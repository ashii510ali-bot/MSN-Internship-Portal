
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const connectDB = require("./config/db");

const protect = require("./middleware/authMiddleware");
const allowRoles = require("./middleware/roleMiddleware");
const { ROLES } = require("./constants/roles");

// ============================================================
// ROUTES
// ============================================================

// Authentication
const authRoutes = require("./routes/authRoutes");

// Common Notifications
const notificationRoutes = require("./routes/notificationRoutes");

// Program Manager
const cohortRoutes = require("./routes/cohortRoutes");
const projectRoutes = require("./routes/projectRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const programManagerProfileRoutes = require("./routes/programManagerProfileRoutes");

// Super Admin
const superAdminUsersRoutes = require("./routes/superAdmin/usersRoutes");
const superAdminProgramsRoutes = require("./routes/superAdmin/programsRoutes");
const superAdminAuditLogsRoutes = require("./routes/superAdmin/auditLogsRoutes");
const superAdminNotificationsRoutes = require("./routes/superAdmin/notificationsRoutes");
const superAdminPlatformSettingsRoutes = require("./routes/superAdmin/platformSettingsRoutes");
const superAdminRolesMatrixRoutes = require("./routes/superAdmin/rolesMatrixRoutes");

// Project Manager
const projectManagerTeamRoutes = require("./routes/projectManager/teamRoutes");
const projectManagerProjectsTasksRoutes = require("./routes/projectManager/projectsTasksRoutes");
const projectManagerScrumReviewRoutes = require("./routes/projectManager/scrumReviewRoutes");
const projectManagerNotificationRoutes = require("./routes/projectManager/projectManagerNotificationRoutes");
const projectManagerTodoRoutes = require("./routes/projectManager/projectManagerTodoRoutes");
const projectManagerProfileRoutes = require("./routes/projectManager/projectManagerProfileRoutes");
const projectManagerInternWorkflowRoutes = require("./routes/projectManager/internWorkflowRoutes");

// Mentor
const mentorDashboardRoutes = require("./routes/mentor/mentorDashboardRoutes");
const mentorInternRoutes = require("./routes/mentor/internRoutes");
const mentorSubmissionRoutes = require("./routes/mentor/submissionRoutes");
const mentorEvaluationRoutes = require("./routes/mentor/evaluationRoutes");
const mentorNotificationRoutes = require("./routes/mentor/mentorNotificationRoutes");
const mentorProfileRoutes = require("./routes/mentor/mentorProfileRoutes");

// Intern
const internRoutes = require("./routes/intern/internRoutes");

// ============================================================
// APP
// ============================================================

const app = express();

connectDB();

const allowedOrigins = (
  process.env.CLIENT_URLS || "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header = same-origin or server-to-server request.
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow temporary Cloudflare Tunnel URLs
      if (/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`Origin ${origin} is not allowed by CORS.`)
      );
    },

    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));

// ============================================================
// ROLE GUARDS
// ============================================================

const programManagerOnly = [
  protect,
  allowRoles(ROLES.PROGRAM_MANAGER, ROLES.SUPER_ADMIN),
];

const projectManagerOnly = [
  protect,
  allowRoles(ROLES.PROJECT_MANAGER, ROLES.SUPER_ADMIN),
];

const mentorOnly = [
  protect,
  allowRoles(ROLES.MENTOR, ROLES.SUPER_ADMIN),
];

const superAdminOnly = [
  protect,
  allowRoles(ROLES.SUPER_ADMIN),
];

// ============================================================
// AUTHENTICATION
// ============================================================

app.use("/api/auth", authRoutes);

// ============================================================
// COMMON NOTIFICATIONS
// Available to all authenticated roles
// ============================================================

app.use("/api/notifications", notificationRoutes);

// ============================================================
// PROGRAM MANAGER
// ============================================================

app.use("/api/cohorts", ...programManagerOnly, cohortRoutes);
app.use("/api/projects", ...programManagerOnly, projectRoutes);
app.use("/api/reports", ...programManagerOnly, reportRoutes);
app.use("/api/dashboard", ...programManagerOnly, dashboardRoutes);
app.use("/api/announcements", ...programManagerOnly, announcementRoutes);

app.use(
  "/api/program-manager-profile",
  ...programManagerOnly,
  programManagerProfileRoutes
);

// ============================================================
// SUPER ADMIN
// ============================================================

app.use("/api/super-admin/users", ...superAdminOnly, superAdminUsersRoutes);
app.use("/api/super-admin/programs", ...superAdminOnly, superAdminProgramsRoutes);

app.use(
  "/api/super-admin/audit-logs",
  ...superAdminOnly,
  superAdminAuditLogsRoutes
);

app.use(
  "/api/super-admin/notifications",
  ...superAdminOnly,
  superAdminNotificationsRoutes
);

app.use(
  "/api/super-admin/platform-settings",
  ...superAdminOnly,
  superAdminPlatformSettingsRoutes
);

app.use(
  "/api/super-admin/roles-matrix",
  ...superAdminOnly,
  superAdminRolesMatrixRoutes
);

// ============================================================
// PROJECT MANAGER
// ============================================================

app.use(
  "/api/project-manager/team",
  ...projectManagerOnly,
  projectManagerTeamRoutes
);

app.use(
  "/api/project-manager/projects-tasks",
  ...projectManagerOnly,
  projectManagerProjectsTasksRoutes
);

app.use(
  "/api/project-manager/scrum-review",
  ...projectManagerOnly,
  projectManagerScrumReviewRoutes
);

app.use(
  "/api/project-manager/notifications",
  ...projectManagerOnly,
  projectManagerNotificationRoutes
);

app.use(
  "/api/project-manager/todos",
  ...projectManagerOnly,
  projectManagerTodoRoutes
);

app.use(
  "/api/project-manager/profile",
  ...projectManagerOnly,
  projectManagerProfileRoutes
);

// Intern roster, task assignment and daily scrum review.
app.use(
  "/api/project-manager/workflow",
  ...projectManagerOnly,
  projectManagerInternWorkflowRoutes
);

// ============================================================
// MENTOR
// ============================================================

app.use("/api/mentor/dashboard", ...mentorOnly, mentorDashboardRoutes);
app.use("/api/mentor/interns", ...mentorOnly, mentorInternRoutes);
app.use("/api/mentor/submissions", ...mentorOnly, mentorSubmissionRoutes);
app.use("/api/mentor/evaluations", ...mentorOnly, mentorEvaluationRoutes);

app.use(
  "/api/mentor/notifications",
  ...mentorOnly,
  mentorNotificationRoutes
);

app.use("/api/mentor/profile", ...mentorOnly, mentorProfileRoutes);

// ============================================================
// INTERN
// The intern router applies protect + allowRoles internally.
// ============================================================

app.use("/api/intern", internRoutes);

// ============================================================
// HEALTH / ROOT
// ============================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    dbState: mongoose.connection.readyState,
    uptime: process.uptime(),
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MSN Academy Internship Portal API is running",
  });
});

// ============================================================
// 404 + ERROR HANDLING
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} was not found.`,
  });
});

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Something went wrong on the server.",
  });
});

// ============================================================
// SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
