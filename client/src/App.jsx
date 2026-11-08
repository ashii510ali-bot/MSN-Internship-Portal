
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "./router/ProtectedRoute";

import { ROLES } from "./lib/roles";

// AUTHENTICATION
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import EmailSent from "./pages/auth/EmailSent";
import ResetPassword from "./pages/auth/ResetPassword";

// INTERN
import InternLayout from "./layouts/intern/InternLayout";
import InternDashboard from "./pages/intern/Dashboard";
import InternDailyScrum from "./pages/intern/DailyScrum";
import InternAttendance from "./pages/intern/Attendance";
import InternProjects from "./pages/intern/MyProjects";
import InternTaskDetails from "./pages/intern/TaskDetails";
import InternSubmissions from "./pages/intern/Submissions";
import InternCertificates from "./pages/intern/Certificates";
import InternNotifications from "./pages/intern/Notifications";
import InternProfile from "./pages/intern/Profile";

// PROJECT MANAGER
import ProjectManagerLayout from "./layouts/projectManager/ProjectManagerLayout";
import ProjectManagerDashboard from "./pages/projectManager/ProjectManagerDashboard";
import TeamManagement from "./pages/projectManager/TeamManagement";
import ProjectsTasks from "./pages/projectManager/ProjectsTasks";
import ScrumReview from "./pages/projectManager/ScrumReview";
import ProjectManagerNotifications from "./pages/projectManager/ProjectManagerNotifications";
import ProjectManagerProfile from "./pages/projectManager/ProjectManagerProfile";
import ProjectManagerLogout from "./pages/projectManager/Logout";
import ProjectManagerLoggedOutPage from "./pages/projectManager/LoggedOutPage";

// MENTOR
import MentorLayout from "./layouts/mentor/MentorLayout";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import SubmissionReview from "./pages/mentor/SubmissionReview";
import PerformanceEvaluation from "./pages/mentor/PerformanceEvaluation";
import MentorNotifications from "./pages/mentor/MentorNotifications";
import MentorProfile from "./pages/mentor/MentorProfile";
import MentorLogout from "./pages/mentor/Logout";

// PROGRAM MANAGER
import ProgramManagerLayout from "./layouts/ProgramManagerLayout";
import ProgramManagerDashboard from "./pages/programManager/ProgramManagerDashboard";
import Cohorts from "./pages/programManager/Cohorts";
import Mentors from "./pages/programManager/Mentors";
import Reports from "./pages/programManager/Reports";
import Announcements from "./pages/programManager/Announcements";
import ProgramManagerNotifications from "./pages/programManager/Notifications";
import ProgramManagerProfile from "./pages/programManager/Profile";
import ProgramManagerLogout from "./pages/programManager/Logout";
import ProgramManagerLoggedOutPage from "./pages/programManager/LoggedOutPage";

// SUPER ADMIN
import SuperAdminLayout from "./pages/super-admin/SuperAdminLayout";
import SuperAdminDashboardPage from "./pages/super-admin/SuperAdminDashboardPage";
import UsersPage from "./pages/super-admin/UsersPage";
import ProgramsPage from "./pages/super-admin/ProgramsPage";
import AuditPage from "./pages/super-admin/AuditPage";
import AdminNotificationsPage from "./pages/super-admin/NotificationsPage";
import SettingsPage from "./pages/super-admin/SettingsPage";
import AdminProfilePage from "./pages/super-admin/ProfilePage";
import AdminLogout from "./pages/super-admin/Logout";

// SYSTEM
import Logout from "./pages/Logout";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// PROGRAM MANAGER LAYOUT
const withProgramManagerLayout = (element) => (
  <ProtectedRoute allowedRoles={[ROLES.PROGRAM_MANAGER]}>
    <ProgramManagerLayout>{element}</ProgramManagerLayout>
  </ProtectedRoute>
);

