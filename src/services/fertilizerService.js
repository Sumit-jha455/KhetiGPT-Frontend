import api, { ENDPOINTS } from "./api";

const unwrap = (response) => response.data?.data ?? {};

export async function getFertilizerOptions() {
  const response = await api.get(ENDPOINTS.FERTILIZER_OPTIONS);
  return unwrap(response);
}

export async function getFertilizerGuidance(payload) {
  const response = await api.post(ENDPOINTS.FERTILIZER, payload);
  const data = unwrap(response);
  return data.guidance ?? data;
}
