from app.core.database import supabase


def create_audit_log(
    action: str,
    entity_type: str,
    entity_id: str,
    details: dict | None = None,
):
    supabase.table("audit_logs").insert(
        {
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "details": details or {},
        }
    ).execute()