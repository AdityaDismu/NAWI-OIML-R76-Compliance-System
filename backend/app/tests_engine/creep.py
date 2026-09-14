from decimal import Decimal

from app.utils.decimal_utils import to_decimal


def evaluate_creep(
    indication_0,
    indication_15,
    indication_30,
    verification_scale_interval,
    mpe,
    indication_4h=None,
) -> dict:

    I0 = to_decimal(indication_0)
    I15 = to_decimal(indication_15)
    I30 = to_decimal(indication_30)
    e = to_decimal(verification_scale_interval)

    change_30 = abs(I30 - I0)

    change_15_to_30 = abs(I30 - I15)

    limit_30 = Decimal("0.5") * e
    limit_15_to_30 = Decimal("0.2") * e

    first_condition = change_30 <= limit_30
    second_condition = (
        change_15_to_30 <= limit_15_to_30
    )

    passed = (
        first_condition
        and second_condition
    )

    result = {
        "test_code": "CREEP",
        "result": "PASS" if passed else "FAIL",
        "indication_0": I0,
        "indication_15": I15,
        "indication_30": I30,
        "change_0_to_30": change_30,
        "change_15_to_30": change_15_to_30,
        "limit_0_to_30": limit_30,
        "limit_15_to_30": limit_15_to_30,
        "criterion": (
            "|I30-I0| <= 0.5e and "
            "|I30-I15| <= 0.2e"
        ),
    }

    if not passed and indication_4h is not None:

        I4h = to_decimal(indication_4h)

        change_4h = abs(I4h - I0)

        mpe = abs(to_decimal(mpe))

        result["indication_4h"] = I4h
        result["change_0_to_4h"] = change_4h
        result["mpe"] = mpe

        result["result"] = (
            "PASS"
            if change_4h <= mpe
            else "FAIL"
        )

        result["criterion"] = (
            "If the initial creep limits are not met, "
            "|I4h-I0| must be <= |MPE|."
        )

    result["explanation"] = (
        "Creep was evaluated from the change in indication "
        "during the specified observation periods."
    )

    return result