from decimal import Decimal


def _class_name(value):
    return str(value or "").replace("Class ", "").strip().upper()


def _decimal_range_value(data, *keys):
    for key in keys:
        value = data.get(key)
        if value is not None and value != "":
            return Decimal(str(value))
    return Decimal("0")


def determine_applicability(test_code: str, instrument: dict, instrument_range: dict) -> tuple[bool, str | None]:
    accuracy_class = _class_name(instrument.get("accuracy_class"))
    category = str(instrument.get("category", "")).strip().upper()
    indication_type = str(instrument.get("indication_type", "")).strip().upper()
    max_capacity = _decimal_range_value(instrument_range, "max_capacity", "max", "max_value")
    e = _decimal_range_value(instrument_range, "verification_scale_interval", "e")

    if test_code == "ENDURANCE":
        applicable = accuracy_class in {"II", "III", "IIII"} and max_capacity <= Decimal("100")
        return applicable, None if applicable else "Endurance applies to Class II, III or IIII instruments with Max not exceeding 100 kg."

    if test_code == "SPAN_STABILITY":
        applicable = accuracy_class != "I"
        return applicable, None if applicable else "Span stability is not applicable to Class I instruments."

    if test_code == "CREEP":
        applicable = accuracy_class != "I"
        return applicable, None if applicable else "Creep is not applicable to Class I instruments."

    if test_code in {"WARM_UP", "VOLTAGE_VARIATION", "EMC"}:
        applicable = category == "ELECTRONIC"
        return applicable, None if applicable else f"{test_code.replace('_', ' ').title()} applies to electronic instruments."

    if test_code == "DAMP_HEAT":
        if category != "ELECTRONIC":
            return False, "Damp heat applies to electronic instruments."
        if accuracy_class == "I":
            return False, "Damp heat is not applicable to Class I instruments."
        if accuracy_class == "II" and e < Decimal("0.001"):
            return False, "Damp heat is not applicable to Class II when e is less than 1 g."
        return True, None

    if test_code == "DISCRIMINATION":
        applicable = category == "ELECTRONIC" and indication_type == "DIGITAL"
        return applicable, None if applicable else "Discrimination applies to digital electronic instruments."

    if test_code == "SENSITIVITY":
        applicable = indication_type == "NON_SELF_INDICATING"
        return applicable, None if applicable else "Sensitivity applies to non-self-indicating instruments."

    return True, None
