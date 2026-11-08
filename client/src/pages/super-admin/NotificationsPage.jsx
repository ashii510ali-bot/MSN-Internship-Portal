
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";

import { Helmet } from "react-helmet-async";
import axios from "axios";

import {
  Bell,
  Check,
  CheckCheck,
  Megaphone,
  ShieldCheck,
  Info,
  Clock,
  Inbox,
  AlertCircle,
} from "lucide-react";

import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../../api";

import { showToast } from "../../api/client";
import { relativeFrom } from "../../lib/labels";

// ============================================================
// CONFIGURATION
// ============================================================

const COMMON_NOTIFICATIONS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/notifications";

const CHIPS = ["All", "Unread", "Security", "Approvals", "System"];

// ============================================================
// AUTH CONFIGURATION
// ============================================================

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

// ============================================================
// CHIP FILTER
// ============================================================

function chipToFilter(chip) {
  switch (chip) {
    case "Unread":
      return { unread: true };

    case "Security":
      return { category: "security" };

    case "Approvals":
      return { category: "approval" };

    case "System":
      return { category: "system" };

    default:
      return {};
  }
}

// ============================================================
// NOTIFICATION ICON
// ============================================================

function getNotificationIcon(category) {
  const value = String(category || "").toLowerCase();

  if (value.includes("announcement")) {
    return Megaphone;
  }

  if (value.includes("security")) {
    return ShieldCheck;
  }

  if (value.includes("approval")) {
    return CheckCheck;
  }

  return Info;
}

// ============================================================
// NOTIFICATION CARD
// ============================================================

