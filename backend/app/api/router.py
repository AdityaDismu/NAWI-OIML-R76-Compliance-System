from fastapi import APIRouter

from app.api.routes.instruments import router as instruments_router
from app.api.routes.tests import router as tests_router
from app.api.routes.evaluations import router as evaluations_router
from app.api.routes.calculations import router as calculations_router
from app.api.routes.reports import (
    router as reports_router,
)
from app.api.routes.equipment import router as equipment_router
from app.api.routes.attachments import router as attachments_router
from app.api.routes.audit import router as audit_router
from app.api.routes.dashboard import router as dashboard_router

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "NAWI OIML Backend"
    }


@router.get("/health/database")
async def database_health_check():
    from app.core.database import supabase

    try:
        response = (
            supabase
            .table("test_definitions")
            .select("id")
            .limit(1)
            .execute()
        )

        return {
            "status": "ok",
            "database": "connected",
            "test_definitions_accessible": True,
            "rows_checked": len(response.data or [])
        }

    except Exception as e:
        return {
            "status": "error",
            "database": "connection_failed",
            "detail": str(e)
        }


router.include_router(instruments_router)
router.include_router(tests_router)
router.include_router(evaluations_router)
router.include_router(calculations_router)
router.include_router(
    reports_router
)
router.include_router(equipment_router)

router.include_router(attachments_router)

router.include_router(audit_router)
router.include_router(dashboard_router)
