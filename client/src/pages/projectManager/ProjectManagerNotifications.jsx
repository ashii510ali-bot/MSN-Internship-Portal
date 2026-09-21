import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

import {
  Search,
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  Megaphone,
  AlertTriangle,
  Info,
  ShieldAlert,
  UserRound,
} from "lucide-react";

const NOTIFICATIONS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/project-manager/notifications";

function ProjectManagerNotifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadNotifications();

    // Refresh notifications automatically
    // so new Admin / Program Manager announcements
    // appear without manually refreshing the page.

    const refreshTimer = setInterval(() => {
      loadNotifications(true);
    }, 15000);

    return () => {
      clearInterval(refreshTimer);
    };
  }, []);

  // ============================================================
  // TOAST AUTO HIDE
  // ============================================================

  useEffect(() => {
    if (!toast.show) return;

    const timer = setTimeout(() => {
      setToast({
        show: false,
        type: "",
        message: "",
      });
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast]);

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      show: true,
      type,
      message,
    });
  };

  // ============================================================
  // LOAD NOTIFICATIONS
  // ============================================================

  const loadNotifications = async (
    silent = false
  ) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const response = await axios.get(
        NOTIFICATIONS_API_URL
      );

      const data = Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : [];

      setNotifications(data);
    } catch (error) {
      console.error(
        "Notifications loading error:",
        error
      );

      if (!silent) {
        showToast(
          error.response?.data?.message ||
            "Unable to load notifications.",
          "error"
        );
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // ============================================================
  // STATS
  // ============================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  const highPriorityCount =
    notifications.filter(
      (notification) =>
        notification.priority ===
          "High" &&
        !notification.isRead
    ).length;

  const todayCount =
    notifications.filter(
      (notification) => {
        if (!notification.createdAt) {
          return false;
        }

        const notificationDate =
          new Date(
            notification.createdAt
          );

        const today = new Date();

        return (
          notificationDate.toDateString() ===
          today.toDateString()
        );
      }
    ).length;

  // ============================================================
  // SEARCH + FILTER
  // ============================================================

  const filteredNotifications =
    useMemo(() => {
      const search =
        searchTerm
          .toLowerCase()
          .trim();

      return notifications.filter(
        (notification) => {
          const matchesSearch =
            !search ||
            notification.title
              ?.toLowerCase()
              .includes(search) ||
            notification.message
              ?.toLowerCase()
              .includes(search) ||
            notification.type
              ?.toLowerCase()
              .includes(search) ||
            notification.sourceRole
              ?.toLowerCase()
              .includes(search) ||
            notification.createdBy
              ?.toLowerCase()
              .includes(search) ||
            notification.relatedName
              ?.toLowerCase()
              .includes(search);

          const matchesFilter =
            filter === "All" ||
            (filter === "Unread" &&
              !notification.isRead) ||
            (filter === "Read" &&
              notification.isRead);

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

  // ============================================================
  // MARK ONE AS READ
  // ============================================================

  const markAsRead = async (id) => {
    try {
      const response =
        await axios.put(
          `${NOTIFICATIONS_API_URL}/${id}/read`
        );

      const updatedNotification =
        response.data?.data;

      if (!updatedNotification) {
        return;
      }

      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              notification._id === id
                ? updatedNotification
                : notification
          )
      );
    } catch (error) {
      console.error(
        "Mark read error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Unable to mark notification as read.",
        "error"
      );
    }
  };

  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      const response =
        await axios.put(
          `${NOTIFICATIONS_API_URL}/mark-all-read`
        );

      const updatedNotifications =
        Array.isArray(
          response.data?.data
        )
          ? response.data.data
          : [];

      setNotifications(
        updatedNotifications
      );

      showToast(
        "All notifications marked as read."
      );
    } catch (error) {
      console.error(
        "Mark all read error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Unable to mark all notifications as read.",
        "error"
      );
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const deleteNotification =
    async () => {
      if (!deleteTarget?._id) {
        return;
      }

      try {
        await axios.delete(
          `${NOTIFICATIONS_API_URL}/${deleteTarget._id}`
        );

        setNotifications(
          (previous) =>
            previous.filter(
              (notification) =>
                notification._id !==
                deleteTarget._id
            )
        );

        setDeleteTarget(null);

        showToast(
          "Notification deleted successfully."
        );
      } catch (error) {
        console.error(
          "Delete notification error:",
          error
        );

        showToast(
          error.response?.data?.message ||
            "Unable to delete notification.",
          "error"
        );
      }
    };

  // ============================================================
  // HELPERS
  // ============================================================

  const getTypeIcon = (
    notification
  ) => {
    const type =
      String(
        notification?.type || ""
      ).toLowerCase();

    const sourceRole =
      String(
        notification?.sourceRole || ""
      ).toLowerCase();

    if (
      type.includes("announcement") ||
      sourceRole.includes("program manager")
    ) {
      return Megaphone;
    }

    if (
      type.includes("alert") ||
      notification?.priority === "High"
    ) {
      return AlertTriangle;
    }

    if (
      type.includes("system")
    ) {
      return ShieldAlert;
    }

    return Info;
  };

  const getTypeStyle = (
    notification
  ) => {
    const type =
      String(
        notification?.type || ""
      ).toLowerCase();

    if (
      type.includes("announcement")
    ) {
      return "bg-blue-50 text-[#2563EB]";
    }

    if (
      type.includes("alert")
    ) {
      return "bg-red-50 text-[#DC2626]";
    }

    if (
      type.includes("system")
    ) {
      return "bg-cyan-50 text-[#0891B2]";
    }

    return "bg-slate-100 text-[#64748B]";
  };

  const getPriorityStyle = (
    priority
  ) => {
    if (priority === "High") {
      return "border-red-200 bg-red-50 text-[#DC2626]";
    }

    if (priority === "Medium") {
      return "border-amber-200 bg-amber-50 text-[#D97706]";
    }

    return "border-blue-200 bg-blue-50 text-[#2563EB]";
  };

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "";
    }

    const notificationDate =
      new Date(date);

    const now = new Date();

    const difference =
      now.getTime() -
      notificationDate.getTime();

    const minutes = Math.floor(
      difference /
        (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days} day${
        days > 1 ? "s" : ""
      } ago`;
    }

    return notificationDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getSourceLabel = (
    notification
  ) => {
    if (
      notification.sourceRole
    ) {
      return notification.sourceRole;
    }

    if (
      notification.createdBy
    ) {
      return notification.createdBy;
    }

    return "System";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
              <Bell size={19} />
            </div>

            <span className="text-sm font-bold uppercase tracking-wider text-[#2563EB]">
              Project Manager
            </span>

            {unreadCount > 0 && (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-[#DC2626]">
                {unreadCount} unread
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">
            Notifications
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#64748B]">
            Stay informed about announcements and
            important updates from Admin and Program
            Manager.
          </p>
        </div>

        <button
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#172033] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2563EB] hover:text-[#2563EB] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck size={18} />

          Mark All Read
        </button>
      </div>

      {/* ====================================================== */}
      {/* STATS */}
      {/* ====================================================== */}

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <StatCard
          icon={Bell}
          title="Unread"
          value={unreadCount}
          iconClass="text-[#2563EB]"
        />

        <StatCard
          icon={AlertTriangle}
          title="High Priority"
          value={highPriorityCount}
          iconClass="text-[#DC2626]"
        />

        <StatCard
          icon={Info}
          title="Today"
          value={todayCount}
          iconClass="text-[#0891B2]"
        />
      </div>

      {/* ====================================================== */}
      {/* MAIN CARD */}
      {/* ====================================================== */}

      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">

        {/* Gradient border/stroke */}

        <div className="h-[3px] w-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626]" />

        <div className="p-4 sm:p-6">

          {/* ================================================== */}
          {/* SEARCH + FILTER */}
          {/* ================================================== */}

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div className="relative w-full md:max-w-xl">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search announcements and notifications..."
                className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-10 pr-4 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex w-fit rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1">

              {[
                "All",
                "Unread",
                "Read",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setFilter(item)
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    filter === item
                      ? "bg-[#0E2A52] text-white shadow-sm"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* ================================================== */}
          {/* INFO BAR */}
          {/* ================================================== */}

          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#2563EB] shadow-sm">
                <Megaphone size={17} />
              </div>

              <div>
                <p className="text-xs font-bold text-[#172033]">
                  Incoming Announcements
                </p>

                <p className="text-[11px] leading-5 text-[#64748B]">
                  Admin and Program Manager announcements
                  are delivered here automatically.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#64748B]">

              <span className="h-2 w-2 rounded-full bg-[#22C55E]" />

              Auto sync enabled
            </div>
          </div>

          {/* ================================================== */}
          {/* NOTIFICATIONS */}
          {/* ================================================== */}

          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center">

              <div className="flex items-center gap-3 text-sm font-medium text-[#64748B]">

                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E2E8F0] border-t-[#2563EB]" />

                Loading Notifications...
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-4 text-center">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
                <Bell size={28} />
              </div>

              <h3 className="text-lg font-bold text-[#172033]">
                No Notifications Found
              </h3>

              <p className="mt-1 max-w-md text-sm leading-6 text-[#64748B]">
                {searchTerm ||
                filter !== "All"
                  ? "No notifications match your current search or filter."
                  : "New Admin or Program Manager announcements will appear here automatically."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {filteredNotifications.map(
                (notification) => {
                  const TypeIcon =
                    getTypeIcon(
                      notification
                    );

                  return (
                    <div
                      key={notification._id}
                      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                        notification.isRead
                          ? "border-[#E2E8F0] bg-white"
                          : "border-blue-200 bg-[#F8FBFF]"
                      }`}
                    >

                      {/* unread stroke */}

                      {!notification.isRead && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#2563EB] via-[#22D3EE] to-[#EF4444]" />
                      )}

                      <div className="flex flex-col gap-4 p-5 pl-6 lg:flex-row lg:items-start">

                        {/* ICON */}

                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getTypeStyle(
                            notification
                          )}`}
                        >
                          <TypeIcon size={21} />
                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">

                          <div className="mb-1.5 flex flex-wrap items-center gap-2">

                            <h3
                              className={`text-sm font-bold ${
                                notification.isRead
                                  ? "text-[#172033]"
                                  : "text-[#0E2A52]"
                              }`}
                            >
                              {notification.title ||
                                "Announcement"}
                            </h3>

                            {!notification.isRead && (
                              <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
                            )}
                          </div>

                          <p className="text-sm leading-6 text-[#64748B]">
                            {notification.message}
                          </p>

                          {/* META */}

                          <div className="mt-3 flex flex-wrap items-center gap-2">

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#2563EB]">
                              <Megaphone size={12} />

                              {notification.type ||
                                "Announcement"}
                            </span>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityStyle(
                                notification.priority
                              )}`}
                            >
                              {notification.priority ||
                                "Medium"}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#64748B]">
                              <UserRound size={12} />

                              From{" "}
                              {getSourceLabel(
                                notification
                              )}
                            </span>

                            {notification.relatedName && (
                              <span className="text-xs text-[#64748B]">
                                •{" "}
                                {
                                  notification.relatedName
                                }
                              </span>
                            )}

                            <span className="text-xs text-[#94A3B8]">
                              •{" "}
                              {formatDate(
                                notification.createdAt
                              )}
                            </span>
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="flex items-center gap-1 lg:ml-auto">

                          {!notification.isRead && (
                            <button
                              type="button"
                              title="Mark as read"
                              onClick={() =>
                                markAsRead(
                                  notification._id
                                )
                              }
                              className="rounded-lg p-2 text-[#2563EB] transition-all hover:bg-blue-50 hover:text-[#1D4ED8]"
                            >
                              <Check size={17} />
                            </button>
                          )}

                          <button
                            type="button"
                            title="Delete notification"
                            onClick={() =>
                              setDeleteTarget(
                                notification
                              )
                            }
                            className="rounded-lg p-2 text-[#DC2626] transition-all hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>

      {/* ====================================================== */}
      {/* DELETE MODAL */}
      {/* ====================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#06152B]/60 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="h-[3px] w-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626]" />

            <div className="p-6">

              <div className="mb-5 flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#DC2626]">
                  <Trash2 size={22} />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget(null)
                  }
                  className="rounded-lg p-2 text-[#64748B] transition hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <h2 className="text-xl font-bold text-[#172033]">
                Delete Notification?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#172033]">
                  {deleteTarget.title ||
                    "this notification"}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget(null)
                  }
                  className="rounded-xl border border-[#E2E8F0] px-5 py-3 text-sm font-semibold text-[#64748B] transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={deleteNotification}
                  className="rounded-xl bg-[#DC2626] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C1C]"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* TOAST */}
      {/* ====================================================== */}

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

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon: Icon,
  title,
  value,
  iconClass,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="h-[3px] w-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#EF4444]" />

      <div className="flex items-center justify-between p-5">

        <div>
          <p className="text-sm font-medium text-[#64748B]">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-[#172033]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 ${iconClass}`}
        >
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

export default ProjectManagerNotifications;