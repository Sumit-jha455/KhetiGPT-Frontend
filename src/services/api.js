/**
 * api.js
 * Central Axios configuration for KhetiGPT backend integration.
 */

import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const TOKEN_STORAGE_KEY = "khetigpt_token";
const REQUEST_TIMEOUT = 15000;

export const getAuthToken = () =>
  sessionStorage.getItem(TOKEN_STORAGE_KEY) ||
  localStorage.getItem(TOKEN_STORAGE_KEY);

export const setAuthToken = (token, remember = false) => {
  clearAuthToken();
  if (!token) return;

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearAuthToken = () => {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      window.dispatchEvent(new Event("khetigpt:unauthorised"));
    }
    if (!error.response) {
      error.message =
        "Unable to reach the server. Please check that the backend is running.";
    }
    return Promise.reject(error);
  }
);

export const ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  PROFILE: "/users/me",
  ASSISTANT: "/assistant/message",
  ASSISTANT_HISTORY: "/assistant/history",
  ASSISTANT_META: "/assistant/meta",
  WEATHER: "/weather",
  WEATHER_CURRENT: "/weather/current",
  WEATHER_FORECAST: "/weather/forecast",
  WEATHER_BUNDLE: "/weather/bundle",
  WEATHER_STATUS: "/weather/status",
  CROP_RECOMMENDATION: "/crops/recommend",
  CROP_OPTIONS: "/crops/options",
  FERTILIZER: "/fertilizer/guidance",
  FERTILIZER_OPTIONS: "/fertilizer/options",
  SCHEMES: "/schemes",
};

export default api;
