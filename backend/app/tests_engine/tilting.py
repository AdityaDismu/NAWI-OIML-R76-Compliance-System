from app.utils.decimal_utils import to_decimal


def evaluate_tilting(observations):
    if not observations:
        raise ValueError(
            "At least one tilting observation is required"
        )

    results = []

    for index, observation in enumerate(
        observations,
        start=1,
    ):
        angle = to_decimal(
            observation["angle"]
        )

        error = abs(
            to_decimal(
                observation["error"]
            )
        )

        mpe = abs(
            to_decimal(
                observation["mpe"]
            )
        )

        function_ok = observation.get(
            "function_ok",
            True,
        )

        indication_ok = error <= mpe

        passed = indication_ok and function_ok

        results.append(
            {
                "sequence_no": index,
                "angle": angle,
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
        "test_code": "TILTING",
        "result": "PASS" if overall_pass else "FAIL",
        "observation_count": len(results),
        "observations": results,
        "criterion": (
            "The instrument must continue to operate correctly "
            "and the weighing error must remain within the "
            "applicable MPE under the specified tilt conditions."
        ),
        "explanation": (
            "The instrument was checked under the specified "
            "tilting conditions and its indication and functional "
            "behaviour were evaluated."
        ),
    }