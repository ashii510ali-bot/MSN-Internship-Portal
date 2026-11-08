import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  FileText,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";

import {
  getMentorNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteMentorNotification,
} from "../../services/mentorApi";

const COMMON_NOTIFICATIONS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/notifications";

const TYPE_ICON = {
  Submission: FileText,
  Evaluation: ClipboardCheck,
  Task: ClipboardCheck,
  Alert: AlertCircle,
  System: Bell,
  Announcement: Bell,
};

const getAuthConfig = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken");

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

function MentorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, type, message });
  };

  useEffect(() => {
    if (!toast.show) return;

    const timer = setTimeout(
      () => setToast({ show: false, type: "", message: "" }),
      3000
    );

    return () => clearTimeout(timer);
  }, [toast]);

  // ============================================================
  // LOAD MENTOR + COMMON NOTIFICATIONS
  // ============================================================

  const loadNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const results = await Promise.allSettled([
        getMentorNotifications(),

        axios.get(
          COMMON_NOTIFICATIONS_API_URL,
          getAuthConfig()
        ),
      ]);

      let mentorNotifications = [];
      let commonNotifications = [];

      // Existing Mentor notifications
      if (results[0].status === "fulfilled") {
        mentorNotifications =
          results[0].value.data?.data || [];
      }

      // Common notifications (Program Manager announcements)
      if (results[1].status === "fulfilled") {
        commonNotifications =
          results[1].value.data?.data || [];
      }

      // Identify notification source for correct API actions
      const mentorData = mentorNotifications.map((item) => ({
        ...item,
        notificationSource: "mentor",
      }));

      const commonData = commonNotifications.map((item) => ({
        ...item,
        notificationSource: "common",
      }));

      // Combine both notification lists
      const combinedNotifications = [
        ...mentorData,
        ...commonData,
      ].sort(
        (a, b) =>
          new Date(b.createdAt || b.date || 0) -
          new Date(a.createdAt || a.date || 0)
      );

      setNotifications(combinedNotifications);

      // Show error only when both APIs fail
      if (
        results[0].status === "rejected" &&
        results[1].status === "rejected" &&
        !silent
      ) {
        showToast("Unable to load notifications.", "error");
      }
    } catch (error) {
      if (!silent) {
        showToast("Unable to load notifications.", "error");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const timer = setInterval(
      () => loadNotifications(true),
      15000
    );

    return () => clearInterval(timer);
  }, []);

  // ============================================================
  // COUNTS AND FILTERS
  // ============================================================

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const filtered = useMemo(() => {
    if (filter === "All") return notifications;

    if (filter === "Unread") {
      return notifications.filter((item) => !item.isRead);
    }

    return notifications.filter(
      (item) => item.type === filter
    );
  }, [notifications, filter]);

  // ============================================================
  // MARK INDIVIDUAL NOTIFICATION AS READ
  // ============================================================

  const handleMarkAsRead = async (notification) => {
    try {
      if (notification.notificationSource === "common") {
        await axios.put(
          `${COMMON_NOTIFICATIONS_API_URL}/${notification._id}/read`,
          {},
          getAuthConfig()
        );
      } else {
        await markNotificationAsRead(notification._id);
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id &&
          item.notificationSource === notification.notificationSource
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (error) {
      showToast("Failed to update notification.", "error");
    }
  };

  // ============================================================
  // MARK ALL NOTIFICATIONS AS READ
  // ============================================================

  const handleMarkAllAsRead = async () => {
    try {
      const results = await Promise.allSettled([
        markAllNotificationsAsRead(),

        axios.put(
          `${COMMON_NOTIFICATIONS_API_URL}/read-all`,
          {},
          getAuthConfig()
        ),
      ]);

      const hasSuccess = results.some(
        (result) => result.status === "fulfilled"
      );

      if (!hasSuccess) {
        throw new Error("Unable to update notifications.");
      }

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      showToast("All notifications marked as read.");
    } catch (error) {
      showToast("Failed to mark all as read.", "error");
    }
  };

  // ============================================================
  // DELETE NOTIFICATION
  // ============================================================

  const handleDelete = async (notification) => {
    try {
      if (notification.notificationSource === "common") {
        await axios.delete(
          `${COMMON_NOTIFICATIONS_API_URL}/${notification._id}`,
          getAuthConfig()
        );
      } else {
        await deleteMentorNotification(notification._id);
      }

      setNotifications((prev) =>
        prev.filter(
          (item) =>
            !(
              item._id === notification._id &&
              item.notificationSource ===
                notification.notificationSource
            )
        )
      );

      showToast("Notification deleted.");
    } catch (error) {
      showToast("Failed to delete notification.", "error");
    }
  };

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (date) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "";

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filters = [
    "All",
    "Unread",
    "Announcement",
    "Submission",
    "Evaluation",
    "System",
  ];

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#F3F6FB] p-5 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[900px] animate-pulse">
          <div className="h-8 w-72 rounded bg-slate-200" />

          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-20 rounded-2xl bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F3F6FB]">
      <div className="mx-auto max-w-[900px] p-5 sm:p-6 lg:p-8">

        {/* HEADER */}

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2563EB]" />

              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563EB]">
                Mentorship
              </p>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-[#172033] sm:text-3xl">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-[#64748B]">
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }`
                : "You're all caught up."}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#172033] shadow-sm transition hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          )}
        </div>

        {/* FILTERS */}

        <div className="mb-5 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                filter === item
                  ? "border-transparent bg-gradient-to-r from-[#2563EB] to-[#0891B2] text-white"
                  : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-blue-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* NOTIFICATION LIST */}

        {filtered.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white text-center shadow-sm">
            <Bell size={28} className="text-slate-300" />

            <p className="mt-3 text-sm font-semibold text-[#94A3B8]">
              No notifications here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notification) => {
              const Icon =
                TYPE_ICON[notification.type] || Bell;

              return (
                <div
                  key={`${notification.notificationSource}-${notification._id}`}
                  className={`flex items-start gap-3.5 rounded-2xl border p-4 shadow-sm transition ${
                    notification.isRead
                      ? "border-[#E2E8F0] bg-white"
                      : "border-blue-100 bg-blue-50/40"
                  }`}
                >
                  {/* ICON */}

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      notification.isRead
                        ? "bg-slate-100 text-[#64748B]"
                        : "bg-blue-50 text-[#2563EB]"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  {/* CONTENT */}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-[#172033]">
                        {notification.title}
                      </p>

                      {!notification.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                      )}

                      {notification.priority === "High" && (
                        <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-700">
                          High Priority
                        </span>
                      )}

                      {notification.type === "Announcement" && (
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700">
                          Announcement
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-[#64748B]">
                      {notification.message}
                    </p>

                    <p className="mt-1.5 text-[10px] text-[#94A3B8]">
                      {formatDate(
                        notification.createdAt || notification.date
                      )}
                    </p>
                  </div>

                  {/* ACTIONS */}

                  <div className="flex shrink-0 items-center gap-1.5">
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkAsRead(notification)
                        }
                        title="Mark as read"
                        className="rounded-lg p-2 text-[#64748B] transition hover:bg-blue-50 hover:text-[#2563EB]"
                      >
                        <Check size={16} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(notification)}
                      title="Delete"
                      className="rounded-lg p-2 text-[#64748B] transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TOAST */}

      {toast.show && (
        <div
          className={`fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl ${
            toast.type === "error"
              ? "border-red-200"
              : "border-blue-200"
          }`}
        >
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              toast.type === "error"
                ? "bg-[#DC2626]"
                : "bg-[#2563EB]"
            }`}
          />

          <p className="text-sm font-medium text-[#172033]">
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
}

export default MentorNotifications;