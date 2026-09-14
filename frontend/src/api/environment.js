import { api } from "./client";

export async function getEvaluationEnvironment(evaluationId) {
  return api.get(`/evaluations/${evaluationId}/environment`);
}

export async function saveEvaluationEnvironment(evaluationId, data) {
  return api.post(`/evaluations/${evaluationId}/environment`, data);
}