from dataclasses import dataclass
from decimal import Decimal
from typing import Any


@dataclass
class CalculationResult:
    value: Decimal | None = None
    passed: bool | None = None
    criterion: str | None = None
    explanation: str | None = None


@dataclass
class TestCalculation:
    test_code: str
    result: str
    criterion: str
    explanation: str
    observations: list[dict[str, Any]]
    calculations: list[dict[str, Any]]