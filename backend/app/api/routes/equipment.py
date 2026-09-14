from fastapi import APIRouter, HTTPException

from app.core.database import supabase

router = APIRouter(prefix="/equipment", tags=["Equipment"])


@router.get("")
async def list_equipment():
    try:
        response = supabase.table("equipment").select("*").order("created_at", desc=True).execute()
        return {"count": len(response.data or []), "items": response.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{equipment_id}")
async def get_equipment(equipment_id: str):
    try:
        response = supabase.table("equipment").select("*").eq("id", equipment_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Equipment not found")
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("")
async def create_equipment(data: dict):
    allowed = {"name", "equipment_type", "manufacturer", "model", "serial_number", "capacity", "accuracy", "resolution", "status", "notes"}
    payload = {key: data.get(key) for key in allowed if key in data}
    if not payload.get("name") or not payload.get("equipment_type"):
        raise HTTPException(status_code=400, detail="Equipment name and type are required")
    try:
        response = supabase.table("equipment").insert(payload).execute()
        return response.data[0] if response.data else payload
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{equipment_id}")
async def update_equipment(equipment_id: str, data: dict):
    allowed = {"name", "equipment_type", "manufacturer", "model", "serial_number", "capacity", "accuracy", "resolution", "status", "notes"}
    payload = {key: data.get(key) for key in allowed if key in data}
    try:
        response = supabase.table("equipment").update(payload).eq("id", equipment_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Equipment not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{equipment_id}")
async def delete_equipment(equipment_id: str):
    try:
        response = supabase.table("equipment").delete().eq("id", equipment_id).execute()
        return {"success": True, "deleted": response.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{equipment_id}/calibration")
async def get_calibration(equipment_id: str):
    try:
        response = supabase.table("equipment_calibrations").select("*").eq("equipment_id", equipment_id).order("created_at", desc=True).limit(1).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{equipment_id}/calibration")
async def create_calibration(equipment_id: str, data: dict):
    payload = {
        "equipment_id": equipment_id,
        "calibration_date": data.get("calibration_date") or None,
        "due_date": data.get("due_date") or None,
        "certificate_number": data.get("certificate_number"),
        "laboratory": data.get("calibration_lab") or data.get("laboratory"),
        "result": data.get("result"),
        "notes": data.get("remarks") or data.get("notes"),
    }
    try:
        response = supabase.table("equipment_calibrations").insert(payload).execute()
        return response.data[0] if response.data else payload
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/test/{test_instance_id}")
async def get_test_equipment(test_instance_id: str):
    try:
        response = supabase.table("test_equipment").select("*, equipment(*)").eq("test_instance_id", test_instance_id).execute()
        return {"count": len(response.data or []), "items": response.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test/{test_instance_id}")
async def assign_test_equipment(test_instance_id: str, data: dict):
    equipment_id = data.get("equipment_id")
    if not equipment_id:
        raise HTTPException(status_code=400, detail="equipment_id is required")
    try:
        response = supabase.table("test_equipment").upsert({"test_instance_id": test_instance_id, "equipment_id": equipment_id}, on_conflict="test_instance_id,equipment_id").execute()
        return response.data[0] if response.data else {"test_instance_id": test_instance_id, "equipment_id": equipment_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/test/{test_instance_id}/{equipment_id}")
async def remove_test_equipment(test_instance_id: str, equipment_id: str):
    try:
        supabase.table("test_equipment").delete().eq("test_instance_id", test_instance_id).eq("equipment_id", equipment_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
