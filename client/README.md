# MSN Academy — Internship Management Portal

A single role-based portal integrated from five isolated feature branches
(`auth-users`, `intern`, `mentor`, `program-manager-&-project-manager`,
`super-admin-dashboard`) into one working application.

---

## Quick start

```bash
# 1. Backend
cd server
cp .env.example .env          # set MONGO_URI and JWT_SECRET
npm install
npm run seed                  # demo users + full workflow chain
npm run dev                   # https://internship-portal-backend-olive.vercel.app

# 2. Frontend (separate terminal)
cd client
npm install
npm run dev                   # http://localhost:5173
```

Vite proxies `/api` to `https://internship-portal-backend-olive.vercel.app`, so no client `.env` is
needed for local development.

### Seeded accounts

All use the password `Msn@12345`.

| Role | Email |
|---|---|
| Super Admin | `admin@msnacademy.com` |
| Program Manager | `program.manager@msnacademy.com` |
| Project Manager | `project.manager@msnacademy.com` |
| Mentor | `mentor@msnacademy.com` |
| Intern | `intern@msnacademy.com` |

---

## Folder structure

```
project-root/
├── client/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── roles.js            # canonical roles + normaliser
│   │   │   ├── session.js          # unified multi-key session store
│   │   │   └── navigation.js       # role -> sidebar configuration
│   │   ├── router/
│   │   │   └── ProtectedRoute.jsx  # ProtectedRoute / PublicOnly / HomeRedirect
│   │   ├── services/
│   │   │   ├── http.js             # fetch wrapper (auth + error handling)
│   │   │   ├── axiosSetup.js       # global axios interceptors
│   │   │   ├── authApi.js
│   │   │   ├── internApi.js
│   │   │   ├── mentorApi.js
│   │   │   └── projectManagerWorkflowApi.js
│   │   ├── layouts/
│   │   │   ├── intern/InternLayout.jsx
│   │   │   ├── mentor/MentorLayout.jsx
│   │   │   ├── projectManager/ProjectManagerLayout.jsx
│   │   │   └── ProgramManagerLayout.jsx
│   │   ├── components/
│   │   │   ├── layout/             # super admin shell
│   │   │   ├── shared/             # data-table, kpi-card, badges, toast...
│   │   │   ├── mentor/
│   │   │   ├── projectManager/
│   │   │   │   ├── InternTaskAssignment.jsx   # page 13 panel
│   │   │   │   └── InternScrumReview.jsx      # page 14 panel
│   │   │   ├── ProgramManagerSidebar.jsx
│   │   │   └── ProgramManagerNavbar.jsx
│   │   ├── pages/
│   │   │   ├── auth/               # Login, Register, Forgot, Reset, EmailSent
│   │   │   ├── intern/             # Dashboard ... TaskDetails, Submissions
│   │   │   ├── projectManager/
│   │   │   ├── mentor/
│   │   │   ├── programManager/
│   │   │   ├── super-admin/
│   │   │   ├── Logout.jsx / Unauthorized.jsx / NotFound.jsx
│   │   ├── api/                    # TanStack Query hooks (super admin)
│   │   ├── shared/                 # zod schemas + enums
│   │   ├── index.css               # THE master stylesheet
│   │   ├── App.jsx                 # centralized router
│   │   └── main.jsx
│   └── vite.config.js              # /api proxy + @ and @msn/shared aliases
│
├── server/
│   ├── constants/roles.js          # canonical roles + normaliser
│   ├── config/db.js
│   ├── middleware/                 # authMiddleware, roleMiddleware
│   ├── models/
│   │   ├── User.js  Notification.js  Task.js  DailyScrum.js
│   │   ├── Attendance.js  Certificate.js  Cohort.js  Project.js
│   │   ├── Announcement.js  Program.js  AuditLog.js  RoleMatrix.js
│   │   ├── PlatformSetting.js  ProgramManagerProfile.js
│   │   ├── mentor/                 # Submission, Evaluation, InternAssignment...
│   │   └── projectManager/         # Team, Project, Todo, ScrumReview...
│   ├── services/
│   │   ├── notificationService.js  # one write path, role-aware fan-out
│   │   ├── workflowService.js      # the cross-module state machine
│   │   └── mailService.js
│   ├── controllers/  routes/       # auth, intern/, mentor/, projectManager/, superAdmin/
│   ├── seedData.js  seedSuperAdmin.js
│   └── server.js
└── README.md
```

---

## The 20 pages

