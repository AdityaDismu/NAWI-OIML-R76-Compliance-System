import { api } from "./client";

export async function getDashboard() {
  return api.get("/dashboard");
}
