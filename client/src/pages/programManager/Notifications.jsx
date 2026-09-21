import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Search,
  AlertTriangle,
  Info,
  Users,
  CalendarDays,
  ClipboardCheck,
  Megaphone,
  X,
  FolderKanban,
  ListTodo,
} from "lucide-react";

const API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/notifications";

// ============================================================
// NOTIFICATION TYPE CONFIG
// ============================================================

const notificationTypeConfig = {
  Registration: {
    icon: Users,
    iconClass:
      "bg-blue-50 text-blue-600 border-blue-100",
  },

  Cohort: {
    icon: Users,
    iconClass:
      "bg-cyan-50 text-cyan-600 border-cyan-100",
  },

  Attendance: {
    icon: CalendarDays,
    iconClass:
      "bg-red-50 text-red-600 border-red-100",
  },

  Evaluation: {
    icon: ClipboardCheck,
    iconClass:
      "bg-indigo-50 text-indigo-600 border-indigo-100",
  },

  Announcement: {
    icon: Megaphone,
    iconClass:
      "bg-blue-50 text-blue-600 border-blue-100",
  },

  Project: {
    icon: FolderKanban,
    iconClass:
      "bg-cyan-50 text-cyan-600 border-cyan-100",
  },

  Task: {
    icon: ListTodo,
    iconClass:
      "bg-blue-50 text-blue-600 border-blue-100",
  },

  System: {
    icon: AlertTriangle,
    iconClass:
      "bg-red-50 text-red-600 border-red-100",
  },

  User: {
    icon: Users,
    iconClass:
      "bg-blue-50 text-blue-600 border-blue-100",
  },

  Info: {
    icon: Info,
    iconClass:
      "bg-slate-50 text-slate-600 border-slate-100",
  },
};

// ============================================================
// HELPER - DATE
// ============================================================

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ============================================================
// HELPER - TIME
// ============================================================

const formatTime = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

// ============================================================
// HELPER - TIME AGO
// ============================================================

