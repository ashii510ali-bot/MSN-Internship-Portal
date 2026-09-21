import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import {
  Users,
  FolderKanban,
  ListTodo,
  ClipboardCheck,
  Bell,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  RefreshCw,
  Megaphone,
  Target,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TEAM_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/project-manager/team";

const PROJECTS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/project-manager/projects-tasks";

const SCRUM_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/project-manager/scrum-review";

const NOTIFICATIONS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/project-manager/notifications";

function ProjectManagerDashboard() {
  const navigate = useNavigate();

  const [team, setTeam] = useState([]);
  const [projects, setProjects] = useState([]);
  const [scrumReviews, setScrumReviews] =
    useState([]);
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchDashboardData = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const [
        teamResponse,
        projectsResponse,
        scrumResponse,
        notificationsResponse,
      ] = await Promise.all([
        axios.get(TEAM_API_URL),
        axios.get(PROJECTS_API_URL),
        axios.get(SCRUM_API_URL),
        axios.get(NOTIFICATIONS_API_URL),
      ]);

      const teamData =
        teamResponse.data?.data ||
        teamResponse.data?.teams ||
        [];

      const projectsData =
        projectsResponse.data?.data ||
        projectsResponse.data?.projects ||
        [];

      const scrumData =
        scrumResponse.data?.data ||
        scrumResponse.data?.reviews ||
        [];

      const notificationsData =
        notificationsResponse.data?.data ||
        notificationsResponse.data?.notifications ||
        [];

      setTeam(
        Array.isArray(teamData)
          ? teamData
          : []
      );

      setProjects(
        Array.isArray(projectsData)
          ? projectsData
          : []
      );

      setScrumReviews(
        Array.isArray(scrumData)
          ? scrumData
          : []
      );

      setNotifications(
        Array.isArray(
          notificationsData
        )
          ? notificationsData
          : []
      );
    } catch (err) {
      console.error(
        "Project Manager Dashboard Error:",
        err
      );

      setError(
        "Dashboard data could not be loaded. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const timer = setInterval(() => {
      fetchDashboardData(false);
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  // ============================================================
  // TEAM STATS
  // ============================================================

  const teamStats = useMemo(() => {
    return {
      total: team.length,

      active: team.filter(
        (item) =>
          String(item.status || "")
            .toLowerCase() ===
          "active"
      ).length,

      pending: team.filter(
        (item) =>
          String(item.status || "")
            .toLowerCase() ===
          "pending"
      ).length,

      completed: team.filter(
        (item) =>
          String(item.status || "")
            .toLowerCase() ===
          "completed"
      ).length,
    };
  }, [team]);

  // ============================================================
  // PROJECT STATS
  // ============================================================

  const projectStats = useMemo(() => {
    const total = projects.length;

    const inProgress = projects.filter(
      (project) => {
        const status =
          String(
            project.status || ""
          ).toLowerCase();

        return (
          status === "in progress" ||
          status === "active" ||
          status === "ongoing"
        );
      }
    ).length;

    const planning = projects.filter(
      (project) => {
        const status =
          String(
            project.status || ""
          ).toLowerCase();

        return (
          status === "planning" ||
          status === "planned" ||
          status === "pending"
        );
      }
    ).length;

    const completed = projects.filter(
      (project) => {
        const status =
          String(
            project.status || ""
          ).toLowerCase();

        return (
          status === "completed" ||
          status === "complete" ||
          status === "done"
        );
      }
    ).length;

    return {
      total,
      inProgress,
      planning,
      completed,
    };
  }, [projects]);

  // ============================================================
  // TASK STATS
  // ============================================================

  const taskStats = useMemo(() => {
    let total = 0;
    let completed = 0;

    projects.forEach((project) => {
      const tasks = Array.isArray(
        project.tasks
      )
        ? project.tasks
        : [];

      total += tasks.length;

      tasks.forEach((task) => {
        const status =
          String(
            task.status || ""
          ).toLowerCase();

        if (
          task.completed === true ||
          status === "completed" ||
          status === "done"
        ) {
          completed += 1;
        }
      });
    });

    const pending =
      total - completed;

    const completionRate =
      total > 0
        ? Math.round(
            (completed / total) * 100
          )
        : 0;

    return {
      total,
      completed,
      pending,
      completionRate,
    };
  }, [projects]);

  // ============================================================
  // SCRUM STATS
  // ============================================================

  const scrumStats = useMemo(() => {
    return {
      total: scrumReviews.length,

      reviewed: scrumReviews.filter(
        (review) =>
          String(
            review.status || ""
          ).toLowerCase() ===
          "reviewed"
      ).length,

      pending: scrumReviews.filter(
        (review) =>
          String(
            review.status || ""
          ).toLowerCase() ===
          "pending"
      ).length,

      needsAttention:
        scrumReviews.filter(
          (review) =>
            String(
              review.status || ""
            ).toLowerCase() ===
            "needs attention"
        ).length,
    };
  }, [scrumReviews]);

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const notificationStats =
    useMemo(() => {
      return {
        unread:
          notifications.filter(
            (notification) =>
              !notification.isRead
          ).length,

        highPriority:
          notifications.filter(
            (notification) =>
              String(
                notification.priority ||
                  ""
              ).toLowerCase() ===
              "high"
          ).length,
      };
    }, [notifications]);

  // ============================================================
  // PROJECT PROGRESS
  // ============================================================

  const projectProgress =
    useMemo(() => {
      return [...projects]
        .map((project) => {
          const tasks =
            Array.isArray(
              project.tasks
            )
              ? project.tasks
              : [];

          let progress = Number(
            project.progress
          );

          if (
            !Number.isFinite(
              progress
            ) &&
            tasks.length > 0
          ) {
            const completedTasks =
              tasks.filter(
                (task) =>
                  task.completed ===
                    true ||
                  String(
                    task.status || ""
                  ).toLowerCase() ===
                    "completed" ||
                  String(
                    task.status || ""
                  ).toLowerCase() ===
                    "done"
              ).length;

            progress = Math.round(
              (completedTasks /
                tasks.length) *
                100
            );
          }

          if (
            !Number.isFinite(progress) ||
            progress < 0
          ) {
            progress = 0;
          }

          if (progress > 100) {
            progress = 100;
          }

          return {
            ...project,
            dashboardProgress:
              progress,
          };
        })
        .sort(
          (a, b) =>
            b.dashboardProgress -
            a.dashboardProgress
        )
        .slice(0, 5);
    }, [projects]);

  // ============================================================
  // RECENT TEAMS
  // ============================================================

  const recentTeams = useMemo(() => {
    return [...team]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      )
      .slice(0, 5);
  }, [team]);

  // ============================================================
  // RECENT SCRUM
  // ============================================================

  const recentScrumReviews =
    useMemo(() => {
      return [...scrumReviews]
        .sort(
          (a, b) =>
            new Date(
              b.scrumDate ||
                b.createdAt ||
                0
            ) -
            new Date(
              a.scrumDate ||
                a.createdAt ||
                0
            )
        )
        .slice(0, 4);
    }, [scrumReviews]);

  // ============================================================
  // RECENT NOTIFICATIONS
  // ============================================================

  const recentNotifications =
    useMemo(() => {
      return [...notifications]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
        )
        .slice(0, 4);
    }, [notifications]);

  // ============================================================
  // HELPERS
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "No date";

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "No date";
    }

    return parsed.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getProjectName = (
    project
  ) =>
    project.name ||
    project.projectName ||
    project.title ||
    "Untitled Project";

  const getTeamName = (teamItem) =>
    teamItem.teamName ||
    teamItem.name ||
    "Unnamed Team";

  const getStatusClass = (
    status
  ) => {
    const value =
      String(
        status || ""
      ).toLowerCase();

    if (
      value === "completed" ||
      value === "complete" ||
      value === "done" ||
      value === "reviewed"
    ) {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (
      value ===
        "needs attention" ||
      value === "overdue"
    ) {
      return "border-red-200 bg-red-50 text-red-700";
    }

    if (
      value ===
        "in progress" ||
      value === "active" ||
      value === "ongoing"
    ) {
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#F8FAFC] p-5 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1500px] animate-pulse">

          <div className="h-8 w-72 rounded bg-slate-200" />

          <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-3">
            <div className="h-72 rounded-2xl bg-white" />
            <div className="h-72 rounded-2xl bg-white" />
            <div className="h-72 rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#F8FAFC]">
      <div className="mx-auto max-w-[1500px] p-5 sm:p-6 lg:p-8">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-6 flex items-end justify-between gap-4">

          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2563EB]" />

              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563EB]">
                Project Management
              </p>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-[#172033] sm:text-3xl">
              Project Manager Dashboard
            </h1>

            <p className="mt-1 text-sm text-[#64748B]">
              A focused overview of your
              teams, projects, tasks and
              Scrum activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchDashboardData(false)
            }
            disabled={refreshing}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#172033] shadow-sm transition hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing"
              : "Refresh"}
          </button>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle
              size={18}
            />

            <span>{error}</span>
          </div>
        )}

        {/* ====================================================
            STAT CARDS
        ==================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <CompactStatCard
            title="Teams"
            value={teamStats.total}
            sub={`${teamStats.active} active`}
            icon={Users}
            iconClass="bg-blue-50 text-[#2563EB]"
            onClick={() =>
              navigate(
                "/project-manager/team"
              )
            }
          />

          <CompactStatCard
            title="Projects"
            value={projectStats.total}
            sub={`${projectStats.inProgress} in progress`}
            icon={FolderKanban}
            iconClass="bg-cyan-50 text-[#0891B2]"
            onClick={() =>
              navigate(
                "/project-manager/projects-tasks"
              )
            }
          />

          <CompactStatCard
            title="Pending Tasks"
            value={taskStats.pending}
            sub={`${taskStats.completed} completed`}
            icon={ListTodo}
            iconClass="bg-amber-50 text-[#F59E0B]"
            onClick={() =>
              navigate(
                "/project-manager/projects-tasks"
              )
            }
          />

          <CompactStatCard
            title="Scrum Reviews"
            value={scrumStats.total}
            sub={`${scrumStats.pending} pending`}
            icon={ClipboardCheck}
            iconClass="bg-red-50 text-[#DC2626]"
            onClick={() =>
              navigate(
                "/project-manager/scrum-review"
              )
            }
          />

          <CompactStatCard
            title="Unread Alerts"
            value={
              notificationStats.unread
            }
            sub={
              notificationStats.highPriority >
              0
                ? `${notificationStats.highPriority} high priority`
                : "All clear"
            }
            icon={Bell}
            iconClass="bg-blue-50 text-[#2563EB]"
            onClick={() =>
              navigate(
                "/project-manager/notifications"
              )
            }
          />
        </section>

        {/* ====================================================
            COMPACT ANALYTICS ROW
        ==================================================== */}

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr_1fr]">

          {/* PROJECT STATUS */}

          <DashboardPanel
            title="Project Status"
            subtitle="Current distribution"
          >
            <div className="flex items-center gap-7">

              <ProjectStatusDonut
                total={
                  projectStats.total
                }
                inProgress={
                  projectStats.inProgress
                }
                planning={
                  projectStats.planning
                }
                completed={
                  projectStats.completed
                }
              />

              <div className="min-w-0 flex-1 space-y-3">
                <StatusLegend
                  label="In Progress"
                  value={
                    projectStats.inProgress
                  }
                  color="bg-[#2563EB]"
                />

                <StatusLegend
                  label="Planning"
                  value={
                    projectStats.planning
                  }
                  color="bg-[#22D3EE]"
                />

                <StatusLegend
                  label="Completed"
                  value={
                    projectStats.completed
                  }
                  color="bg-[#DC2626]"
                />
              </div>
            </div>
          </DashboardPanel>

          {/* TASK COMPLETION */}

          <DashboardPanel
            title="Task Completion"
            subtitle="Across all projects"
          >
            <div className="flex items-center gap-6">

              <TaskDonut
                percentage={
                  taskStats.completionRate
                }
              />

              <div className="min-w-0 flex-1">

                <MiniDataRow
                  label="Total Tasks"
                  value={
                    taskStats.total
                  }
                />

                <MiniDataRow
                  label="Completed"
                  value={
                    taskStats.completed
                  }
                />

                <MiniDataRow
                  label="Pending"
                  value={
                    taskStats.pending
                  }
                />

                <MiniDataRow
                  label="Completion Rate"
                  value={`${taskStats.completionRate}%`}
                  accent
                />
              </div>
            </div>
          </DashboardPanel>

          {/* SCRUM HEALTH */}

          <DashboardPanel
            title="Scrum Health"
            subtitle="Latest review status"
          >
            <div className="grid grid-cols-3 gap-2">

              <HealthBox
                label="Reviewed"
                value={
                  scrumStats.reviewed
                }
                className="bg-emerald-50 text-emerald-700"
              />

              <HealthBox
                label="Pending"
                value={
                  scrumStats.pending
                }
                className="bg-amber-50 text-amber-700"
              />

              <HealthBox
                label="Attention"
                value={
                  scrumStats.needsAttention
                }
                className="bg-red-50 text-red-700"
              />
            </div>

            <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B]">
                  Total Reviews
                </span>

                <span className="text-lg font-black text-[#172033]">
                  {scrumStats.total}
                </span>
              </div>
            </div>
          </DashboardPanel>
        </section>

        {/* ====================================================
            PROJECT PROGRESS + NOTIFICATIONS
        ==================================================== */}

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">

          {/* PROJECT PROGRESS */}

          <DashboardPanel
            title="Project Progress"
            subtitle="Latest project execution status"
            action={
              <ViewButton
                onClick={() =>
                  navigate(
                    "/project-manager/projects-tasks"
                  )
                }
              />
            }
          >
            {projectProgress.length ===
            0 ? (
              <CompactEmpty
                icon={FolderKanban}
                text="No projects available."
              />
            ) : (
              <div className="space-y-4">

                {projectProgress.map(
                  (project) => (
                    <div
                      key={
                        project._id ||
                        project.id
                      }
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-4">

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#172033]">
                            {getProjectName(
                              project
                            )}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs font-bold text-[#2563EB]">
                          {
                            project.dashboardProgress
                          }
                          %
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#EF4444]"
                          style={{
                            width: `${project.dashboardProgress}%`,
                          }}
                        />
                      </div>

                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-[#94A3B8]">
                          {project.tasks
                            ?.length ||
                            0}{" "}
                          tasks
                        </span>

                        <span className="text-[10px] text-[#94A3B8]">
                          {project.status ||
                            "Planning"}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </DashboardPanel>

          {/* NOTIFICATIONS */}

          <DashboardPanel
            title="Recent Notifications"
            subtitle="Admin and Program Manager updates"
            action={
              <ViewButton
                onClick={() =>
                  navigate(
                    "/project-manager/notifications"
                  )
                }
              />
            }
          >
            {recentNotifications.length ===
            0 ? (
              <CompactEmpty
                icon={Bell}
                text="No notifications yet."
              />
            ) : (
              <div className="space-y-2.5">

                {recentNotifications.map(
                  (notification) => (
                    <div
                      key={
                        notification._id
                      }
                      className={`flex items-start gap-3 rounded-xl border p-3 transition hover:border-blue-200 ${
                        notification.isRead
                          ? "border-[#E2E8F0] bg-white"
                          : "border-blue-100 bg-blue-50/40"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          notification.isRead
                            ? "bg-slate-100 text-[#64748B]"
                            : "bg-blue-50 text-[#2563EB]"
                        }`}
                      >
                        <Megaphone
                          size={16}
                        />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-bold text-[#172033]">
                            {notification.title ||
                              "Announcement"}
                          </p>

                          {!notification.isRead && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />
                          )}
                        </div>

                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-5 text-[#64748B]">
                          {notification.message ||
                            "No message available."}
                        </p>

                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold text-[#2563EB]">
                            From{" "}
                            {notification.sourceRole ||
                              notification.createdBy ||
                              "System"}
                          </span>

                          <span className="text-[10px] text-[#94A3B8]">
                            {formatDate(
                              notification.createdAt
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </DashboardPanel>
        </section>

        {/* ====================================================
            TEAM + SCRUM
        ==================================================== */}

        <section className="mt-5 grid gap-5 xl:grid-cols-2">

          {/* TEAM OVERVIEW */}

          <DashboardPanel
            title="Team Overview"
            subtitle="Managed project teams"
            action={
              <ViewButton
                text="Manage"
                onClick={() =>
                  navigate(
                    "/project-manager/team"
                  )
                }
              />
            }
          >
            {recentTeams.length ===
            0 ? (
              <CompactEmpty
                icon={Users}
                text="No teams available."
              />
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">

                <div className="grid grid-cols-[1fr_70px_92px] border-b border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Team
                  </span>

                  <span className="text-center text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Members
                  </span>

                  <span className="text-right text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Status
                  </span>
                </div>

                {recentTeams.map(
                  (item) => (
                    <div
                      key={
                        item._id ||
                        item.id
                      }
                      className="grid grid-cols-[1fr_70px_92px] items-center border-b border-[#E2E8F0] px-3.5 py-3 last:border-b-0 hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#172033]">
                          {getTeamName(
                            item
                          )}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-[#94A3B8]">
                          {item.project &&
                          item.project !==
                            "Unassigned"
                            ? item.project
                            : "No project"}
                        </p>
                      </div>

                      <p className="text-center text-sm font-bold text-[#334155]">
                        {item.memberCount ||
                          0}
                      </p>

                      <div className="flex justify-end">
                        <span
                          className={`rounded-full border px-2 py-1 text-[9px] font-bold ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status ||
                            "Active"}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </DashboardPanel>

          {/* SCRUM REVIEW */}

          <DashboardPanel
            title="Recent Scrum Reviews"
            subtitle="Latest team-level Scrum activity"
            action={
              <ViewButton
                text="View"
                onClick={() =>
                  navigate(
                    "/project-manager/scrum-review"
                  )
                }
              />
            }
          >
            {recentScrumReviews.length ===
            0 ? (
              <CompactEmpty
                icon={ClipboardCheck}
                text="No Scrum reviews available."
              />
            ) : (
              <div className="space-y-2.5">

                {recentScrumReviews.map(
                  (review) => (
                    <div
                      key={
                        review._id
                      }
                      className="rounded-xl border border-[#E2E8F0] p-3.5 hover:border-blue-200 hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-3">

                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-[#172033]">
                            {review.teamName ||
                              review.team?.teamName ||
                              "Unknown Team"}
                          </p>

                          <p className="mt-0.5 truncate text-[10px] text-[#94A3B8]">
                            {review.projectName ||
                              review.project?.name ||
                              "Unknown Project"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${getStatusClass(
                            review.status
                          )}`}
                        >
                          {review.status ||
                            "Pending"}
                        </span>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[10px] text-[#64748B]">

                        <span className="flex items-center gap-1">
                          <CalendarDays
                            size={12}
                            className="text-[#2563EB]"
                          />

                          {formatDate(
                            review.scrumDate ||
                              review.createdAt
                          )}
                        </span>

                        <span className="flex items-center gap-1">
                          <Target
                            size={12}
                            className="text-[#0891B2]"
                          />

                          {review.sprintName ||
                            "Current Sprint"}
                        </span>

                        <span className="flex items-center gap-1">
                          <Activity
                            size={12}
                            className="text-[#DC2626]"
                          />

                          {Number(
                            review.sprintProgress ||
                              0
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </DashboardPanel>
        </section>

        {/* ====================================================
            QUICK ACTIONS
        ==================================================== */}

        <DashboardPanel
          title="Quick Actions"
          subtitle="Main Project Manager tools"
          className="mt-5"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <QuickAction
              icon={Users}
              title="Team Management"
              description="Manage teams"
              iconClass="bg-blue-50 text-[#2563EB]"
              onClick={() =>
                navigate(
                  "/project-manager/team"
                )
              }
            />

            <QuickAction
              icon={FolderKanban}
              title="Projects & Tasks"
              description="Manage project work"
              iconClass="bg-cyan-50 text-[#0891B2]"
              onClick={() =>
                navigate(
                  "/project-manager/projects-tasks"
                )
              }
            />

            <QuickAction
              icon={ClipboardCheck}
              title="Scrum Review"
              description="Review team activity"
              iconClass="bg-amber-50 text-[#F59E0B]"
              onClick={() =>
                navigate(
                  "/project-manager/scrum-review"
                )
              }
            />

            <QuickAction
              icon={Bell}
              title="Notifications"
              description="View announcements"
              iconClass="bg-red-50 text-[#DC2626]"
              onClick={() =>
                navigate(
                  "/project-manager/notifications"
                )
              }
            />
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD PANEL
// ============================================================

function DashboardPanel({
  title,
  subtitle,
  action,
  children,
  className = "",
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_6px_24px_rgba(15,23,42,0.045)] ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626]" />

      <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] px-5 py-4">

        <div className="min-w-0">
          <h2 className="text-sm font-black text-[#172033] sm:text-[15px]">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-[11px] text-[#94A3B8]">
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}

// ============================================================
// VIEW BUTTON
// ============================================================

function ViewButton({
  text = "View all",
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#2563EB] transition hover:text-[#1D4ED8]"
    >
      {text}

      <ArrowRight size={13} />
    </button>
  );
}

// ============================================================
// COMPACT STAT CARD
// ============================================================

function CompactStatCard({
  title,
  value,
  sub,
  icon: Icon,
  iconClass,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white text-left shadow-[0_6px_22px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626]" />

      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <div className="min-w-0">

          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            {title}
          </p>

          <p className="mt-1 text-2xl font-black tracking-tight text-[#172033]">
            {value}
          </p>

          <p className="mt-0.5 text-[10px] text-[#64748B]">
            {sub}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass} transition-transform duration-300 group-hover:scale-105`}
        >
          <Icon size={18} />
        </div>
      </div>
    </button>
  );
}

// ============================================================
// PROJECT STATUS DONUT
// ============================================================

function ProjectStatusDonut({
  total,
  inProgress,
  planning,
  completed,
}) {
  if (total === 0) {
    return (
      <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[12px] border-slate-100">
        <div className="text-center">
          <p className="text-2xl font-black text-[#172033]">
            0
          </p>

          <p className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Projects
          </p>
        </div>
      </div>
    );
  }

  const first =
    (inProgress / total) * 360;

  const second =
    first +
    (planning / total) * 360;

  const background =
    `conic-gradient(
      #2563EB 0deg ${first}deg,
      #22D3EE ${first}deg ${second}deg,
      #DC2626 ${second}deg 360deg
    )`;

  return (
    <div
      className="relative h-32 w-32 shrink-0 rounded-full p-[11px]"
      style={{
        background,
      }}
    >
      <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
        <div className="text-center">
          <p className="text-2xl font-black text-[#172033]">
            {total}
          </p>

          <p className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Projects
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TASK DONUT
// ============================================================

function TaskDonut({
  percentage,
}) {
  const value = Math.min(
    100,
    Math.max(
      0,
      Number(percentage) || 0
    )
  );

  const degree =
    value * 3.6;

  return (
    <div
      className="relative h-32 w-32 shrink-0 rounded-full p-[11px]"
      style={{
        background: `conic-gradient(#2563EB 0deg ${degree}deg, #E8EEF7 ${degree}deg 360deg)`,
      }}
    >
      <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
        <div className="text-center">
          <p className="text-2xl font-black text-[#172033]">
            {value}%
          </p>

          <p className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Complete
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STATUS LEGEND
// ============================================================

function StatusLegend({
  label,
  value,
  color,
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${color}`}
        />

        <span className="text-[11px] font-semibold text-[#64748B]">
          {label}
        </span>
      </div>

      <span className="text-xs font-black text-[#172033]">
        {value}
      </span>
    </div>
  );
}

// ============================================================
// MINI DATA ROW
// ============================================================

function MiniDataRow({
  label,
  value,
  accent = false,
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-b-0">
      <span className="text-[11px] font-medium text-[#64748B]">
        {label}
      </span>

      <span
        className={`text-sm font-black ${
          accent
            ? "text-[#2563EB]"
            : "text-[#172033]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================
// HEALTH BOX
// ============================================================

function HealthBox({
  label,
  value,
  className,
}) {
  return (
    <div
      className={`rounded-xl px-3 py-3 ${className}`}
    >
      <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">
        {label}
      </p>

      <p className="mt-1 text-xl font-black">
        {value}
      </p>
    </div>
  );
}

// ============================================================
// COMPACT EMPTY
// ============================================================

function CompactEmpty({
  icon: Icon,
  text,
}) {
  return (
    <div className="flex min-h-[150px] flex-col items-center justify-center text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-300">
        <Icon size={23} />
      </div>

      <p className="mt-2 text-xs font-semibold text-[#94A3B8]">
        {text}
      </p>
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
  onClick,
  iconClass,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-[#172033]">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-[#94A3B8]">
          {description}
        </p>
      </div>

      <ArrowRight
        size={14}
        className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#2563EB]"
      />
    </button>
  );
}

export default ProjectManagerDashboard;