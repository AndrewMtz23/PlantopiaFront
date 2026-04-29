import axios from "axios";
import { clearSessionData, getAccessToken } from "../utils/session";

const API_BASE_URL = process.env.REACT_APP_API_URL;

if (!API_BASE_URL) {
  throw new Error("REACT_APP_API_URL no esta configurado.");
}

const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

const buildAuthHeaders = (headers = {}) => {
  const token = getAccessToken();

  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};

const apiFetch = (path, options = {}) =>
  fetch(buildApiUrl(path), {
    ...options,
    headers: buildAuthHeaders(options.headers || {}),
  }).then((response) => {
    if (response.status === 401) {
      clearSessionData();
    }

    return response;
  });

const configureHttpClient = () => {
  axios.defaults.baseURL = API_BASE_URL;

  axios.interceptors.request.use((config) => {
    config.headers = buildAuthHeaders(config.headers || {});
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status) {
        const method = (error.config?.method || "GET").toUpperCase();
        const url = `${error.config?.baseURL || ""}${error.config?.url || ""}`;
        console.error(`API error ${error.response.status}: ${method} ${url}`);
      }

      if (error?.response?.status === 401) {
        clearSessionData();
      }

      return Promise.reject(error);
    }
  );
};

export { API_BASE_URL, apiFetch, buildApiUrl, buildAuthHeaders, configureHttpClient };
