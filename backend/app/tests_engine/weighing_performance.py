from decimal import Decimal

from app.regulatory.formulas import (
    calculate_error,
    calculate_corrected_error,
)
from app.regulatory.rules import (
    get_mpe_for_load,
    is_within_mpe,
)
from app.utils.decimal_utils import to_decimal


def calculate_observation(
    load_value,
    indication_value,
    verification_scale_interval,
    zero_error,
    delta_load=0,
):
    """
    Calculate one weighing-performance observation.

    R76:

    P  = I + 0.5e - ΔL
    E  = P - L
    Ec = E - E0
    """

    L = to_decimal(load_value)
    I = to_decimal(indication_value)
    e = to_decimal(verification_scale_interval)
    E0 = to_decimal(zero_error)
    delta = to_decimal(delta_load)

    error = calculate_error(
        indication=I,
        load_value=L,
        verification_scale_interval=e,
        delta_load=delta,
    )

    corrected_error = calculate_corrected_error(
        error=error,
        zero_error=E0,
    )

    return {
        "load_value": L,
        "indication_value": I,
        "verification_scale_interval": e,
        "delta_load": delta,
        "error": error,
        "corrected_error": corrected_error,
    }


def evaluate_observation(
    observation,
    instrument,
    instrument_range,
):
    """
    Evaluate one observation against the applicable MPE.
    """

    load_value = observation["load_value"]
    corrected_error = observation["corrected_error"]

    mpe = get_mpe_for_load(
        load_value=load_value,
        instrument_range=instrument_range,
        instrument=instrument,
    )

    passed = is_within_mpe(
        corrected_error,
        mpe,
    )

    return {
        **observation,
        "mpe": mpe,
        "result": "PASS" if passed else "FAIL",
        "criterion": f"|Ec| <= {mpe}",
    }


def evaluate_test(
    observations,
    instrument,
    instrument_range,
    zero_error,
):
    """
    Evaluate the complete weighing-performance test.

    Every observation must satisfy its applicable MPE.
    """

    if not observations:
        raise ValueError(
            "At least one weighing observation is required"
        )

    evaluated = []

    for observation in observations:

        result = calculate_observation(
            load_value=observation["load_value"],
            indication_value=observation["indication_value"],
            verification_scale_interval=instrument_range[
                "verification_scale_interval"
            ],
            zero_error=zero_error,
            delta_load=observation.get("delta_load", 0),
        )

        evaluated_result = evaluate_observation(
            observation=result,
            instrument=instrument,
            instrument_range=instrument_range,
        )

        evaluated.append(evaluated_result)

    overall_pass = all(
        item["result"] == "PASS"
        for item in evaluated
    )

    return {
        "test_code": "WEIGHING_PERFORMANCE",
        "result": "PASS" if overall_pass else "FAIL",
        "observation_count": len(evaluated),
        "observations": evaluated,
    }