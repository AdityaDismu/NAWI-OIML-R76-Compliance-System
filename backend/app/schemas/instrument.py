from pydantic import BaseModel
from typing import Optional


class InstrumentCreate(BaseModel):
    manufacturer: str
    model: str
    serial_number: str
    accuracy_class: str
    category: str
    indication_type: str
    software_identification: Optional[str] = None
    software_version: Optional[str] = None
    connected_modules: Optional[str] = None
    notes: Optional[str] = None


class InstrumentResponse(BaseModel):
    id: str
    manufacturer: str
    model: str
    serial_number: str
    accuracy_class: str
    category: str
    indication_type: str
    software_identification: Optional[str] = None
    software_version: Optional[str] = None
    connected_modules: Optional[str] = None
    notes: Optional[str] = None


class InstrumentRangeCreate(BaseModel):
    range_type: str = "SINGLE_RANGE"
    max_capacity: float
    min_capacity: float
    verification_scale_interval: float
    actual_scale_interval: float
    maximum_tare: Optional[float] = None