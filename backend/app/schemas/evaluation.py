from pydantic import BaseModel
from typing import Optional


class EvaluationCreate(BaseModel):
    instrument_id: str
    evaluation_type: str = "INITIAL_VERIFICATION"
    standard_id: Optional[str] = None
    notes: Optional[str] = None