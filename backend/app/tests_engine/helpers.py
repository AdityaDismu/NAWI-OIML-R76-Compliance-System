from decimal import Decimal

from app.utils.decimal_utils import to_decimal


def get_range_value(instrument_range: dict, field: str) -> Decimal:
    value = instrument_range.get(field)

    if value is None:
        raise ValueError(f"Instrument range field '{field}' is required")

    return to_decimal(value)


def all_pass(results: list[str]) -> bool:
    return all(result == "PASS" for result in results)


def pass_fail(condition: bool) -> str:
    return "PASS" if condition else "FAIL"