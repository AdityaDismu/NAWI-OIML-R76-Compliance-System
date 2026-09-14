from decimal import Decimal

from app.regulatory.rules import (
    get_mpe_for_load,
    is_within_mpe,
)
from app.tests_engine.helpers import pass_fail
from app.utils.decimal_utils import to_decimal


def get_eccentricity_test_load(
    instrument_range: dict,
    support_points: int | None = None,
) -> Decimal:
    """
    Determine the prescribed eccentricity test load.

    OIML R76-1:2006 A.4.7.1 specifies, as the general case,
    a load of:

        1/3 (Max + T+)

    where:
        Max = maximum capacity
        T+  = maximum additive tare

    For instruments with more than four support points,
    the load is:

        1/(n - 1) (Max + T+)

    where n is the number of support points.

    For the current single-range instrument:
        Max = 150 kg
        T+  = 30 kg

    Therefore:
        Test load = (150 + 30) / 3
                  = 60 kg
    """

    max_capacity = to_decimal(
        instrument_range.get(
            "max_capacity",
            instrument_range.get("max_value"),
        )
    )

    maximum_tare = to_decimal(
        instrument_range.get("maximum_tare") or 0
    )

    total_capacity = (
        max_capacity + maximum_tare
    )

    if support_points and support_points > 4:
        return (
            total_capacity
            / Decimal(support_points - 1)
        )

    return total_capacity / Decimal(3)


def evaluate_eccentricity(
    observations: list[dict],
    instrument: dict,
    instrument_range: dict,
) -> dict:
    """
    Evaluate the eccentricity test.

    Each observation contains:

        load_value
        reference_indication
        indication_value
        position

    In this prototype, reference_indication represents
    the reference value corresponding to the applied load.

    Therefore:

        Error = Indication - Reference Indication

    The previous implementation incorrectly calculated:

        Error = Indication - Load
        Corrected Error = Error - Reference Indication

    which caused values such as:

        0.010 - 50.000 = -49.990

    That was incorrect.

    For the current simplified eccentricity test workflow,
    the reference indication is the comparison reference,
    so the corrected error is the calculated error.

    The result passes when:

        |Corrected Error| <= MPE
    """

    if not observations:
        raise ValueError(
            "At least one eccentricity observation is required"
        )

    results = []

    for observation in observations:

        load_value = to_decimal(
            observation["load_value"]
        )

        indication = to_decimal(
            observation["indication_value"]
        )

        reference_indication = to_decimal(
            observation.get(
                "reference_indication",
                load_value,
            )
        )

        # -------------------------------------------------
        # Correct error calculation
        # -------------------------------------------------
        #
        # The reference indication represents the expected
        # indication for the applied test load.
        #
        # Example:
        #
        # Reference = 50.000
        # Indication = 50.010
        #
        # Error = +0.010 kg
        #
        error = (
            indication
            - reference_indication
        )

        # For this prototype's eccentricity input model,
        # the reference indication already represents the
        # zero/reference-corrected comparison value.
        corrected_error = error

        # -------------------------------------------------
        # MPE
        # -------------------------------------------------

        mpe = get_mpe_for_load(
            load_value,
            instrument_range,
            instrument,
        )

        # -------------------------------------------------
        # PASS / FAIL
        # -------------------------------------------------

        passed = is_within_mpe(
            corrected_error,
            mpe,
        )

        results.append(
            {
                "position": observation.get(
                    "position"
                ),
                "load_value": load_value,
                "indication_value": indication,
                "reference_indication": (
                    reference_indication
                ),
                "error": error,
                "corrected_error": (
                    corrected_error
                ),
                "mpe": mpe,
                "result": pass_fail(
                    passed
                ),
            }
        )

    overall_pass = all(
        item["result"] == "PASS"
        for item in results
    )

    return {
        "test_code": "ECCENTRICITY",
        "result": (
            "PASS"
            if overall_pass
            else "FAIL"
        ),
        "observation_count": len(
            results
        ),
        "observations": results,
        "criterion": (
            "Error at each required loading position "
            "must be within the applicable MPE."
        ),
        "explanation": (
            "The instrument was checked at the required "
            "eccentric loading positions and each "
            "calculated error was compared with the "
            "applicable MPE."
        ),
    }