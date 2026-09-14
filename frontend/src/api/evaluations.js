import { api } from "./client";
export async function getEvaluations(){ return api.get("/evaluations"); }
export async function getEvaluation(id){ return api.get(`/evaluations/${id}`); }
export async function getEvaluationTests(id){ return api.get(`/evaluations/${id}/tests`); }
export async function createEvaluation(data){ return api.post("/evaluations", data); }
export async function finalizeEvaluation(id){ return api.post(`/evaluations/${id}/finalize`, {}); }
export async function submitEvaluation(id){ return api.post(`/evaluations/${id}/submit`, {}); }
export async function startEvaluationReview(id){ return api.post(`/evaluations/${id}/review`, {}); }
export async function approveEvaluation(id, review_notes=""){ return api.post(`/evaluations/${id}/approve`, {review_notes}); }
export async function rejectEvaluation(id, rejection_reason=""){ return api.post(`/evaluations/${id}/reject`, {rejection_reason}); }
