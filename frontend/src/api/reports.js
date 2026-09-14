import { api, API_URL } from "./client";

async function downloadReport(evaluationId, format) {
  const response = await fetch(`${API_URL}/reports/${evaluationId}/${format}`, { method: "GET" });
  if (!response.ok) {
    let message = `Failed to generate ${format.toUpperCase()} report`;
    try { const data = await response.json(); message = data?.detail || message; } catch {}
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || `nawi-report-${evaluationId}.${format === "word" ? "docx" : "pdf"}`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { success: true, filename };
}

export const getReports = () => api.get("/reports");
export const getEvaluationReports = (evaluationId) => api.get(`/reports/evaluation/${evaluationId}`);
export const getReport = (reportId) => api.get(`/reports/${reportId}`);
export const generatePdfReport = (evaluationId) => downloadReport(evaluationId, "pdf");
export const generateWordReport = (evaluationId) => downloadReport(evaluationId, "word");
export const generateReport = (evaluationId) => api.post(`/reports/${evaluationId}/generate`, {});
export const getReportDownloadUrl = (reportId, format="pdf") => `${API_URL}/reports/${reportId}/download?format=${format}`;
