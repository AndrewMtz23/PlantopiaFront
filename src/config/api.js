import axios from "axios";
import { clearSessionData, getAccessToken } from "../utils/session";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

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
      if (error?.response?.status === 401) {
        clearSessionData();
      }

      return Promise.reject(error);
    }
  );
};

export { API_BASE_URL, apiFetch, buildApiUrl, buildAuthHeaders, configureHttpClient };
