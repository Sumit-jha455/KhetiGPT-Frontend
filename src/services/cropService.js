import api, { ENDPOINTS } from "./api";

const unwrap = (response) => response.data?.data ?? {};

export async function getCropOptions() {
  const response = await api.get(ENDPOINTS.CROP_OPTIONS);
  return unwrap(response);
}

export async function getCropRecommendation(payload) {
  const response = await api.post(ENDPOINTS.CROP_RECOMMENDATION, payload);
  const data = unwrap(response);
  return data.recommendation ?? data;
}
