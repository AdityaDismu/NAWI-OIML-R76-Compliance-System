from app.regulatory.rules import get_mpe_for_load
from app.utils.decimal_utils import to_decimal


def evaluate_repeatability(
    observations: list[dict],
    instrument: dict,
    instrument_range: dict,
) -> dict:

    if len(observations) < 2:
        raise ValueError(
            "At least two repeatability observations are required"
        )

    indications = [
        to_decimal(item["indication_value"])
        for item in observations
    ]

    maximum = max(indications)
    minimum = min(indications)

    repeatability_range = maximum - minimum

    load_value = to_decimal(
        observations[0]["load_value"]
    )

    mpe = get_mpe_for_load(
        load_value,
        instrument_range,
        instrument,
    )

    passed = repeatability_range <= abs(mpe)

    return {
        "test_code": "REPEATABILITY",
        "result": "PASS" if passed else "FAIL",
        "observation_count": len(observations),
        "load_value": load_value,
        "maximum_indication": maximum,
        "minimum_indication": minimum,
        "repeatability_range": repeatability_range,
        "mpe": mpe,
        "criterion": (
            "Range of indications must be <= applicable MPE."
        ),
        "explanation": (
            "Repeatability is determined from the difference "
            "between the maximum and minimum indications "
            "obtained under repeated weighing conditions."
        ),
        "observations": [
            {
                "sequence_no": index,
                "load_value": to_decimal(
                    item["load_value"]
                ),
                "indication_value": to_decimal(
                    item["indication_value"]
                ),
            }
            for index, item in enumerate(
                observations,
                start=1,
            )
        ],
    }