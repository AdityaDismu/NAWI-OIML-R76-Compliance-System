from decimal import Decimal

from app.utils.decimal_utils import to_decimal


def calculate_corrected_load(
    indication,
    verification_scale_interval,
    delta_load=0,
):
    """
    OIML R76-1:2006:

    P = I + 0.5e - ΔL
    """

    I = to_decimal(indication)
    e = to_decimal(verification_scale_interval)
    delta = to_decimal(delta_load)

    return I + (Decimal("0.5") * e) - delta


def calculate_error(
    indication,
    load_value,
    verification_scale_interval,
    delta_load=0,
):
    """
    E = P - L
    """

    P = calculate_corrected_load(
        indication,
        verification_scale_interval,
        delta_load,
    )

    L = to_decimal(load_value)

    return P - L


def calculate_corrected_error(
    error,
    zero_error,
):
    """
    Ec = E - E0
    """

    E = to_decimal(error)
    E0 = to_decimal(zero_error)

    return E - E0