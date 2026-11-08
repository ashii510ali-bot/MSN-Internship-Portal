
import { getToken, clearSession } from "../lib/session";

// ============================================================
// API CLIENT
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_SUPER_ADMIN_API_URL || "/api/super-admin";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

const toastListeners = new Set();

export const subscribeToast = (listener) => {
  toastListeners.add(listener);
  return () => toastListeners.delete(listener);
};

export const showToast = (message, type = "error") => {
  toastListeners.forEach((listener) => listener(message, type));
};

// ============================================================
// CSRF TOKEN
// ============================================================

function getCsrfToken() {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    /(?:^|;\s*)msn_csrf_token=([^;]*)/
  );

  return match && match[1]
    ? decodeURIComponent(match[1])
    : null;
}

// ============================================================
// API REQUEST
// ============================================================

export async function apiClient(endpoint, options = {}) {
  const url =
    endpoint.startsWith("http") || endpoint.startsWith("/api")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = new Headers(options.headers || {});

  // JSON Content-Type
  if (
    options.body !== undefined &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  // Attach unified session token
  const token = getToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Attach CSRF token
  const csrfToken = getCsrfToken();

  if (csrfToken && !headers.has("x-csrf-token")) {
    headers.set("x-csrf-token", csrfToken);
  }

  headers.set("X-Requested-With", "XMLHttpRequest");

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // ========================================================
    // HANDLE 401 UNAUTHORIZED
    // ========================================================

    if (response.status === 401) {
      const errData = await response.json().catch(() => ({}));

      // Clear all session keys using unified session handler
      clearSession();

      // Redirect to the correct login route
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.replace("/login");
      }

      throw new ApiError(
        errData.message || errData.error || "Your session has expired. Please login again.",
        401,
        errData
      );
    }

    // ========================================================
    // HANDLE 403 FORBIDDEN
    // ========================================================

    if (response.status === 403) {
      const errData = await response.json().catch(() => ({}));

      showToast(
        errData.message || errData.error || "Permission denied for this action",
        "error"
      );

      throw new ApiError(
        errData.message || errData.error || "Forbidden",
        403,
        errData
      );
    }

    // ========================================================
    // HANDLE RESPONSE
    // ========================================================

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new ApiError(
        data.message || data.error || "An error occurred",
        response.status,
        data
      );
    }

    return data;

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "Network error";

    showToast(message, "error");

    throw new ApiError(message, 500);
  }
}
