
import axios from "axios";
import { getToken } from "../lib/session";

// ============================================================
// MENTOR API SERVICE
// ============================================================

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

const BASE_URL = `${getApiRoot()}/mentor`;

const mentorApi = axios.create({
  baseURL: BASE_URL,
});

mentorApi.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ============================================================
// DASHBOARD
// ============================================================

export const getMentorDashboard = () =>
  mentorApi.get("/dashboard");

// ============================================================
// INTERNS
// ============================================================

export const getAssignedInterns = () =>
  mentorApi.get("/interns");

// ============================================================
// SUBMISSIONS
// ============================================================

export const getSubmissions = (status) =>
  mentorApi.get("/submissions", {
    params: status ? { status } : {},
  });

export const getSubmissionById = (id) =>
  mentorApi.get(`/submissions/${id}`);

export const approveSubmission = (id, payload) =>
  mentorApi.post(`/submissions/${id}/approve`, payload);

export const requestResubmission = (id, payload) =>
  mentorApi.post(`/submissions/${id}/resubmission`, payload);

// ============================================================
// EVALUATIONS
// ============================================================

export const getEvaluations = () =>
  mentorApi.get("/evaluations");

export const getEvaluationsByIntern = (internId) =>
  mentorApi.get(`/evaluations/${internId}`);

export const createEvaluation = (payload) =>
  mentorApi.post("/evaluations", payload);

export const updateEvaluation = (id, payload) =>
  mentorApi.put(`/evaluations/${id}`, payload);

// ============================================================
// NOTIFICATIONS
// ============================================================

export const getMentorNotifications = () =>
  mentorApi.get("/notifications");

export const markNotificationAsRead = (id) =>
  mentorApi.patch(`/notifications/${id}/read`);

export const markAllNotificationsAsRead = () =>
  mentorApi.patch("/notifications/read-all");

export const deleteMentorNotification = (id) =>
  mentorApi.delete(`/notifications/${id}`);

// ============================================================
// PROFILE
// ============================================================

export const getMentorProfile = () =>
  mentorApi.get("/profile");

export const updateMentorProfile = (payload) =>
  mentorApi.put("/profile", payload);

export default mentorApi;
