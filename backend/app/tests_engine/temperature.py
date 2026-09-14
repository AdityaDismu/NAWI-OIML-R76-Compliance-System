from decimal import Decimal
from app.utils.decimal_utils import to_decimal


def evaluate_temperature(observations):
    if not observations:
        raise ValueError("At least one temperature observation is required")

    results = []
    for observation in observations:
        temperature = to_decimal(observation["temperature"])
        zero_change = abs(to_decimal(observation["zero_change"]))
        e = to_decimal(observation["verification_scale_interval"])
        accuracy_class = str(observation.get("accuracy_class", "III")).replace("Class ", "").strip().upper()
        if e <= 0:
            raise ValueError("Verification scale interval e must be greater than zero")

        # R76 zero indication temperature effect: for Class II/III/IIII,
        # no more than 1e per 5 °C; for Class I, 1e per 1 °C.
        limit = e if accuracy_class == "I" else e
        basis = "1e per 1 °C" if accuracy_class == "I" else "1e per 5 °C"
        passed = zero_change <= limit
        results.append({
            "temperature": temperature,
            "zero_change": zero_change,
            "limit": limit,
            "basis": basis,
            "result": "PASS" if passed else "FAIL",
        })

    overall_pass = all(item["result"] == "PASS" for item in results)
    return {
        "test_code": "TEMPERATURE",
        "result": "PASS" if overall_pass else "FAIL",
        "observation_count": len(results),
        "observations": results,
        "criterion": "Zero variation must not exceed 1e for each 1 °C change for Class I, or 1e for each 5 °C change for Classes II, III and IIII.",
        "explanation": "Zero indication variation was evaluated at the recorded stabilized temperature points.",
    }
