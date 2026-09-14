from fastapi import APIRouter, HTTPException
from app.core.database import supabase

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("")
async def dashboard_summary():
    try:
        instruments = supabase.table("instruments").select("id", count="exact").execute()
        evaluations = supabase.table("evaluations").select("id,status,created_at").execute()
        rows = evaluations.data or []
        return {
            "total_instruments": instruments.count or 0,
            "active_evaluations": sum(1 for x in rows if x.get("status") in {"DRAFT", "NOT_STARTED", "IN_PROGRESS", "COMPLETE"}),
            "completed_evaluations": sum(1 for x in rows if x.get("status") == "COMPLETE"),
            "finalized_evaluations": sum(1 for x in rows if x.get("status") == "FINALIZED"),
            "recent_evaluations": rows[:10],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
