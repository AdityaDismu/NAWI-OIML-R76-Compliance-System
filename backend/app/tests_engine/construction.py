def evaluate_construction(observations):
    if not observations:
        raise ValueError(
            "At least one construction checklist observation is required"
        )

    results = []

    for index, observation in enumerate(observations, start=1):
        item = observation.get("item")
        requirement = observation.get("requirement")
        observed = observation.get("observed", "")
        evidence = observation.get("evidence", "")
        compliant = observation.get("compliant", False)

        results.append(
            {
                "sequence_no": index,
                "item": item,
                "requirement": requirement,
                "observed": observed,
                "evidence": evidence,
                "result": "PASS" if compliant else "FAIL",
            }
        )

    overall_pass = all(
        item["result"] == "PASS"
        for item in results
    )

    return {
        "test_code": "CONSTRUCTION_CHECKLIST",
        "result": "PASS" if overall_pass else "FAIL",
        "observation_count": len(results),
        "observations": results,
        "criterion": (
            "The construction of the instrument must conform "
            "to the applicable requirements and approved "
            "technical documentation."
        ),
        "explanation": (
            "The instrument construction, markings, securing "
            "arrangements and relevant documentation were "
            "checked against the applicable requirements."
        ),
    }