// MAIN APP
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}

        <Route path="/" element={<Login />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/email-sent" element={<EmailSent />} />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        <Route
          path="/sign-in"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/logout" element={<Logout />} />

        {/* INTERN ROUTES */}

        <Route
          path="/intern"
          element={
            <ProtectedRoute allowedRoles={[ROLES.INTERN]}>
              <InternLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="/intern/dashboard" replace />}
          />

          <Route path="dashboard" element={<InternDashboard />} />
          <Route path="daily-scrum" element={<InternDailyScrum />} />
          <Route path="attendance" element={<InternAttendance />} />
          <Route path="projects" element={<InternProjects />} />
          <Route path="tasks/:taskId" element={<InternTaskDetails />} />
          <Route path="submissions" element={<InternSubmissions />} />
          <Route path="certificates" element={<InternCertificates />} />
          <Route path="notifications" element={<InternNotifications />} />
          <Route path="profile" element={<InternProfile />} />
        </Route>

        {/* PROJECT MANAGER ROUTES */}

        <Route
          path="/project-manager"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PROJECT_MANAGER]}>
              <ProjectManagerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProjectManagerDashboard />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="projects-tasks" element={<ProjectsTasks />} />
          <Route path="scrum-review" element={<ScrumReview />} />
          <Route
            path="notifications"
            element={<ProjectManagerNotifications />}
          />
          <Route path="profile" element={<ProjectManagerProfile />} />
        </Route>

        <Route
          path="/project-manager/logout"
          element={<ProjectManagerLogout />}
        />

        <Route
          path="/project-manager/logged-out"
          element={<ProjectManagerLoggedOutPage />}
        />

        {/* MENTOR ROUTES */}

        <Route
          path="/mentor"
          element={
            <ProtectedRoute allowedRoles={[ROLES.MENTOR]}>
              <MentorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MentorDashboard />} />
          <Route
            path="submission-review"
            element={<SubmissionReview />}
          />
          <Route
            path="performance-evaluation"
            element={<PerformanceEvaluation />}
          />
          <Route path="notifications" element={<MentorNotifications />} />
          <Route path="profile" element={<MentorProfile />} />
        </Route>

        <Route path="/mentor/logout" element={<MentorLogout />} />

        {/* PROGRAM MANAGER ROUTES */}

        <Route
          path="/program-manager/dashboard"
          element={withProgramManagerLayout(<ProgramManagerDashboard />)}
        />

        <Route
          path="/program-manager/cohorts"
          element={withProgramManagerLayout(<Cohorts />)}
        />

        <Route
          path="/program-manager/mentors"
          element={withProgramManagerLayout(<Mentors />)}
        />

        <Route
          path="/program-manager/reports"
          element={withProgramManagerLayout(<Reports />)}
        />

        <Route
          path="/program-manager/announcements"
          element={withProgramManagerLayout(<Announcements />)}
        />

        <Route
          path="/program-manager/notifications"
          element={withProgramManagerLayout(
            <ProgramManagerNotifications />
          )}
        />

        <Route
          path="/program-manager/profile"
          element={withProgramManagerLayout(<ProgramManagerProfile />)}
        />

        <Route
          path="/program-manager/logout"
          element={<ProgramManagerLogout />}
        />

        <Route
          path="/program-manager/logged-out"
          element={<ProgramManagerLoggedOutPage />}
        />

        {/* SUPER ADMIN ROUTES */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="/admin/dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<SuperAdminDashboardPage />}
          />

          <Route path="users" element={<UsersPage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="audit" element={<AuditPage />} />

          <Route
            path="notifications"
            element={<AdminNotificationsPage />}
          />

          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* ADMIN LOGOUT - OUTSIDE PROTECTED ADMIN ROUTE */}

        <Route
          path="/admin/logout"
          element={<AdminLogout />}
        />

        {/* LEGACY SUPER ADMIN ROUTE */}

        <Route
          path="/super-admin/*"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        {/* 404 */}

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
