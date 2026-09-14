from decimal import Decimal
from app.utils.decimal_utils import to_decimal


def evaluate_voltage(observations, instrument=None, instrument_range=None):
    if not observations:
        raise ValueError("At least one voltage observation is required")

    e = to_decimal(
        instrument_range["verification_scale_interval"]
    )

    results = []

    for observation in observations:
        voltage = to_decimal(observation["voltage"])
        load_value = to_decimal(observation["load_value"])
        error = abs(to_decimal(observation.get("error", 0)))
        mpe = abs(to_decimal(observation.get("mpe", 0)))
        if mpe == 0 and instrument is not None:
            from app.regulatory.rules import get_mpe_for_load
            mpe = abs(get_mpe_for_load(load_value, instrument_range, instrument))

        within_mpe = error <= mpe

        function_ok = observation.get(
            "function_ok",
            True,
        )

        passed = within_mpe and function_ok

        results.append(
            {
                "voltage": voltage,
                "load_value": load_value,
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
        "test_code": "VOLTAGE_VARIATION",
        "result": "PASS" if overall_pass else "FAIL",
        "observation_count": len(results),
        "verification_scale_interval": e,
        "observations": results,
        "criterion": (
            "The instrument must operate as specified and "
            "indications must remain within the applicable MPE."
        ),
        "explanation": (
            "The instrument was tested at the specified supply "
            "voltage conditions and the weighing indication and "
            "functional behaviour were evaluated."
        ),
    }