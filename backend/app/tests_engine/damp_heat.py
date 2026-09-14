from app.utils.decimal_utils import to_decimal


def evaluate_damp_heat(observations):
    if not observations:
        raise ValueError(
            "At least one damp heat observation is required"
        )

    results = []

    for index, observation in enumerate(
        observations,
        start=1,
    ):
        temperature = to_decimal(
            observation["temperature"]
        )

        humidity = to_decimal(
            observation.get("relative_humidity", observation.get("humidity", 0))
        )

        error = abs(
            to_decimal(
                observation.get("error", 0)
            )
        )

        mpe = abs(
            to_decimal(
                observation.get("mpe", observation.get("applicable_mpe", 0))
            )
        )

        function_ok = observation.get(
            "function_ok",
            observation.get("performance_ok", observation.get("condition_ok", True)),
        )

        indication_ok = error <= mpe

        passed = indication_ok and function_ok

        results.append(
            {
                "sequence_no": index,
                "temperature": temperature,
                "relative_humidity": humidity,
                "error": error,
                "mpe": mpe,
                "function_ok": function_ok,
                "result": "PASS" if passed else "FAIL",
            }
        )

    overall_pass = all(
        item["result"] == "PASS"
        for item in results
    )

    return {
        "test_code": "DAMP_HEAT",
        "result": "PASS" if overall_pass else "FAIL",
        "observation_count": len(results),
        "observations": results,
        "criterion": (
            "The instrument must operate correctly and "
            "the weighing indication must remain within "
            "the applicable MPE after the specified damp "
            "heat conditions."
        ),
        "explanation": (
            "The instrument was exposed to the specified "
            "damp heat conditions and its weighing and "
            "functional performance were evaluated."
        ),
    }