from decimal import Decimal

from app.utils.decimal_utils import to_decimal


def get_mpe(
    load_value,
    verification_scale_interval,
    accuracy_class,
):
    """
    Return the maximum permissible error for the given load.

    Based on OIML R76-1:2006 Table 6 for initial verification.
    """

    L = to_decimal(load_value)
    e = to_decimal(verification_scale_interval)

    if e <= 0:
        raise ValueError("Verification scale interval e must be greater than zero")

    accuracy_class = str(accuracy_class or "").replace("Class ", "").strip().upper()
    # Accept labels such as "Class III (Medium)" used by the UI.
    if accuracy_class.startswith("III (" ) or accuracy_class.startswith("III-"):
        accuracy_class = "III"
    elif accuracy_class.startswith("II (" ) or accuracy_class.startswith("II-"):
        accuracy_class = "II"
    elif accuracy_class.startswith("IIII (" ) or accuracy_class.startswith("IIII-"):
        accuracy_class = "IIII"
    elif accuracy_class.startswith("I (" ) or accuracy_class.startswith("I-"):
        accuracy_class = "I"

    if accuracy_class not in ["I", "II", "III", "IIII"]:
        raise ValueError(f"Unsupported accuracy class: {accuracy_class}")

    # Number of verification intervals corresponding to the load
    intervals = L / e

    if accuracy_class == "I":

        # Class I:
        # ±0.5e throughout the applicable range
        return Decimal("0.5") * e

    if accuracy_class == "II":

        if intervals <= Decimal("500"):
            return Decimal("0.5") * e

        if intervals <= Decimal("2000"):
            return Decimal("1") * e

        return Decimal("1.5") * e

    if accuracy_class == "III":

        if intervals <= Decimal("500"):
            return Decimal("0.5") * e

        if intervals <= Decimal("2000"):
            return Decimal("1") * e

        return Decimal("1.5") * e

    if accuracy_class == "IIII":

        if intervals <= Decimal("50"):
            return Decimal("0.5") * e

        if intervals <= Decimal("200"):
            return Decimal("1") * e

        return Decimal("1.5") * e

    raise ValueError("Unable to determine MPE")