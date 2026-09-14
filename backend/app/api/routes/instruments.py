from fastapi import APIRouter, HTTPException

from app.core.database import supabase
from app.schemas.instrument import (
    InstrumentCreate,
    InstrumentRangeCreate,
)


router = APIRouter(
    prefix="/instruments",
    tags=["Instruments"],
)


def format_instrument(instrument):
    """
    Convert database field names into the API/frontend format.

    Database:
        model_type

    Frontend/API:
        model
    """

    if not instrument:
        return instrument

    formatted = dict(instrument)

    if "model_type" in formatted:
        formatted["model"] = formatted.pop("model_type")

    return formatted


def format_range(range_data):
    """
    Convert database range fields into the frontend-friendly format.

    The database contains both:
        max_value / min_value / e_value / d_value

    and:
        max_capacity / min_capacity /
        verification_scale_interval / actual_scale_interval

    The frontend uses the descriptive names.
    """

    if not range_data:
        return range_data

    formatted = dict(range_data)

    # If descriptive fields are missing, derive them from
    # the database's value fields.
    if (
        formatted.get("max_capacity") is None
        and formatted.get("max_value") is not None
    ):
        formatted["max_capacity"] = formatted["max_value"]

    if (
        formatted.get("min_capacity") is None
        and formatted.get("min_value") is not None
    ):
        formatted["min_capacity"] = formatted["min_value"]

    if (
        formatted.get("verification_scale_interval") is None
        and formatted.get("e_value") is not None
    ):
        formatted["verification_scale_interval"] = formatted["e_value"]

    if (
        formatted.get("actual_scale_interval") is None
        and formatted.get("d_value") is not None
    ):
        formatted["actual_scale_interval"] = formatted["d_value"]

    if (
        formatted.get("maximum_tare") is None
        and formatted.get("max_tare") is not None
    ):
        formatted["maximum_tare"] = formatted["max_tare"]

    return formatted


# ================================================================
# CREATE INSTRUMENT
# ================================================================

@router.post("")
async def create_instrument(
    instrument: InstrumentCreate,
):

    instrument_data = {
        "manufacturer": instrument.manufacturer,
        "model_type": instrument.model,
        "serial_number": instrument.serial_number,
        "accuracy_class": instrument.accuracy_class,
        "category": instrument.category,
        "indication_type": instrument.indication_type,
        "software_identification": (
            instrument.software_identification
        ),
        "software_version": instrument.software_version,
        "connected_modules": instrument.connected_modules,
        "notes": instrument.notes,
    }

    try:
        response = (
            supabase
            .table("instruments")
            .insert(instrument_data)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=400,
                detail="Instrument could not be created",
            )

        created_instrument = response.data[0]

        return format_instrument(
            created_instrument
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# ================================================================
# GET ALL INSTRUMENTS
# ================================================================

@router.get("")
async def get_instruments():

    try:
        response = (
            supabase
            .table("instruments")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        instruments = [
            format_instrument(instrument)
            for instrument in (response.data or [])
        ]

        return {
            "count": len(instruments),
            "instruments": instruments,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# ================================================================
# GET SINGLE INSTRUMENT
# ================================================================

@router.get("/{instrument_id}")
async def get_instrument(
    instrument_id: str,
):

    try:

        # --------------------------------------------------------
        # Get instrument
        # --------------------------------------------------------

        instrument_response = (
            supabase
            .table("instruments")
            .select("*")
            .eq("id", instrument_id)
            .single()
            .execute()
        )

        if not instrument_response.data:
            raise HTTPException(
                status_code=404,
                detail="Instrument not found",
            )

        instrument = format_instrument(
            instrument_response.data
        )

        # --------------------------------------------------------
        # Get ranges
        # --------------------------------------------------------

        ranges_response = (
            supabase
            .table("instrument_ranges")
            .select("*")
            .eq("instrument_id", instrument_id)
            .order("created_at")
            .execute()
        )

        ranges = [
            format_range(range_data)
            for range_data in (ranges_response.data or [])
        ]

        instrument["ranges"] = ranges

        return instrument

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail="Instrument not found",
        )


# ================================================================
# CREATE INSTRUMENT RANGE
# ================================================================

@router.post("/{instrument_id}/ranges")
async def create_instrument_range(
    instrument_id: str,
    range_data: InstrumentRangeCreate,
):

    try:

        # --------------------------------------------------------
        # 1. Check instrument exists
        # --------------------------------------------------------

        instrument_response = (
            supabase
            .table("instruments")
            .select("id")
            .eq("id", instrument_id)
            .single()
            .execute()
        )

        if not instrument_response.data:
            raise HTTPException(
                status_code=404,
                detail="Instrument not found",
            )

        # --------------------------------------------------------
        # 2. Prepare range data
        # --------------------------------------------------------

        max_value = range_data.max_capacity
        min_value = range_data.min_capacity
        e_value = range_data.verification_scale_interval
        d_value = range_data.actual_scale_interval

        range_insert = {
            "instrument_id": instrument_id,

            "range_type": range_data.range_type,

            # Current descriptive database fields
            "max_capacity": max_value,
            "min_capacity": min_value,
            "verification_scale_interval": e_value,
            "actual_scale_interval": d_value,
            "maximum_tare": range_data.maximum_tare,

            # Required existing database fields
            "max_value": max_value,
            "min_value": min_value,
            "e_value": e_value,
            "d_value": d_value,
        }

        # --------------------------------------------------------
        # 3. Insert range
        # --------------------------------------------------------

        response = (
            supabase
            .table("instrument_ranges")
            .insert(range_insert)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=400,
                detail="Instrument range could not be created",
            )

        return format_range(
            response.data[0]
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )