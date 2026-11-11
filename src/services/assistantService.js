import api, { ENDPOINTS } from "./api";

const getData = (response) => response.data?.data ?? {};

export async function sendAssistantMessage(message) {
  const response = await api.post(ENDPOINTS.ASSISTANT, { message });
  return getData(response);
}

export async function fetchAssistantHistory() {
  const response = await api.get(ENDPOINTS.ASSISTANT_HISTORY);
  return getData(response);
}

export async function clearAssistantHistory() {
  const response = await api.delete(ENDPOINTS.ASSISTANT_HISTORY);
  return getData(response);
}

export async function fetchAssistantMeta() {
  const response = await api.get(ENDPOINTS.ASSISTANT_META);
  return getData(response);
}
