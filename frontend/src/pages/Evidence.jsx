import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import EvidenceUploader from "../components/evidence/EvidenceUploader";
import EvidenceGallery from "../components/evidence/EvidenceGallery";
import {
  getAttachments,
  uploadAttachment,
  deleteAttachment,
} from "../api/attachments";
import { getEvaluation, getEvaluationTests } from "../api/evaluations";

export default function Evidence() {
  const { id } = useParams();

  const [evaluation, setEvaluation] = useState(null);
  const [tests, setTests] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function loadData() {
    try {
      setLoading(true);

      const [evaluationData, testsData, attachmentsData] =
        await Promise.all([
          getEvaluation(id),
          getEvaluationTests(id),
          getAttachments(id),
        ]);

      setEvaluation(evaluationData);
      setTests(Array.isArray(testsData) ? testsData : testsData?.tests || testsData?.items || []);
      setAttachments(
        Array.isArray(attachmentsData)
          ? attachmentsData
          : attachmentsData?.items || []
      );
    } catch (error) {
      console.error("Failed to load evidence:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function handleUpload({
    file,
    testInstanceId,
    description,
  }) {
    try {
      setUploading(true);

      await uploadAttachment({
        evaluationId: id,
        testInstanceId,
        file,
        description,
      });

      await loadData();
    } catch (error) {
  console.error("Upload failed:", error);

  alert(
    error?.message ||
      "Unable to upload the evidence file."
  );
}
  }

  async function handleDelete(attachmentId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this evidence?"
    );

    if (!confirmed) return;

    try {
      await deleteAttachment(attachmentId);

      await loadData();
    } catch (error) {
      console.error("Delete failed:", error);

      alert("Unable to delete the evidence.");
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-400">
        Loading evidence...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence"
        description="Manage photographs, certificates and supporting documents for this evaluation."
      />

      {evaluation && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Evaluation
              </p>

              <p className="mt-1 text-sm font-medium text-white">
                {evaluation.id}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Status
              </p>

              <p className="mt-1 text-sm font-medium text-cyan-300">
                {evaluation.status || "IN_PROGRESS"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <EvidenceUploader
          tests={tests}
          onUpload={handleUpload}
          uploading={uploading}
        />

        <EvidenceGallery
          attachments={attachments}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}