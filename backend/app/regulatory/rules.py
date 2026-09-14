from decimal import Decimal

from app.regulatory.mpe import get_mpe
from app.utils.decimal_utils import to_decimal


def is_within_mpe(error, mpe) -> bool:
    """
    PASS when |error| <= MPE
    """

    return abs(to_decimal(error)) <= abs(to_decimal(mpe))


def get_mpe_for_load(
    load_value,
    instrument_range,
    instrument,
):
    return get_mpe(
        load_value=load_value,
        verification_scale_interval=instrument_range[
            "verification_scale_interval"
        ],
        accuracy_class=instrument["accuracy_class"],
    )


def get_n(
    max_capacity,
    verification_scale_interval,
):
    """
    n = Max / e
    """

    max_value = to_decimal(max_capacity)
    e = to_decimal(verification_scale_interval)

    if e <= 0:
        raise ValueError("e must be greater than zero")

    return max_value / e