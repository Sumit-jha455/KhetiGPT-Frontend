import api, { ENDPOINTS } from "./api";

const getData = (response) => response.data?.data ?? {};

const withCity = (city) => (city ? { params: { city: city.trim() } } : undefined);

export async function fetchCurrentWeather(city) {
  const response = await api.get(ENDPOINTS.WEATHER_CURRENT, withCity(city));
  return getData(response);
}

export async function fetchForecast(city) {
  const response = await api.get(ENDPOINTS.WEATHER_FORECAST, withCity(city));
  return getData(response);
}

export async function fetchWeatherBundle(city) {
  const response = await api.get(ENDPOINTS.WEATHER_BUNDLE, withCity(city));
  return getData(response);
}

export async function fetchWeatherStatus() {
  const response = await api.get(ENDPOINTS.WEATHER_STATUS);
  return getData(response);
}
