from decimal import Decimal

from app.utils.decimal_utils import to_decimal


def evaluate_zero_return(
    zero_before,
    zero_after,
    verification_scale_interval,
    instrument_range,
) -> dict:

    zero_before = to_decimal(zero_before)
    zero_after = to_decimal(zero_after)
    e = to_decimal(verification_scale_interval)

    zero_deviation = abs(
        zero_after - zero_before
    )

    limit = Decimal("0.5") * e

    passed = zero_deviation <= limit

    return {
        "test_code": "ZERO_RETURN",
        "result": "PASS" if passed else "FAIL",
        "zero_before": zero_before,
        "zero_after": zero_after,
        "zero_deviation": zero_deviation,
        "limit": limit,
        "criterion": "|zero deviation| <= 0.5e",
        "explanation": (
            "The zero indication after removal of the "
            "test load was compared with the initial "
            "zero indication."
        ),
    }