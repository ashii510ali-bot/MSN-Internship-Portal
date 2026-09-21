
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  Layers3,
  Megaphone,
  Settings,
  UserRoundCheck,
  UsersRound,
  Zap,
} from "lucide-react";

// ============================================================
// API URLS
// ============================================================

const COHORTS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/cohorts";

const MENTORS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/auth/mentors";

const ANNOUNCEMENTS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/announcements";

const NOTIFICATIONS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/notifications";

// ============================================================
// MAIN COMPONENT
// ============================================================

function ProgramManagerDashboard() {
  // ============================================================
  // STATES
  // ============================================================

  const [cohorts, setCohorts] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [announcements, setAnnouncements] =
    useState([]);
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [pageError, setPageError] =
    useState("");

  // ============================================================
  // AUTH CONFIG
  // ============================================================

  const getAuthConfig = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    if (!token) {
      return {};
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ============================================================
  // RESPONSE NORMALIZER
  // ============================================================

  const getArrayFromResponse = (
    response,
    keys = []
  ) => {
    const data = response?.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    for (const key of keys) {
      if (Array.isArray(data?.[key])) {
        return data[key];
      }
    }

    return [];
  };

  // ============================================================
  // FETCH COHORTS
  // ============================================================

  const fetchCohorts =
    useCallback(async () => {
      try {
        const response =
          await axios.get(
            COHORTS_API_URL
          );

        console.log(
          "Dashboard Cohorts:",
          response.data
        );

        return getArrayFromResponse(
          response,
          ["cohorts"]
        );
      } catch (error) {
        console.error(
          "Dashboard Cohorts Error:",
          error.response?.data ||
            error.message
        );

        return [];
      }
    }, []);

  // ============================================================
  // FETCH MENTORS
  // ============================================================

  const fetchMentors =
    useCallback(async () => {
      try {
        const response =
          await axios.get(
            MENTORS_API_URL,
            getAuthConfig()
          );

        console.log(
          "Dashboard Mentors:",
          response.data
        );

        return getArrayFromResponse(
          response,
          ["mentors", "users"]
        );
      } catch (error) {
        console.error(
          "Dashboard Mentors Error:",
          error.response?.data ||
            error.message
        );

        return [];
      }
    }, []);

  // ============================================================
  // FETCH ANNOUNCEMENTS
  // ============================================================

  const fetchAnnouncements =
    useCallback(async () => {
      try {
        const response =
          await axios.get(
            ANNOUNCEMENTS_API_URL
          );

        console.log(
          "Dashboard Announcements:",
          response.data
        );

        return getArrayFromResponse(
          response,
          ["announcements"]
        );
      } catch (error) {
        console.error(
          "Dashboard Announcements Error:",
          error.response?.data ||
            error.message
        );

        return [];
      }
    }, []);

  // ============================================================
  // FETCH NOTIFICATIONS
  // ============================================================

  const fetchNotifications =
    useCallback(async () => {
      try {
        const response =
          await axios.get(
            NOTIFICATIONS_API_URL,
            getAuthConfig()
          );

        console.log(
          "Dashboard Notifications:",
          response.data
        );

        return getArrayFromResponse(
          response,
          ["notifications"]
        );
      } catch (error) {
        console.error(
          "Dashboard Notifications Error:",
          error.response?.data ||
            error.message
        );

        return [];
      }
    }, []);

  // ============================================================
  // LOAD ALL DASHBOARD DATA
  // ============================================================

  const loadDashboardData =
    useCallback(
      async (initialLoad = false) => {
        try {
          if (initialLoad) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setPageError("");

          const results =
            await Promise.allSettled([
              fetchCohorts(),
              fetchMentors(),
              fetchAnnouncements(),
              fetchNotifications(),
            ]);

          const [
            cohortsResult,
            mentorsResult,
            announcementsResult,
            notificationsResult,
          ] = results;

          setCohorts(
            cohortsResult.status ===
              "fulfilled"
              ? cohortsResult.value
              : []
          );

          setMentors(
            mentorsResult.status ===
              "fulfilled"
              ? mentorsResult.value
              : []
          );

          setAnnouncements(
            announcementsResult.status ===
              "fulfilled"
              ? announcementsResult.value
              : []
          );

          setNotifications(
            notificationsResult.status ===
              "fulfilled"
              ? notificationsResult.value
              : []
          );

          const failedCount =
            results.filter(
              (result) =>
                result.status ===
                "rejected"
            ).length;

          if (failedCount === 4) {
            setPageError(
              "Unable to load dashboard data from the backend."
            );
          }
        } catch (error) {
          console.error(
            "Dashboard loading error:",
            error
          );

          setPageError(
            "Failed to load dashboard data."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        fetchCohorts,
        fetchMentors,
        fetchAnnouncements,
        fetchNotifications,
      ]
    );

  // ============================================================
  // INITIAL LOAD + AUTOMATIC UPDATE
  // ============================================================

  useEffect(() => {
    loadDashboardData(true);

    const handleDataUpdated = () => {
      loadDashboardData(false);
    };

    window.addEventListener(
      "msnAcademyDataUpdated",
      handleDataUpdated
    );

    window.addEventListener(
      "storage",
      handleDataUpdated
    );

    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 10000);

    return () => {
      window.removeEventListener(
        "msnAcademyDataUpdated",
        handleDataUpdated
      );

      window.removeEventListener(
        "storage",
        handleDataUpdated
      );

      clearInterval(interval);
    };
  }, [loadDashboardData]);

  // ============================================================
  // COHORT STATUS
  // ============================================================

  const getCohortStatus = (
    cohort
  ) => {
    return (
      cohort?.status ||
      "Active"
    );
  };

  // ============================================================
  // TOTAL COHORTS
  // ============================================================

  const totalCohorts =
    cohorts.length;

  // ============================================================
  // ACTIVE COHORTS
  // ============================================================

  const activeCohorts =
    useMemo(() => {
      return cohorts.filter(
        (item) =>
          String(
            item?.status || ""
          ).toLowerCase() ===
          "active"
      ).length;
    }, [cohorts]);

  // ============================================================
  // TOTAL MENTORS
  // ============================================================

  const totalMentors =
    mentors.length;

  // ============================================================
  // ACTIVE MENTORS
  // ============================================================

  const activeMentors =
    useMemo(() => {
      return mentors.filter(
        (mentor) =>
          String(
            mentor?.status || ""
          ).toLowerCase() ===
          "active"
      ).length;
    }, [mentors]);

  // ============================================================
  // TOTAL ANNOUNCEMENTS
  // ============================================================

  const totalAnnouncements =
    announcements.length;

  // ============================================================
  // PUBLISHED ANNOUNCEMENTS
  // ============================================================

  const publishedAnnouncements =
    useMemo(() => {
      return announcements.filter(
        (item) =>
          String(
            item?.status || ""
          ).toLowerCase() ===
          "published"
      ).length;
    }, [announcements]);

  // ============================================================
  // TOTAL NOTIFICATIONS
  // ============================================================

  const totalNotifications =
    notifications.length;

  // ============================================================
  // UNREAD NOTIFICATIONS
  // ============================================================

  const unreadNotifications =
    useMemo(() => {
      return notifications.filter(
        (item) =>
          item?.isRead === false
      ).length;
    }, [notifications]);

  // ============================================================
  // RECENT COHORTS
  // ============================================================

  const recentCohorts =
    useMemo(() => {
      return [...cohorts]
        .sort((a, b) => {
          const dateA =
            new Date(
              a?.createdAt ||
                a?.startDate ||
                0
            ).getTime();

          const dateB =
            new Date(
              b?.createdAt ||
                b?.startDate ||
                0
            ).getTime();

          return dateB - dateA;
        })
        .slice(0, 4);
    }, [cohorts]);

  // ============================================================
  // RECENT ANNOUNCEMENTS
  // ============================================================

  const recentAnnouncements =
    useMemo(() => {
      return [...announcements]
        .sort((a, b) => {
          const dateA =
            new Date(
              a?.createdAt ||
                a?.date ||
                0
            ).getTime();

          const dateB =
            new Date(
              b?.createdAt ||
                b?.date ||
                0
            ).getTime();

          return dateB - dateA;
        })
        .slice(0, 4);
    }, [announcements]);

  // ============================================================
  // RECENT NOTIFICATIONS
  // ============================================================

  const recentNotifications =
    useMemo(() => {
      return [...notifications]
        .sort((a, b) => {
          const dateA =
            new Date(
              a?.createdAt ||
                a?.date ||
                0
            ).getTime();

          const dateB =
            new Date(
              b?.createdAt ||
                b?.date ||
                0
            ).getTime();

          return dateB - dateA;
        })
        .slice(0, 5);
    }, [notifications]);

  // ============================================================
  // RECENT MENTORS
  // ============================================================

  const recentMentors =
    useMemo(() => {
      return [...mentors]
        .sort((a, b) => {
          const dateA =
            new Date(
              a?.createdAt || 0
            ).getTime();

          const dateB =
            new Date(
              b?.createdAt || 0
            ).getTime();

          return dateB - dateA;
        })
        .slice(0, 4);
    }, [mentors]);

  // ============================================================
  // NOTIFICATION ICON
  // ============================================================

  const getNotificationIcon =
    (type) => {
      const normalized =
        String(
          type || ""
        ).toLowerCase();

      if (
        normalized.includes(
          "cohort"
        )
      ) {
        return Layers3;
      }

      if (
        normalized.includes(
          "announcement"
        )
      ) {
        return Megaphone;
      }

      if (
        normalized.includes(
          "attendance"
        )
      ) {
        return CalendarDays;
      }

      if (
        normalized.includes(
          "evaluation"
        )
      ) {
        return CheckCircle2;
      }

      if (
        normalized.includes(
          "registration"
        ) ||
        normalized.includes(
          "user"
        )
      ) {
        return UsersRound;
      }

      if (
        normalized.includes(
          "warning"
        ) ||
        normalized.includes(
          "error"
        )
      ) {
        return AlertTriangle;
      }

      return Bell;
    };

  // ============================================================
  // NOTIFICATION STYLE
  // ============================================================

  const getNotificationStyle =
    (type) => {
      const normalized =
        String(
          type || ""
        ).toLowerCase();

      if (
        normalized.includes(
          "warning"
        ) ||
        normalized.includes(
          "error"
        ) ||
        normalized.includes(
          "attendance"
        )
      ) {
        return "bg-red-50 text-red-600";
      }

      if (
        normalized.includes(
          "cohort"
        ) ||
        normalized.includes(
          "announcement"
        )
      ) {
        return "bg-blue-50 text-blue-600";
      }

      if (
        normalized.includes(
          "evaluation"
        )
      ) {
        return "bg-violet-50 text-violet-600";
      }

      return "bg-slate-100 text-slate-600";
    };

  // ============================================================
  // DATE
  // ============================================================

  const formatDate = (value) => {
    if (!value) {
      return "Recently";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Recently";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F6FB] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading program dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F3F6FB]">
      <style>
        {`
          @keyframes gradientMove {
            0% {
              background-position: 0% 50%;
            }

            50% {
              background-position: 100% 50%;
            }

            100% {
              background-position: 0% 50%;
            }
          }
        `}
      </style>

      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="relative overflow-hidden rounded-2xl p-[1px] shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,#2563EB,#22D3EE,#DC2626,#2563EB)] bg-[length:300%_100%] animate-[gradientMove_7s_linear_infinite]" />

          <div className="relative rounded-[15px] bg-white px-5 py-6 sm:px-6 lg:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                    <BarChart3 size={20} />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                    Program Manager
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[#172033] sm:text-3xl">
                  Program Performance
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#64748B]">
                  Manage and monitor cohorts,
                  mentors, announcements and
                  program notifications in one
                  place.
                </p>
              </div>

              <div className="flex items-center gap-3">

                {refreshing && (
                  <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                    Updating
                  </div>
                )}

                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Database
                    </p>

                    <p className="text-sm font-bold text-slate-700">
                      Live
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {pageError && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            <div className="flex items-center gap-2">
              <AlertTriangle
                size={17}
                className="shrink-0"
              />

              <span>{pageError}</span>
            </div>

            <button
              type="button"
              onClick={() =>
                loadDashboardData(false)
              }
              className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-600 shadow-sm hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* ======================================================
            TOP DATA CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <DashboardStatCard
            icon={Layers3}
            title="Active Cohorts"
            value={activeCohorts}
            description={`${totalCohorts} total cohorts`}
            iconClass="bg-blue-50 text-blue-600"
          />

          <DashboardStatCard
            icon={UserRoundCheck}
            title="Active Mentors"
            value={activeMentors}
            description={`${totalMentors} total mentors`}
            iconClass="bg-cyan-50 text-cyan-600"
          />

          <DashboardStatCard
            icon={Megaphone}
            title="Announcements"
            value={totalAnnouncements}
            description={`${publishedAnnouncements} published`}
            iconClass="bg-violet-50 text-violet-600"
          />

          <DashboardStatCard
            icon={Bell}
            title="Notifications"
            value={totalNotifications}
            description={`${unreadNotifications} unread`}
            iconClass="bg-red-50 text-red-600"
          />

        </div>

        {/* ======================================================
            COHORTS + PROGRAM OVERVIEW
        ====================================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(350px,0.8fr)]">

          {/* ====================================================
              COHORT CARDS
          ==================================================== */}

          <DashboardPanel
            title="Cohort Overview"
            description="Live cohort records from MongoDB."
            icon={Layers3}
            actionText="Manage Cohorts"
            actionPath="/program-manager/cohorts"
          >

            {recentCohorts.length ===
            0 ? (
              <EmptyState
                icon={Layers3}
                title="No cohorts found"
                description="Create a cohort and its data will appear here automatically."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {recentCohorts.map(
                  (
                    cohort,
                    index
                  ) => {
                    const status =
                      getCohortStatus(
                        cohort
                      );

                    const isActive =
                      String(
                        status
                      ).toLowerCase() ===
                      "active";

                    return (
                      <GradientCard
                        key={
                          cohort?._id ||
                          cohort?.id ||
                          index
                        }
                      >
                        <div className="flex items-start justify-between gap-3">

                          <div className="flex min-w-0 items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <Layers3
                                size={19}
                              />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-bold text-[#172033]">
                                {cohort?.name ||
                                  "Unnamed Cohort"}
                              </h3>

                              <p className="mt-1 truncate text-xs text-[#64748B]">
                                {cohort?.program ||
                                  "Internship Program"}
                              </p>
                            </div>

                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                              isActive
                                ? "border-cyan-100 bg-cyan-50 text-cyan-600"
                                : "border-slate-200 bg-slate-50 text-slate-500"
                            }`}
                          >
                            {status}
                          </span>

                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">

                          <MiniInfoCard
                            label="Mentor"
                            value={
                              cohort?.mentorName ||
                              cohort?.mentor?.name ||
                              "Not assigned"
                            }
                            icon={
                              UserRoundCheck
                            }
                          />

                          <MiniInfoCard
                            label="Start Date"
                            value={formatDate(
                              cohort?.startDate
                            )}
                            icon={
                              CalendarDays
                            }
                          />

                        </div>

                        {cohort?.description && (
                          <p className="mt-4 line-clamp-2 text-xs leading-5 text-[#64748B]">
                            {
                              cohort.description
                            }
                          </p>
                        )}
                      </GradientCard>
                    );
                  }
                )}

              </div>
            )}

          </DashboardPanel>

          {/* ====================================================
              PROGRAM OVERVIEW
          ==================================================== */}

          <DashboardPanel
            title="Program Overview"
            description="Live summary from the database."
            icon={Zap}
          >

            <div className="space-y-3">

              <OverviewRow
                icon={Layers3}
                label="Total Cohorts"
                value={totalCohorts}
                iconClass="bg-blue-50 text-blue-600"
              />

              <OverviewRow
                icon={Layers3}
                label="Active Cohorts"
                value={activeCohorts}
                iconClass="bg-cyan-50 text-cyan-600"
              />

              <OverviewRow
                icon={UserRoundCheck}
                label="Total Mentors"
                value={totalMentors}
                iconClass="bg-indigo-50 text-indigo-600"
              />

              <OverviewRow
                icon={Megaphone}
                label="Announcements"
                value={totalAnnouncements}
                iconClass="bg-blue-50 text-blue-600"
              />

              <OverviewRow
                icon={Bell}
                label="Unread Notifications"
                value={unreadNotifications}
                iconClass="bg-red-50 text-red-600"
              />

            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-[#F8FAFC]">

              <div className="h-1 bg-[linear-gradient(90deg,#2563EB,#22D3EE,#DC2626)]" />

              <div className="p-4">
                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
                    <Activity size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#172033]">
                      Program Snapshot
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#64748B]">
                      Your program currently
                      has{" "}
                      <span className="font-bold text-blue-600">
                        {activeCohorts}
                      </span>{" "}
                      active cohorts and{" "}
                      <span className="font-bold text-cyan-600">
                        {activeMentors}
                      </span>{" "}
                      active mentors.
                    </p>
                  </div>

                </div>
              </div>

            </div>

          </DashboardPanel>

        </div>

        {/* ======================================================
            ANNOUNCEMENTS + MENTORS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">

          {/* ====================================================
              ANNOUNCEMENTS
          ==================================================== */}

          <DashboardPanel
            title="Recent Announcements"
            description="Latest communication records from the database."
            icon={Megaphone}
            actionText="View All"
            actionPath="/program-manager/announcements"
          >

            {recentAnnouncements.length ===
            0 ? (
              <EmptyState
                icon={Megaphone}
                title="No announcements found"
                description="Created announcements will appear here automatically."
              />
            ) : (
              <div className="space-y-3">

                {recentAnnouncements.map(
                  (
                    announcement,
                    index
                  ) => (
                    <GradientCard
                      key={
                        announcement?._id ||
                        announcement?.id ||
                        index
                      }
                      padding="p-4"
                    >

                      <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Megaphone
                            size={18}
                          />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-bold text-[#172033]">
                                {announcement?.title ||
                                  "Untitled Announcement"}
                              </h3>

                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#64748B]">
                                {announcement?.description ||
                                  "No description available."}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                                String(
                                  announcement?.status ||
                                    ""
                                ).toLowerCase() ===
                                "published"
                                  ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                                  : "border-amber-100 bg-amber-50 text-amber-600"
                              }`}
                            >
                              {announcement?.status ||
                                "Draft"}
                            </span>

                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#64748B]">

                            <span className="flex items-center gap-1.5">
                              <UsersRound
                                size={13}
                              />
                              {announcement?.audience ||
                                "All"}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <CalendarDays
                                size={13}
                              />
                              {formatDate(
                                announcement?.date ||
                                  announcement?.createdAt
                              )}
                            </span>

                            <span>
                              Priority:{" "}
                              <strong className="font-semibold text-slate-600">
                                {announcement?.priority ||
                                  "Medium"}
                              </strong>
                            </span>

                          </div>

                        </div>
                      </div>
                    </GradientCard>
                  )
                )}

              </div>
            )}

          </DashboardPanel>

          {/* ====================================================
              MENTORS
          ==================================================== */}

          <DashboardPanel
            title="Mentor Overview"
            description="Current mentor records from the database."
            icon={UserRoundCheck}
            actionText="View All"
            actionPath="/program-manager/mentors"
          >

            {recentMentors.length ===
            0 ? (
              <EmptyState
                icon={UserRoundCheck}
                title="No mentors found"
                description="Created mentor records will appear here automatically."
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">

                {recentMentors.map(
                  (
                    mentor,
                    index
                  ) => (
                    <GradientCard
                      key={
                        mentor?._id ||
                        mentor?.id ||
                        index
                      }
                      padding="p-3.5"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                          <UserRoundCheck
                            size={18}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[#172033]">
                            {mentor?.name ||
                              mentor?.fullName ||
                              "Unnamed Mentor"}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-[#64748B]">
                            {mentor?.specialization ||
                              mentor?.expertise ||
                              "Mentor"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                            String(
                              mentor?.status ||
                                ""
                            ).toLowerCase() ===
                            "active"
                              ? "border-cyan-100 bg-cyan-50 text-cyan-600"
                              : "border-slate-200 bg-slate-50 text-slate-500"
                          }`}
                        >
                          {mentor?.status ||
                            "Active"}
                        </span>

                      </div>

                    </GradientCard>
                  )
                )}

              </div>
            )}

          </DashboardPanel>

        </div>

        {/* ======================================================
            NOTIFICATIONS + QUICK ACTIONS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(350px,0.8fr)]">

          {/* ====================================================
              NOTIFICATIONS
          ==================================================== */}

          <DashboardPanel
            title="Recent Notifications"
            description="Latest activity coming from the academy system."
            icon={Bell}
            actionText="View All"
            actionPath="/program-manager/notifications"
          >

            {recentNotifications.length ===
            0 ? (
              <EmptyState
                icon={Bell}
                title="No notifications found"
                description="New system activity will appear here automatically."
              />
            ) : (
              <div className="space-y-3">

                {recentNotifications.map(
                  (
                    notification,
                    index
                  ) => {
                    const Icon =
                      getNotificationIcon(
                        notification?.type
                      );

                    const iconClass =
                      getNotificationStyle(
                        notification?.type
                      );

                    return (
                      <GradientCard
                        key={
                          notification?._id ||
                          notification?.id ||
                          index
                        }
                        padding="p-3.5"
                      >

                        <div className="flex gap-3">

                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                          >
                            <Icon size={18} />
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <h3 className="truncate text-sm font-bold text-[#172033]">
                                {notification?.title ||
                                  "Notification"}
                              </h3>

                              {!notification?.isRead && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#DC2626] shadow-[0_0_0_4px_rgba(220,38,38,0.08)]" />
                              )}

                            </div>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#64748B]">
                              {notification?.message ||
                                "No message available."}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#64748B]">

                              {notification?.type && (
                                <span className="font-semibold text-blue-600">
                                  {
                                    notification.type
                                  }
                                </span>
                              )}

                              {notification?.createdBy && (
                                <span>
                                  From:{" "}
                                  <strong className="font-semibold text-slate-600">
                                    {
                                      notification.createdBy
                                    }
                                  </strong>
                                </span>
                              )}

                              <span>
                                {formatDate(
                                  notification?.createdAt ||
                                    notification?.date
                                )}
                              </span>

                            </div>

                          </div>
                        </div>

                      </GradientCard>
                    );
                  }
                )}

              </div>
            )}

          </DashboardPanel>

          {/* ====================================================
              QUICK ACTIONS
          ==================================================== */}

          <DashboardPanel
            title="Quick Actions"
            description="Quick access to program management modules."
            icon={Zap}
          >

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">

              <QuickAction
                icon={Layers3}
                title="Manage Cohorts"
                description="Create and manage academy cohorts"
                path="/program-manager/cohorts"
              />

              <QuickAction
                icon={UserRoundCheck}
                title="Manage Mentors"
                description="Review and manage mentors"
                path="/program-manager/mentors"
              />

              <QuickAction
                icon={Megaphone}
                title="Announcements"
                description="Create and manage announcements"
                path="/program-manager/announcements"
              />

              <QuickAction
                icon={Bell}
                title="Notifications"
                description="Review system notifications"
                path="/program-manager/notifications"
              />

              <QuickAction
                icon={BarChart3}
                title="Reports"
                description="View program reports"
                path="/program-manager/reports"
              />

              <QuickAction
                icon={Settings}
                title="Settings"
                description="Manage program settings"
                path="/program-manager/settings"
              />

            </div>

          </DashboardPanel>

        </div>

      </div>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function DashboardStatCard({
  icon: Icon,
  title,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)]">

      {/* ANIMATED OUTER STROKE ONLY */}
      <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,#2563EB,#22D3EE,#DC2626,#2563EB)] bg-[length:300%_100%] opacity-70 transition-all duration-500 group-hover:animate-[gradientMove_3s_linear_infinite] group-hover:opacity-100" />

      <div className="relative rounded-[15px] bg-white p-5">

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">
            <p className="text-sm font-medium text-[#64748B]">
              {title}
            </p>

            <h3 className="mt-2 text-3xl font-bold tracking-tight text-[#172033]">
              {value}
            </h3>

            <p className="mt-1 text-xs font-medium text-slate-400">
              {description}
            </p>
          </div>

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
          >
            <Icon size={22} />
          </div>

        </div>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD PANEL
// ============================================================

function DashboardPanel({
  title,
  description,
  icon: Icon,
  actionText,
  actionPath,
  children,
}) {
  const handleAction = () => {
    if (actionPath) {
      window.location.href =
        actionPath;
    }
  };

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex min-w-0 items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={19} />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#172033]">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-[#64748B]">
              {description}
            </p>
          </div>

        </div>

        {actionText && (
          <button
            type="button"
            onClick={handleAction}
            className="group/link flex shrink-0 items-center gap-1.5 self-start rounded-lg px-2 py-1 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
          >
            {actionText}

            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover/link:translate-x-0.5"
            />
          </button>
        )}

      </div>

      <div className="mt-5">
        {children}
      </div>

    </div>
  );
}

// ============================================================
// GRADIENT CARD
// ============================================================

function GradientCard({
  children,
  padding = "p-4",
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]">

      {/* BLUE → CYAN → RED OUTER STROKE */}
      <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,#2563EB,#22D3EE,#DC2626,#2563EB)] bg-[length:300%_100%] opacity-55 transition-all duration-500 group-hover:animate-[gradientMove_3s_linear_infinite] group-hover:opacity-100" />

      <div
        className={`relative rounded-[15px] bg-white ${padding}`}
      >
        {children}
      </div>

    </div>
  );
}

// ============================================================
// MINI INFO CARD
// ============================================================

function MiniInfoCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">

      <div className="flex items-center gap-2">

        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
          <Icon size={14} />
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 truncate text-xs font-bold text-slate-600">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

// ============================================================
// OVERVIEW ROW
// ============================================================

function OverviewRow({
  icon: Icon,
  label,
  value,
  iconClass,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 transition-all duration-200 hover:bg-white hover:shadow-sm">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={18} />
        </div>

        <span className="text-sm font-semibold text-slate-600">
          {label}
        </span>

      </div>

      <span className="text-lg font-bold text-[#172033]">
        {value}
      </span>

    </div>
  );
}

// ============================================================
// QUICK ACTION
// ============================================================

function QuickAction({
  icon: Icon,
  title,
  description,
  path,
}) {
  const handleClick = () => {
    window.location.href =
      path;
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]">

      <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,#2563EB,#22D3EE,#DC2626,#2563EB)] bg-[length:300%_100%] opacity-40 transition-all duration-500 group-hover:animate-[gradientMove_3s_linear_infinite] group-hover:opacity-90" />

      <button
        type="button"
        onClick={handleClick}
        className="relative flex w-full items-center gap-3 rounded-[15px] bg-white p-3.5 text-left"
      >

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-blue-600 transition-colors group-hover:bg-blue-50">
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#172033]">
            {title}
          </p>

          <p className="mt-0.5 text-xs text-[#64748B]">
            {description}
          </p>
        </div>

        <ArrowRight
          size={16}
          className="shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-blue-600"
        />

      </button>
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-5 py-10 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
        <Icon size={21} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-700">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {description}
      </p>

    </div>
  );
}

export default ProgramManagerDashboard;