const getTimeAgo = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const seconds = Math.floor(
    difference / 1000
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes} ${
      minutes === 1 ? "minute" : "minutes"
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} ${
      hours === 1 ? "hour" : "hours"
    } ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days} ${
      days === 1 ? "day" : "days"
    } ago`;
  }

  return formatDate(dateValue);
};

// ============================================================
// COMPONENT
// ============================================================

function Notifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [
    selectedNotification,
    setSelectedNotification,
  ] = useState(null);

  // ==========================================================
  // FETCH NOTIFICATIONS
  // ==========================================================

  const fetchNotifications =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response =
          await axios.get(API_URL);

        if (
          response.data &&
          response.data.success
        ) {
          setNotifications(
            response.data.data || []
          );
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error(
          "Fetch notifications error:",
          error
        );

        setErrorMessage(
          error.response?.data?.message ||
            "Failed to load notifications."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ==========================================================
  // SUCCESS MESSAGE
  // ==========================================================

  const showSuccess = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // ==========================================================
  // UNREAD COUNT
  // ==========================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  // ==========================================================
  // FILTERED NOTIFICATIONS
  // ==========================================================

  const filteredNotifications =
    useMemo(() => {
      return notifications.filter(
        (notification) => {
          const title =
            notification.title || "";

          const message =
            notification.message || "";

          const matchesSearch =
            title
              .toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              ) ||
            message
              .toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              );

          const matchesFilter =
            filter === "All"
              ? true
              : filter === "Unread"
              ? !notification.isRead
              : filter === "Read"
              ? notification.isRead
              : notification.type ===
                filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      notifications,
      searchTerm,
      filter,
    ]);

  // ==========================================================
  // MARK AS READ
  // ==========================================================

  const markAsRead = async (id) => {
    try {
      setActionLoading(true);

      const response =
        await axios.put(
          `${API_URL}/${id}/read`
        );

      if (
        response.data &&
        response.data.success
      ) {
        setNotifications(
          (current) =>
            current.map(
              (notification) =>
                notification._id === id ||
                notification.id === id
                  ? {
                      ...notification,
                      isRead: true,
                    }
                  : notification
            )
        );

        showSuccess(
          "Notification marked as read."
        );
      }
    } catch (error) {
      console.error(
        "Mark read error:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to mark notification as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // MARK AS UNREAD
  // ==========================================================

  const markAsUnread = async (id) => {
    try {
      setActionLoading(true);

      const response =
        await axios.put(
          `${API_URL}/${id}/unread`
        );

      if (
        response.data &&
        response.data.success
      ) {
        setNotifications(
          (current) =>
            current.map(
              (notification) =>
                notification._id === id ||
                notification.id === id
                  ? {
                      ...notification,
                      isRead: false,
                    }
                  : notification
            )
        );

        showSuccess(
          "Notification marked as unread."
        );
      }
    } catch (error) {
      console.error(
        "Mark unread error:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to mark notification as unread."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setActionLoading(true);

      const response =
        await axios.put(
          `${API_URL}/read-all`
        );

      if (
        response.data &&
        response.data.success
      ) {
        setNotifications(
          (current) =>
            current.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        );

        showSuccess(
          "All notifications marked as read."
        );
      }
    } catch (error) {
      console.error(
        "Mark all read error:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to mark all notifications as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // DELETE NOTIFICATION
  // ==========================================================

  const deleteNotification = async (id) => {
    try {
      setActionLoading(true);

      const response =
        await axios.delete(
          `${API_URL}/${id}`
        );

      if (
        response.data &&
        response.data.success
      ) {
        setNotifications(
          (current) =>
            current.filter(
              (notification) =>
                notification._id !== id &&
                notification.id !== id
            )
        );

        if (
          selectedNotification &&
          (
            selectedNotification._id === id ||
            selectedNotification.id === id
          )
        ) {
          setSelectedNotification(null);
        }

        showSuccess(
          "Notification deleted successfully."
        );
      }
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to delete notification."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // TYPE CONFIG
  // ==========================================================

  const getTypeConfig = (type) => {
    return (
      notificationTypeConfig[type] || {
        icon: Info,
        iconClass:
          "bg-slate-50 text-slate-600 border-slate-100",
      }
    );
  };

  // ==========================================================
  // CLEAR ERROR
  // ==========================================================

  const clearError = () => {
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#F3F6FB] px-3 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1600px] space-y-5">

        {/* =====================================================
            SUCCESS MESSAGE
        ====================================================== */}

        {successMessage && (
          <div className="fixed right-5 top-5 z-[200] flex items-center gap-3 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-xl">
            <Check
              size={18}
              className="text-blue-600"
            />

            {successMessage}

            <button
              type="button"
              onClick={() =>
                setSuccessMessage("")
              }
              className="ml-2 text-slate-400 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =====================================================
            ERROR MESSAGE
        ====================================================== */}

        {errorMessage && (
          <div className="fixed right-5 top-5 z-[200] flex max-w-md items-center gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 shadow-xl">
            <AlertTriangle
              size={18}
              className="shrink-0 text-red-500"
            />

            <span className="flex-1">
              {errorMessage}
            </span>

            <button
              type="button"
              onClick={clearError}
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/85 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">

          {/* Animated outer stroke only */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-blue-500/30 via-transparent to-red-500/30 opacity-70" />

            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-transparent via-blue-400/20 to-transparent opacity-50" />
          </div>

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                  <Bell size={22} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Notifications
                  </h1>

                  <p className="text-sm text-slate-500">
                    Stay updated with important portal activities.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={
                unreadCount === 0 ||
                actionLoading
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck size={17} />

              {actionLoading
                ? "Updating..."
                : "Mark All as Read"}
            </button>
          </div>
        </div>

        {/* =====================================================
            STATS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Total */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-1">

            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-blue-500/30 via-transparent to-red-500/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10 flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Notifications
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {notifications.length}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Bell size={21} />
              </div>
            </div>
          </div>

          {/* Unread */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-1">

            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-red-500/30 via-transparent to-blue-500/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10 flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Unread
                </p>

                <h2 className="mt-1 text-2xl font-bold text-red-600">
                  {unreadCount}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Bell size={21} />
              </div>
            </div>
          </div>

          {/* Read */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-1">

            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-blue-500/30 via-transparent to-cyan-500/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10 flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Read
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {notifications.length -
                    unreadCount}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <CheckCheck size={21} />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            SEARCH + FILTERS
        ====================================================== */}

        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_5px_20px_rgba(15,23,42,0.045)] backdrop-blur-xl">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}
            <div className="relative w-full lg:max-w-md">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search notifications..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">

              {[
                "All",
                "Unread",
                "Read",
                "Registration",
                "Cohort",
                "Attendance",
                "Evaluation",
                "Announcement",
                "Project",
                "Task",
                "System",
              ].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setFilter(option)
                  }
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-300 ${
                    filter === option
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-[0_5px_20px_rgba(15,23,42,0.045)]">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading notifications...
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                NOTIFICATION LIST
            ================================================== */}

            <div className="space-y-3">

              {filteredNotifications.length ===
              0 ? (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-[0_5px_20px_rgba(15,23,42,0.045)]">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Bell size={24} />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-slate-800">
                    No notifications found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search or filter.
                  </p>
                </div>
              ) : (
                filteredNotifications.map(
                  (notification) => {
                    const config =
                      getTypeConfig(
                        notification.type
                      );

                    const Icon =
                      config.icon;

                    const notificationId =
                      notification._id ||
                      notification.id;

                    return (
                      <div
                        key={notificationId}
                        className={`group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-[0_5px_20px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] ${
                          notification.isRead
                            ? "border-slate-200/80"
                            : "border-blue-200/80"
                        }`}
                      >

                        {/* Outer animated stroke only */}
                        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">

                          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-blue-500/40 via-transparent to-red-500/40" />
                        </div>

                        {/* Unread indicator */}
                        {!notification.isRead && (
                          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-red-500" />
                        )}

                        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start">

                          {/* Icon */}
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${config.iconClass}`}
                          >
                            <Icon size={20} />
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                              <div>

                                <div className="flex flex-wrap items-center gap-2">

                                  <h3
                                    className={`text-sm font-bold ${
                                      notification.isRead
                                        ? "text-slate-800"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {
                                      notification.title
                                    }
                                  </h3>

                                  {!notification.isRead && (
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                                      New
                                    </span>
                                  )}

                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                    {notification.type ||
                                      "Info"}
                                  </span>
                                </div>

                                <p className="mt-1 text-xs text-slate-400">
                                  {notification.createdBy ||
                                    "System"}{" "}
                                  •{" "}
                                  {getTimeAgo(
                                    notification.createdAt
                                  )}
                                </p>
                              </div>

                              <span className="shrink-0 text-xs text-slate-400">
                                {formatDate(
                                  notification.createdAt
                                )}
                              </span>
                            </div>

                            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
                              {
                                notification.message
                              }
                            </p>

                            {/* Actions */}
                            <div className="mt-4 flex flex-wrap items-center gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedNotification(
                                    notification
                                  )
                                }
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              >
                                View Details
                              </button>

                              {notification.isRead ? (
                                <button
                                  type="button"
                                  disabled={
                                    actionLoading
                                  }
                                  onClick={() =>
                                    markAsUnread(
                                      notificationId
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                                >
                                  <Bell size={13} />
                                  Mark Unread
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={
                                    actionLoading
                                  }
                                  onClick={() =>
                                    markAsRead(
                                      notificationId
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-100 disabled:opacity-50"
                                >
                                  <Check size={13} />
                                  Mark as Read
                                </button>
                              )}

                              <button
                                type="button"
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  deleteNotification(
                                    notificationId
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all duration-300 hover:bg-red-100 disabled:opacity-50"
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* =======================================================
          DETAILS MODAL
      ======================================================== */}

      {selectedNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/80 bg-white shadow-2xl">

            {/* Modal gradient top stroke */}
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-red-500" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Bell size={19} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Notification Details
                  </h2>

                  <p className="text-xs text-slate-400">
                    {getTimeAgo(
                      selectedNotification.createdAt
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedNotification(
                    null
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 p-5">

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {
                    selectedNotification.title
                  }
                </h3>

                <div className="mt-2 flex flex-wrap gap-2">

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                    {
                      selectedNotification.type ||
                      "Info"
                    }
                  </span>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {selectedNotification.isRead
                      ? "Read"
                      : "Unread"}
                  </span>

                  {selectedNotification.senderRole && (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                      From:{" "}
                      {
                        selectedNotification.senderRole
                      }
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-600">
                  {
                    selectedNotification.message
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {formatDate(
                      selectedNotification.createdAt
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Time
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {formatTime(
                      selectedNotification.createdAt
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-3 sm:col-span-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Created By
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {selectedNotification.createdBy ||
                      "System"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4">

              {!selectedNotification.isRead && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={async () => {
                    const notificationId =
                      selectedNotification._id ||
                      selectedNotification.id;

                    await markAsRead(
                      notificationId
                    );

                    setSelectedNotification(
                      null
                    );
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Check size={16} />
                  Mark as Read
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setSelectedNotification(
                    null
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;