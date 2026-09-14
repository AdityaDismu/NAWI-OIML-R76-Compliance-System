from pathlib import Path
from fastapi import HTTPException
from app.core.database import supabase


def _safe_latest_test_result(test_instance_id: str):
    try:
        response = supabase.table("test_results").select("*").eq("test_instance_id", test_instance_id).limit(20).execute()
        rows = response.data or []
        return rows[-1] if rows else None
    except Exception:
        return None


def _normalize_result(test: dict, saved_result: dict | None) -> str:
    value = test.get("result")
    if isinstance(value, dict): value = value.get("result")
    if value: return str(value).upper()
    if saved_result:
        value = saved_result.get("result")
        if isinstance(value, dict): value = value.get("result")
        if value: return str(value).upper()
    return "NOT TESTED"


def _is_applicable(value):
    if value is True: return True
    if value is False or value is None: return False
    return str(value).strip().lower() in {"true", "1", "yes", "y"}


def get_evaluation_report_data(evaluation_id: str):
    evaluation_response = supabase.table("evaluations").select("*").eq("id", evaluation_id).single().execute()
    if not evaluation_response.data: raise HTTPException(status_code=404, detail="Evaluation not found")
    evaluation = evaluation_response.data

    instrument_response = supabase.table("instruments").select("*").eq("id", evaluation["instrument_id"]).single().execute()
    if not instrument_response.data: raise HTTPException(status_code=404, detail="Instrument not found")
    instrument = instrument_response.data

    range_response = supabase.table("instrument_ranges").select("*").eq("instrument_id", instrument["id"]).limit(1).execute()
    instrument_range = range_response.data[0] if range_response.data else None

    tests_response = supabase.table("test_instances").select("*").eq("evaluation_id", evaluation_id).execute()
    tests = tests_response.data or []
    definition_ids = list({t.get("test_definition_id") for t in tests if t.get("test_definition_id")})
    definitions = []
    if definition_ids:
        definitions_response = supabase.table("test_definitions").select("*").in_("id", definition_ids).execute()
        definitions = definitions_response.data or []
    definition_map = {d["id"]: d for d in definitions}

    report_tests = []
    for test in tests:
        definition = definition_map.get(test.get("test_definition_id"), {})
        saved_result = _safe_latest_test_result(test["id"])
        result = _normalize_result(test, saved_result)
        details = saved_result.get("details", {}) if saved_result else {}
        if not isinstance(details, dict): details = {"value": details}
        report_tests.append({
            "id": test.get("id"), "test_code": definition.get("code") or test.get("test_code"),
            "test_name": definition.get("name") or definition.get("title") or definition.get("code") or test.get("test_code") or "OIML Test",
            "display_order": definition.get("display_order", 9999),
            "status": str(test.get("status") or "NOT_TESTED").upper(),
            "applicability": _is_applicable(test.get("applicability")),
            "applicability_reason": test.get("applicability_reason"), "result": result,
            "criterion": saved_result.get("criterion", "") if saved_result else "",
            "explanation": saved_result.get("explanation", "") if saved_result else "",
            "details": details, "remarks": test.get("remarks") or "",
        })
    report_tests.sort(key=lambda x: x.get("display_order", 9999))

    applicable = [t for t in report_tests if t["applicability"]]
    na = [t for t in report_tests if not t["applicability"]]
    passed = sum(t["result"] == "PASS" for t in applicable)
    failed = sum(t["result"] == "FAIL" for t in applicable)
    completed = sum(t["status"] == "COMPLETE" and t["result"] in {"PASS", "FAIL"} for t in applicable)
    not_tested = len(applicable) - completed
    if not_tested: overall, statement = "INCOMPLETE", "Evaluation is incomplete because one or more applicable tests have not been completed."
    elif failed: overall, statement = "FAIL", "The instrument did not satisfy all applicable test requirements."
    else: overall, statement = "PASS", "All completed applicable tests satisfied their acceptance criteria."

    attachments = []
    try:
        attachment_response = supabase.table("attachments").select("*").eq("evaluation_id", evaluation_id).order("created_at", desc=True).execute()
        for item in attachment_response.data or []:
            path = Path(item.get("file_path") or "")
            item["local_exists"] = bool(path.exists())
            item["is_image"] = str(item.get("content_type") or "").startswith("image/")
            attachments.append(item)
    except Exception:
        attachments = []

    environment = None
    try:
        env_response = supabase.table("evaluation_environments").select("*").eq("evaluation_id", evaluation_id).limit(1).execute()
        environment = env_response.data[0] if env_response.data else None
    except Exception:
        pass

    summary = {
        "applicable_tests": len(applicable), "completed_tests": completed, "passed_tests": passed,
        "failed_tests": failed, "not_tested_tests": not_tested, "not_applicable_tests": len(na),
        "overall_result": overall, "overall_statement": statement, "report_generation_allowed": True,
    }
    return {"evaluation": evaluation, "instrument": instrument, "instrument_range": instrument_range,
            "tests": report_tests, "summary": summary, "attachments": attachments, "environment": environment}
