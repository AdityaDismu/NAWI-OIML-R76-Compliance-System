from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from app.core.database import supabase
from app.schemas.evaluation import EvaluationCreate
from app.regulatory.applicability import determine_applicability
from app.services.evaluation_service import finalize_evaluation

router = APIRouter(
    prefix="/evaluations",
    tags=["Evaluations"],
)


@router.post("")
async def create_evaluation(evaluation: EvaluationCreate):

    # ---------------------------------------------------------
    # 1. Check instrument
    # ---------------------------------------------------------

    instrument_response = (
        supabase
        .table("instruments")
        .select("*")
        .eq("id", evaluation.instrument_id)
        .single()
        .execute()
    )

    if not instrument_response.data:
        raise HTTPException(
            status_code=404,
            detail="Instrument not found",
        )

    instrument = instrument_response.data

    # ---------------------------------------------------------
    # 2. Get instrument range
    # ---------------------------------------------------------

    range_response = (
        supabase
        .table("instrument_ranges")
        .select("*")
        .eq("instrument_id", evaluation.instrument_id)
        .limit(1)
        .execute()
    )

    if not range_response.data:
        raise HTTPException(
            status_code=400,
            detail="Instrument range must be created before evaluation",
        )

    instrument_range = range_response.data[0]

    # ---------------------------------------------------------
    # 3. Get OIML R76-1:2006 standard
    # ---------------------------------------------------------

    standard_response = (
        supabase
        .table("regulatory_standards")
        .select("*")
        .eq("name", "OIML R76-1")
        .eq("edition", "2006")
        .eq("is_active", True)
        .limit(1)
        .execute()
    )

    if not standard_response.data:
        raise HTTPException(
            status_code=500,
            detail="OIML R76-1:2006 standard was not found in regulatory_standards",
        )

    standard = standard_response.data[0]

    # ---------------------------------------------------------
    # 4. Create evaluation
    # ---------------------------------------------------------

    evaluation_data = {
        "instrument_id": evaluation.instrument_id,
        "standard_id": standard["id"],
        "evaluation_type": evaluation.evaluation_type,
        "notes": evaluation.notes,
        "status": "DRAFT",
    }

    evaluation_response = (
        supabase
        .table("evaluations")
        .insert(evaluation_data)
        .execute()
    )

    if not evaluation_response.data:
        raise HTTPException(
            status_code=400,
            detail="Evaluation could not be created",
        )

    created_evaluation = evaluation_response.data[0]

    # ---------------------------------------------------------
    # 5. Get active test definitions
    # ---------------------------------------------------------

    definitions_response = (
        supabase
        .table("test_definitions")
        .select("*")
        .eq("is_active", True)
        .order("display_order")
        .execute()
    )

    definitions = definitions_response.data or []

    # ---------------------------------------------------------
    # 6. Determine applicability of every test
    # ---------------------------------------------------------

    test_instances = []

    for definition in definitions:

        applicable, reason = determine_applicability(
            definition["code"],
            instrument,
            instrument_range,
        )

        test_instances.append(
    {
        "evaluation_id": created_evaluation["id"],
        "test_definition_id": definition["id"],
        "status": "NOT_TESTED",
        "applicability": applicable,
        "applicability_reason": reason,
    }
)

    # ---------------------------------------------------------
    # 7. Create test instances
    # ---------------------------------------------------------

    created_instances = []

    if test_instances:

        instances_response = (
            supabase
            .table("test_instances")
            .insert(test_instances)
            .execute()
        )

        created_instances = (
            instances_response.data or []
        )

    # ---------------------------------------------------------
    # 8. Return complete creation response
    # ---------------------------------------------------------

    return {
        "evaluation": created_evaluation,
        "instrument": instrument,
        "instrument_range": instrument_range,
        "standard": standard,
        "test_instances": created_instances,
        "test_count": len(created_instances),
    }


