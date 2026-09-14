from fastapi import HTTPException

from app.core.database import supabase


def ensure_evaluation_editable(
    evaluation_id: str,
):
    response = (
        supabase
        .table("evaluations")
        .select("status")
        .eq("id", evaluation_id)
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Evaluation not found",
        )

    status = response.data["status"]

    if status == "FINALIZED":
        raise HTTPException(
            status_code=400,
            detail=(
                "This evaluation is finalized "
                "and cannot be modified."
            ),
        )

    return True


def _is_applicable(test):
    """
    Normalize the applicability value returned by Supabase.

    PostgreSQL normally returns a boolean, but this helper also
    safely handles string representations.
    """

    value = test.get("applicability")

    if value is True:
        return True

    if value is False:
        return False

    if isinstance(value, str):
        return value.strip().lower() in {
            "true",
            "1",
            "yes",
            "y",
        }

    return bool(value)


def finalize_evaluation(
    evaluation_id: str,
):

    # ---------------------------------------------------------
    # 1. Get evaluation
    # ---------------------------------------------------------

    evaluation_response = (
        supabase
        .table("evaluations")
        .select("*")
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

    evaluation = evaluation_response.data

    # ---------------------------------------------------------
    # 2. Prevent double finalization
    # ---------------------------------------------------------

    if evaluation.get("status") == "FINALIZED":

        raise HTTPException(
            status_code=400,
            detail="Evaluation is already finalized.",
        )

    # ---------------------------------------------------------
    # 3. Get all test instances
    # ---------------------------------------------------------

    tests_response = (
        supabase
        .table("test_instances")
        .select(
            "id,status,applicability,applicability_reason,"
            "test_definitions(code,name)"
        )
        .eq(
            "evaluation_id",
            evaluation_id,
        )
        .execute()
    )

    tests = tests_response.data or []

    incomplete_tests = []
    applicable_tests = []
    not_applicable_tests = []

    # ---------------------------------------------------------
    # 4. Check only APPLICABLE tests
    # ---------------------------------------------------------

    for test in tests:

        definition = (
            test.get("test_definitions")
            or {}
        )

        test_code = (
            definition.get("code")
            or "UNKNOWN"
        )

        test_name = (
            definition.get("name")
            or test_code
        )

        applicable = _is_applicable(test)

        # -----------------------------------------------------
        # NOT APPLICABLE
        # -----------------------------------------------------

        if not applicable:

            not_applicable_tests.append(
                {
                    "code": test_code,
                    "name": test_name,
                    "status": test.get("status"),
                    "reason": test.get(
                        "applicability_reason"
                    ),
                }
            )

            continue

        # -----------------------------------------------------
        # APPLICABLE
        # -----------------------------------------------------

        applicable_tests.append(
            {
                "code": test_code,
                "name": test_name,
                "status": test.get("status"),
            }
        )

        if test.get("status") != "COMPLETE":

            incomplete_tests.append(
                {
                    "code": test_code,
                    "name": test_name,
                    "status": test.get(
                        "status"
                    ),
                }
            )

    # ---------------------------------------------------------
    # 5. Block only if an APPLICABLE test is incomplete
    # ---------------------------------------------------------

    if incomplete_tests:

        raise HTTPException(
            status_code=400,
            detail={
                "message": (
                    "Evaluation cannot be finalized because "
                    "one or more applicable tests are incomplete."
                ),
                "incomplete_tests": incomplete_tests,
                "applicable_test_count": len(
                    applicable_tests
                ),
                "not_applicable_test_count": len(
                    not_applicable_tests
                ),
            },
        )

    # ---------------------------------------------------------
    # 6. Finalize
    # ---------------------------------------------------------

    response = (
        supabase
        .table("evaluations")
        .update(
            {
                "status": "FINALIZED",
            }
        )
        .eq(
            "id",
            evaluation_id,
        )
        .execute()
    )

    if not response.data:

        raise HTTPException(
            status_code=500,
            detail="Evaluation could not be finalized.",
        )

    return {
        "success": True,
        "evaluation": response.data[0],
        "applicable_tests": applicable_tests,
        "not_applicable_tests": not_applicable_tests,
    }