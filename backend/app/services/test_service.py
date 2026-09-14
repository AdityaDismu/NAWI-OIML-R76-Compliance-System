
from fastapi import HTTPException

from app.core.database import supabase
from app.regulatory.engine import calculate_test
from app.services.observation_service import save_observations
from app.services.calculation_service import (
    save_calculation,
    save_test_result,
)
from app.utils.decimal_utils import decimal_to_json


def get_test_instance(test_instance_id: str):
    """
    Get a test instance together with its test definition.

    Also loads the latest saved calculation and test result so
    completed tests can display their result after page reload.
    """

    response = (
        supabase
        .table("test_instances")
        .select("*, test_definitions(*)")
        .eq("id", test_instance_id)
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Test instance not found",
        )

    test = response.data

    # ---------------------------------------------------------
    # Load latest saved calculation
    # ---------------------------------------------------------
    try:
        calculation_response = (
            supabase
            .table("calculations")
            .select("*")
            .eq("test_instance_id", test_instance_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        calculations = calculation_response.data or []

        if calculations:
            test["saved_calculation"] = decimal_to_json(
                calculations[0]
            )
        else:
            test["saved_calculation"] = None

    except Exception:
        test["saved_calculation"] = None

    # ---------------------------------------------------------
    # Load latest saved test result
    # ---------------------------------------------------------
    try:
        result_response = (
            supabase
            .table("test_results")
            .select("*")
            .eq("test_instance_id", test_instance_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        results = result_response.data or []

        if results:
            test["saved_result"] = decimal_to_json(
                results[0]
            )
        else:
            test["saved_result"] = None

    except Exception:
        test["saved_result"] = None

    # ---------------------------------------------------------
    # Build result object for frontend
    # ---------------------------------------------------------
    saved_result = test.get("saved_result")
    saved_calculation = test.get("saved_calculation")

    if saved_result or saved_calculation:

        result_data = {}

        if isinstance(saved_calculation, dict):

            outputs = saved_calculation.get("outputs")

            if isinstance(outputs, dict):
                result_data.update(outputs)
            else:
                result_data.update(saved_calculation)

        if isinstance(saved_result, dict):

            result_value = saved_result.get("result")

            if isinstance(result_value, dict):
                result_data.update(result_value)

            elif result_value is not None:
                result_data["result"] = result_value

            if saved_result.get("criterion") is not None:
                result_data["criterion"] = saved_result["criterion"]

            if saved_result.get("explanation") is not None:
                result_data["explanation"] = saved_result["explanation"]

            if saved_result.get("details") is not None:
                details = saved_result["details"]

                if isinstance(details, dict):
                    result_data.update(details)

        # Ensure test code is available.
        definition = test.get("test_definitions") or {}

        if not result_data.get("test_code"):
            result_data["test_code"] = (
                definition.get("code")
                or test.get("test_code")
            )

        test["result"] = decimal_to_json(result_data)

    else:
        test["result"] = None

    return decimal_to_json(test)


def create_audit_log(
    evaluation_id: str,
    test_instance_id: str,
    action: str,
    user_id: str | None = None,
    details: dict | None = None,
):
    """
    Create an audit log entry.
    """

    payload = {
        "evaluation_id": evaluation_id,
        "test_instance_id": test_instance_id,
        "action": action,
        "user_id": user_id,
        "details": decimal_to_json(details or {}),
    }

    try:
        supabase.table("audit_logs").insert(payload).execute()
    except Exception:
        # Audit logging should not break the main test operation.
        pass


def update_evaluation_progress(
    evaluation_id: str,
):
    """
    Update evaluation progress based on applicable tests.
    """

    response = (
        supabase
        .table("test_instances")
        .select("id, status, applicability")
        .eq("evaluation_id", evaluation_id)
        .execute()
    )

    tests = response.data or []

    applicable_tests = [
        test
        for test in tests
        if test.get("applicability") is True
    ]

    completed_tests = [
        test
        for test in applicable_tests
        if test.get("status") == "COMPLETE"
    ]

    total = len(applicable_tests)
    completed = len(completed_tests)

    if total == 0:

        progress = 100
        evaluation_status = "COMPLETE"

    else:

        progress = round(
            (completed / total) * 100,
            2,
        )

        if completed == total:
            evaluation_status = "COMPLETE"

        elif completed > 0:
            evaluation_status = "IN_PROGRESS"

        else:
            evaluation_status = "NOT_STARTED"

    supabase \
    .table("evaluations") \
    .update(
        {
            "status": evaluation_status,
        }
    ) \
    .eq("id", evaluation_id) \
    .execute()

    return {
        "evaluation_id": evaluation_id,
        "completed_tests": completed,
        "total_tests": total,
        "progress": progress,
        "status": evaluation_status,
    }


def execute_test(
    test_instance_id: str,
    observations: list,
    parameters: dict | None = None,
    user_id: str | None = None,
):
    """
    Execute an OIML regulatory test.
    """

    parameters = parameters or {}

    # ---------------------------------------------------------
    # Get test instance
    # ---------------------------------------------------------
    test_response = (
        supabase
        .table("test_instances")
        .select("*, test_definitions(*)")
        .eq("id", test_instance_id)
        .single()
        .execute()
    )

    if not test_response.data:
        raise HTTPException(
            status_code=404,
            detail="Test instance not found",
        )

    test = test_response.data

    definition = test.get("test_definitions") or {}
    test_code = definition.get("code")

    if not test_code:
        raise HTTPException(
            status_code=400,
            detail="Test definition code not found",
        )

    evaluation_id = test.get("evaluation_id")

    # ---------------------------------------------------------
    # Check applicability
    # ---------------------------------------------------------
    if test.get("applicability") is not True:
        raise HTTPException(
            status_code=400,
            detail="This test is not applicable",
        )

    # ---------------------------------------------------------
    # Prevent duplicate execution
    # ---------------------------------------------------------
    if test.get("status") == "COMPLETE":
        raise HTTPException(
            status_code=400,
            detail="Test is already complete",
        )

    # ---------------------------------------------------------
    # Get evaluation
    # ---------------------------------------------------------
    evaluation_response = (
        supabase
        .table("evaluations")
        .select("*")
        .eq("id", evaluation_id)
        .single()
        .execute()
    )

    if not evaluation_response.data:
        raise HTTPException(
            status_code=404,
            detail="Evaluation not found",
        )

    evaluation = evaluation_response.data

    # ---------------------------------------------------------
    # Check evaluation editability
    #
    # We already loaded the evaluation above, so we can check
    # the status directly instead of making another Supabase
    # request through ensure_evaluation_editable().
    # ---------------------------------------------------------
    if evaluation.get("status") not in {"DRAFT", "IN_PROGRESS", "REJECTED"}:
        raise HTTPException(
            status_code=400,
            detail=(
                "This evaluation is currently under review or approved "
                "and cannot be modified by the tester."
            ),
        )

    instrument_id = evaluation.get("instrument_id")

    if not instrument_id:
        raise HTTPException(
            status_code=400,
            detail="Evaluation instrument not found",
        )

    # ---------------------------------------------------------
    # Mark test as IN_PROGRESS
    # ---------------------------------------------------------
    supabase \
        .table("test_instances") \
        .update(
            {
                "status": "IN_PROGRESS",
            }
        ) \
        .eq("id", test_instance_id) \
        .execute()

    try:

        # -----------------------------------------------------
        # Get instrument
        # -----------------------------------------------------
        instrument_response = (
            supabase
            .table("instruments")
            .select("*")
            .eq("id", instrument_id)
            .single()
            .execute()
        )

        if not instrument_response.data:
            raise HTTPException(
                status_code=404,
                detail="Instrument not found",
            )

        instrument = instrument_response.data

        # -----------------------------------------------------
        # Get instrument range
        # -----------------------------------------------------
        range_response = (
            supabase
            .table("instrument_ranges")
            .select("*")
            .eq("instrument_id", instrument_id)
            .order("created_at", desc=False)
            .limit(1)
            .execute()
        )

        ranges = range_response.data or []

        instrument_range = (
            ranges[0]
            if ranges
            else {}
        )

        # -----------------------------------------------------
        # Calculate regulatory result
        # -----------------------------------------------------
        result = calculate_test(
            test_code,
            observations,
            instrument,
            instrument_range,
            **parameters,
        )

        # -----------------------------------------------------
        # Convert Decimal values to JSON-safe values
        # -----------------------------------------------------
        safe_result = decimal_to_json(result)
        safe_observations = decimal_to_json(observations)
        safe_parameters = decimal_to_json(parameters)

        # -----------------------------------------------------
        # Save observations
        # -----------------------------------------------------
        saved_observations = save_observations(
            test_instance_id,
            safe_observations,
        )

        # -----------------------------------------------------
        # Save calculation
        #
        # calculation_service.save_calculation() expects:
        # test_instance_id, calculation_type, inputs, outputs
        # -----------------------------------------------------
        saved_calculation = save_calculation(
            test_instance_id,
            test_code,
            safe_parameters,
            safe_result,
        )

        # -----------------------------------------------------
        # Save final test result
        #
        # calculation_service.save_test_result() expects:
        # test_instance_id, result, criterion, explanation,
        # details
        # -----------------------------------------------------
        saved_result = save_test_result(
            test_instance_id,
            safe_result.get("result"),
            safe_result.get("criterion"),
            safe_result.get("explanation"),
            safe_result,
        )

        # -----------------------------------------------------
        # Mark test COMPLETE
        # -----------------------------------------------------
        supabase \
            .table("test_instances") \
            .update(
                {
                    "status": "COMPLETE",
                    "result": safe_result.get("result"),
                }
            ) \
            .eq("id", test_instance_id) \
            .execute()

        # -----------------------------------------------------
        # Audit log
        # -----------------------------------------------------
        create_audit_log(
            evaluation_id=evaluation_id,
            test_instance_id=test_instance_id,
            action="TEST_COMPLETED",
            user_id=user_id,
            details={
                "test_code": test_code,
                "result": safe_result,
            },
        )

        # -----------------------------------------------------
        # Update evaluation progress
        # -----------------------------------------------------
        progress = update_evaluation_progress(
            evaluation_id
        )

        # -----------------------------------------------------
        # Return complete result
        # -----------------------------------------------------
        return {
            "test_instance_id": test_instance_id,
            "test_code": test_code,
            "result": safe_result,
            "saved_observations": decimal_to_json(
                saved_observations
            ),
            "saved_calculation": decimal_to_json(
                saved_calculation
            ),
            "saved_result": decimal_to_json(
                saved_result
            ),
            "progress": progress,
        }

    except KeyError as exc:

        supabase \
            .table("test_instances") \
            .update(
                {
                    "status": "NOT_TESTED",
                }
            ) \
            .eq("id", test_instance_id) \
            .execute()

        raise HTTPException(
            status_code=400,
            detail=f"Missing required parameter: {exc}",
        )

    except ValueError as exc:

        supabase \
            .table("test_instances") \
            .update(
                {
                    "status": "NOT_TESTED",
                }
            ) \
            .eq("id", test_instance_id) \
            .execute()

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except HTTPException:

        supabase \
            .table("test_instances") \
            .update(
                {
                    "status": "NOT_TESTED",
                }
            ) \
            .eq("id", test_instance_id) \
            .execute()

        raise

    except Exception as exc:

        supabase \
            .table("test_instances") \
            .update(
                {
                    "status": "NOT_TESTED",
                }
            ) \
            .eq("id", test_instance_id) \
            .execute()

        raise HTTPException(
            status_code=500,
            detail=f"Test execution failed: {str(exc)}",
        )

