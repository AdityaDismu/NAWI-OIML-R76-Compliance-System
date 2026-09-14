from fastapi import APIRouter, HTTPException

from app.core.database import supabase
from app.schemas.test import (
    TestInstanceStart,
    TestInstanceComplete,
    TestExecutionRequest,
)
from app.services.test_service import execute_test, get_test_instance as get_test_instance_service


router = APIRouter(
    prefix="/tests",
    tags=["OIML Tests"],
)


@router.get("/definitions")
async def get_test_definitions():

    try:

        response = (
            supabase
            .table("test_definitions")
            .select("*")
            .eq("is_active", True)
            .order("display_order")
            .execute()
        )

        return {
            "count": len(response.data or []),
            "definitions": response.data or [],
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@router.get("/evaluation/{evaluation_id}")
async def get_evaluation_tests(
    evaluation_id: str,
):

    try:

        response = (
            supabase
            .table("test_instances")
            .select("*, test_definitions(*)")
            .eq(
                "evaluation_id",
                evaluation_id,
            )
            .order("created_at")
            .execute()
        )

        return {
            "evaluation_id": evaluation_id,
            "count": len(response.data or []),
            "tests": response.data or [],
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@router.get("/{test_instance_id}")
async def get_test_instance(test_instance_id: str):
    try:
        return get_test_instance_service(test_instance_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{test_instance_id}/start")
async def start_test(
    test_instance_id: str,
    data: TestInstanceStart,
):

    try:

        response = (
            supabase
            .table("test_instances")
            .select("*")
            .eq(
                "id",
                test_instance_id,
            )
            .single()
            .execute()
        )

        if not response.data:

            raise HTTPException(
                status_code=404,
                detail="Test instance not found",
            )

        test_instance = response.data

        # applicability is BOOLEAN
        if test_instance.get("applicability") is False:

            raise HTTPException(
                status_code=400,
                detail="This test is not applicable to the instrument",
            )

        if test_instance.get("status") == "COMPLETE":

            raise HTTPException(
                status_code=400,
                detail="Test is already complete",
            )

        update_response = (
            supabase
            .table("test_instances")
            .update(
                {
                    "status": "IN_PROGRESS",
                }
            )
            .eq(
                "id",
                test_instance_id,
            )
            .execute()
        )

        return update_response.data[0]

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@router.post("/{test_instance_id}/complete")
async def complete_test(
    test_instance_id: str,
    data: TestInstanceComplete,
):

    if data.result not in [
        "PASS",
        "FAIL",
        "NA",
    ]:

        raise HTTPException(
            status_code=400,
            detail="Result must be PASS, FAIL or NA",
        )

    try:

        response = (
            supabase
            .table("test_instances")
            .select("*")
            .eq(
                "id",
                test_instance_id,
            )
            .single()
            .execute()
        )

        if not response.data:

            raise HTTPException(
                status_code=404,
                detail="Test instance not found",
            )

        test_instance = response.data

        # Non-applicable test must be NA
        if (
            test_instance.get("applicability") is False
            and data.result != "NA"
        ):

            raise HTTPException(
                status_code=400,
                detail="A non-applicable test must have result NA",
            )

        # Applicable test cannot be NA
        if (
            test_instance.get("applicability") is True
            and data.result == "NA"
        ):

            raise HTTPException(
                status_code=400,
                detail="An applicable test cannot be marked NA",
            )

        update_response = (
            supabase
            .table("test_instances")
            .update(
                {
                    "status": "COMPLETE",
                    "result": data.result,
                    "remarks": data.remarks,
                }
            )
            .eq(
                "id",
                test_instance_id,
            )
            .execute()
        )

        return update_response.data[0]

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@router.post("/{test_instance_id}/execute")
async def execute_test_instance(
    test_instance_id: str,
    request: TestExecutionRequest,
):

    return execute_test(
        test_instance_id=test_instance_id,
        observations=request.observations,
        parameters=request.parameters,
    )