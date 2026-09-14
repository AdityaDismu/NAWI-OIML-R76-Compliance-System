from app.regulatory.rules import get_mpe_for_load, is_within_mpe
from app.tests_engine.helpers import pass_fail
from app.utils.decimal_utils import to_decimal
from decimal import Decimal


def calculate_net_value(gross_value, tare_value):
    return to_decimal(gross_value) - to_decimal(tare_value)


def evaluate_tare(observations: list[dict], instrument: dict, instrument_range: dict) -> dict:
    if not observations:
        raise ValueError("At least one tare observation is required")
    e = to_decimal(instrument_range["verification_scale_interval"])
    results = []
    for observation in observations:
        gross_load = to_decimal(observation["gross_load"])
        tare_value = to_decimal(observation["tare_value"])
        gross_indication = to_decimal(observation["gross_indication"])
        net_value = calculate_net_value(gross_load, tare_value)
        if "net_indication" in observation and observation["net_indication"] not in (None, ""):
            net_indication = to_decimal(observation["net_indication"])
        else:
            net_indication = gross_indication - tare_value
        net_reference = to_decimal(observation.get("net_reference", net_value))
        # A.4.4.3 style indication correction using the actual net indication.
        error = (net_indication + (Decimal("0.5") * e)) - net_reference
        mpe = get_mpe_for_load(net_value, instrument_range, instrument)
        passed = is_within_mpe(error, mpe)
        results.append({
            "gross_load": gross_load, "tare_value": tare_value,
            "net_value": net_value, "gross_indication": gross_indication,
            "net_indication": net_indication, "net_reference": net_reference,
            "error": error, "mpe": mpe, "result": pass_fail(passed),
        })
    overall_pass = all(item["result"] == "PASS" for item in results)
    return {
        "test_code": "TARE", "result": "PASS" if overall_pass else "FAIL",
        "observation_count": len(results), "observations": results,
        "criterion": "The net weighing error, determined from the net indication and applicable correction, must be within the MPE for the net load.",
        "explanation": "The instrument was tested with the recorded tare values and the resulting net weighing errors were compared with the applicable MPE.",
    }
