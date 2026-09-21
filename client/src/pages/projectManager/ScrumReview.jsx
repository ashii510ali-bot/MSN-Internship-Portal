
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

import InternScrumReview from "../../components/projectManager/InternScrumReview";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  CalendarDays,
  UsersRound,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ClipboardCheck,
  BarChart3,
  TrendingUp,
  MessageSquareText,
  Target,
  Layers3,
  Activity,
  UserCheck,
  CircleCheckBig,
  ShieldAlert,
  Gauge,
} from "lucide-react";

// ============================================================
// API
// ============================================================

const SCRUM_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/project-manager/scrum-review";

const TEAM_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/project-manager/team";

const PROJECTS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/project-manager/projects-tasks";

// ============================================================
// EMPTY FORM
// ============================================================

const emptyForm = {
  teamId: "",
  teamName: "",
  projectId: "",
  projectName: "",

  scrumDate: "",
  scrumType: "Daily Scrum",
  sprintName: "",

  totalMembers: 0,
  presentMembers: 0,
  lateMembers: 0,
  absentMembers: 0,

  sprintProgress: 0,

  completedWork: "",
  blockers: "",
  nextPlan: "",

  status: "Pending",
  managerRemarks: "",
};

// ============================================================
// COMPONENT
// ============================================================

function ScrumReview() {
  const [reviews, setReviews] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // FILTERS
  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState("All");
  const [projectFilter, setProjectFilter] =
    useState("All");
  const [statusFilter, setStatusFilter] =
    useState("All");

  // MODALS
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [selectedReview, setSelectedReview] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  // FORM
  const [form, setForm] = useState({
    ...emptyForm,
  });

  // TOAST
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // TOAST TIMER
  // ============================================================

  useEffect(() => {
    if (!toast.show) {
      return;
    }

    const timer = setTimeout(() => {
      setToast({
        show: false,
        type: "success",
        message: "",
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // ============================================================
  // TOAST
  // ============================================================

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
  // LOAD DATA
  // ============================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        reviewsResponse,
        teamsResponse,
        projectsResponse,
      ] = await Promise.all([
        axios.get(SCRUM_API_URL),
        axios.get(TEAM_API_URL),
        axios.get(PROJECTS_API_URL),
      ]);

      const reviewData =
        Array.isArray(
          reviewsResponse.data
        )
          ? reviewsResponse.data
          : reviewsResponse.data?.data ||
            reviewsResponse.data?.reviews ||
            [];

      const teamData =
        Array.isArray(
          teamsResponse.data
        )
          ? teamsResponse.data
          : teamsResponse.data?.data ||
            teamsResponse.data?.teams ||
            [];

      const projectData =
        Array.isArray(
          projectsResponse.data
        )
          ? projectsResponse.data
          : projectsResponse.data?.data ||
            projectsResponse.data?.projects ||
            [];

      setReviews(
        Array.isArray(reviewData)
          ? reviewData
          : []
      );

      setTeams(
        Array.isArray(teamData)
          ? teamData
          : []
      );

      setProjects(
        Array.isArray(projectData)
          ? projectData
          : []
      );
    } catch (error) {
      console.error(
        "Scrum Review load error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Unable to load Scrum Review data.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STATS
  // ============================================================

  const stats = useMemo(() => {
    const uniqueTeams = new Set(
      reviews
        .map(
          (item) =>
            item.teamId ||
            item.teamName
        )
        .filter(Boolean)
    );

    const averageProgress =
      reviews.length > 0
        ? Math.round(
            reviews.reduce(
              (total, item) =>
                total +
                Number(
                  item.sprintProgress ||
                    item.progress ||
                    0
                ),
              0
            ) / reviews.length
          )
        : 0;

    const blockersCount =
      reviews.filter((item) =>
        String(
          item.blockers || ""
        ).trim()
      ).length;

    const pending =
      reviews.filter(
        (item) =>
          item.status === "Pending"
      ).length;

    const reviewed =
      reviews.filter(
        (item) =>
          item.status === "Reviewed"
      ).length;

    const attention =
      reviews.filter(
        (item) =>
          item.status ===
          "Needs Attention"
      ).length;

    return {
      total: reviews.length,
      teams: uniqueTeams.size,
      averageProgress,
      blockers: blockersCount,
      pending,
      reviewed,
      attention,
    };
  }, [reviews]);

  // ============================================================
  // FILTERED REVIEWS
  // ============================================================

  const filteredReviews = useMemo(() => {
    const search =
      searchTerm
        .toLowerCase()
        .trim();

    return reviews.filter((review) => {
      const searchableText = `
        ${review.teamName || ""}
        ${review.projectName || ""}
        ${review.sprintName || ""}
        ${review.completedWork || ""}
        ${review.blockers || ""}
        ${review.nextPlan || ""}
        ${review.managerRemarks || ""}
      `.toLowerCase();

      const matchesSearch =
        !search ||
        searchableText.includes(search);

      const matchesTeam =
        teamFilter === "All" ||
        String(
          review.teamId ||
            review.teamName ||
            ""
        ) === String(teamFilter);

      const matchesProject =
        projectFilter === "All" ||
        String(
          review.projectId ||
            review.projectName ||
            ""
        ) ===
          String(projectFilter);

      const matchesStatus =
        statusFilter === "All" ||
        review.status === statusFilter;

      return (
        matchesSearch &&
        matchesTeam &&
        matchesProject &&
        matchesStatus
      );
    });
  }, [
    reviews,
    searchTerm,
    teamFilter,
    projectFilter,
    statusFilter,
  ]);

  // ============================================================
  // TEAM GROUPS
  // ============================================================

  const teamGroups = useMemo(() => {
    const grouped = {};

    filteredReviews.forEach((review) => {
      const key =
        review.teamId ||
        review.teamName ||
        "Unknown Team";

      if (!grouped[key]) {
        grouped[key] = {
          teamId:
            review.teamId || "",
          teamName:
            review.teamName ||
            "Unnamed Team",
          projectName:
            review.projectName ||
            "Unassigned",
          reviews: [],
        };
      }

      grouped[key].reviews.push(review);
    });

    return Object.values(grouped).sort(
      (a, b) =>
        String(
          a.teamName
        ).localeCompare(
          String(
            b.teamName
          )
        )
    );
  }, [filteredReviews]);

  // ============================================================
  // PERFORMANCE DATA
  // ============================================================

  const performanceData = useMemo(() => {
    const grouped = {};

    reviews.forEach((review) => {
      const teamName =
        review.teamName ||
        "Unnamed Team";

      const progress = Number(
        review.sprintProgress ||
          review.progress ||
          0
      );

      const totalMembers = Math.max(
        Number(
          review.totalMembers || 0
        ),
        0
      );

      const present =
        Number(
          review.presentMembers || 0
        ) +
        Number(
          review.lateMembers || 0
        );

      const attendanceRate =
        totalMembers > 0
          ? Math.round(
              (present /
                totalMembers) *
                100
            )
          : 0;

      if (!grouped[teamName]) {
        grouped[teamName] = {
          teamName,
          progressTotal: 0,
          attendanceTotal: 0,
          count: 0,
          blockers: 0,
        };
      }

      grouped[
        teamName
      ].progressTotal += progress;

      grouped[
        teamName
      ].attendanceTotal +=
        attendanceRate;

      grouped[teamName].count += 1;

      if (
        String(
          review.blockers || ""
        ).trim()
      ) {
        grouped[
          teamName
        ].blockers += 1;
      }
    });

    return Object.values(grouped)
      .map((item) => ({
        teamName:
          item.teamName,

        progress:
          item.count > 0
            ? Math.round(
                item.progressTotal /
                  item.count
              )
            : 0,

        attendance:
          item.count > 0
            ? Math.round(
                item.attendanceTotal /
                  item.count
              )
            : 0,

        blockers:
          item.blockers,
      }))
      .sort(
        (a, b) =>
          b.progress - a.progress
      );
  }, [reviews]);

  // ============================================================
  // OPEN ADD
  // ============================================================

  const openAddModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      scrumDate:
        new Date()
          .toISOString()
          .split("T")[0],
    });

    setShowModal(true);
  };

  // ============================================================
  // OPEN EDIT
  // ============================================================

  const openEditModal = (review) => {
    setEditingId(
      review._id ||
        review.id
    );

    setForm({
      teamId:
        review.teamId || "",

      teamName:
        review.teamName || "",

      projectId:
        review.projectId || "",

      projectName:
        review.projectName || "",

      scrumDate: review.scrumDate
        ? new Date(
            review.scrumDate
          )
            .toISOString()
            .split("T")[0]
        : "",

      scrumType:
        review.scrumType ||
        "Daily Scrum",

      sprintName:
        review.sprintName ||
        "",

      totalMembers:
        Number(
          review.totalMembers || 0
        ),

      presentMembers:
        Number(
          review.presentMembers || 0
        ),

      lateMembers:
        Number(
          review.lateMembers || 0
        ),

      absentMembers:
        Number(
          review.absentMembers || 0
        ),

      sprintProgress:
        Number(
          review.sprintProgress ||
            review.progress ||
            0
        ),

      completedWork:
        review.completedWork ||
        "",

      blockers:
        review.blockers ||
        "",

      nextPlan:
        review.nextPlan ||
        "",

      status:
        review.status ||
        "Pending",

      managerRemarks:
        review.managerRemarks ||
        "",
    });

    setShowModal(true);
  };

  // ============================================================
  // OPEN DETAILS
  // ============================================================

  const openDetailsModal = (
    review
  ) => {
    setSelectedReview(review);
    setShowDetails(true);
  };

  // ============================================================
  // CLOSE MODALS
  // ============================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingId(null);

    setForm({
      ...emptyForm,
    });
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedReview(null);
  };

  // ============================================================
  // TEAM CHANGE
  // ============================================================

  const handleTeamChange = (
    teamId
  ) => {
    const selectedTeam =
      teams.find(
        (team) =>
          String(
            team._id ||
              team.id
          ) ===
          String(teamId)
      );

    const memberCount =
      Number(
        selectedTeam?.memberCount ||
          selectedTeam?.membersCount ||
          0
      );

    let projectName =
      selectedTeam?.project ||
      "Unassigned";

    const matchedProject =
      projects.find(
        (project) =>
          String(
            project._id ||
              project.id
          ) ===
          String(
            selectedTeam?.projectId ||
              ""
          )
      );

    if (
      matchedProject?.name
    ) {
      projectName =
        matchedProject.name;
    }

    setForm((previous) => ({
      ...previous,

      teamId,

      teamName:
        selectedTeam?.teamName ||
        selectedTeam?.name ||
        "",

      totalMembers:
        memberCount,

      projectName,
    }));
  };

  // ============================================================
  // PROJECT CHANGE
  // ============================================================

  const handleProjectChange = (
    projectId
  ) => {
    const selectedProject =
      projects.find(
        (project) =>
          String(
            project._id ||
              project.id
          ) ===
          String(projectId)
      );

    setForm((previous) => ({
      ...previous,
      projectId,

      projectName:
        selectedProject?.name ||
        selectedProject?.projectName ||
        "",
    }));
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // ATTENDANCE CALCULATION
  // ============================================================

  useEffect(() => {
    const total =
      Number(
        form.totalMembers || 0
      );

    const present =
      Number(
        form.presentMembers || 0
      );

    const late =
      Number(
        form.lateMembers || 0
      );

    const calculatedAbsent =
      Math.max(
        total -
          present -
          late,
        0
      );

    if (
      Number(
        form.absentMembers || 0
      ) !==
      calculatedAbsent
    ) {
      setForm((previous) => ({
        ...previous,
        absentMembers:
          calculatedAbsent,
      }));
    }
  }, [
    form.totalMembers,
    form.presentMembers,
    form.lateMembers,
  ]);

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    const total =
      Number(
        form.totalMembers || 0
      );

    const present =
      Number(
        form.presentMembers || 0
      );

    const late =
      Number(
        form.lateMembers || 0
      );

    if (!form.teamId) {
      showToast(
        "Please select a team.",
        "error"
      );
      return false;
    }

    if (!form.projectId) {
      showToast(
        "Please select a project.",
        "error"
      );
      return false;
    }

    if (!form.scrumDate) {
      showToast(
        "Please select Scrum date.",
        "error"
      );
      return false;
    }

    if (
      !form.sprintName.trim()
    ) {
      showToast(
        "Please enter sprint or week.",
        "error"
      );
      return false;
    }

    if (
      !form.completedWork.trim()
    ) {
      showToast(
        "Please add completed work.",
        "error"
      );
      return false;
    }

    if (
      !form.nextPlan.trim()
    ) {
      showToast(
        "Please add the next plan.",
        "error"
      );
      return false;
    }

    if (
      present + late >
      total
    ) {
      showToast(
        "Present + Late members cannot exceed total members.",
        "error"
      );
      return false;
    }

    return true;
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      teamId:
        form.teamId,

      teamName:
        form.teamName.trim(),

      projectId:
        form.projectId,

      projectName:
        form.projectName.trim(),

      scrumDate:
        form.scrumDate,

      scrumType:
        form.scrumType,

      sprintName:
        form.sprintName.trim(),

      totalMembers:
        Number(
          form.totalMembers || 0
        ),

      presentMembers:
        Number(
          form.presentMembers || 0
        ),

      lateMembers:
        Number(
          form.lateMembers || 0
        ),

      absentMembers:
        Number(
          form.absentMembers || 0
        ),

      sprintProgress:
        Number(
          form.sprintProgress || 0
        ),

      completedWork:
        form.completedWork.trim(),

      blockers:
        form.blockers.trim(),

      nextPlan:
        form.nextPlan.trim(),

      status:
        form.status,

      managerRemarks:
        form.managerRemarks.trim(),
    };

    try {
      setSaving(true);

      if (editingId) {
        const response =
          await axios.put(
            `${SCRUM_API_URL}/${editingId}`,
            payload
          );

        const updatedReview =
          response.data?.data;

        if (!updatedReview) {
          throw new Error(
            "Updated Scrum Review was not returned."
          );
        }

        setReviews((previous) =>
          previous.map(
            (item) =>
              String(
                item._id ||
                  item.id
              ) ===
              String(editingId)
                ? updatedReview
                : item
          )
        );

        showToast(
          "Scrum Review updated successfully."
        );
      } else {
        const response =
          await axios.post(
            SCRUM_API_URL,
            payload
          );

        const newReview =
          response.data?.data;

        if (!newReview) {
          throw new Error(
            "Created Scrum Review was not returned."
          );
        }

        setReviews((previous) => [
          newReview,
          ...previous,
        ]);

        showToast(
          "Scrum Review created successfully."
        );
      }

      setShowModal(false);
      setEditingId(null);

      setForm({
        ...emptyForm,
      });
    } catch (error) {
      console.error(
        "Scrum Review save error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          error.message ||
          "Unable to save Scrum Review.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async () => {
    if (
      !deleteTarget?._id &&
      !deleteTarget?.id
    ) {
      return;
    }

    const deleteId =
      deleteTarget._id ||
      deleteTarget.id;

    try {
      await axios.delete(
        `${SCRUM_API_URL}/${deleteId}`
      );

      setReviews((previous) =>
        previous.filter(
          (item) =>
            String(
              item._id ||
                item.id
            ) !==
            String(deleteId)
        )
      );

      setDeleteTarget(null);

      showToast(
        "Scrum Review deleted successfully."
      );
    } catch (error) {
      console.error(
        "Scrum Review delete error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Unable to delete Scrum Review.",
        "error"
      );
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "-";
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

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusStyle = (
    status
  ) => {
    if (
      status ===
      "Reviewed"
    ) {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }

    if (
      status ===
      "Needs Attention"
    ) {
      return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
  };

  // ============================================================
  // PERFORMANCE LABEL
  // ============================================================

  const getPerformanceLabel = (
    progress
  ) => {
    if (progress >= 80) {
      return "Excellent";
    }

    if (progress >= 60) {
      return "On Track";
    }

    if (progress >= 40) {
      return "Stable";
    }

    return "Needs Attention";
  };

  // ============================================================
  // TEAM OPTIONS
  // ============================================================

  const teamOptions = useMemo(() => {
    return [...teams].sort((a, b) =>
      String(
        a.teamName ||
          a.name ||
          ""
      ).localeCompare(
        String(
          b.teamName ||
            b.name ||
            ""
        )
      )
    );
  }, [teams]);

  // ============================================================
  // PROJECT OPTIONS
  // ============================================================

  const projectOptions = useMemo(() => {
    return [...projects].sort(
      (a, b) =>
        String(
          a.name ||
            a.projectName ||
            ""
        ).localeCompare(
          String(
            b.name ||
              b.projectName ||
              ""
          )
        )
    );
  }, [projects]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">

      {/* ======================================================
          INTERN DAILY SCRUM REVIEW
          Added during integration: the scrums interns submit on
          their Daily Scrum page arrive here for review.
      ====================================================== */}

      <InternScrumReview />
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <section className="mb-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-white text-[#2563EB] shadow-sm">
                <ClipboardCheck
                  size={18}
                />
              </div>

              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563EB]">
                Team Performance
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-[#172033] sm:text-3xl">
              Scrum Review
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
              Review team Scrum meetings,
              monitor attendance,
              track sprint progress and
              identify blockers.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#0E2A52] px-5 text-sm font-bold text-white shadow-lg shadow-blue-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626]" />

            <Plus
              size={18}
              className="transition-transform duration-300 group-hover:rotate-90"
            />

            Add Scrum Review
          </button>
        </div>
      </section>

      {/* ====================================================== */}
      {/* KPI CARDS */}
      {/* ====================================================== */}

      <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={ClipboardCheck}
          title="Total Reviews"
          value={stats.total}
          iconClass="text-[#2563EB]"
          softClass="bg-blue-50"
        />

        <MetricCard
          icon={UsersRound}
          title="Teams Covered"
          value={stats.teams}
          iconClass="text-[#0891B2]"
          softClass="bg-cyan-50"
        />

        <MetricCard
          icon={TrendingUp}
          title="Average Progress"
          value={`${stats.averageProgress}%`}
          iconClass="text-[#2563EB]"
          softClass="bg-blue-50"
        />

        <MetricCard
          icon={ShieldAlert}
          title="Active Blockers"
          value={stats.blockers}
          iconClass="text-[#DC2626]"
          softClass="bg-red-50"
        />

        <MetricCard
          icon={Clock3}
          title="Pending Review"
          value={stats.pending}
          iconClass="text-[#F59E0B]"
          softClass="bg-amber-50"
        />
      </section>

      {/* ====================================================== */}
      {/* FILTER BAR */}
      {/* ====================================================== */}

      <section className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-[3px] bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626]" />

        <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search team, project, sprint or blocker..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-[#FBFCFE] pl-10 pr-4 text-sm text-[#172033] outline-none transition-all placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <FilterSelect
            value={teamFilter}
            onChange={setTeamFilter}
            label="All Teams"
            options={teamOptions.map(
              (team) => ({
                value:
                  team._id ||
                  team.id,
                label:
                  team.teamName ||
                  team.name ||
                  "Unnamed Team",
              })
            )}
          />

          <FilterSelect
            value={projectFilter}
            onChange={setProjectFilter}
            label="All Projects"
            options={projectOptions.map(
              (project) => ({
                value:
                  project._id ||
                  project.id,
                label:
                  project.name ||
                  project.projectName ||
                  "Unnamed Project",
              })
            )}
          />

          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            label="All Status"
            options={[
              {
                value: "Pending",
                label: "Pending",
              },
              {
                value: "Reviewed",
                label: "Reviewed",
              },
              {
                value: "Needs Attention",
                label: "Needs Attention",
              },
            ]}
          />
        </div>
      </section>

      {/* ====================================================== */}
      {/* MAIN */}
      {/* ====================================================== */}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.58fr)_minmax(340px,0.82fr)]">
        {/* ==================================================== */}
        {/* TEAM REVIEWS */}
        {/* ==================================================== */}

        <section className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">
                Team Reviews
              </p>

              <h2 className="mt-1 text-xl font-black text-[#172033]">
                Scrum Meetings
              </h2>

              <p className="mt-1 text-xs text-[#64748B]">
                Latest Scrum record for
                each team.
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-[#2563EB]">
              {teamGroups.length} Teams
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 text-sm font-semibold text-[#64748B]">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#2563EB]" />
                Loading Scrum Reviews...
              </div>
            </div>
          ) : teamGroups.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-[#2563EB]">
                <ClipboardCheck
                  size={27}
                />
              </div>

              <h3 className="mt-4 text-lg font-black text-[#172033]">
                No Scrum Reviews Found
              </h3>

              <p className="mt-1 max-w-md text-sm leading-6 text-[#64748B]">
                Try changing the current
                filters or add a new team
                Scrum Review.
              </p>

              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0E2A52] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0B2345]"
              >
                <Plus size={15} />
                Add Review
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {teamGroups.map(
                (group) => (
                  <TeamScrumBlock
                    key={
                      group.teamId ||
                      group.teamName
                    }
                    group={group}
                    onView={
                      openDetailsModal
                    }
                    onEdit={
                      openEditModal
                    }
                    onDelete={
                      setDeleteTarget
                    }
                    formatDate={
                      formatDate
                    }
                    getStatusStyle={
                      getStatusStyle
                    }
                    getPerformanceLabel={
                      getPerformanceLabel
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* ==================================================== */}
        {/* RIGHT ANALYTICS */}
        {/* ==================================================== */}

        <aside className="min-w-0 space-y-6">
          <PerformancePanel
            performanceData={
              performanceData
            }
            stats={stats}
            getPerformanceLabel={
              getPerformanceLabel
            }
          />

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-[3px] bg-gradient-to-r from-[#DC2626] via-[#22D3EE] to-[#2563EB]" />

            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-[#DC2626]">
                  <Target size={18} />
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#DC2626]">
                    Scrum Insight
                  </p>

                  <h3 className="mt-1 text-lg font-black text-[#172033]">
                    Current Signal
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#64748B]">
                    Quick health summary of
                    the current Scrum cycle.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <InsightTile
                  icon={TrendingUp}
                  label="Avg Progress"
                  value={`${stats.averageProgress}%`}
                  iconClass="text-[#2563EB]"
                  backgroundClass="bg-blue-50"
                />

                <InsightTile
                  icon={ShieldAlert}
                  label="Blockers"
                  value={stats.blockers}
                  iconClass="text-[#DC2626]"
                  backgroundClass="bg-red-50"
                />

                <InsightTile
                  icon={CircleCheckBig}
                  label="Reviewed"
                  value={stats.reviewed}
                  iconClass="text-[#0891B2]"
                  backgroundClass="bg-cyan-50"
                />

                <InsightTile
                  icon={Clock3}
                  label="Pending"
                  value={stats.pending}
                  iconClass="text-[#F59E0B]"
                  backgroundClass="bg-amber-50"
                />
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* ====================================================== */}
      {/* ADD / EDIT MODAL */}
      {/* ====================================================== */}

      {showModal && (
        <ModalOverlay>
          <div className="relative max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="h-[3px] bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626]" />

            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">
                  Team Scrum Record
                </p>

                <h2 className="mt-1 text-xl font-black text-[#172033]">
                  {editingId
                    ? "Edit Scrum Review"
                    : "Add Scrum Review"}
                </h2>

                <p className="mt-1 text-sm text-[#64748B]">
                  Record the meeting,
                  attendance and sprint
                  progress at team level.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-200 p-2 text-[#64748B] transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#172033]"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-7 p-6"
            >
              {/* TEAM */}

              <FormSection
                icon={UsersRound}
                title="Team Assignment"
                subtitle="Select the team and project being reviewed."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField
                    label="Team"
                    required
                  >
                    <select
                      value={
                        form.teamId
                      }
                      onChange={(event) =>
                        handleTeamChange(
                          event
                            .target
                            .value
                        )
                      }
                      className="form-input"
                    >
                      <option value="">
                        Select team
                      </option>

                      {teamOptions.map(
                        (team) => {
                          const id =
                            team._id ||
                            team.id;

                          return (
                            <option
                              key={id}
                              value={id}
                            >
                              {team.teamName ||
                                team.name ||
                                "Unnamed Team"}
                            </option>
                          );
                        }
                      )}
                    </select>
                  </FormField>

                  <FormField
                    label="Project"
                    required
                  >
                    <select
                      value={
                        form.projectId
                      }
                      onChange={(event) =>
                        handleProjectChange(
                          event
                            .target
                            .value
                        )
                      }
                      className="form-input"
                    >
                      <option value="">
                        Select project
                      </option>

                      {projectOptions.map(
                        (
                          project
                        ) => {
                          const id =
                            project._id ||
                            project.id;

                          return (
                            <option
                              key={id}
                              value={id}
                            >
                              {project.name ||
                                project.projectName ||
                                "Unnamed Project"}
                            </option>
                          );
                        }
                      )}
                    </select>
                  </FormField>
                </div>
              </FormSection>

              {/* MEETING */}

              <FormSection
                icon={CalendarDays}
                title="Meeting Information"
                subtitle="Set the Scrum type, date and sprint context."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <FormField
                    label="Scrum Date"
                    required
                  >
                    <input
                      type="date"
                      name="scrumDate"
                      value={
                        form.scrumDate
                      }
                      onChange={
                        handleChange
                      }
                      className="form-input"
                    />
                  </FormField>

                  <FormField label="Scrum Type">
                    <select
                      name="scrumType"
                      value={
                        form.scrumType
                      }
                      onChange={
                        handleChange
                      }
                      className="form-input"
                    >
                      <option value="Daily Scrum">
                        Daily Scrum
                      </option>

                      <option value="Sprint Review">
                        Sprint Review
                      </option>

                      <option value="Sprint Retrospective">
                        Sprint Retrospective
                      </option>

                      <option value="Sprint Planning">
                        Sprint Planning
                      </option>
                    </select>
                  </FormField>

                  <FormField
                    label="Sprint / Week"
                    required
                  >
                    <input
                      type="text"
                      name="sprintName"
                      value={
                        form.sprintName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Sprint 04"
                      className="form-input"
                    />
                  </FormField>
                </div>
              </FormSection>

              {/* ATTENDANCE */}

              <FormSection
                icon={UsersRound}
                title="Team Attendance"
                subtitle="Attendance is recorded at team level."
              >
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <NumberField
                    label="Total Members"
                    value={
                      form.totalMembers
                    }
                    readOnly
                  />

                  <NumberField
                    label="Present"
                    name="presentMembers"
                    value={
                      form.presentMembers
                    }
                    onChange={
                      handleChange
                    }
                    max={
                      form.totalMembers
                    }
                  />

                  <NumberField
                    label="Late"
                    name="lateMembers"
                    value={
                      form.lateMembers
                    }
                    onChange={
                      handleChange
                    }
                    max={
                      form.totalMembers
                    }
                  />

                  <NumberField
                    label="Absent"
                    value={
                      form.absentMembers
                    }
                    readOnly
                  />
                </div>
              </FormSection>

              {/* PROGRESS */}

              <FormSection
                icon={Gauge}
                title="Sprint Progress"
                subtitle="Track the current completion level for the team."
              >
                <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">
                        Current Progress
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#172033]">
                        Team sprint completion
                      </p>
                    </div>

                    <span className="text-2xl font-black text-[#2563EB]">
                      {
                        form.sprintProgress
                      }
                      %
                    </span>
                  </div>

                  <input
                    type="range"
                    name="sprintProgress"
                    min="0"
                    max="100"
                    value={
                      form.sprintProgress
                    }
                    onChange={
                      handleChange
                    }
                    className="mt-5 w-full accent-blue-600"
                  />

                  <div className="mt-2 flex justify-between text-[10px] font-bold text-[#94A3B8]">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </FormSection>

              {/* DISCUSSION */}

              <FormSection
                icon={MessageSquareText}
                title="Scrum Discussion"
                subtitle="Capture completed work, blockers and next steps."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField
                    label="Completed Work"
                    required
                  >
                    <textarea
                      name="completedWork"
                      value={
                        form.completedWork
                      }
                      onChange={
                        handleChange
                      }
                      rows={5}
                      placeholder="What did the team complete?"
                      className="form-input resize-none"
                    />
                  </FormField>

                  <FormField label="Blockers / Issues">
                    <textarea
                      name="blockers"
                      value={
                        form.blockers
                      }
                      onChange={
                        handleChange
                      }
                      rows={5}
                      placeholder="Mention blockers, risks or issues..."
                      className="form-input resize-none"
                    />
                  </FormField>
                </div>
              </FormSection>

              {/* NEXT PLAN */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  label="Next Plan"
                  required
                >
                  <textarea
                    name="nextPlan"
                    value={
                      form.nextPlan
                    }
                    onChange={
                      handleChange
                    }
                    rows={4}
                    placeholder="What will the team work on next?"
                    className="form-input resize-none"
                  />
                </FormField>

                <div className="space-y-5">
                  <FormField
                    label="Review Status"
                    required
                  >
                    <select
                      name="status"
                      value={
                        form.status
                      }
                      onChange={
                        handleChange
                      }
                      className="form-input"
                    >
                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Reviewed">
                        Reviewed
                      </option>

                      <option value="Needs Attention">
                        Needs Attention
                      </option>
                    </select>
                  </FormField>

                  <FormField label="Manager Remarks">
                    <input
                      type="text"
                      name="managerRemarks"
                      value={
                        form.managerRemarks
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Optional manager feedback"
                      className="form-input"
                    />
                  </FormField>
                </div>
              </div>

              {/* SUMMARY */}

              <div className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/40">
                <div className="flex items-center gap-2 border-b border-blue-100 px-4 py-3">
                  <MessageSquareText
                    size={16}
                    className="text-[#2563EB]"
                  />

                  <p className="text-sm font-bold text-[#172033]">
                    Review Summary
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                  <SummaryMini
                    label="Members"
                    value={
                      form.totalMembers
                    }
                  />

                  <SummaryMini
                    label="Present"
                    value={
                      form.presentMembers
                    }
                  />

                  <SummaryMini
                    label="Absent"
                    value={
                      form.absentMembers
                    }
                  />

                  <SummaryMini
                    label="Progress"
                    value={`${form.sprintProgress}%`}
                  />
                </div>
              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-[#64748B] transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#0E2A52] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0B2345] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Review"
                    : "Create Review"}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* ====================================================== */}
      {/* DETAILS MODAL */}
      {/* ====================================================== */}

      {showDetails &&
        selectedReview && (
          <ModalOverlay>
            <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
              <div className="h-[3px] bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626]" />

              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#2563EB]">
                    Scrum Meeting
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#172033]">
                    {
                      selectedReview.teamName
                    }
                  </h2>

                  <p className="mt-1 text-sm text-[#64748B]">
                    {
                      selectedReview.projectName ||
                      "Unassigned Project"
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeDetails
                  }
                  className="rounded-xl border border-slate-200 p-2 text-[#64748B] transition hover:bg-slate-50"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="space-y-5 p-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <DetailStat
                    icon={
                      CalendarDays
                    }
                    label="Date"
                    value={formatDate(
                      selectedReview.scrumDate
                    )}
                  />

                  <DetailStat
                    icon={Layers3}
                    label="Sprint"
                    value={
                      selectedReview.sprintName ||
                      "-"
                    }
                  />

                  <DetailStat
                    icon={
                      UsersRound
                    }
                    label="Members"
                    value={
                      selectedReview.totalMembers ||
                      0
                    }
                  />

                  <DetailStat
                    icon={
                      TrendingUp
                    }
                    label="Progress"
                    value={`${Number(
                      selectedReview.sprintProgress ||
                        0
                    )}%`}
                  />
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#F8FAFC]">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <p className="text-sm font-black text-[#172033]">
                      Attendance
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-4">
                    <AttendanceMini
                      label="Present"
                      value={
                        selectedReview.presentMembers ||
                        0
                      }
                      className="border-cyan-100 bg-cyan-50 text-cyan-700"
                    />

                    <AttendanceMini
                      label="Late"
                      value={
                        selectedReview.lateMembers ||
                        0
                      }
                      className="border-amber-100 bg-amber-50 text-amber-700"
                    />

                    <AttendanceMini
                      label="Absent"
                      value={
                        selectedReview.absentMembers ||
                        0
                      }
                      className="border-red-100 bg-red-50 text-red-700"
                    />
                  </div>
                </div>

                <DetailText
                  label="Completed Work"
                  value={
                    selectedReview.completedWork
                  }
                />

                <DetailText
                  label="Blockers / Issues"
                  value={
                    selectedReview.blockers ||
                    "No blockers reported."
                  }
                />

                <DetailText
                  label="Next Plan"
                  value={
                    selectedReview.nextPlan
                  }
                />

                <DetailText
                  label="Manager Remarks"
                  value={
                    selectedReview.managerRemarks ||
                    "No manager remarks."
                  }
                />
              </div>
            </div>
          </ModalOverlay>
        )}

      {/* ====================================================== */}
      {/* DELETE MODAL */}
      {/* ====================================================== */}

      {deleteTarget && (
        <ModalOverlay>
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="h-[3px] bg-gradient-to-r from-[#DC2626] via-[#EF4444] to-[#2563EB]" />

            <div className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-[#DC2626]">
                <Trash2 size={21} />
              </div>

              <h2 className="mt-4 text-xl font-black text-[#172033]">
                Delete Scrum Review?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                Are you sure you want to
                delete the Scrum Review for{" "}
                <span className="font-bold text-[#172033]">
                  {deleteTarget.teamName ||
                    "this team"}
                </span>
                ?
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget(
                      null
                    )
                  }
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-[#64748B] transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleDelete
                  }
                  className="rounded-xl bg-[#DC2626] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B91C1C]"
                >
                  Delete Review
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ====================================================== */}
      {/* TOAST */}
      {/* ====================================================== */}

      {toast.show && (
        <div
          className={`fixed bottom-5 right-5 z-[80] flex max-w-sm items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl ${
            toast.type === "error"
              ? "border-red-200"
              : "border-blue-200"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              toast.type === "error"
                ? "bg-[#DC2626]"
                : "bg-[#2563EB]"
            }`}
          />

          <p className="text-sm font-bold text-[#172033]">
            {toast.message}
          </p>
        </div>
      )}

      {/* ====================================================== */}
      {/* FORM STYLES */}
      {/* ====================================================== */}

      <style>{`
        .form-input {
          width: 100%;
          min-height: 44px;
          border-radius: 0.75rem;
          border: 1px solid #E2E8F0;
          background: #FBFCFE;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #172033;
          outline: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background-color 0.2s ease;
        }

        .form-input:hover {
          border-color: #CBD5E1;
        }

        .form-input:focus {
          border-color: #2563EB;
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        textarea.form-input {
          min-height: auto;
        }

        select.form-input {
          cursor: pointer;
        }

        input[type="range"] {
          accent-color: #2563EB;
        }
      `}</style>
    </div>
  );
}

// ============================================================
// PERFORMANCE PANEL
// ============================================================

function PerformancePanel({
  performanceData,
  stats,
  getPerformanceLabel,
}) {
  const progress = Math.min(
    Math.max(
      Number(
        stats.averageProgress ||
          0
      ),
      0
    ),
    100
  );

  const attendanceAverage =
    performanceData.length > 0
      ? Math.round(
          performanceData.reduce(
            (total, item) =>
              total +
              Number(
                item.attendance || 0
              ),
            0
          ) /
            performanceData.length
        )
      : 0;

  const radius = 70;

  const circumference =
    2 *
    Math.PI *
    radius;

  const progressOffset =
    circumference -
    (progress / 100) *
      circumference;

  const attendanceRadius =
    52;

  const attendanceCircumference =
    2 *
    Math.PI *
    attendanceRadius;

  const attendanceOffset =
    attendanceCircumference -
    (attendanceAverage /
      100) *
      attendanceCircumference;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* TOP STROKE */}

      <div className="h-[3px] bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626]" />

      <div className="p-5">
        {/* HEADER */}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#2563EB]">
              Team Analytics
            </p>

            <h2 className="mt-1 text-lg font-black text-[#172033]">
              Performance Overview
            </h2>

            <p className="mt-1 text-xs leading-5 text-[#64748B]">
              Overall sprint health across
              reviewed teams.
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#2563EB]">
            <BarChart3 size={18} />
          </div>
        </div>

        {/* DOUBLE DONUT */}

        <div className="mt-6 flex justify-center">
          <div className="relative h-[205px] w-[205px]">
            <svg
              viewBox="0 0 205 205"
              className="h-full w-full -rotate-90"
            >
              {/* OUTER TRACK */}

              <circle
                cx="102.5"
                cy="102.5"
                r={radius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="14"
              />

              {/* OUTER PROGRESS */}

              <circle
                cx="102.5"
                cy="102.5"
                r={radius}
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={
                  circumference
                }
                strokeDashoffset={
                  progressOffset
                }
                style={{
                  transition:
                    "stroke-dashoffset 0.8s ease",
                }}
              />

              {/* INNER TRACK */}

              <circle
                cx="102.5"
                cy="102.5"
                r={
                  attendanceRadius
                }
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="10"
              />

              {/* INNER ATTENDANCE */}

              <circle
                cx="102.5"
                cy="102.5"
                r={
                  attendanceRadius
                }
                fill="none"
                stroke="#0891B2"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={
                  attendanceCircumference
                }
                strokeDashoffset={
                  attendanceOffset
                }
                style={{
                  transition:
                    "stroke-dashoffset 0.8s ease",
                }}
              />

              <defs>
                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="#2563EB"
                  />

                  <stop
                    offset="50%"
                    stopColor="#22D3EE"
                  />

                  <stop
                    offset="100%"
                    stopColor="#DC2626"
                  />
                </linearGradient>
              </defs>
            </svg>

            {/* CENTER */}

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#94A3B8]">
                Avg Progress
              </span>

              <span className="mt-1 text-3xl font-black tracking-tight text-[#172033]">
                {progress}%
              </span>

              <span className="mt-1 rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black text-[#2563EB]">
                {getPerformanceLabel(
                  progress
                )}
              </span>
            </div>
          </div>
        </div>

        {/* DONUT LEGEND */}

        <div className="mt-2 flex items-center justify-center gap-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#2563EB] to-[#DC2626]" />

            <span className="text-[10px] font-bold text-[#64748B]">
              Progress
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0891B2]" />

            <span className="text-[10px] font-bold text-[#64748B]">
              Attendance
            </span>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="mt-6 grid grid-cols-3 gap-2">
          <AnalyticsBox
            label="Teams"
            value={stats.teams}
            icon={UsersRound}
            iconClass="text-[#2563EB]"
            backgroundClass="bg-blue-50"
          />

          <AnalyticsBox
            label="Attendance"
            value={`${attendanceAverage}%`}
            icon={UserCheck}
            iconClass="text-[#0891B2]"
            backgroundClass="bg-cyan-50"
          />

          <AnalyticsBox
            label="Blockers"
            value={stats.blockers}
            icon={AlertTriangle}
            iconClass="text-[#DC2626]"
            backgroundClass="bg-red-50"
          />
        </div>

        {/* TEAM BREAKDOWN */}

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#64748B]">
                Team Breakdown
              </p>

              <p className="mt-0.5 text-xs text-[#94A3B8]">
                Highest performing teams
              </p>
            </div>

            <Activity
              size={16}
              className="text-[#2563EB]"
            />
          </div>

          {performanceData.length ===
          0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-[#FBFCFE] p-6 text-center">
              <Activity
                size={22}
                className="mx-auto text-slate-300"
              />

              <p className="mt-2 text-sm font-bold text-[#172033]">
                No team data
              </p>

              <p className="mt-1 text-xs text-[#64748B]">
                Add Scrum Reviews to see
                performance.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {performanceData
                .slice(0, 5)
                .map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item.teamName
                      }
                      className="group rounded-xl border border-slate-200 bg-[#FBFCFE] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-[#64748B]">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black text-[#172033]">
                            {
                              item.teamName
                            }
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-[#64748B]">
                              {getPerformanceLabel(
                                item.progress
                              )}
                            </span>

                            {item.blockers >
                              0 && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />

                                <span className="text-[10px] font-bold text-[#DC2626]">
                                  {
                                    item.blockers
                                  }{" "}
                                  blocker
                                  {item.blockers !==
                                  1
                                    ? "s"
                                    : ""}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="w-20 shrink-0">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-[#94A3B8]">
                              Progress
                            </span>

                            <span className="text-[10px] font-black text-[#2563EB]">
                              {
                                item.progress
                              }
                              %
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626]"
                              style={{
                                width: `${item.progress}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// ANALYTICS BOX
// ============================================================

function AnalyticsBox({
  label,
  value,
  icon: Icon,
  iconClass,
  backgroundClass,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-[#FBFCFE] p-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${backgroundClass}`}
      >
        <Icon
          size={15}
          className={iconClass}
        />
      </div>

      <p className="mt-2 text-[9px] font-black uppercase tracking-wide text-[#94A3B8]">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-[#172033]">
        {value}
      </p>
    </div>
  );
}

// ============================================================
// TEAM SCRUM BLOCK
// ============================================================

function TeamScrumBlock({
  group,
  onView,
  onEdit,
  onDelete,
  formatDate,
  getStatusStyle,
  getPerformanceLabel,
}) {
  const latestReview =
    [...group.reviews].sort(
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
    )[0];

  const progress =
    Number(
      latestReview?.sprintProgress ||
        latestReview?.progress ||
        0
    );

  const totalMembers =
    Number(
      latestReview?.totalMembers ||
        0
    );

  const present =
    Number(
      latestReview?.presentMembers ||
        0
    );

  const late =
    Number(
      latestReview?.lateMembers ||
        0
    );

  const absent =
    Number(
      latestReview?.absentMembers ||
        Math.max(
          totalMembers -
            present -
            late,
          0
        )
    );

  const attendance =
    totalMembers > 0
      ? Math.round(
          ((present + late) /
            totalMembers) *
            100
        )
      : 0;

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626] p-[1px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="rounded-[15px] bg-white">
        <div className="p-5">
          {/* HEADER */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#2563EB] transition duration-300 group-hover:scale-105">
                <UsersRound size={21} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#64748B]">
                    Team
                  </span>

                  <span className="text-[10px] font-bold text-[#94A3B8]">
                    {latestReview?.scrumType ||
                      "Daily Scrum"}
                  </span>
                </div>

                <h3 className="mt-2 truncate text-lg font-black text-[#172033]">
                  {
                    group.teamName
                  }
                </h3>

                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#64748B]">
                  <Layers3
                    size={13}
                    className="shrink-0 text-[#2563EB]"
                  />

                  <span className="truncate">
                    {latestReview?.projectName ||
                      group.projectName ||
                      "Unassigned Project"}
                  </span>
                </div>
              </div>
            </div>

            <span
              className={`self-start rounded-full border px-3 py-1.5 text-[10px] font-black ${getStatusStyle(
                latestReview?.status
              )}`}
            >
              {latestReview?.status ||
                "Pending"}
            </span>
          </div>

          {/* QUICK STATS */}

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TeamMetric
              icon={UsersRound}
              label="Members"
              value={
                totalMembers
              }
              iconClass="text-[#2563EB]"
              backgroundClass="bg-blue-50"
            />

            <TeamMetric
              icon={CheckCircle2}
              label="Present"
              value={present}
              iconClass="text-[#0891B2]"
              backgroundClass="bg-cyan-50"
            />

            <TeamMetric
              icon={Clock3}
              label="Late"
              value={late}
              iconClass="text-[#F59E0B]"
              backgroundClass="bg-amber-50"
            />

            <TeamMetric
              icon={AlertTriangle}
              label="Absent"
              value={absent}
              iconClass="text-[#DC2626]"
              backgroundClass="bg-red-50"
            />
          </div>

          {/* PROGRESS / ATTENDANCE */}

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_160px]">
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Sprint Progress
                  </p>

                  <p className="mt-1 text-xs font-bold text-[#172033]">
                    {getPerformanceLabel(
                      progress
                    )}
                  </p>
                </div>

                <span className="text-lg font-black text-[#2563EB]">
                  {progress}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626] transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Attendance
                </p>

                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    attendance >=
                    75
                      ? "bg-[#0891B2]"
                      : "bg-[#DC2626]"
                  }`}
                />
              </div>

              <p className="mt-2 text-xl font-black text-[#172033]">
                {attendance}%
              </p>

              <p className="mt-0.5 text-[10px] font-semibold text-[#64748B]">
                present + late
              </p>
            </div>
          </div>

          {/* SCRUM CONTENT */}

          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <ReviewContent
              title="Completed Work"
              value={
                latestReview?.completedWork ||
                "No update recorded."
              }
            />

            <ReviewContent
              title="Blockers / Issues"
              value={
                latestReview?.blockers ||
                "No blockers reported."
              }
              danger={Boolean(
                String(
                  latestReview?.blockers ||
                    ""
                ).trim()
              )}
            />

            <ReviewContent
              title="Next Plan"
              value={
                latestReview?.nextPlan ||
                "No next plan recorded."
              }
            />
          </div>

          {/* FOOTER */}

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-[#64748B]">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays
                  size={13}
                />

                {formatDate(
                  latestReview?.scrumDate
                )}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Layers3 size={13} />

                {latestReview?.sprintName ||
                  "Sprint"}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Activity size={13} />

                {group.reviews.length}{" "}
                review
                {group.reviews.length !==
                1
                  ? "s"
                  : ""}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <SmallAction
                icon={Eye}
                title="View"
                onClick={() =>
                  onView(
                    latestReview
                  )
                }
              />

              <SmallAction
                icon={Pencil}
                title="Edit"
                onClick={() =>
                  onEdit(
                    latestReview
                  )
                }
              />

              <SmallAction
                icon={Trash2}
                title="Delete"
                danger
                onClick={() =>
                  onDelete(
                    latestReview
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// ============================================================
// TEAM METRIC
// ============================================================

function TeamMetric({
  icon: Icon,
  label,
  value,
  iconClass,
  backgroundClass,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 transition-all duration-200 hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${backgroundClass}`}
        >
          <Icon
            size={14}
            className={iconClass}
          />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xl font-black text-[#172033]">
        {value}
      </p>
    </div>
  );
}

// ============================================================
// REVIEW CONTENT
// ============================================================

function ReviewContent({
  title,
  value,
  danger = false,
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        danger
          ? "border-red-100 bg-red-50/60"
          : "border-slate-200 bg-[#F8FAFC]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={`text-[11px] font-black ${
            danger
              ? "text-red-700"
              : "text-[#172033]"
          }`}
        >
          {title}
        </p>

        {danger && (
          <AlertTriangle
            size={14}
            className="text-[#DC2626]"
          />
        )}
      </div>

      <p
        className={`mt-2 line-clamp-4 text-xs leading-5 ${
          danger
            ? "text-red-700"
            : "text-[#64748B]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// FORM SECTION
// ============================================================

function FormSection({
  icon: Icon,
  title,
  subtitle,
  children,
}) {
  return (
    <section>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#2563EB]">
          <Icon size={16} />
        </div>

        <div>
          <p className="text-sm font-black text-[#172033]">
            {title}
          </p>

          <p className="mt-0.5 text-xs text-[#64748B]">
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

// ============================================================
// FORM FIELD
// ============================================================

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-[#172033]">
        {label}

        {required && (
          <span className="ml-1 text-[#DC2626]">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

// ============================================================
// NUMBER FIELD
// ============================================================

function NumberField({
  label,
  name,
  value,
  onChange,
  readOnly = false,
  max,
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-wide text-[#64748B]">
        {label}
      </label>

      <input
        type="number"
        name={name}
        min="0"
        max={max}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`form-input text-center text-lg font-black ${
          readOnly
            ? "bg-[#F1F5F9] text-[#64748B]"
            : ""
        }`}
      />
    </div>
  );
}

// ============================================================
// SUMMARY MINI
// ============================================================

function SummaryMini({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-[#172033]">
        {value}
      </p>
    </div>
  );
}

// ============================================================
// DETAIL STAT
// ============================================================

function DetailStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3">
      <Icon
        size={16}
        className="text-[#2563EB]"
      />

      <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold text-[#172033]">
        {value}
      </p>
    </div>
  );
}

// ============================================================
// ATTENDANCE MINI
// ============================================================

function AttendanceMini({
  label,
  value,
  className,
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${className}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide">
        {label}
      </p>

      <p className="mt-1 text-xl font-black">
        {value}
      </p>
    </div>
  );
}

// ============================================================
// DETAIL TEXT
// ============================================================

function DetailText({
  label,
  value,
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold text-[#172033]">
        {label}
      </p>

      <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-sm leading-6 text-[#64748B]">
        {value || "-"}
      </div>
    </div>
  );
}

// ============================================================
// SMALL ACTION
// ============================================================

function SmallAction({
  icon: Icon,
  title,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-lg border p-2.5 transition-all duration-200 ${
        danger
          ? "border-red-100 bg-white text-red-500 hover:border-red-200 hover:bg-red-50"
          : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      <Icon size={15} />
    </button>
  );
}

// ============================================================
// INSIGHT TILE
// ============================================================

function InsightTile({
  icon: Icon,
  label,
  value,
  iconClass,
  backgroundClass,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-[#FBFCFE] p-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${backgroundClass}`}
      >
        <Icon
          size={15}
          className={iconClass}
        />
      </div>

      <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-[#172033]">
        {value}
      </p>
    </div>
  );
}

// ============================================================
// FILTER SELECT
// ============================================================

function FilterSelect({
  value,
  onChange,
  label,
  options,
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      className="h-11 rounded-xl border border-slate-200 bg-[#FBFCFE] px-4 text-sm font-semibold text-[#172033] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
    >
      <option value="All">
        {label}
      </option>

      {options.map(
        (option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        )
      )}
    </select>
  );
}

// ============================================================
// METRIC CARD
// ============================================================

function MetricCard({
  icon: Icon,
  title,
  value,
  iconClass,
  softClass,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626] p-[1px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="rounded-[15px] bg-white">
        <div className="flex min-h-[116px] items-center justify-between gap-4 p-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
              {title}
            </p>

            <p className="mt-2 text-2xl font-black tracking-tight text-[#172033]">
              {value}
            </p>
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${softClass} ${iconClass} transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MODAL OVERLAY
// ============================================================

function ModalOverlay({
  children,
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#06152B]/60 p-4 backdrop-blur-sm">
      {children}
    </div>
  );
}

export default ScrumReview;

