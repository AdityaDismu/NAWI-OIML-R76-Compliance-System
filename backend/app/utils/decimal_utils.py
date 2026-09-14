from decimal import Decimal


def to_decimal(value) -> Decimal:
    """
    Convert a value safely to Decimal.

    Strings are preferred for regulatory calculations because
    they avoid floating-point rounding issues.
    """

    if isinstance(value, Decimal):
        return value

    if value is None:
        return Decimal("0")

    return Decimal(str(value))


def decimal_to_json(value):
    """
    Recursively convert Decimal values into JSON-safe values.

    Decimal is kept during calculations.
    Only at the API/database boundary is it converted.
    """

    if isinstance(value, Decimal):
        return float(value)

    if isinstance(value, dict):
        return {
            key: decimal_to_json(item)
            for key, item in value.items()
        }

    if isinstance(value, list):
        return [
            decimal_to_json(item)
            for item in value
        ]

    if isinstance(value, tuple):
        return [
            decimal_to_json(item)
            for item in value
        ]

    return value