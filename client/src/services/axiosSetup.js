import axios from "axios";

import { getToken, clearSession } from "../lib/session";

// ============================================================
// GLOBAL AXIOS SETUP
//
// The Program Manager and Project Manager pages were written
// against absolute "https://internship-portal-backend-olive.vercel.app/api/..." URLs and did
// not send an auth header, because in their own branch those
// endpoints were unprotected. In the unified backend they are
// role-guarded.
//
// Rather than editing ~10,000 lines of working page code, these
// interceptors do two things for every axios request in the app:
//
//   1. rewrite the hardcoded host onto a relative /api path so
//      the request goes through the Vite proxy (and works
//      unchanged in production behind any host)
//   2. attach the JWT from the unified session
//
// Installed once from main.jsx.
// ============================================================

const LEGACY_HOSTS = [
  "https://internship-portal-backend-olive.vercel.app",
  "http://127.0.0.1:5000",
];

const API_ROOT = import.meta.env.VITE_API_URL || "";

function normaliseUrl(url) {
  if (!url) return url;

  for (const host of LEGACY_HOSTS) {
    if (url.startsWith(host)) {
      return `${API_ROOT}${url.slice(host.length)}`;
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
