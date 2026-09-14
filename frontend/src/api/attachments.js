import { api } from "./client";

export async function getAttachments(evaluationId) {
  return api.get(`/attachments/evaluation/${evaluationId}`);
}

export async function getTestAttachments(testInstanceId) {
  return api.get(`/attachments/test/${testInstanceId}`);
}

export async function uploadAttachment({
  evaluationId,
  testInstanceId,
  file,
  description = "",
}) {
  const formData = new FormData();

  formData.append("evaluation_id", evaluationId);

  if (testInstanceId) {
    formData.append("test_instance_id", testInstanceId);
  }

  formData.append("description", description);
  formData.append("file", file);

  return api.post("/attachments/upload", formData);
}

export async function deleteAttachment(attachmentId) {
  return api.delete(`/attachments/${attachmentId}`);
}

export function getAttachmentDownloadUrl(attachmentId) {
  const baseUrl =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

  return `${baseUrl}/attachments/${attachmentId}/download`;
}