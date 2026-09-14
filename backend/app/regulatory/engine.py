from app.tests_engine.weighing_performance import (
    evaluate_test as evaluate_weighing_performance,
)

from app.tests_engine.eccentricity import (
    evaluate_eccentricity,
)

from app.tests_engine.repeatability import (
    evaluate_repeatability,
)

from app.tests_engine.zero_return import (
    evaluate_zero_return,
)

from app.tests_engine.creep import (
    evaluate_creep,
)

from app.tests_engine.tare import evaluate_tare
from app.tests_engine.discrimination import evaluate_discrimination
from app.tests_engine.stability import evaluate_stability
from app.tests_engine.warmup import evaluate_warmup
from app.tests_engine.temperature import evaluate_temperature
from app.tests_engine.voltage import evaluate_voltage
from app.tests_engine.tilting import evaluate_tilting
from app.tests_engine.damp_heat import evaluate_damp_heat
from app.tests_engine.construction import evaluate_construction
from app.tests_engine.emc import evaluate_emc

from app.tests_engine.span_stability import (
    evaluate_span_stability,
)

from app.tests_engine.endurance import (
    evaluate_endurance,
)


def calculate_test(
    test_code,
    observations=None,
    instrument=None,
    instrument_range=None,
    zero_error=0,
    **kwargs,
):

    observations = observations or []

    if test_code == "WEIGHING_PERFORMANCE":

        return evaluate_weighing_performance(
            observations=observations,
            instrument=instrument,
            instrument_range=instrument_range,
            zero_error=zero_error,
        )

    if test_code == "ECCENTRICITY":

        return evaluate_eccentricity(
            observations=observations,
            instrument=instrument,
            instrument_range=instrument_range,
        )

    if test_code == "REPEATABILITY":

        return evaluate_repeatability(
            observations=observations,
            instrument=instrument,
            instrument_range=instrument_range,
        )

    if test_code == "ZERO_RETURN":

        return evaluate_zero_return(
            zero_before=kwargs["zero_before"],
            zero_after=kwargs["zero_after"],
            verification_scale_interval=(
                instrument_range[
                    "verification_scale_interval"
                ]
            ),
            instrument_range=instrument_range,
        )

    if test_code == "CREEP":

        return evaluate_creep(
            indication_0=kwargs["indication_0"],
            indication_15=kwargs["indication_15"],
            indication_30=kwargs["indication_30"],
            verification_scale_interval=(
                instrument_range[
                    "verification_scale_interval"
                ]
            ),
            mpe=kwargs["mpe"],
            indication_4h=kwargs.get("indication_4h"),
        )

    if test_code == "TARE":

        return evaluate_tare(
            observations=observations,
            instrument=instrument,
            instrument_range=instrument_range,
        )

    if test_code == "DISCRIMINATION":

        return evaluate_discrimination(
            observations=observations,
            actual_scale_interval=(
                instrument_range[
                    "actual_scale_interval"
                ]
            ),
        )

    if test_code in ("STABILITY_OF_EQUILIBRIUM", "STABILITY"):

        return evaluate_stability(
            observations=observations,
        )

    if test_code in ("WARM_UP", "WARMUP"):

        return evaluate_warmup(
            observations=observations,
            instrument=instrument,
            instrument_range=instrument_range,
        )

    if test_code == "TEMPERATURE":
        return evaluate_temperature(
            observations=observations,
        )

    if test_code in ("VOLTAGE_VARIATION", "VOLTAGE"):
        return evaluate_voltage(
            observations=observations,
            instrument=instrument,
            instrument_range=instrument_range,
        )

    if test_code == "TILTING":
        return evaluate_tilting(
            observations=observations,
        )

    if test_code == "DAMP_HEAT":
        return evaluate_damp_heat(
            observations=observations,
        )

    if test_code in ("CONSTRUCTION_CHECKLIST", "CONSTRUCTION"):
        return evaluate_construction(
            observations=observations,
        )

    if test_code == "EMC":
        return evaluate_emc(
            observations=observations,
        )

    if test_code == "SPAN_STABILITY":
        return evaluate_span_stability(
            observations=observations,
            instrument=instrument,
            instrument_range=instrument_range,
        )

    if test_code == "ENDURANCE":
        return evaluate_endurance(
            observations=observations,
            instrument=instrument,
            instrument_range=instrument_range,
        )

    raise ValueError(
        f"Test engine not implemented yet: {test_code}"
    )