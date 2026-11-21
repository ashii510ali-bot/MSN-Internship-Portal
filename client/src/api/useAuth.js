
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

import { apiClient } from "./client";
import { queryKeys } from "./queryKeys";
import { clearSession } from "../lib/session";

export function getStoredUser() {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("msn_user");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getStoredRole() {
  const user = getStoredUser();

  if (user?.role) return user.role;

  if (typeof window === "undefined") return null;

  return localStorage.getItem("msn_active_role") || null;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,

    queryFn: async () => {
      const res = await apiClient("/api/auth/me");

      if (res.data) {
        localStorage.setItem("msn_user", JSON.stringify(res.data));
        localStorage.setItem("msn_active_role", res.data.role);
      }

      return res.data;
    },

    placeholderData: getStoredUser() ?? undefined,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return res;
    },

    onSuccess: (res) => {
      if (res?.token) {
        localStorage.setItem("msn_token", res.token);
      }

      if (res?.user) {
        localStorage.setItem("msn_user", JSON.stringify(res.user));
        localStorage.setItem("msn_active_role", res.user.role);

        queryClient.setQueryData(queryKeys.auth.me, res.user);
      }
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      return true;
    },

    onSettled: () => {
      // Clear authentication session
      clearSession();

      // Clear cached user data
      queryClient.clear();

      // Redirect without browser page reload
      navigate("/login", { replace: true });
    },
  });
}

// Register a new user
export async function register(payload) {
  const res = await apiClient("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return res;
}
