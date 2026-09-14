from decimal import Decimal
from app.utils.decimal_utils import to_decimal
from app.regulatory.rules import get_mpe_for_load


def evaluate_span_stability(observations, instrument, instrument_range):
    if not observations:
        raise ValueError(
            "At least one span stability observation is required"
        )

    results = []

    for index, observation in enumerate(
        observations,
        start=1,
    ):
        if "initial_error" in observation:
            initial_error = to_decimal(observation["initial_error"])
            later_error = to_decimal(observation["later_error"])
        else:
            initial_error = (
                to_decimal(observation["indication_initial"])
                - to_decimal(observation["zero_reference"])
            )
            later_error = (
                to_decimal(observation["indication_load"])
                - to_decimal(observation["load_reference"])
            )

        mpe = abs(
            to_decimal(observation.get("mpe", 0))
        )
        if mpe == 0:
            load_value = to_decimal(observation.get("load_reference", instrument_range["max_capacity"]))
            mpe = abs(get_mpe_for_load(load_value, instrument_range, instrument))

        error_difference = abs(
            later_error - initial_error
        )

        e = to_decimal(
            instrument_range["verification_scale_interval"]
        )

        # R76 acceptance limit:
        # maximum permitted difference between errors
        difference_limit = max(
            Decimal("0.5") * e,
            Decimal("0.5") * mpe,
        )

        error_ok = abs(later_error) <= mpe
        difference_ok = (
            error_difference <= difference_limit
        )

        passed = error_ok and difference_ok

        results.append(
            {
                "sequence_no": index,
                "initial_error": initial_error,
                "later_error": later_error,
                "mpe": mpe,
                "error_difference": error_difference,
                "difference_limit": difference_limit,
                "error_within_mpe": error_ok,
                "difference_within_limit": difference_ok,
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
        "test_code": "SPAN_STABILITY",
        "result": (
            "PASS"
            if overall_pass
            else "FAIL"
        ),
        "observation_count": len(results),
        "observations": results,
        "criterion": (
            "The span error must remain within the applicable "
            "MPE and the difference between errors from "
            "different measurements must remain within the "
            "specified stability limit."
        ),
        "explanation": (
            "Span stability was evaluated by comparing the "
            "initial corrected error with errors obtained "
            "during subsequent measurements."
        ),
    }