| # | Page | Route | Role |
|---|---|---|---|
| 1 | Login | `/login` | public |
| 2 | Registration | `/register` | public |
| 3 | Forgot Password | `/forgot-password` (+ `/email-sent`, `/reset-password/:token`) | public |
| 4 | Intern Dashboard | `/intern/dashboard` | Intern |
| 5 | Daily Scrum | `/intern/daily-scrum` | Intern |
| 6 | Attendance | `/intern/attendance` | Intern |
| 7 | My Projects | `/intern/projects` | Intern |
| 8 | Task Details & Submission | `/intern/tasks/:taskId` | Intern |
| 9 | Submission Status | `/intern/submissions` | Intern |
| 10 | Certificates | `/intern/certificates` | Intern |
| 11 | Project Management Dashboard | `/project-manager` | Project Manager |
| 12 | Team Management | `/project-manager/team` | Project Manager |
| 13 | Project & Task Management | `/project-manager/projects-tasks` | Project Manager |
| 14 | Daily Scrum Review | `/project-manager/scrum-review` | Project Manager |
| 15 | Mentor Dashboard | `/mentor` | Mentor |
| 16 | Submission Review | `/mentor/submission-review` | Mentor |
| 17 | Performance Evaluation | `/mentor/performance-evaluation` | Mentor |
| 18 | Program Manager Dashboard | `/program-manager/dashboard` | Program Manager |
| 19 | Program & Cohort Management | `/program-manager/cohorts` | Program Manager |
| 20 | Super Admin Dashboard | `/admin/dashboard` | Super Admin |

Supporting routes: `/`, `/logout`, `/unauthorized`, `*` (404), plus each
module's own notifications and profile pages.

---

## Data flow

```
PM assigns Task ───notify──▶ Intern
        │
Intern opens /intern/tasks/:id  → task moves to "In Progress"
        │  submits
        ▼
Submission { status: pending, mentorId, taskId, attempt }
  └─ Task → "Submitted" ───notify──▶ Mentor queue (page 16)
        │
  Mentor reviews
        ├── approve  → Task "Approved"  ──notify──▶ Intern
        └── resubmit → Task "Resubmit" + feedback ──notify──▶ Intern
                          └─ Intern resubmits (attempt + 1) → back to Mentor
        │
Mentor saves Evaluation (page 17)
  └─ notify Intern
  └─ issueCertificateIfEligible():
        every assigned task Approved?  → Certificate + notify Intern
        │
Certificate appears on /intern/certificates

Intern submits Daily Scrum ──notify──▶ PM Scrum Review (page 14)
  └─ PM marks Reviewed / Needs Attention + remarks ──notify──▶ Intern
```

`server/services/workflowService.js` owns every transition that crosses a
module boundary, so no module has to know another module's internals.
Certificate issuance is idempotent — calling it twice never produces a
second certificate.

---

## Authentication and role protection

- **Canonical roles**: `intern`, `project_manager`, `mentor`,
  `program_manager`, `super_admin`. `normalizeRole()` (mirrored in
  `server/constants/roles.js` and `client/src/lib/roles.js`) absorbs every
  legacy spelling the branches used.
- **Login** carries a role selector; the server rejects a login whose
  selected role does not match the stored role.
- **Server**: `protect` verifies the JWT (accepting the `id`, `userId` and
  `_id` payload shapes the branches produced) and loads the user;
  `allowRoles(...)` normalises both sides before comparing. Guards are
  applied once, at mount time in `server.js`, so the whole permission map
  is readable in one block.
- **Client**: `ProtectedRoute` sends an unauthenticated visitor to
  `/login` and a *wrong-role* visitor to **their own** dashboard — so
  typing another role's URL can never render that role's page.
- **Session**: `lib/session.js` writes `token` / `msn_token` /
  `authToken`, `user` / `msn_user`, `role` / `msn_active_role` and
  `userId` together. This is what lets the Program Manager, Project
  Manager, Mentor and Super Admin pages work unmodified against one login.

---

## Styling

`client/src/index.css` is the single stylesheet, loaded once from
`main.jsx`. No page imports its own CSS. The palette is declared once in
the Tailwind v4 `@theme` block:

```
--color-sidebar:      #0B2345
--color-blue-main:    #2563EB
--color-cyan-accent:  #22D3EE
```

with `.gradient-stroke` and `.gradient-progress` as the shared card and
progress treatments. The intern branch's glass surfaces were merged in at
the bottom of the file (retuned from red/purple to the portal palette),
along with the auth shake animation and one scrollbar treatment. The Vite
boilerplate `App.css` was deleted.

---

## Dependency changes

**Added**

| Package | Side | Why |
|---|---|---|
| `nodemailer` ^7 | server | password reset email (from `auth-users`) |
| `framer-motion` ^12 | client | auth page animations (from `auth-users`) |

**Removed:** none. Nothing else was added — the base branch already
carried React 19, TanStack Query, Tailwind v4, axios, lucide-react,
react-router-dom v7, zod, date-fns and react-datepicker.

---

## Integration notes

- `feature/admin` and `feature/ui-integration-testing` contained only a
  README — there was no code to merge.
- `integration` and `feature/program-manager-&-project-manager` were
  strict subsets of `feature/super-admin-dashboard`, which was used as
  the base.
- Conflicting `Project` and `Submission` models were resolved in favour of
  the richer implementations; the intern branch's thin CRUD routes were
  replaced by controllers that participate in the workflow.
- Intern APIs are namespaced under `/api/intern/*` to resolve the
  `/api/projects` and `/api/notifications` collisions with the Program
  Manager module.
- All four role sidebars read from `lib/navigation.js` rather than
  declaring their own menu arrays.
