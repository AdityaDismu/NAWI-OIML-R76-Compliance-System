from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.database import supabase
from app.regulatory.engine import calculate_test


router = APIRouter(
    prefix="/calculations",
    tags=["Calculations"],
)


class WeighingObservationInput(BaseModel):
    load_value: float
    indication_value: float
    delta_load: float = 0
    direction: str | None = None


class WeighingPerformanceRequest(BaseModel):
    test_instance_id: str
    zero_error: float = 0
    observations: list[WeighingObservationInput]


@router.post("/weighing-performance")
async def calculate_weighing_performance(
    request: WeighingPerformanceRequest,
):
    # ----------------------------------------
    # 1. Get test instance
    # ----------------------------------------

    test_response = (
        supabase
        .table("test_instances")
        .select("*, test_definitions(*)")
        .eq("id", request.test_instance_id)
        .single()
        .execute()
    )

    if not test_response.data:
        raise HTTPException(
            status_code=404,
            detail="Test instance not found",
        )

    test_instance = test_response.data
    definition = test_instance.get("test_definitions")

    if not definition:
        raise HTTPException(
            status_code=400,
            detail="Test definition not found",
        )

    if definition["code"] != "WEIGHING_PERFORMANCE":
        raise HTTPException(
            status_code=400,
            detail="This endpoint only supports Weighing Performance",
        )

    # ----------------------------------------
    # 2. Check test status
    # ----------------------------------------

    if test_instance["status"] == "COMPLETE":
        raise HTTPException(
            status_code=400,
            detail="Test is already complete",
        )

    if test_instance.get("applicability") is not True:
        raise HTTPException(
            status_code=400,
            detail="This test is not applicable",
        )

    # ----------------------------------------
    # 3. Get evaluation
    # ----------------------------------------

    evaluation_response = (
        supabase
        .table("evaluations")
        .select("*")
        .eq("id", test_instance["evaluation_id"])
        .single()
        .execute()
    )

    if not evaluation_response.data:
        raise HTTPException(
            status_code=404,
            detail="Evaluation not found",
        )

    evaluation = evaluation_response.data

    # ----------------------------------------
    # 4. Get instrument
    # ----------------------------------------

    instrument_response = (
        supabase
        .table("instruments")
        .select("*")
        .eq("id", evaluation["instrument_id"])
        .single()
        .execute()
    )

    if not instrument_response.data:
        raise HTTPException(
            status_code=404,
            detail="Instrument not found",
        )

    instrument = instrument_response.data

    # ----------------------------------------
    # 5. Get instrument range
    # ----------------------------------------

    range_response = (
        supabase
        .table("instrument_ranges")
        .select("*")
        .eq("instrument_id", instrument["id"])
        .limit(1)
        .execute()
    )

    if not range_response.data:
        raise HTTPException(
            status_code=404,
            detail="Instrument range not found",
        )

    instrument_range = range_response.data[0]

    # ----------------------------------------
    # 6. Mark test as IN_PROGRESS
    # ----------------------------------------

    if test_instance["status"] == "NOT_TESTED":
        supabase.table("test_instances").update(
            {
                "status": "IN_PROGRESS",
            }
        ).eq(
            "id",
            request.test_instance_id,
        ).execute()

    # ----------------------------------------
    # 7. Convert observations
    # ----------------------------------------

    observations = []

    for item in request.observations:
        observations.append(
            {
                "load_value": item.load_value,
                "indication_value": item.indication_value,
                "delta_load": item.delta_load,
            }
        )

    # ----------------------------------------
    # 8. Run regulatory calculation engine
    # ----------------------------------------

    try:
        calculation_result = calculate_test(
            test_code="WEIGHING_PERFORMANCE",
            observations=observations,
            instrument=instrument,
            instrument_range=instrument_range,
            zero_error=request.zero_error,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    # ----------------------------------------
    # 9. Save observations
    # ----------------------------------------

    observation_rows = []

    for index, item in enumerate(
        calculation_result["observations"],
        start=1,
    ):
        observation_rows.append(
            {
                "test_instance_id": request.test_instance_id,
                "sequence_no": index,
                "load_value": float(item["load_value"]),
                "indication_value": float(item["indication_value"]),
                "delta_load": float(item["delta_load"]),
                "direction": request.observations[index - 1].direction,
                "metadata": {
                    "verification_scale_interval": float(
                        item["verification_scale_interval"]
                    ),
                    "error": float(item["error"]),
                    "corrected_error": float(
                        item["corrected_error"]
                    ),
                    "mpe": float(item["mpe"]),
                    "result": item["result"],
                },
            }
        )

    if observation_rows:
        supabase.table("observations").insert(
            observation_rows
        ).execute()

    # ----------------------------------------
    # 10. Save calculation
    # ----------------------------------------

    supabase.table("calculations").insert(
        {
            "test_instance_id": request.test_instance_id,
            "calculation_type": "WEIGHING_PERFORMANCE",
            "inputs": {
                "zero_error": request.zero_error,
                "observation_count": len(
                    request.observations
                ),
            },
            "outputs": {
                "result": calculation_result["result"],
                "observation_count": calculation_result[
                    "observation_count"
                ],
            },
        }
    ).execute()

    # ----------------------------------------
    # 11. Save final test result
    # ----------------------------------------

    overall_result = calculation_result["result"]

    supabase.table("test_results").insert(
        {
            "test_instance_id": request.test_instance_id,
            "result": overall_result,
            "criterion": (
                "Every weighing observation must satisfy "
                "|Ec| <= applicable MPE"
            ),
            "explanation": (
                "The corrected error of every observation "
                "was compared against the applicable "
                "maximum permissible error."
            ),
            "details": {
                "observation_count": calculation_result[
                    "observation_count"
                ],
                "observations": [
                    {
                        "load_value": float(
                            item["load_value"]
                        ),
                        "indication_value": float(
                            item["indication_value"]
                        ),
                        "error": float(item["error"]),
                        "corrected_error": float(
                            item["corrected_error"]
                        ),
                        "mpe": float(item["mpe"]),
                        "result": item["result"],
                    }
                    for item in calculation_result[
                        "observations"
                    ]
                ],
            },
        }
    ).execute()

    # ----------------------------------------
    # 12. Complete test automatically
    # ----------------------------------------

    supabase.table("test_instances").update(
        {
            "status": "COMPLETE",
            "result": overall_result,
        }
    ).eq(
        "id",
        request.test_instance_id,
    ).execute()

    # ----------------------------------------
    # 13. Return complete result
    # ----------------------------------------

    return {
        "success": True,
        "test_instance_id": request.test_instance_id,
        "test_code": "WEIGHING_PERFORMANCE",
        "status": "COMPLETE",
        "result": overall_result,
        "observation_count": calculation_result[
            "observation_count"
        ],
        "observations": [
            {
                "load_value": float(item["load_value"]),
                "indication_value": float(
                    item["indication_value"]
                ),
                "error": float(item["error"]),
                "corrected_error": float(
                    item["corrected_error"]
                ),
                "mpe": float(item["mpe"]),
                "result": item["result"],
                "criterion": item["criterion"],
            }
            for item in calculation_result["observations"]
        ],
    }