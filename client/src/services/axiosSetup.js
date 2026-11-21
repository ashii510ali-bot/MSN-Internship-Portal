
import axios from "axios";
import { getToken, clearSession } from "../lib/session";

// ============================================================
// GLOBAL AXIOS SETUP
// Uses the same Railway backend as services/http.js
// Converts old backend URLs and attaches JWT automatically.
// ============================================================

const LEGACY_HOSTS = [
  "https://internship-portal-backend-olive.vercel.app",
  "http://127.0.0.1:5000",
];

function getApiRoot() {
  let url = import.meta.env.VITE_API_URL?.trim();

  if (!url) {
    url = "https://wholesome-connection-production-e9828876.up.railway.app";
  }

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  url = url.replace(/\/+$/, "");
  url = url.replace(/\/api$/i, "");

  return `${url}/api`;
}

const API_ROOT = getApiRoot();

function normaliseUrl(url) {
  if (!url) return url;

  for (const host of LEGACY_HOSTS) {
    if (url.startsWith(host)) {
      let endpoint = url.slice(host.length);

      if (endpoint === "/api") {
        endpoint = "";
      } else if (endpoint.startsWith("/api/")) {
        endpoint = endpoint.slice(4);
      }

      return `${API_ROOT}${endpoint}`;
    }
  }

  return url;
}

export function installAxiosInterceptors() {
  axios.interceptors.request.use((config) => {
    config.url = normaliseUrl(config.url);

    if (config.baseURL) {
      config.baseURL = normaliseUrl(config.baseURL);
    }

    const token = getToken();

    if (token && !config.headers?.Authorization) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        clearSession();

        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login")
        ) {
          window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    }
  );
}

export default installAxiosInterceptors;
