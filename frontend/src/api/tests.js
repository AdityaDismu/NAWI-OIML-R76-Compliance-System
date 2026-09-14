import { api } from "./client";

export async function getTestDefinitions() {
  return api.get("/tests/definitions");
}

export async function getEvaluationTests(evaluationId) {
  return api.get(`/tests/evaluation/${evaluationId}`);
}

export async function getTestInstance(testInstanceId) {
  return api.get(`/tests/${testInstanceId}`);
}

export async function startTest(testInstanceId) {
  return api.post(`/tests/${testInstanceId}/start`, {});
}

export async function executeTest(testInstanceId, data) {
  return api.post(`/tests/${testInstanceId}/execute`, data);
}

export async function completeTest(testInstanceId, data) {
  return api.post(`/tests/${testInstanceId}/complete`, data);
}