@router.get("")
async def get_evaluations():

    try:

        response = (
            supabase
            .table("evaluations")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        evaluations = response.data or []

        for evaluation in evaluations:

            instrument_response = (
                supabase
                .table("instruments")
                .select(
                    "id, manufacturer, model_type, "
                    "serial_number, accuracy_class"
                )
                .eq(
                    "id",
                    evaluation["instrument_id"],
                )
                .limit(1)
                .execute()
            )

            instrument_data = (
                instrument_response.data[0]
                if instrument_response.data
                else None
            )

            evaluation["instrument"] = instrument_data

        return {
            "count": len(evaluations),
            "evaluations": evaluations,
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@router.get("/{evaluation_id}")
async def get_evaluation(
    evaluation_id: str,
):

    try:

        response = (
            supabase
            .table("evaluations")
            .select("*")
            .eq("id", evaluation_id)
            .single()
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Evaluation not found",
            )

        evaluation = response.data

        instrument_response = (
            supabase
            .table("instruments")
            .select("*")
            .eq(
                "id",
                evaluation["instrument_id"],
            )
            .limit(1)
            .execute()
        )

        evaluation["instrument"] = (
            instrument_response.data[0]
            if instrument_response.data
            else None
        )

        range_response = (
            supabase
            .table("instrument_ranges")
            .select("*")
            .eq(
                "instrument_id",
                evaluation["instrument_id"],
            )
            .limit(1)
            .execute()
        )

        evaluation["instrument_range"] = (
            range_response.data[0]
            if range_response.data
            else None
        )

        return evaluation

    except HTTPException:
        raise

    except Exception:

        raise HTTPException(
            status_code=404,
            detail="Evaluation not found",
        )


@router.get("/{evaluation_id}/tests")
async def get_evaluation_tests(
    evaluation_id: str,
):

    try:

        evaluation_response = (
            supabase
            .table("evaluations")
            .select("id")
            .eq(
                "id",
                evaluation_id,
            )
            .single()
            .execute()
        )

        if not evaluation_response.data:
            raise HTTPException(
                status_code=404,
                detail="Evaluation not found",
            )

        instances_response = (
            supabase
            .table("test_instances")
            .select("*")
            .eq(
                "evaluation_id",
                evaluation_id,
            )
            .execute()
        )

        instances = instances_response.data or []

        definition_ids = list(
            {
                instance["test_definition_id"]
                for instance in instances
                if instance.get("test_definition_id")
            }
        )

        definitions = []

        if definition_ids:

            definitions_response = (
                supabase
                .table("test_definitions")
                .select("*")
                .in_(
                    "id",
                    definition_ids,
                )
                .execute()
            )

            definitions = (
                definitions_response.data or []
            )

        definition_map = {
            definition["id"]: definition
            for definition in definitions
        }

        tests = []

        for instance in instances:

            test = dict(instance)

            test["test_definition"] = (
                definition_map.get(
                    instance.get(
                        "test_definition_id"
                    )
                )
            )

            tests.append(test)

        tests.sort(
            key=lambda test: (
                test.get(
                    "test_definition",
                    {},
                ).get(
                    "display_order",
                    9999,
                )
                if test.get(
                    "test_definition"
                )
                else 9999
            )
        )

        return {
            "evaluation_id": evaluation_id,
            "count": len(tests),
            "tests": tests,
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@router.get("/{evaluation_id}/environment")
async def get_evaluation_environment(evaluation_id: str):
    try:
        evaluation = (
            supabase.table("evaluations")
            .select("id")
            .eq("id", evaluation_id)
            .single()
            .execute()
        )
        if not evaluation.data:
            raise HTTPException(status_code=404, detail="Evaluation not found")

        response = (
            supabase.table("evaluation_environments")
            .select("*")
            .eq("evaluation_id", evaluation_id)
            .limit(1)
            .execute()
        )
        return response.data[0] if response.data else None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{evaluation_id}/environment")
async def save_evaluation_environment(evaluation_id: str, data: dict):
    try:
        evaluation = (
            supabase.table("evaluations")
            .select("id,status")
            .eq("id", evaluation_id)
            .single()
            .execute()
        )
        if not evaluation.data:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        if evaluation.data.get("status") == "FINALIZED":
            raise HTTPException(status_code=400, detail="This evaluation is finalized and cannot be modified.")

        allowed = {
            "temperature", "humidity", "pressure", "location",
            "start_time", "end_time", "conditions_ok", "notes"
        }
        payload = {key: data.get(key) for key in allowed if key in data}
        payload["evaluation_id"] = evaluation_id

        response = (
            supabase.table("evaluation_environments")
            .upsert(payload, on_conflict="evaluation_id")
            .execute()
        )
        return response.data[0] if response.data else payload
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{evaluation_id}/finalize")
async def finalize_evaluation_route(
    evaluation_id: str,
):

    return finalize_evaluation(
        evaluation_id
    )

# ============================================================
# Role workflow: tester submits evaluation for authority review
# ============================================================
@router.post("/{evaluation_id}/submit")
async def submit_evaluation_for_review(evaluation_id: str):
    try:
        response = supabase.table("evaluations").select("*").eq("id", evaluation_id).single().execute()
        evaluation = response.data
        if not evaluation:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        if evaluation.get("status") == "FINALIZED":
            raise HTTPException(status_code=400, detail="Finalized evaluations cannot be submitted again.")
        tests_response = supabase.table("test_instances").select("status,applicability,result").eq("evaluation_id", evaluation_id).execute()
        tests = tests_response.data or []
        incomplete = [t for t in tests if t.get("applicability") is True and (t.get("status") != "COMPLETE" or t.get("result") not in {"PASS", "FAIL"})]
        if incomplete:
            raise HTTPException(status_code=400, detail=f"Complete all applicable tests before submission. {len(incomplete)} applicable test(s) remain incomplete.")
        updated = supabase.table("evaluations").update({"status":"SUBMITTED_FOR_REVIEW", "submitted_at": datetime.now(timezone.utc).isoformat()}).eq("id", evaluation_id).execute()
        return {"success": True, "evaluation": updated.data[0] if updated.data else None}
    except HTTPException: raise
    except Exception as exc: raise HTTPException(status_code=500, detail=str(exc))

@router.post("/{evaluation_id}/review")
async def start_evaluation_review(evaluation_id: str):
    try:
        response = supabase.table("evaluations").select("*").eq("id", evaluation_id).single().execute()
        evaluation = response.data
        if not evaluation: raise HTTPException(status_code=404, detail="Evaluation not found")
        if evaluation.get("status") not in {"SUBMITTED_FOR_REVIEW", "UNDER_REVIEW"}:
            raise HTTPException(status_code=400, detail="Only submitted evaluations can enter review.")
        updated = supabase.table("evaluations").update({"status":"UNDER_REVIEW"}).eq("id", evaluation_id).execute()
        return {"success": True, "evaluation": updated.data[0] if updated.data else None}
    except HTTPException: raise
    except Exception as exc: raise HTTPException(status_code=500, detail=str(exc))

@router.post("/{evaluation_id}/approve")
async def approve_evaluation(evaluation_id: str, data: dict | None = None):
    try:
        response = supabase.table("evaluations").select("*").eq("id", evaluation_id).single().execute()
        evaluation = response.data
        if not evaluation: raise HTTPException(status_code=404, detail="Evaluation not found")
        if evaluation.get("status") not in {"SUBMITTED_FOR_REVIEW", "UNDER_REVIEW"}:
            raise HTTPException(status_code=400, detail="Only submitted evaluations can be approved.")
        tests_response = supabase.table("test_instances").select("status,applicability,result").eq("evaluation_id", evaluation_id).execute()
        tests = tests_response.data or []
        incomplete = [t for t in tests if t.get("applicability") is True and (t.get("status") != "COMPLETE" or t.get("result") not in {"PASS", "FAIL"})]
        if incomplete: raise HTTPException(status_code=400, detail="Cannot approve an evaluation with incomplete applicable tests.")
        notes = (data or {}).get("review_notes") or ""
        updated = supabase.table("evaluations").update({"status":"APPROVED", "reviewed_at": datetime.now(timezone.utc).isoformat(), "approved_at": datetime.now(timezone.utc).isoformat(), "review_notes":notes}).eq("id", evaluation_id).execute()
        return {"success": True, "evaluation": updated.data[0] if updated.data else None}
    except HTTPException: raise
    except Exception as exc: raise HTTPException(status_code=500, detail=str(exc))

@router.post("/{evaluation_id}/reject")
async def reject_evaluation(evaluation_id: str, data: dict | None = None):
    try:
        response = supabase.table("evaluations").select("*").eq("id", evaluation_id).single().execute()
        evaluation = response.data
        if not evaluation: raise HTTPException(status_code=404, detail="Evaluation not found")
        if evaluation.get("status") not in {"SUBMITTED_FOR_REVIEW", "UNDER_REVIEW"}:
            raise HTTPException(status_code=400, detail="Only submitted evaluations can be rejected.")
        reason = (data or {}).get("rejection_reason") or "Review returned the evaluation for correction."
        updated = supabase.table("evaluations").update({"status":"REJECTED", "reviewed_at": datetime.now(timezone.utc).isoformat(), "rejection_reason":reason}).eq("id", evaluation_id).execute()
        return {"success": True, "evaluation": updated.data[0] if updated.data else None}
    except HTTPException: raise
    except Exception as exc: raise HTTPException(status_code=500, detail=str(exc))


