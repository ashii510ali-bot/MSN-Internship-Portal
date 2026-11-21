
import { getToken, clearSession } from "../lib/session";

// ============================================================
// HTTP CLIENT - RAILWAY BACKEND
// ============================================================

const configuredUrl = import.meta.env.VITE_API_URL?.trim();

function getApiRoot() {
  let url =
    configuredUrl ||
    "https://wholesome-connection-production-e9828876.up.railway.app";

  // Add HTTPS if the environment variable has no protocol
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Remove trailing slash and existing /api
  url = url.replace(/\/+$/, "").replace(/\/api$/i, "");

  return `${url}/api`;
}

const API_ROOT = getApiRoot();

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ============================================================
// BUILD API URL
// ============================================================

function buildUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  // Avoid duplicate /api
  const cleanEndpoint = endpoint.startsWith("/api/")
    ? endpoint.slice(4)
    : endpoint;

  return `${API_ROOT}${cleanEndpoint.startsWith("/") ? "" : "/"}${cleanEndpoint}`;
}

// ============================================================
// API REQUEST
// ============================================================

export async function request(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers: extraHeaders,
    ...rest
  } = options;

  const headers = new Headers(extraHeaders || {});

  if (body !== undefined && !(body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  const token = getToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(buildUrl(endpoint), {
      method,
      headers,
      credentials: "include",
      body:
        body === undefined || body instanceof FormData
          ? body
          : JSON.stringify(body),
      ...rest,
    });
  } catch (networkError) {
    throw new ApiError(
      "Unable to reach the server. Please check your connection.",
      0
    );
  }

  const payload = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearSession();

    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      window.location.href = "/login";
    }

    throw new ApiError(
      payload.message || "Your session has expired.",
      401,
      payload
    );
  }

  if (!response.ok || payload.success === false) {
    throw new ApiError(
      payload.message || payload.error || "Something went wrong.",
      response.status,
      payload
    );
  }

  return payload;
}

// ============================================================
// RESPONSE HELPER
// ============================================================

export function unwrap(payload, fallback = null) {
  if (
    payload &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    return payload.data ?? fallback;
  }

  return payload ?? fallback;
}

// ============================================================
// HTTP METHODS
// ============================================================

export const http = {
  get: (endpoint, options) =>
    request(endpoint, { ...options, method: "GET" }),

  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: "POST", body }),

  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: "PUT", body }),

  patch: (endpoint, body, options) =>
    request(endpoint, { ...options, method: "PATCH", body }),

  delete: (endpoint, options) =>
    request(endpoint, { ...options, method: "DELETE" }),
};

export default http;
