from app.utils.decimal_utils import to_decimal
from app.regulatory.rules import get_mpe_for_load


def evaluate_warmup(observations, instrument=None, instrument_range=None):
    if not observations:
        raise ValueError("At least one warm-up observation is required")
    results = []
    for observation in observations:
        elapsed = int(observation["elapsed_minutes"])
        zero_error = to_decimal(observation["zero_error"])
        load_error = to_decimal(observation["load_error"])
        available = bool(observation.get("weighing_result_available", False))
        load_value = to_decimal(observation.get("load_value", instrument_range.get("max_capacity") if instrument_range else 0))
        mpe = abs(to_decimal(observation.get("mpe", 0)))
        if mpe == 0 and instrument is not None and instrument_range is not None and load_value > 0:
            mpe = abs(get_mpe_for_load(load_value, instrument_range, instrument))
        load_ok = True if mpe == 0 else abs(load_error) <= mpe
        passed = (not available) and load_ok
        results.append({
            "elapsed_minutes": elapsed,
            "zero_error": zero_error,
            "load_error": load_error,
            "load_value": load_value,
            "mpe": mpe,
            "weighing_result_available": available,
            "load_error_within_mpe": load_ok,
            "result": "PASS" if passed else "FAIL",
        })
    overall_pass = all(item["result"] == "PASS" for item in results)
    return {
        "test_code": "WARM_UP",
        "result": "PASS" if overall_pass else "FAIL",
        "observation_count": len(results),
        "observations": results,
        "criterion": "No weighing result may be indicated or transmitted during warm-up; when a loaded error is recorded, it must also remain within the applicable MPE.",
        "explanation": "Warm-up behaviour was checked at the recorded times after switching on the instrument.",
    }
