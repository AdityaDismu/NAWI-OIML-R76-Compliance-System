from fastapi import APIRouter, HTTPException
from app.core.database import supabase

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("")
async def list_audit_logs(evaluation_id: str | None = None):
    try:
        query = supabase.table("audit_logs").select("*").order("created_at", desc=True)
        if evaluation_id:
            query = query.eq("evaluation_id", evaluation_id)
        response = query.execute()
        return {"count": len(response.data or []), "items": response.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
