from decimal import Decimal
from app.utils.decimal_utils import to_decimal


def evaluate_endurance(
    observations,
    instrument,
    instrument_range,
):
    if not observations:
        raise ValueError(
            "At least one endurance observation is required"
        )

    max_capacity = to_decimal(
        instrument_range.get("max_capacity", instrument_range.get("max_value"))
    )

    accuracy_class = str(instrument.get("accuracy_class", "")).replace("Class ", "").strip().upper()

    # Endurance is applicable only to:
    # Class II, III and IIII
    # Max <= 100 kg
    if accuracy_class not in ["II", "III", "IIII"]:
        raise ValueError(
            "Endurance test is not applicable to Class I instruments."
        )

    if max_capacity > Decimal("100"):
        raise ValueError(
            "Endurance test is not applicable when Max exceeds 100 kg."
        )

    results = []

    for index, observation in enumerate(
        observations,
        start=1,
    ):
        stage = observation.get(
            "stage",
            "UNKNOWN",
        )

        load_value = to_decimal(
            observation.get("load_value", observation.get("test_load"))
        )

        initial_error = abs(
            to_decimal(
                observation["initial_error"]
            )
        )

        final_error = abs(
            to_decimal(
                observation["final_error"]
            )
        )

        mpe = abs(
            to_decimal(
                observation.get("mpe", 0)
            )
        )
        if mpe == 0:
            from app.regulatory.rules import get_mpe_for_load
            mpe = abs(get_mpe_for_load(load_value, instrument_range, instrument))

        durability_error = abs(
            final_error - initial_error
        )

        operation_ok = observation.get("operation_ok", True)
        passed = (
            final_error <= mpe
            and durability_error <= mpe
            and operation_ok
        ) if mpe > 0 else operation_ok

        results.append(
            {
                "sequence_no": index,
                "stage": stage,
                "load_value": load_value,
                "initial_error": initial_error,
                "final_error": final_error,
                "durability_error": durability_error,
                "mpe": mpe,
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
        "test_code": "ENDURANCE",
        "result": (
            "PASS"
            if overall_pass
            else "FAIL"
        ),
        "observation_count": len(results),
        "observations": results,
        "criterion": (
            "After the specified endurance loading cycles, "
            "the instrument must continue to satisfy the "
            "applicable weighing performance requirements."
        ),
        "explanation": (
            "The instrument was evaluated before and after "
            "the endurance loading sequence and the resulting "
            "errors were compared with the applicable limits."
        ),
    }