from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from fastapi.responses import FileResponse

from app.core.database import supabase


router = APIRouter(
    prefix="/attachments",
    tags=["Evidence"],
)


# -------------------------------------------------------------
# Local upload directory
# -------------------------------------------------------------

UPLOAD_DIR = (
    Path(__file__)
    .resolve()
    .parents[3]
    / "uploads"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# -------------------------------------------------------------
# List evaluation evidence
# -------------------------------------------------------------

@router.get("/evaluation/{evaluation_id}")
async def list_evaluation_attachments(
    evaluation_id: str,
):

    try:

        response = (
            supabase
            .table("attachments")
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

        items = response.data or []

        return {
            "count": len(items),
            "items": items,
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to load evidence: "
                f"{error}"
            ),
        )


# -------------------------------------------------------------
# List evidence for one test
# -------------------------------------------------------------

@router.get("/test/{test_instance_id}")
async def list_test_attachments(
    test_instance_id: str,
):

    try:

        response = (
            supabase
            .table("attachments")
            .select("*")
            .eq(
                "test_instance_id",
                test_instance_id,
            )
            .order(
                "created_at",
                desc=True,
            )
            .execute()
        )

        items = response.data or []

        return {
            "count": len(items),
            "items": items,
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to load test evidence: "
                f"{error}"
            ),
        )


# -------------------------------------------------------------
# Upload evidence
# -------------------------------------------------------------

@router.post("/upload")
async def upload_attachment(
    evaluation_id: str = Form(...),
    test_instance_id: str | None = Form(
        default=None
    ),
    description: str = Form(
        default=""
    ),
    file: UploadFile = File(...),
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="A file must be selected.",
        )

    # ---------------------------------------------------------
    # Verify evaluation
    # ---------------------------------------------------------

    try:

        evaluation_response = (
            supabase
            .table("evaluations")
            .select("id,status")
            .eq(
                "id",
                evaluation_id,
            )
            .single()
            .execute()
        )

        evaluation = (
            evaluation_response.data
        )

        if not evaluation:

            raise HTTPException(
                status_code=404,
                detail="Evaluation not found.",
            )

        if (
            evaluation.get("status")
            == "FINALIZED"
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Evidence cannot be uploaded "
                    "after the evaluation is finalized."
                ),
            )

        # -----------------------------------------------------
        # Verify test instance if supplied
        # -----------------------------------------------------

        if test_instance_id:

            test_response = (
                supabase
                .table("test_instances")
                .select(
                    "id,evaluation_id"
                )
                .eq(
                    "id",
                    test_instance_id,
                )
                .single()
                .execute()
            )

            test = test_response.data

            if not test:

                raise HTTPException(
                    status_code=404,
                    detail="Test instance not found.",
                )

            if (
                test.get("evaluation_id")
                != evaluation_id
            ):

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "The selected test does not "
                        "belong to this evaluation."
                    ),
                )

        # -----------------------------------------------------
        # Generate safe local filename
        # -----------------------------------------------------

        original_name = Path(
            file.filename
        ).name

        suffix = Path(
            original_name
        ).suffix

        stored_name = (
            f"{uuid4().hex}{suffix}"
        )

        target = (
            UPLOAD_DIR
            / stored_name
        )

        # -----------------------------------------------------
        # Read file
        # -----------------------------------------------------

        content = await file.read()

        if not content:

            raise HTTPException(
                status_code=400,
                detail="The selected file is empty.",
            )

        # -----------------------------------------------------
        # Write local file
        # -----------------------------------------------------

        target.write_bytes(content)

        # -----------------------------------------------------
        # Store database record
        # -----------------------------------------------------

        payload = {
            "evaluation_id": evaluation_id,
            "test_instance_id": (
                test_instance_id
                if test_instance_id
                else None
            ),
            "file_name": original_name,
            "file_path": str(target),
            "content_type": (
                file.content_type
                or "application/octet-stream"
            ),
            "file_size": len(content),
            "description": description or "",
        }

        response = (
            supabase
            .table("attachments")
            .insert(payload)
            .execute()
        )

        if not response.data:

            if target.exists():
                target.unlink()

            raise HTTPException(
                status_code=500,
                detail=(
                    "The file was saved locally, "
                    "but the evidence database record "
                    "could not be created."
                ),
            )

        return {
            "success": True,
            "attachment": response.data[0],
        }

    except HTTPException:

        raise

    except Exception as error:

        # Remove local file if database operation failed.
        if "target" in locals():
            if target.exists():
                target.unlink()

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to upload evidence: "
                f"{error}"
            ),
        )


# -------------------------------------------------------------
# Download
# -------------------------------------------------------------

@router.get("/{attachment_id}/download")
async def download_attachment(
    attachment_id: str,
):

    try:

        response = (
            supabase
            .table("attachments")
            .select("*")
            .eq(
                "id",
                attachment_id,
            )
            .single()
            .execute()
        )

        attachment = response.data

        if not attachment:

            raise HTTPException(
                status_code=404,
                detail="Attachment not found.",
            )

        path = Path(
            attachment.get(
                "file_path",
                "",
            )
        )

        if not path.exists():

            raise HTTPException(
                status_code=404,
                detail="Attachment file not found.",
            )

        return FileResponse(
            path,
            media_type=(
                attachment.get(
                    "content_type"
                )
                or "application/octet-stream"
            ),
            filename=(
                attachment.get(
                    "file_name"
                )
                or path.name
            ),
        )

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to download evidence: "
                f"{error}"
            ),
        )


# -------------------------------------------------------------
# Delete
# -------------------------------------------------------------

@router.delete("/{attachment_id}")
async def delete_attachment(
    attachment_id: str,
):

    try:

        response = (
            supabase
            .table("attachments")
            .select(
                "file_path"
            )
            .eq(
                "id",
                attachment_id,
            )
            .single()
            .execute()
        )

        attachment = (
            response.data
        )

        if not attachment:

            raise HTTPException(
                status_code=404,
                detail="Attachment not found.",
            )

        path = Path(
            attachment.get(
                "file_path",
                "",
            )
        )

        (
            supabase
            .table("attachments")
            .delete()
            .eq(
                "id",
                attachment_id,
            )
            .execute()
        )

        if path.exists():
            path.unlink()

        return {
            "success": True
        }

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to delete evidence: "
                f"{error}"
            ),
        )