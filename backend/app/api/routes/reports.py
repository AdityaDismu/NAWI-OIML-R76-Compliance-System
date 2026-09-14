from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.core.database import supabase

from app.services.report_service import (
    get_evaluation_report_data,
)

from app.reports.pdf_generator import generate_pdf
from app.reports.word_generator import generate_word


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


def _generate_record(
    evaluation_id: str,
    report_data: dict,
):
    """
    Save a lightweight report-history record.

    PASS/FAIL does not affect report generation.
    """

    try:

        response = (
            supabase.table("reports")
            .insert(
                {
                    "evaluation_id": evaluation_id,
                    "status": "GENERATED",
                }
            )
            .execute()
        )

        return (
            response.data[0]
            if response.data
            else None
        )

    except Exception:

        # Report generation should still work
        # even if report history has a schema issue.
        return None


# ============================================================
# PDF
# ============================================================

@router.get("/{evaluation_id}/pdf")
async def generate_pdf_report(
    evaluation_id: str,
):

    report_data = get_evaluation_report_data(
        evaluation_id
    )

    pdf = generate_pdf(
        report_data
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                "attachment; "
                f"filename=nawi-report-{evaluation_id}.pdf"
            )
        },
    )


# ============================================================
# WORD
# ============================================================

@router.get("/{evaluation_id}/word")
async def generate_word_report(
    evaluation_id: str,
):

    report_data = get_evaluation_report_data(
        evaluation_id
    )

    word = generate_word(
        report_data
    )

    return StreamingResponse(
        word,
        media_type=(
            "application/vnd.openxmlformats-"
            "officedocument.wordprocessingml.document"
        ),
        headers={
            "Content-Disposition": (
                "attachment; "
                f"filename=nawi-report-{evaluation_id}.docx"
            )
        },
    )


# ============================================================
# POST PDF
# ============================================================

@router.post("/{evaluation_id}/pdf")
async def generate_pdf_report_post(
    evaluation_id: str,
):

    return await generate_pdf_report(
        evaluation_id
    )


# ============================================================
# POST WORD
# ============================================================

@router.post("/{evaluation_id}/word")
async def generate_word_report_post(
    evaluation_id: str,
):

    return await generate_word_report(
        evaluation_id
    )


# ============================================================
# GENERATE REPORT METADATA
# ============================================================

@router.post("/{evaluation_id}/generate")
async def generate_report(
    evaluation_id: str,
):
    """
    Generate report metadata for any recorded
    evaluation outcome.

    FAIL results do NOT block report generation.
    """

    report_data = get_evaluation_report_data(
        evaluation_id
    )

    record = _generate_record(
        evaluation_id,
        report_data,
    )

    return {
        "success": True,

        "evaluation_id": evaluation_id,

        "report": record,

        "summary": report_data[
            "summary"
        ],

        "data": report_data,
    }


# ============================================================
# SINGLE REPORT METADATA
# ============================================================
@router.get("/{report_id}")
async def get_report(report_id: str):
    try:
        response = supabase.table("reports").select("*").eq("id", report_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Report not found")
        return response.data
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Report not found") from exc


# ============================================================
# ALL REPORTS
# ============================================================

@router.get("")
async def list_reports():

    try:

        response = (
            supabase.table("reports")
            .select("*")
            .order(
                "created_at",
                desc=True,
            )
            .execute()
        )

        reports = response.data or []

        return {
            "count": len(reports),
            "reports": reports,
        }

    except Exception:

        return {
            "count": 0,
            "reports": [],
        }


# ============================================================
# REPORTS FOR ONE EVALUATION
# ============================================================

@router.get("/evaluation/{evaluation_id}")
async def list_evaluation_reports(
    evaluation_id: str,
):

    try:

        response = (
            supabase.table("reports")
            .select("*")
            .eq(
                "evaluation_id",
                evaluation_id,
            )
            .order(
                "created_at",
                desc=True,
            )
            .execute()
        )

        reports = response.data or []

        return {
            "count": len(reports),
            "reports": reports,
        }

    except Exception:

        return {
            "count": 0,
            "reports": [],
        }


# ============================================================
# DOWNLOAD REPORT FROM HISTORY
# ============================================================

@router.get("/{report_id}/download")
async def download_report(
    report_id: str,
    format: str = "pdf",
):

    try:

        response = (
            supabase.table("reports")
            .select("*")
            .eq(
                "id",
                report_id,
            )
            .single()
            .execute()
        )

    except Exception as exc:

        raise HTTPException(
            status_code=404,
            detail="Report not found",
        ) from exc

    if not response.data:

        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    evaluation_id = response.data.get(
        "evaluation_id"
    )

    if not evaluation_id:

        raise HTTPException(
            status_code=400,
            detail=(
                "Report has no evaluation reference"
            ),
        )

    report_data = get_evaluation_report_data(
        evaluation_id
    )

    # --------------------------------------------------------
    # WORD
    # --------------------------------------------------------

    if format.lower() == "word":

        document = generate_word(
            report_data
        )

        return StreamingResponse(
            document,
            media_type=(
                "application/vnd.openxmlformats-"
                "officedocument.wordprocessingml.document"
            ),
            headers={
                "Content-Disposition": (
                    "attachment; "
                    f"filename=nawi-report-{evaluation_id}.docx"
                )
            },
        )

    # --------------------------------------------------------
    # PDF
    # --------------------------------------------------------

    if format.lower() != "pdf":

        raise HTTPException(
            status_code=400,
            detail=(
                "Format must be pdf or word"
            ),
        )

    pdf = generate_pdf(
        report_data
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                "attachment; "
                f"filename=nawi-report-{evaluation_id}.pdf"
            )
        },
    )