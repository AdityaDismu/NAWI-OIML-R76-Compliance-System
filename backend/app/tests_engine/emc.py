from app.utils.decimal_utils import to_decimal


def evaluate_emc(observations):
    if not observations:
        raise ValueError(
            "At least one EMC observation is required"
        )

    results = []

    for index, observation in enumerate(
        observations,
        start=1,
    ):
        test_type = observation.get(
            "test_type",
            "UNKNOWN",
        )

        level = observation.get(
            "level",
            "",
        )

        error = abs(
            to_decimal(
                observation.get("error", 0)
            )
        )

        e = abs(
            to_decimal(
                observation.get("verification_scale_interval", observation.get("e", 0))
            )
        )

        function_ok = observation.get(
            "function_ok",
            observation.get("disturbance_ok", True),
        )

        # R76 EMC acceptance:
        # disturbance effect must not exceed e,
        # OR the instrument must detect/react to a significant fault.
        # If the UI records a direct disturbance outcome instead of a
        # numeric error, preserve that observation as the acceptance decision.
        direct_ok = observation.get("disturbance_ok")
        disturbance_within_limit = (
            bool(direct_ok) if "error" not in observation and direct_ok is not None
            else error <= e
        )

        significant_fault_detected = observation.get(
            "significant_fault_detected",
            False,
        )

        passed = (
            disturbance_within_limit
            or significant_fault_detected
        ) and function_ok

        results.append(
            {
                "sequence_no": index,
                "test_type": test_type,
                "level": level,
                "error": error,
                "verification_scale_interval": e,
                "function_ok": function_ok,
                "significant_fault_detected": (
                    significant_fault_detected
                ),
                "result": (
                    "PASS"
                    if passed
                    else "FAIL"
                ),
            }
        )

    overall_pass = all(
        item["result"] == "PASS"
        for item in results
    )

    return {
        "test_code": "EMC",
        "result": (
            "PASS"
            if overall_pass
            else "FAIL"
        ),
        "observation_count": len(results),
        "observations": results,
        "criterion": (
            "The disturbance effect must not exceed e, "
            "or the instrument must detect and react to "
            "a significant fault."
        ),
        "explanation": (
            "The applicable electromagnetic compatibility "
            "tests were evaluated and the disturbance effect "
            "and instrument response were recorded."
        ),
    }