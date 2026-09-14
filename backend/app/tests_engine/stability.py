def evaluate_stability(
    observations: list[dict],
) -> dict:

    if not observations:
        raise ValueError(
            "At least one stability observation is required"
        )

    results = []

    for index, observation in enumerate(
        observations,
        start=1,
    ):

        stable = observation.get(
            "stable_equilibrium",
            observation.get("equilibrium_stable", False),
        )

        correct_trigger = observation.get(
            "correct_trigger_behavior",
            observation.get("print_or_storage_ok", False),
        )

        no_premature_action = observation.get(
            "no_premature_action",
            observation.get("zero_tare_ok", False),
        )

        passed = (
            stable
            and correct_trigger
            and no_premature_action
        )

        results.append(
            {
                "sequence_no": index,
                "stable_equilibrium": stable,
                "correct_trigger_behavior": correct_trigger,
                "no_premature_action": (
                    no_premature_action
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
        "test_code": "STABILITY_OF_EQUILIBRIUM",
        "result": (
            "PASS"
            if overall_pass
            else "FAIL"
        ),
        "observation_count": len(results),
        "observations": results,
        "criterion": (
            "The instrument must establish stable equilibrium "
            "before initiating printing, data storage, zero "
            "setting or tare operations."
        ),
        "explanation": (
            "The stability of equilibrium was evaluated by "
            "disturbing the equilibrium and checking whether "
            "the instrument performs its specified functions "
            "only after stable equilibrium is established."
        ),
    }