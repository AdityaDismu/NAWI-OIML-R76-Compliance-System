import { api } from "./client";

export async function getInstruments() {
  return api.get("/instruments");
}

export async function getInstrument(id) {
  return api.get(`/instruments/${id}`);
}

export async function createInstrument(data) {
  return api.post("/instruments", data);
}

export async function createInstrumentRange(instrumentId, data) {
  return api.post(`/instruments/${instrumentId}/ranges`, data);
}