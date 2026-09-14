import { api } from "./client";

export async function getEquipment() {
  return api.get("/equipment");
}

export async function getEquipmentItem(id) {
  return api.get(`/equipment/${id}`);
}

export async function createEquipment(data) {
  return api.post("/equipment", data);
}

export async function updateEquipment(id, data) {
  return api.put(`/equipment/${id}`, data);
}

export async function deleteEquipment(id) {
  return api.delete(`/equipment/${id}`);
}

export async function getEquipmentCalibration(id) {
  return api.get(`/equipment/${id}/calibration`);
}

export async function createEquipmentCalibration(id, data) {
  return api.post(`/equipment/${id}/calibration`, data);
}

export async function getTestEquipment(testInstanceId) {
  return api.get(`/equipment/test/${testInstanceId}`);
}

export async function assignEquipmentToTest(testInstanceId, equipmentId) {
  return api.post(`/equipment/test/${testInstanceId}`, {
    equipment_id: equipmentId,
  });
}

export async function removeEquipmentFromTest(
  testInstanceId,
  equipmentId
) {
  return api.delete(
    `/equipment/test/${testInstanceId}/${equipmentId}`
  );
}