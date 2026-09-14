import { api } from "./client";

export async function getAuditLogs(evaluationId = "") {
  const query = evaluationId ? `?evaluation_id=${encodeURIComponent(evaluationId)}` : "";
  return api.get(`/audit${query}`);
}
