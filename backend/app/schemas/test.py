from pydantic import BaseModel


class TestInstanceStart(BaseModel):
    pass


class TestInstanceComplete(BaseModel):
    result: str
    remarks: str | None = None


class WeighingObservationInput(BaseModel):
    load_value: float
    indication_value: float
    delta_load: float = 0
    direction: str | None = None

class TestExecutionRequest(BaseModel):
    observations: list[dict] = []
    parameters: dict = {}