import api, { ENDPOINTS } from "./api";

const unwrap = (response) => ({
  data: response.data?.data ?? {},
  meta: response.data?.meta ?? null,
});

export async function getSchemes(params = {}) {
  const response = await api.get(ENDPOINTS.SCHEMES, { params });
  return unwrap(response);
}

export async function getSchemesMeta() {
  const response = await api.get(`${ENDPOINTS.SCHEMES}/meta`);
  return response.data?.data ?? {};
}

export async function getSchemeById(id) {
  const response = await api.get(`${ENDPOINTS.SCHEMES}/${encodeURIComponent(id)}`);
  return response.data?.data?.scheme ?? null;
}
