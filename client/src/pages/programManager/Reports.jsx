
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

import {
  BarChart3,
  TrendingUp,
  UsersRound,
  Layers3,
  CheckCircle2,
  Download,
  RefreshCw,
  CalendarDays,
  Bell,
  Megaphone,
  AlertTriangle,
  UserRoundCheck,
  Activity,
  Radio,
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
// REPORT TYPES
// ============================================================

const REPORT_TYPES = [
  "Overview",
  "Cohorts",
  "Mentors",
  "Announcements",
  "Notifications",
];

// ============================================================
// MAIN COMPONENT
// ============================================================

function Reports() {
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

  const [error, setError] =
    useState("");

  const [reportType, setReportType] =
    useState("Overview");

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
  // NORMALIZE API RESPONSE
  // ============================================================

  const extractArray = (
    response,
    possibleKeys = []
  ) => {
    const data = response?.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    for (const key of possibleKeys) {
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

        return extractArray(
          response,
          ["cohorts"]
        );
      } catch (error) {
        console.error(
          "Reports Cohorts Error:",
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

        return extractArray(
          response,
          ["mentors", "users"]
        );
      } catch (error) {
        console.error(
          "Reports Mentors Error:",
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

        return extractArray(
          response,
          ["announcements"]
        );
      } catch (error) {
        console.error(
          "Reports Announcements Error:",
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

        return extractArray(
          response,
          ["notifications"]
        );
      } catch (error) {
        console.error(
          "Reports Notifications Error:",
          error.response?.data ||
            error.message
        );

        return [];
      }
    }, []);

  // ============================================================
  // LOAD ALL REPORT DATA
  // ============================================================

  const loadReportData =
    useCallback(
      async (initialLoad = false) => {
        try {
          if (initialLoad) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setError("");

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

          if (
            cohortsResult.status ===
            "fulfilled"
          ) {
            setCohorts(
              cohortsResult.value
            );
          }

          if (
            mentorsResult.status ===
            "fulfilled"
          ) {
            setMentors(
              mentorsResult.value
            );
          }

          if (
            announcementsResult.status ===
            "fulfilled"
          ) {
            setAnnouncements(
              announcementsResult.value
            );
          }

          if (
            notificationsResult.status ===
            "fulfilled"
          ) {
            setNotifications(
              notificationsResult.value
            );
          }

          const failedCount =
            results.filter(
              (result) =>
                result.status ===
                "rejected"
            ).length;

          if (failedCount === 4) {
            setError(
              "Unable to load report data from the backend."
            );
          }
        } catch (error) {
          console.error(
            "Reports loading error:",
            error
          );

          setError(
            "Failed to load reports data."
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
  // INITIAL LOAD + AUTO UPDATE
  // ============================================================

  useEffect(() => {
    loadReportData(true);

    const handleDataUpdated = () => {
      loadReportData(false);
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
      loadReportData(false);
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
  }, [loadReportData]);

  // ============================================================
  // COHORT ANALYTICS
  // ============================================================

  const totalCohorts =
    cohorts.length;

  const activeCohorts =
    useMemo(() => {
      return cohorts.filter(
        (cohort) =>
          String(
            cohort?.status || ""
          ).toLowerCase() ===
          "active"
      ).length;
    }, [cohorts]);

  const inactiveCohorts =
    Math.max(
      totalCohorts -
        activeCohorts,
      0
    );

  // ============================================================
  // MENTOR ANALYTICS
  // ============================================================

  const totalMentors =
    mentors.length;

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

  const inactiveMentors =
    Math.max(
      totalMentors -
        activeMentors,
      0
    );

  // ============================================================
  // ANNOUNCEMENT ANALYTICS
  // ============================================================

  const totalAnnouncements =
    announcements.length;

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

  const draftAnnouncements =
    useMemo(() => {
      return announcements.filter(
        (item) =>
          String(
            item?.status || ""
          ).toLowerCase() ===
          "draft"
      ).length;
    }, [announcements]);

  // ============================================================
  // NOTIFICATION ANALYTICS
  // ============================================================

  const totalNotifications =
    notifications.length;

  const unreadNotifications =
    useMemo(() => {
      return notifications.filter(
        (item) =>
          item?.isRead === false
      ).length;
    }, [notifications]);

  const readNotifications =
    Math.max(
      totalNotifications -
        unreadNotifications,
      0
    );

  // ============================================================
  // COHORT STATUS PERCENTAGE
  // ============================================================

  const activeCohortPercent =
    totalCohorts === 0
      ? 0
      : Math.round(
          (activeCohorts /
            totalCohorts) *
            100
        );

  const inactiveCohortPercent =
    totalCohorts === 0
      ? 0
      : Math.round(
          (inactiveCohorts /
            totalCohorts) *
            100
        );

  // ============================================================
  // MENTOR STATUS PERCENTAGE
  // ============================================================

  const activeMentorPercent =
    totalMentors === 0
      ? 0
      : Math.round(
          (activeMentors /
            totalMentors) *
            100
        );

  const inactiveMentorPercent =
    totalMentors === 0
      ? 0
      : Math.round(
          (inactiveMentors /
            totalMentors) *
            100
        );

  // ============================================================
  // ANNOUNCEMENT PERCENTAGE
  // ============================================================

  const publishedAnnouncementPercent =
    totalAnnouncements === 0
      ? 0
      : Math.round(
          (publishedAnnouncements /
            totalAnnouncements) *
            100
        );

  const draftAnnouncementPercent =
    totalAnnouncements === 0
      ? 0
      : Math.round(
          (draftAnnouncements /
            totalAnnouncements) *
            100
        );

  // ============================================================
  // NOTIFICATION PERCENTAGE
  // ============================================================

  const unreadNotificationPercent =
    totalNotifications === 0
      ? 0
      : Math.round(
          (unreadNotifications /
            totalNotifications) *
            100
        );

  const readNotificationPercent =
    totalNotifications === 0
      ? 0
      : Math.round(
          (readNotifications /
            totalNotifications) *
            100
        );

  // ============================================================
  // COHORT CARDS
  // ============================================================

  const cohortCards =
    useMemo(() => {
      return cohorts
        .slice()
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
        .slice(0, 6);
    }, [cohorts]);

  // ============================================================
  // MENTOR CARDS
  // ============================================================

  const mentorCards =
    useMemo(() => {
      return mentors
        .slice()
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
        .slice(0, 6);
    }, [mentors]);

  // ============================================================
  // RECENT ANNOUNCEMENTS
  // ============================================================

  const recentAnnouncements =
    useMemo(() => {
      return announcements
        .slice()
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
    }, [announcements]);

  // ============================================================
  // RECENT NOTIFICATIONS
  // ============================================================

  const recentNotifications =
    useMemo(() => {
      return notifications
        .slice()
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
        .slice(0, 6);
    }, [notifications]);

  // ============================================================
  // NOTIFICATION TYPE ANALYTICS
  // ============================================================

  const notificationTypes =
    useMemo(() => {
      const typeMap = {};

      notifications.forEach(
        (notification) => {
          const type =
            notification?.type ||
            "System";

          typeMap[type] =
            (typeMap[type] || 0) +
            1;
        }
      );

      return Object.entries(
        typeMap
      )
        .sort(
          (a, b) =>
            b[1] - a[1]
        )
        .slice(0, 5);
    }, [notifications]);

  const maxNotificationTypeCount =
    notificationTypes.length > 0
      ? Math.max(
          ...notificationTypes.map(
            ([, count]) =>
              count
          )
        )
      : 0;

  // ============================================================
  // DATE FORMAT
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
  // EXPORT REPORT
  // ============================================================

  const exportReport = () => {
    const report = {
      generatedAt:
        new Date().toISOString(),

      generatedBy:
        "Program Manager",

      reportType,

      summary: {
        totalCohorts,
        activeCohorts,
        inactiveCohorts,
        totalMentors,
        activeMentors,
        inactiveMentors,
        totalAnnouncements,
        publishedAnnouncements,
        draftAnnouncements,
        totalNotifications,
        unreadNotifications,
        readNotifications,
      },

      cohorts,

      mentors,

      announcements,

      notifications,
    };

    const blob =
      new Blob(
        [
          JSON.stringify(
            report,
            null,
            2
          ),
        ],
        {
          type: "application/json",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download = `msn-academy-${reportType.toLowerCase()}-report.json`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(url);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F6FB] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-14 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-[#64748B]">
              Loading reports...
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
    <div className="min-h-screen bg-[#F3F6FB] p-4 text-[#172033] sm:p-6 lg:p-8">

      {/* ======================================================
          AMBIENT BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed right-10 top-24 -z-0 h-72 w-72 rounded-full bg-blue-500/[0.035] blur-[120px]" />

      <div className="pointer-events-none fixed bottom-10 left-72 -z-0 h-64 w-64 rounded-full bg-red-500/[0.025] blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-[1600px]">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="relative overflow-hidden rounded-2xl p-[1px] shadow-[0_10px_35px_rgba(15,23,42,0.06)]">

          <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,#2563EB,#22D3EE,#DC2626,#2563EB)] bg-[length:300%_100%] animate-[gradientMove_7s_linear_infinite]" />

          <div className="relative rounded-[15px] bg-white px-5 py-6 sm:px-6 lg:px-7">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <div className="flex items-center gap-3">

                  <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-white shadow-[0_8px_25px_rgba(37,99,235,0.08)]">

                    <div className="absolute inset-x-2 top-0 h-[2px] rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-red-500" />

                    <BarChart3
                      size={21}
                      className="text-blue-600"
                    />

                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-600">
                      Analytics Center
                    </p>

                    <h1 className="mt-1 text-3xl font-black tracking-tight text-[#172033] sm:text-4xl">
                      Reports & Analytics
                    </h1>
                  </div>

                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                  Monitor cohorts, mentors,
                  announcements and system
                  notifications using live
                  database data.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <select
                  value={reportType}
                  onChange={(event) =>
                    setReportType(
                      event.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 shadow-sm outline-none transition-all duration-300 hover:border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5"
                >
                  {REPORT_TYPES.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type} Report
                      </option>
                    )
                  )}
                </select>

                <button
                  type="button"
                  onClick={exportReport}
                  className="group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-[0_10px_30px_rgba(37,99,235,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-[0_16px_35px_rgba(37,99,235,0.24)] active:scale-95"
                >
                  <span className="absolute inset-y-0 left-[-100%] w-1/2 skew-x-[-20deg] bg-white/15 transition-all duration-700 group-hover:left-[130%]" />

                  <Download
                    size={17}
                    className="relative"
                  />

                  <span className="relative">
                    Export Report
                  </span>
                </button>

              </div>

            </div>
          </div>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">

            <div className="flex items-center gap-2">
              <AlertTriangle
                size={17}
              />

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                loadReportData(false)
              }
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-600 shadow-sm hover:bg-red-100"
            >
              Retry
            </button>

          </div>
        )}

        {/* ====================================================
            LIVE STATUS
        ==================================================== */}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">

          <div className="flex items-center gap-2">
            <Radio
              size={16}
              className="text-emerald-500"
            />

            <span className="text-xs font-semibold text-slate-500">
              Reports are connected to live backend data
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin text-blue-600"
                  : "text-slate-300"
              }
            />

            {refreshing
              ? "Updating..."
              : "Auto updates enabled"}
          </div>

        </div>

        {/* ====================================================
            KPI CARDS
        ==================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <ReportKpiCard
            title="Total Cohorts"
            value={totalCohorts}
            subtitle={`${activeCohorts} active`}
            icon={Layers3}
            iconClass="bg-blue-50 text-blue-600"
          />

          <ReportKpiCard
            title="Total Mentors"
            value={totalMentors}
            subtitle={`${activeMentors} active`}
            icon={UserRoundCheck}
            iconClass="bg-cyan-50 text-cyan-600"
          />

          <ReportKpiCard
            title="Announcements"
            value={totalAnnouncements}
            subtitle={`${publishedAnnouncements} published`}
            icon={Megaphone}
            iconClass="bg-violet-50 text-violet-600"
          />

          <ReportKpiCard
            title="Notifications"
            value={totalNotifications}
            subtitle={`${unreadNotifications} unread`}
            icon={Bell}
            iconClass="bg-red-50 text-red-600"
          />

        </section>

        {/* ====================================================
            CHARTS
        ==================================================== */}

        <section className="mt-6 grid gap-6 xl:grid-cols-2">

          {/* ==================================================
              COHORT STATUS CHART
          ================================================== */}

          <ChartPanel
            eyebrow="Cohort Analytics"
            title="Cohort Status"
            description="Current cohort distribution."
            icon={Layers3}
          >

            <div className="grid grid-cols-1 items-center gap-7 sm:grid-cols-[190px_1fr]">

              <DonutChart
                primary={activeCohortPercent}
                primaryColor="#2563EB"
                secondaryColor="#DC2626"
                centerValue={activeCohortPercent}
                centerLabel="Active"
              />

              <div className="space-y-3">

                <ChartLegend
                  label="Active Cohorts"
                  value={activeCohorts}
                  percent={
                    activeCohortPercent
                  }
                  dotClass="bg-blue-600"
                  barClass="bg-gradient-to-r from-blue-600 to-cyan-400"
                />

                <ChartLegend
                  label="Inactive / Other"
                  value={inactiveCohorts}
                  percent={
                    inactiveCohortPercent
                  }
                  dotClass="bg-red-500"
                  barClass="bg-gradient-to-r from-red-500 to-red-400"
                />

              </div>

            </div>
          </ChartPanel>

          {/* ==================================================
              MENTOR STATUS CHART
          ================================================== */}

          <ChartPanel
            eyebrow="Mentor Analytics"
            title="Mentor Availability"
            description="Current mentor status distribution."
            icon={UserRoundCheck}
          >

            <div className="space-y-5">

              <HorizontalChartBar
                label="Active Mentors"
                value={activeMentors}
                total={totalMentors}
                percent={
                  activeMentorPercent
                }
                barClass="bg-gradient-to-r from-blue-600 via-cyan-400 to-cyan-300"
              />

              <HorizontalChartBar
                label="Inactive Mentors"
                value={inactiveMentors}
                total={totalMentors}
                percent={
                  inactiveMentorPercent
                }
                barClass="bg-gradient-to-r from-red-500 to-red-400"
              />

              <div className="grid grid-cols-2 gap-3">

                <SmallMetricCard
                  label="Active"
                  value={activeMentors}
                  icon={CheckCircle2}
                  iconClass="bg-blue-50 text-blue-600"
                />

                <SmallMetricCard
                  label="Inactive"
                  value={inactiveMentors}
                  icon={AlertTriangle}
                  iconClass="bg-red-50 text-red-600"
                />

              </div>

            </div>
          </ChartPanel>

          {/* ==================================================
              ANNOUNCEMENT CHART
          ================================================== */}

          <ChartPanel
            eyebrow="Communication Analytics"
            title="Announcement Status"
            description="Published versus draft announcements."
            icon={Megaphone}
          >

            <div className="grid grid-cols-1 items-center gap-7 sm:grid-cols-[190px_1fr]">

              <DonutChart
                primary={
                  publishedAnnouncementPercent
                }
                primaryColor="#0891B2"
                secondaryColor="#F59E0B"
                centerValue={
                  publishedAnnouncementPercent
                }
                centerLabel="Published"
              />

              <div className="space-y-3">

                <ChartLegend
                  label="Published"
                  value={publishedAnnouncements}
                  percent={
                    publishedAnnouncementPercent
                  }
                  dotClass="bg-cyan-600"
                  barClass="bg-gradient-to-r from-blue-600 to-cyan-400"
                />

                <ChartLegend
                  label="Drafts"
                  value={draftAnnouncements}
                  percent={
                    draftAnnouncementPercent
                  }
                  dotClass="bg-amber-500"
                  barClass="bg-gradient-to-r from-amber-400 to-amber-500"
                />

              </div>

            </div>
          </ChartPanel>

          {/* ==================================================
              NOTIFICATION CHART
          ================================================== */}

          <ChartPanel
            eyebrow="Notification Analytics"
            title="Notification Activity"
            description="Read and unread system notifications."
            icon={Bell}
          >

            <div className="space-y-5">

              <HorizontalChartBar
                label="Unread Notifications"
                value={unreadNotifications}
                total={totalNotifications}
                percent={
                  unreadNotificationPercent
                }
                barClass="bg-gradient-to-r from-red-500 to-red-400"
              />

              <HorizontalChartBar
                label="Read Notifications"
                value={readNotifications}
                total={totalNotifications}
                percent={
                  readNotificationPercent
                }
                barClass="bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500"
              />

              <div className="grid grid-cols-2 gap-3">

                <SmallMetricCard
                  label="Unread"
                  value={
                    unreadNotifications
                  }
                  icon={Bell}
                  iconClass="bg-red-50 text-red-600"
                />

                <SmallMetricCard
                  label="Read"
                  value={
                    readNotifications
                  }
                  icon={CheckCircle2}
                  iconClass="bg-blue-50 text-blue-600"
                />

              </div>

            </div>
          </ChartPanel>

        </section>

        {/* ====================================================
            COHORT DATA
        ==================================================== */}

        <section className="mt-6 relative overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl">

          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-600 via-cyan-400 to-red-500 opacity-75" />

          <div className="border-b border-slate-100 p-5 sm:p-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
                  Live Cohort Data
                </p>

                <h2 className="mt-1 text-xl font-black text-[#172033]">
                  Cohort Overview
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Latest cohort records from MongoDB.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                <Layers3 size={19} />
              </div>

            </div>
          </div>

          <div className="p-5 sm:p-6">

            {cohortCards.length ===
            0 ? (
              <EmptyReportState
                icon={Layers3}
                title="No cohort data"
                description="Create a cohort and it will appear here automatically."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                {cohortCards.map(
                  (
                    cohort,
                    index
                  ) => (
                    <ReportDataCard
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
                              size={18}
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-[#172033]">
                              {cohort?.name ||
                                "Unnamed Cohort"}
                            </h3>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {cohort?.program ||
                                "Internship Program"}
                            </p>
                          </div>

                        </div>

                        <StatusBadge
                          status={
                            cohort?.status ||
                            "Active"
                          }
                        />

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <ReportInfo
                          label="Mentor"
                          value={
                            cohort?.mentorName ||
                            cohort?.mentor?.name ||
                            "Not assigned"
                          }
                        />

                        <ReportInfo
                          label="Start"
                          value={formatDate(
                            cohort?.startDate
                          )}
                        />

                      </div>

                    </ReportDataCard>
                  )
                )}

              </div>
            )}

          </div>
        </section>

        {/* ====================================================
            MENTOR DATA
        ==================================================== */}

        <section className="mt-6 relative overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl">

          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-red-500 opacity-75" />

          <div className="border-b border-slate-100 p-5 sm:p-6">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600">
                  Live Mentor Data
                </p>

                <h2 className="mt-1 text-xl font-black text-[#172033]">
                  Mentor Overview
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Latest mentor records from MongoDB.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-600">
                <UserRoundCheck size={19} />
              </div>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            {mentorCards.length ===
            0 ? (
              <EmptyReportState
                icon={UserRoundCheck}
                title="No mentor data"
                description="Created mentor records will appear here automatically."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                {mentorCards.map(
                  (
                    mentor,
                    index
                  ) => (
                    <ReportDataCard
                      key={
                        mentor?._id ||
                        mentor?.id ||
                        index
                      }
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                          <UserRoundCheck
                            size={19}
                          />
                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="truncate text-sm font-bold text-[#172033]">
                            {mentor?.name ||
                              mentor?.fullName ||
                              "Unnamed Mentor"}
                          </h3>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {mentor?.specialization ||
                              mentor?.expertise ||
                              "Mentor"}
                          </p>

                        </div>

                        <StatusBadge
                          status={
                            mentor?.status ||
                            "Active"
                          }
                        />

                      </div>

                    </ReportDataCard>
                  )
                )}

              </div>
            )}

          </div>

        </section>

        {/* ====================================================
            ANNOUNCEMENT + NOTIFICATION DATA
        ==================================================== */}

        <section className="mt-6 grid gap-6 xl:grid-cols-2">

          {/* ANNOUNCEMENTS */}

          <DataListPanel
            eyebrow="Communication"
            title="Recent Announcements"
            description="Latest announcement activity."
            icon={Megaphone}
          >

            {recentAnnouncements.length ===
            0 ? (
              <EmptyReportState
                icon={Megaphone}
                title="No announcements"
                description="New announcements will appear here automatically."
              />
            ) : (
              <div className="space-y-3">

                {recentAnnouncements.map(
                  (
                    announcement,
                    index
                  ) => (
                    <ReportDataCard
                      key={
                        announcement?._id ||
                        announcement?.id ||
                        index
                      }
                      padding="p-3.5"
                    >

                      <div className="flex gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Megaphone
                            size={18}
                          />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <h3 className="truncate text-sm font-bold text-[#172033]">
                              {announcement?.title ||
                                "Untitled Announcement"}
                            </h3>

                            <StatusBadge
                              status={
                                announcement?.status ||
                                "Draft"
                              }
                            />

                          </div>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {announcement?.description ||
                              "No description available."}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">

                            <span>
                              Audience:{" "}
                              <strong className="font-semibold text-slate-500">
                                {announcement?.audience ||
                                  "All"}
                              </strong>
                            </span>

                            <span>
                              {formatDate(
                                announcement?.date ||
                                  announcement?.createdAt
                              )}
                            </span>

                          </div>

                        </div>
                      </div>
                    </ReportDataCard>
                  )
                )}

              </div>
            )}

          </DataListPanel>

          {/* NOTIFICATIONS */}

          <DataListPanel
            eyebrow="System Activity"
            title="Recent Notifications"
            description="Latest notification activity."
            icon={Bell}
          >

            {recentNotifications.length ===
            0 ? (
              <EmptyReportState
                icon={Bell}
                title="No notifications"
                description="New system notifications will appear here automatically."
              />
            ) : (
              <div className="space-y-3">

                {recentNotifications.map(
                  (
                    notification,
                    index
                  ) => (
                    <ReportDataCard
                      key={
                        notification?._id ||
                        notification?.id ||
                        index
                      }
                      padding="p-3.5"
                    >

                      <div className="flex gap-3">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            String(
                              notification?.type ||
                                ""
                            )
                              .toLowerCase()
                              .includes(
                                "warning"
                              ) ||
                            String(
                              notification?.type ||
                                ""
                            )
                              .toLowerCase()
                              .includes(
                                "error"
                              )
                              ? "bg-red-50 text-red-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {String(
                            notification?.type ||
                              ""
                          )
                            .toLowerCase()
                            .includes(
                              "announcement"
                            ) ? (
                            <Megaphone
                              size={18}
                            />
                          ) : String(
                              notification?.type ||
                                ""
                            )
                              .toLowerCase()
                              .includes(
                                "cohort"
                              ) ? (
                            <Layers3
                              size={18}
                            />
                          ) : (
                            <Bell
                              size={18}
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <h3 className="truncate text-sm font-bold text-[#172033]">
                              {notification?.title ||
                                "Notification"}
                            </h3>

                            {!notification?.isRead && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                            )}

                          </div>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {notification?.message ||
                              "No message available."}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">

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
                                <strong className="font-semibold text-slate-500">
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

                    </ReportDataCard>
                  )
                )}

              </div>
            )}

          </DataListPanel>

        </section>

        {/* ====================================================
            NOTIFICATION TYPE GRAPH
        ==================================================== */}

        <section className="relative mt-6 overflow-hidden rounded-2xl border border-white/80 bg-white/80 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">

          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-red-500 via-cyan-400 to-blue-600 opacity-75" />

          <div className="flex items-start justify-between">

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-600">
                Activity Breakdown
              </p>

              <h2 className="mt-1 text-xl font-black text-[#172033]">
                Notification Types
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Distribution of notifications by type.
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600">
              <Activity size={19} />
            </div>

          </div>

          {notificationTypes.length ===
          0 ? (
            <div className="mt-6">
              <EmptyReportState
                icon={Activity}
                title="No notification analytics"
                description="Notification type data will appear here when records are available."
              />
            </div>
          ) : (
            <div className="mt-8 space-y-5">

              {notificationTypes.map(
                ([type, count], index) => {
                  const percent =
                    maxNotificationTypeCount ===
                    0
                      ? 0
                      : Math.round(
                          (count /
                            maxNotificationTypeCount) *
                            100
                        );

                  const barClasses =
                    [
                      "bg-gradient-to-r from-blue-600 to-cyan-400",
                      "bg-gradient-to-r from-cyan-500 to-blue-500",
                      "bg-gradient-to-r from-red-500 to-red-400",
                      "bg-gradient-to-r from-violet-500 to-blue-500",
                      "bg-gradient-to-r from-amber-400 to-red-400",
                    ];

                  return (
                    <div
                      key={type}
                      className="group"
                    >

                      <div className="mb-2 flex items-center justify-between gap-4">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                            <span className="text-[10px] font-black">
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>
                          </div>

                          <span className="truncate text-sm font-bold text-slate-600">
                            {type}
                          </span>

                        </div>

                        <span className="text-sm font-black text-[#172033]">
                          {count}
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className={`h-full rounded-full ${
                            barClasses[
                              index %
                                barClasses.length
                            ]
                          } transition-all duration-1000 ease-out`}
                          style={{
                            width: `${percent}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <section className="relative mt-6 overflow-hidden rounded-2xl border border-white/80 bg-white/80 p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">

          <div className="absolute right-0 top-0 h-px w-1/2 bg-gradient-to-l from-red-500 via-cyan-400 to-transparent opacity-75" />

          <div className="absolute bottom-0 left-0 h-px w-1/2 bg-gradient-to-r from-blue-600 via-cyan-400 to-transparent opacity-75" />

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600">
                MSN Academy
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#172033]">
                Program data at a glance
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                These reports use live cohort, mentor,
                announcement and notification records
                from the backend.
              </p>
            </div>

            <button
              type="button"
              onClick={exportReport}
              className="group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-[0_10px_30px_rgba(37,99,235,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700"
            >

              <Download
                size={17}
              />

              Export Data

            </button>

          </div>
        </section>

      </div>
    </div>
  );
}

// ============================================================
// KPI CARD
// ============================================================

function ReportKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]">

      <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,#2563EB,#22D3EE,#DC2626,#2563EB)] bg-[length:300%_100%] opacity-65 transition-all duration-500 group-hover:animate-[gradientMove_3s_linear_infinite] group-hover:opacity-100" />

      <div className="relative rounded-[15px] bg-white p-5">

        <div className="flex items-start justify-between gap-4">

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {title}
            </p>

            <p className="mt-3 text-3xl font-black tracking-tight text-[#172033]">
              {value}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              {subtitle}
            </p>
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}
          >
            <Icon size={21} />
          </div>

        </div>

        <div className="mt-5 h-[2px] overflow-hidden rounded-full bg-slate-100">

          <div className="h-full w-2/3 bg-gradient-to-r from-blue-600 via-cyan-400 to-red-500 transition-all duration-500 group-hover:w-full" />

        </div>

      </div>
    </div>
  );
}

// ============================================================
// CHART PANEL
// ============================================================

function ChartPanel({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/80 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">

      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-600 via-cyan-400 to-red-500 opacity-70" />

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-xl font-black text-[#172033]">
            {title}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
          <Icon size={19} />
        </div>

      </div>

      <div className="mt-7">
        {children}
      </div>

    </div>
  );
}

// ============================================================
// DONUT CHART
// ============================================================

function DonutChart({
  primary,
  primaryColor,
  secondaryColor,
  centerValue,
  centerLabel,
}) {
  const safePrimary =
    Math.min(
      Math.max(
        Number(primary) || 0,
        0
      ),
      100
    );

  return (
    <div
      className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(
          ${primaryColor} 0 ${safePrimary}%,
          ${secondaryColor} ${safePrimary}% 100%
        )`,
      }}
    >

      <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">

        <span className="text-3xl font-black text-[#172033]">
          {centerValue}%
        </span>

        <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {centerLabel}
        </span>

      </div>

    </div>
  );
}

// ============================================================
// CHART LEGEND
// ============================================================

function ChartLegend({
  label,
  value,
  percent,
  dotClass,
  barClass,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-all duration-300 hover:border-blue-100 hover:bg-white hover:shadow-sm">

      <div className="flex items-center justify-between gap-4">

        <div className="flex min-w-0 items-center gap-2">

          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`}
          />

          <span className="truncate text-sm font-bold text-slate-600">
            {label}
          </span>

        </div>

        <div className="shrink-0 text-right">

          <span className="text-sm font-black text-[#172033]">
            {value}
          </span>

          <span className="ml-2 text-[11px] font-semibold text-slate-400">
            {percent}%
          </span>

        </div>

      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">

        <div
          className={`h-full rounded-full ${barClass} transition-all duration-1000`}
          style={{
            width: `${percent}%`,
          }}
        />

      </div>

    </div>
  );
}

// ============================================================
// HORIZONTAL BAR
// ============================================================

function HorizontalChartBar({
  label,
  value,
  total,
  percent,
  barClass,
}) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm font-bold text-slate-600">
          {label}
        </span>

        <span className="text-xs font-bold text-slate-400">
          {value} / {total}
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full ${barClass} transition-all duration-1000 ease-out`}
          style={{
            width: `${percent}%`,
          }}
        />

      </div>

      <div className="mt-1 text-right text-[10px] font-bold text-slate-400">
        {percent}%
      </div>

    </div>
  );
}

// ============================================================
// SMALL METRIC
// ============================================================

function SmallMetricCard({
  label,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition-all duration-300 hover:bg-white hover:shadow-sm">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon size={16} />
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 text-lg font-black text-[#172033]">
            {value}
          </p>
        </div>

      </div>
    </div>
  );
}

// ============================================================
// REPORT DATA CARD
// ============================================================

function ReportDataCard({
  children,
  padding = "p-4",
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]">

      <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,#2563EB,#22D3EE,#DC2626,#2563EB)] bg-[length:300%_100%] opacity-45 transition-all duration-500 group-hover:animate-[gradientMove_3s_linear_infinite] group-hover:opacity-100" />

      <div
        className={`relative rounded-[15px] bg-white ${padding}`}
      >
        {children}
      </div>

    </div>
  );
}

// ============================================================
// DATA LIST PANEL
// ============================================================

function DataListPanel({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/80 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">

      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-600 via-cyan-400 to-red-500 opacity-70" />

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-xl font-black text-[#172033]">
            {title}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
          <Icon size={19} />
        </div>

      </div>

      <div className="mt-6">
        {children}
      </div>

    </div>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({
  status,
}) {
  const normalized =
    String(
      status || ""
    ).toLowerCase();

  const isActive =
    normalized === "active";

  const isPublished =
    normalized ===
    "published";

  const isDraft =
    normalized ===
    "draft";

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        isActive
          ? "border-blue-100 bg-blue-50 text-blue-600"
          : isPublished
          ? "border-emerald-100 bg-emerald-50 text-emerald-600"
          : isDraft
          ? "border-amber-100 bg-amber-50 text-amber-600"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
}

// ============================================================
// REPORT INFO
// ============================================================

function ReportInfo({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">

      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-bold text-slate-600">
        {value}
      </p>

    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyReportState({
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

export default Reports;