function NotificationCard({ item, onMarkRead }) {
  const Icon = getNotificationIcon(item.category);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
        !item.isRead
          ? "border-blue-200 bg-blue-50/60 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {!item.isRead && (
        <div className="absolute left-0 top-0 h-full w-1 bg-blue-500" />
      )}

      <div className="flex gap-4 p-4 sm:p-5">

        {/* ICON */}

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            !item.isRead
              ? "bg-blue-100 text-blue-600"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <Icon size={21} />
        </div>

        {/* CONTENT */}

        <div className="min-w-0 flex-1">

          {/* TITLE + STATUS */}

          <div className="flex flex-wrap items-start justify-between gap-2">

            <div className="min-w-0 flex-1">

              <h3 className="break-words text-sm font-bold text-slate-800 sm:text-base">
                {item.title || "Notification"}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-2">

                <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  {item.category || "System"}
                </span>

                {!item.isRead && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Unread
                  </span>
                )}

                {item.isRead && (
                  <span className="text-[10px] font-medium text-slate-400">
                    Read
                  </span>
                )}

              </div>

            </div>

            {/* TIME */}

            <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
              <Clock size={13} />
              <span>{item.timestampLabel || "Recently"}</span>
            </div>

          </div>

          {/* COMPLETE MESSAGE */}

          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
            {item.message || "No additional message available."}
          </p>

          {/* FOOTER */}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">

            <span className="text-xs text-slate-400">
              {item.notificationSource === "common"
                ? "Program Manager Announcement"
                : "MSN Academy Notification"}
            </span>

            {!item.isRead && (
              <button
                type="button"
                onClick={() => onMarkRead(item.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                <Check size={14} />
                Mark as read
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

// ============================================================
// SUPER ADMIN NOTIFICATIONS PAGE
// ============================================================

export default function NotificationsPage() {
  const [activeChip, setActiveChip] = useState("All");

  const [commonNotifications, setCommonNotifications] =
    useState([]);

  const [isCommonLoading, setIsCommonLoading] = useState(true);

  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const filter = useMemo(
    () => chipToFilter(activeChip),
    [activeChip]
  );

  // Existing Super Admin notifications

  const { data: notifications = [] } =
    useNotifications(filter);

  const { mutate: markRead } =
    useMarkNotificationRead();

  const {
    mutate: markAllRead,
    isPending: isLegacyMarkingAll,
  } = useMarkAllNotificationsRead();

  // ============================================================
  // LOAD PROGRAM MANAGER ANNOUNCEMENTS
  // ============================================================

  const loadCommonNotifications = useCallback(async () => {
    try {
      const response = await axios.get(
        COMMON_NOTIFICATIONS_API_URL,
        getAuthConfig()
      );

      const announcements = (
        response.data?.data || []
      ).filter(
        (notification) =>
          notification.sourceType === "Announcement"
      );

      setCommonNotifications(announcements);

    } catch (error) {
      console.error(
        "Announcement loading error:",
        error.response?.data || error.message
      );
    } finally {
      setIsCommonLoading(false);
    }
  }, []);

  // ============================================================
  // INITIAL LOAD + AUTO REFRESH
  // ============================================================

  useEffect(() => {
    loadCommonNotifications();

    const timer = setInterval(() => {
      loadCommonNotifications();
    }, 15000);

    return () => clearInterval(timer);
  }, [loadCommonNotifications]);

  // ============================================================
  // FORMAT EXISTING NOTIFICATIONS
  // ============================================================

  const legacyItems = useMemo(() => {
    return notifications.map((notification) => ({
      id: notification.id || notification._id,
      title: notification.title,
      message:
        notification.message ||
        notification.description ||
        "",
      timestampLabel: relativeFrom(
        notification.createdAt
      ),
      isRead: notification.isRead,
      category: notification.category || "System",
      notificationSource: "legacy",
    }));
  }, [notifications]);

  // ============================================================
  // FILTER ANNOUNCEMENTS
  // ============================================================

  const filteredCommonNotifications = useMemo(() => {
    return commonNotifications.filter((notification) => {
      if (activeChip === "Unread") {
        return !notification.isRead;
      }

      if (
        activeChip === "Security" ||
        activeChip === "Approvals" ||
        activeChip === "System"
      ) {
        return false;
      }

      return true;
    });
  }, [commonNotifications, activeChip]);

  // ============================================================
  // FORMAT ANNOUNCEMENTS
  // ============================================================

  const commonItems = useMemo(() => {
    return filteredCommonNotifications.map((notification) => ({
      id: `common_${notification._id}`,
      title: notification.title,
      message:
        notification.message ||
        notification.description ||
        "",
      timestampLabel: relativeFrom(
        notification.createdAt
      ),
      isRead: notification.isRead,
      category: "Announcement",
      notificationSource: "common",
    }));
  }, [filteredCommonNotifications]);

  // ============================================================
  // COMBINE NOTIFICATIONS
  // ============================================================

  const items = useMemo(() => {
    return [...legacyItems, ...commonItems].sort(
      (a, b) => {
        if (a.isRead !== b.isRead) {
          return a.isRead ? 1 : -1;
        }

        return 0;
      }
    );
  }, [legacyItems, commonItems]);

  // ============================================================
  // FILTER FINAL LIST
  // ============================================================

  const filteredItems = useMemo(() => {
    if (activeChip === "Unread") {
      return items.filter((item) => !item.isRead);
    }

    if (activeChip === "Security") {
      return legacyItems.filter(
        (item) =>
          String(item.category).toLowerCase() === "security"
      );
    }

    if (activeChip === "Approvals") {
      return legacyItems.filter(
        (item) =>
          String(item.category).toLowerCase() === "approval"
      );
    }

    if (activeChip === "System") {
      return legacyItems.filter(
        (item) =>
          String(item.category).toLowerCase() === "system"
      );
    }

    return items;
  }, [activeChip, items, legacyItems]);

  const unreadCount = items.filter(
    (item) => !item.isRead
  ).length;

  // ============================================================
  // MARK INDIVIDUAL NOTIFICATION AS READ
  // ============================================================

  const handleMarkRead = useCallback(
    (id) => {
      if (String(id).startsWith("common_")) {
        const notificationId = String(id).replace(
          "common_",
          ""
        );

        axios
          .put(
            `${COMMON_NOTIFICATIONS_API_URL}/${notificationId}/read`,
            {},
            getAuthConfig()
          )
          .then(() => {
            setCommonNotifications((previous) =>
              previous.map((item) =>
                item._id === notificationId
                  ? { ...item, isRead: true }
                  : item
              )
            );

            showToast(
              "Announcement marked as read",
              "success"
            );
          })
          .catch((error) => {
            console.error(
              "Mark announcement read error:",
              error.response?.data || error.message
            );

            showToast(
              "Failed to update announcement",
              "error"
            );
          });

      } else {
        markRead(id);
      }
    },
    [markRead]
  );

  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  const handleMarkAllRead = useCallback(async () => {
    if (unreadCount === 0) {
      showToast(
        "All notifications are already read",
        "info"
      );
      return;
    }

    setIsMarkingAll(true);

    try {
      // Existing Super Admin notifications

      await new Promise((resolve, reject) => {
        markAllRead(undefined, {
          onSuccess: resolve,
          onError: reject,
        });
      });

      // Program Manager announcements

      const unreadAnnouncements =
        commonNotifications.filter(
          (item) => !item.isRead
        );

      await Promise.all(
        unreadAnnouncements.map((item) =>
          axios.put(
            `${COMMON_NOTIFICATIONS_API_URL}/${item._id}/read`,
            {},
            getAuthConfig()
          )
        )
      );

      setCommonNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      showToast(
        "All notifications marked as read",
        "success"
      );

    } catch (error) {
      console.error(
        "Mark all read error:",
        error.response?.data || error.message
      );

      showToast(
        "Some notifications could not be updated",
        "error"
      );

    } finally {
      setIsMarkingAll(false);
    }
  }, [
    markAllRead,
    commonNotifications,
    unreadCount,
  ]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <Helmet>
        <title>
          Notifications | Super Admin | MSN Academy
        </title>
      </Helmet>

      <div className="min-h-screen space-y-6">

        {/* PAGE HEADER */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Bell size={22} />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                  Notifications
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Stay updated with important academy activities.
                </p>
              </div>

            </div>
          </div>

          <div className="flex items-center gap-3">

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Unread
              </p>

              <p className="text-lg font-bold text-blue-600">
                {unreadCount}
              </p>
            </div>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={
                isMarkingAll ||
                isLegacyMarkingAll ||
                unreadCount === 0
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck size={16} />

              {isMarkingAll || isLegacyMarkingAll
                ? "Updating..."
                : "Mark all as read"}
            </button>

          </div>

        </div>

        {/* FILTER SECTION */}

        <div className="rounded-xl border border-slate-200 bg-white p-4">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>
              <h2 className="text-sm font-bold text-slate-800">
                All Activity
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Manage your notifications
              </p>
            </div>

            <div className="flex flex-wrap gap-2">

              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setActiveChip(chip)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                    activeChip === chip
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {chip}
                </button>
              ))}

            </div>

          </div>

        </div>

        {/* NOTIFICATION LIST */}

        <div className="space-y-3">

          {filteredItems.length > 0 ? (

            filteredItems.map((item) => (
              <NotificationCard
                key={`${item.notificationSource}_${item.id}`}
                item={item}
                onMarkRead={handleMarkRead}
              />
            ))

          ) : (

            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                {isCommonLoading ? (
                  <Bell size={25} />
                ) : (
                  <Inbox size={25} />
                )}
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-700">
                {isCommonLoading
                  ? "Loading notifications..."
                  : "No notifications found"}
              </h3>

              <p className="mt-2 max-w-sm text-xs leading-6 text-slate-400">
                {isCommonLoading
                  ? "Please wait while we load your notifications."
                  : "There are no notifications available in this category right now."}
              </p>

            </div>

          )}

        </div>

        {/* LOADING STATUS */}

        {isCommonLoading && filteredItems.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-400">
            <AlertCircle size={14} />
            Updating announcement notifications...
          </div>
        )}

      </div>
    </>
  );
}
