from app.utils.decimal_utils import to_decimal
from decimal import Decimal


def evaluate_discrimination(observations: list[dict], actual_scale_interval) -> dict:
    if not observations:
        raise ValueError("At least one discrimination observation is required")

    d = to_decimal(actual_scale_interval)
    if d <= 0:
        raise ValueError("Actual scale interval d must be greater than zero")

    results = []
    for observation in observations:
        initial = to_decimal(observation["initial_indication"])
        reduced = to_decimal(observation["reduced_indication"])
        final = to_decimal(observation["final_indication"])

        # R76 digital discrimination sequence: reduce indication by d,
        # add 0.1d and then the specified 1.4d load; the indication must
        # increase to at least the original indication + d.
        reduced_target = initial - d
        additional_load = Decimal("0.1") * d
        required_final = initial + d
        reduction_ok = reduced <= reduced_target
        final_ok = final >= required_final
        passed = reduction_ok and final_ok

        results.append({
            "load_value": to_decimal(observation["load_value"]),
            "initial_indication": initial,
            "reduced_indication": reduced,
            "required_reduced_indication": reduced_target,
            "additional_load": additional_load,
            "final_indication": final,
            "required_final_indication": required_final,
            "reduction_ok": reduction_ok,
            "final_ok": final_ok,
            "result": "PASS" if passed else "FAIL",
        })

    overall_pass = all(item["result"] == "PASS" for item in results)
    return {
        "test_code": "DISCRIMINATION",
        "result": "PASS" if overall_pass else "FAIL",
        "observation_count": len(results),
        "observations": results,
        "criterion": "The indication must first be reduced by at least d and, after the specified additional load, must increase by at least d from the initial indication.",
        "explanation": "Digital discrimination was evaluated at the selected loads using the prescribed reduction and additional-load sequence.",
    }
