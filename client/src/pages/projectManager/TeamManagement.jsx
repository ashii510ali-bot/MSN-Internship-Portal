
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  UsersRound,
  UserRoundCheck,
  Clock3,
  CircleCheck,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  FolderKanban,
  Building2,
  GraduationCap,
  Code2,
  CircleCheckBig,
  CircleX,
  UserPlus,
  ChevronDown,
} from "lucide-react";

const TEAM_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/project-manager/team";

const MENTORS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/auth/mentors";

// ============================================================
// DEFAULT FORM
// ============================================================

const defaultForm = {
  teamName: "",
  memberCount: 1,
  mentor: "",
  project: "",
  department: "Development",
  startDate: "",
  endDate: "",
  status: "Active",
  technologies: [],
  description: "",
  progress: 0,
};

// ============================================================
// STATUS STYLES
// ============================================================

const statusStyles = {
  Active: {
    badge: "bg-blue-50 text-[#2563EB] border-blue-200",
    dot: "bg-[#2563EB]",
  },

  Pending: {
    badge: "bg-amber-50 text-[#B45309] border-amber-200",
    dot: "bg-[#F59E0B]",
  },

  Completed: {
    badge: "bg-cyan-50 text-[#0891B2] border-cyan-200",
    dot: "bg-[#0891B2]",
  },

  Inactive: {
    badge: "bg-red-50 text-[#DC2626] border-red-200",
    dot: "bg-[#DC2626]",
  },
};

// ============================================================
// DATE FORMATTER
// ============================================================

const formatDate = (date) => {
  if (!date) return "Not set";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not set";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ============================================================
// TOAST
// ============================================================

function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed right-5 top-5 z-[100] flex w-[340px] items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl ${
        isSuccess
          ? "border-blue-200"
          : "border-red-200"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isSuccess
            ? "bg-blue-50 text-[#2563EB]"
            : "bg-red-50 text-[#DC2626]"
        }`}
      >
        {isSuccess ? (
          <CircleCheckBig size={21} />
        ) : (
          <CircleX size={21} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#172033]">
          {isSuccess ? "Success" : "Error"}
        </p>

        <p className="mt-1 text-sm leading-5 text-[#64748B]">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 text-[#94A3B8] transition hover:bg-slate-100 hover:text-[#172033]"
      >
        <X size={17} />
      </button>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626] p-[1px] transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-full rounded-[15px] bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#64748B]">
              {title}
            </p>

            <h3 className="mt-2 text-3xl font-bold text-[#172033]">
              {value}
            </h3>
          </div>

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
          >
            <Icon size={23} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TEAM CARD
// ============================================================

function TeamCard({
  team,
  onEdit,
  onDelete,
}) {
  const status =
    statusStyles[team.status] ||
    statusStyles.Active;

  const progress = Math.min(
    100,
    Math.max(
      0,
      Number(team.progress) || 0
    )
  );

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626] p-[1px] transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="rounded-[15px] bg-white">
        {/* Gradient top stroke */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#EF4444]" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                <UsersRound size={23} />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-[#172033]">
                  {team.teamName ||
                    team.name ||
                    "Unnamed Team"}
                </h3>

                <p className="mt-1 text-xs text-[#64748B]">
                  {team.department ||
                    "Development"}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.badge}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
              />

              {team.status || "Active"}
            </span>
          </div>

          {/* Information Grid */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div className="flex items-center gap-2 text-[#64748B]">
                <UsersRound size={15} />

                <span className="text-xs">
                  Members
                </span>
              </div>

              <p className="mt-1 text-sm font-bold text-[#172033]">
                {team.memberCount || 0}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div className="flex items-center gap-2 text-[#64748B]">
                <GraduationCap size={15} />

                <span className="text-xs">
                  Mentor
                </span>
              </div>

              <p className="mt-1 truncate text-sm font-bold text-[#172033]">
                {team.mentor ||
                  "Unassigned"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div className="flex items-center gap-2 text-[#64748B]">
                <FolderKanban size={15} />

                <span className="text-xs">
                  Project
                </span>
              </div>

              <p className="mt-1 truncate text-sm font-bold text-[#172033]">
                {team.project ||
                  "Unassigned"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div className="flex items-center gap-2 text-[#64748B]">
                <Building2 size={15} />

                <span className="text-xs">
                  Department
                </span>
              </div>

              <p className="mt-1 truncate text-sm font-bold text-[#172033]">
                {team.department ||
                  "Development"}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-[#94A3B8]">
                Start Date
              </p>

              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#172033]">
                <CalendarDays
                  size={15}
                  className="text-[#2563EB]"
                />

                {formatDate(
                  team.startDate
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[#94A3B8]">
                End Date
              </p>

              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#172033]">
                <CalendarDays
                  size={15}
                  className="text-[#DC2626]"
                />

                {formatDate(
                  team.endDate
                )}
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2">
              <Code2
                size={15}
                className="text-[#0891B2]"
              />

              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Technologies Used
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {Array.isArray(
                team.technologies
              ) &&
              team.technologies.length > 0 ? (
                team.technologies.map(
                  (
                    technology,
                    index
                  ) => (
                    <span
                      key={`${technology}-${index}`}
                      className="rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-[#0891B2]"
                    >
                      {technology}
                    </span>
                  )
                )
              ) : (
                <span className="text-xs text-[#94A3B8]">
                  No technologies added
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {team.description && (
            <p className="mt-4 line-clamp-2 text-sm leading-5 text-[#64748B]">
              {team.description}
            </p>
          )}

          {/* Progress */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">
                Team Progress
              </span>

              <span className="text-xs font-bold text-[#172033]">
                {progress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#EF4444] transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center gap-2 border-t border-[#E2E8F0] pt-4">
            <button
              type="button"
              onClick={() =>
                onEdit(team)
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-[#2563EB] transition hover:bg-blue-100"
            >
              <Pencil size={16} />
              Edit
            </button>

            <button
              type="button"
              onClick={() =>
                onDelete(team)
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-[#DC2626] transition hover:bg-red-100"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

function TeamManagement() {
  const [teams, setTeams] = useState([]);

  const [mentors, setMentors] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingTeam, setEditingTeam] =
    useState(null);

  const [form, setForm] =
    useState(defaultForm);

  const [technologyInput, setTechnologyInput] =
    useState("");

  const [mentorMode, setMentorMode] =
    useState("dropdown");

  const [manualMentor, setManualMentor] =
    useState("");

  const [toast, setToast] =
    useState(null);

  // ============================================================
  // TOAST
  // ============================================================

  const showToast = (
    type,
    message
  ) => {
    setToast({
      type,
      message,
    });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // ============================================================
  // GET TEAMS
  // ============================================================

  const fetchTeams = async () => {
    try {
      setLoading(true);

      const response =
        await axios.get(
          TEAM_API_URL
        );

      const data =
        response.data?.data ||
        response.data ||
        [];

      setTeams(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch teams:",
        error
      );

      showToast(
        "error",
        "Failed to load teams."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GET MENTORS
  // ============================================================

  const fetchMentors = async () => {
    try {
      const response =
        await axios.get(
          MENTORS_API_URL
        );

      const data =
        response.data?.data ||
        response.data?.mentors ||
        response.data ||
        [];

      if (!Array.isArray(data)) {
        setMentors([]);
        return;
      }

      const formattedMentors =
        data.map((mentor) => ({
          id:
            mentor._id ||
            mentor.id,

          name:
            mentor.name ||
            mentor.fullName ||
            mentor.username ||
            mentor.email ||
            "Unnamed Mentor",
        }));

      setMentors(
        formattedMentors
      );
    } catch (error) {
      console.error(
        "Failed to fetch mentors:",
        error
      );

      setMentors([]);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchTeams();
    fetchMentors();
  }, []);

  // ============================================================
  // FILTER TEAMS
  // ============================================================

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const teamName =
        team.teamName ||
        team.name ||
        "";

      const mentor =
        team.mentor || "";

      const project =
        team.project || "";

      const search =
        searchTerm.toLowerCase();

      const matchesSearch =
        teamName
          .toLowerCase()
          .includes(search) ||
        mentor
          .toLowerCase()
          .includes(search) ||
        project
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        team.status ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    teams,
    searchTerm,
    statusFilter,
  ]);

  // ============================================================
  // STATS
  // ============================================================

  const stats = useMemo(() => {
    return {
      total: teams.length,

      active: teams.filter(
        (team) =>
          team.status === "Active"
      ).length,

      pending: teams.filter(
        (team) =>
          team.status === "Pending"
      ).length,

      completed: teams.filter(
        (team) =>
          team.status === "Completed"
      ).length,
    };
  }, [teams]);

  // ============================================================
  // CREATE MODAL
  // ============================================================

  const openCreateModal = () => {
    setEditingTeam(null);

    setForm({
      ...defaultForm,
      technologies: [],
    });

    setTechnologyInput("");

    setMentorMode("dropdown");

    setManualMentor("");

    setIsModalOpen(true);
  };

  // ============================================================
  // EDIT MODAL
  // ============================================================

  const openEditModal = (team) => {
    setEditingTeam(team);

    const teamMentor =
      team.mentor || "";

    const existingMentor =
      mentors.some(
        (mentor) =>
          mentor.name ===
          teamMentor
      );

    setMentorMode(
      existingMentor ||
        !teamMentor
        ? "dropdown"
        : "manual"
    );

    setManualMentor(
      existingMentor
        ? ""
        : teamMentor
    );

    setForm({
      teamName:
        team.teamName ||
        team.name ||
        "",

      memberCount:
        team.memberCount || 1,

      mentor:
        teamMentor,

      project:
        team.project || "",

      department:
        team.department ||
        "Development",

      startDate:
        team.startDate
          ? new Date(
              team.startDate
            )
              .toISOString()
              .split("T")[0]
          : "",

      endDate:
        team.endDate
          ? new Date(
              team.endDate
            )
              .toISOString()
              .split("T")[0]
          : "",

      status:
        team.status ||
        "Active",

      technologies:
        Array.isArray(
          team.technologies
        )
          ? team.technologies
          : [],

      description:
        team.description ||
        "",

      progress:
        team.progress || 0,
    });

    setTechnologyInput("");

    setIsModalOpen(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);

    setEditingTeam(null);

    setForm({
      ...defaultForm,
      technologies: [],
    });

    setTechnologyInput("");

    setMentorMode("dropdown");

    setManualMentor("");
  };

  // ============================================================
  // INPUT CHANGE
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
  // ADD TECHNOLOGY
  // ============================================================

  const addTechnology = () => {
    const technology =
      technologyInput.trim();

    if (!technology) return;

    const alreadyExists =
      form.technologies.some(
        (item) =>
          item.toLowerCase() ===
          technology.toLowerCase()
      );

    if (alreadyExists) {
      setTechnologyInput("");
      return;
    }

    setForm((previous) => ({
      ...previous,

      technologies: [
        ...previous.technologies,
        technology,
      ],
    }));

    setTechnologyInput("");
  };

  // ============================================================
  // REMOVE TECHNOLOGY
  // ============================================================

  const removeTechnology = (
    technology
  ) => {
    setForm((previous) => ({
      ...previous,

      technologies:
        previous.technologies.filter(
          (item) =>
            item !== technology
        ),
    }));
  };

  // ============================================================
  // TECHNOLOGY ENTER
  // ============================================================

  const handleTechnologyKeyDown = (
    event
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      addTechnology();
    }
  };

  // ============================================================
  // ADD / ASSIGN MANUAL MENTOR
  // ============================================================

  const handleAddManualMentor =
    () => {
      const mentorName =
        manualMentor.trim();

      if (!mentorName) {
        showToast(
          "error",
          "Please enter mentor name."
        );

        return;
      }

      setForm((previous) => ({
        ...previous,
        mentor: mentorName,
      }));

      setManualMentor(
        mentorName
      );

      showToast(
        "success",
        "Mentor added successfully."
      );
    };

  // ============================================================
  // SUBMIT FORM
  // ============================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!form.teamName.trim()) {
      showToast(
        "error",
        "Please enter a team name."
      );

      return;
    }

    if (
      !form.memberCount ||
      Number(form.memberCount) < 1
    ) {
      showToast(
        "error",
        "Members count must be at least 1."
      );

      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) <
        new Date(form.startDate)
    ) {
      showToast(
        "error",
        "End date cannot be before start date."
      );

      return;
    }

    // ========================================================
    // IMPORTANT MENTOR FIX
    // ========================================================

    let selectedMentor =
      form.mentor?.trim();

    if (!selectedMentor) {
      selectedMentor =
        manualMentor?.trim();
    }

    if (!selectedMentor) {
      selectedMentor =
        "Unassigned";
    }

    const payload = {
      teamName:
        form.teamName.trim(),

      memberCount:
        Number(form.memberCount),

      mentor:
        selectedMentor,

      project:
        form.project.trim() ||
        "Unassigned",

      department:
        form.department,

      startDate:
        form.startDate ||
        null,

      endDate:
        form.endDate ||
        null,

      status:
        form.status,

      technologies:
        form.technologies,

      description:
        form.description.trim(),

      progress:
        Number(form.progress) ||
        0,
    };

    try {
      setSaving(true);

      if (editingTeam) {
        await axios.put(
          `${TEAM_API_URL}/${editingTeam._id}`,
          payload
        );

        showToast(
          "success",
          "Team updated successfully."
        );
      } else {
        await axios.post(
          TEAM_API_URL,
          payload
        );

        showToast(
          "success",
          "Team created successfully."
        );
      }

      closeModal();

      await fetchTeams();
    } catch (error) {
      console.error(
        "Save team error:",
        error
      );

      showToast(
        "error",
        error.response?.data
          ?.message ||
          "Failed to save team."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE TEAM
  // ============================================================

  const handleDelete = async (
    team
  ) => {
    const teamName =
      team.teamName ||
      team.name ||
      "this team";

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${teamName}"?`
      );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${TEAM_API_URL}/${team._id}`
      );

      showToast(
        "success",
        "Team deleted successfully."
      );

      await fetchTeams();
    } catch (error) {
      console.error(
        "Delete team error:",
        error
      );

      showToast(
        "error",
        error.response?.data
          ?.message ||
          "Failed to delete team."
      );
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F3F6FB] px-4 py-6 text-[#172033] sm:px-6 lg:px-8">
      {/* Toast */}
      <Toast
        toast={toast}
        onClose={() =>
          setToast(null)
        }
      />

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#2563EB]">
            Project Manager
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#172033] sm:text-3xl">
            Team Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
            Create, manage and monitor project
            teams, mentors, technologies and
            team progress.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openCreateModal
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-[#1D4ED8]"
        >
          <Plus size={18} />
          Create Team
        </button>
      </div>

      {/* ====================================================== */}
      {/* STATS */}
      {/* ====================================================== */}

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Teams"
          value={stats.total}
          icon={UsersRound}
          iconClass="bg-blue-50 text-[#2563EB]"
        />

        <StatCard
          title="Active Teams"
          value={stats.active}
          icon={UserRoundCheck}
          iconClass="bg-cyan-50 text-[#0891B2]"
        />

        <StatCard
          title="Pending Teams"
          value={stats.pending}
          icon={Clock3}
          iconClass="bg-amber-50 text-[#F59E0B]"
        />

        <StatCard
          title="Completed Teams"
          value={stats.completed}
          icon={CircleCheck}
          iconClass="bg-red-50 text-[#DC2626]"
        />
      </div>

      {/* ====================================================== */}
      {/* SEARCH + FILTER */}
      {/* ====================================================== */}

      <div className="mb-7 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />

            <input
              type="text"
              value={
                searchTerm
              }
              onChange={(event) =>
                setSearchTerm(
                  event.target
                    .value
                )
              }
              placeholder="Search team, mentor or project..."
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-11 pr-4 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="relative lg:w-52">
            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
              className="w-full appearance-none rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 pr-10 text-sm font-medium text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]"
            />
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* TEAM CARDS */}
      {/* ====================================================== */}

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2563EB]" />
        </div>
      ) : filteredTeams.length ===
        0 ? (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
            <UsersRound size={30} />
          </div>

          <h3 className="mt-5 text-lg font-bold text-[#172033]">
            No teams found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
            {searchTerm ||
            statusFilter !==
              "All"
              ? "Try changing your search or status filter."
              : "Create your first project team to get started."}
          </p>

          {!searchTerm &&
            statusFilter ===
              "All" && (
              <button
                type="button"
                onClick={
                  openCreateModal
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
              >
                <Plus size={17} />
                Create Team
              </button>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTeams.map(
            (team) => (
              <TeamCard
                key={team._id}
                team={team}
                onEdit={
                  openEditModal
                }
                onDelete={
                  handleDelete
                }
              />
            )
          )}
        </div>
      )}

      {/* ====================================================== */}
      {/* CREATE / EDIT MODAL */}
      {/* ====================================================== */}

      {isModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#071426]/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#DC2626] p-[1px] shadow-2xl">
            <div className="max-h-[92vh] overflow-y-auto rounded-[15px] bg-white">
              {/* Modal Header */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-[#172033]">
                    {editingTeam
                      ? "Edit Team"
                      : "Create New Team"}
                  </h2>

                  <p className="mt-1 text-sm text-[#64748B]">
                    Add team details, mentor,
                    technologies and progress.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="rounded-xl p-2 text-[#64748B] transition hover:bg-slate-100 hover:text-[#172033]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-6 p-6"
              >
                {/* Team Name + Members Count */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#172033]">
                      Team Name
                      <span className="text-[#DC2626]">
                        {" "}
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="teamName"
                      value={
                        form.teamName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Team Alpha"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#172033]">
                      Members Count
                      <span className="text-[#DC2626]">
                        {" "}
                        *
                      </span>
                    </label>

                    <input
                      type="number"
                      name="memberCount"
                      min="1"
                      value={
                        form.memberCount
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. 5"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>

                {/* ================================================= */}
                {/* MENTOR */}
                {/* ================================================= */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#172033]">
                    Assigned Mentor
                  </label>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                    {/* Mentor Dropdown */}

                    <div className="relative">
                      <select
                        value={
                          mentorMode ===
                          "manual"
                            ? "__manual__"
                            : form.mentor
                        }
                        onChange={(
                          event
                        ) => {
                          const value =
                            event
                              .target
                              .value;

                          if (
                            value ===
                            "__manual__"
                          ) {
                            setMentorMode(
                              "manual"
                            );

                            setManualMentor(
                              ""
                            );

                            setForm(
                              (
                                previous
                              ) => ({
                                ...previous,
                                mentor:
                                  "",
                              })
                            );
                          } else {
                            setMentorMode(
                              "dropdown"
                            );

                            setManualMentor(
                              ""
                            );

                            setForm(
                              (
                                previous
                              ) => ({
                                ...previous,
                                mentor:
                                  value,
                              })
                            );
                          }
                        }}
                        className="w-full appearance-none rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">
                          Select Mentor
                        </option>

                        {mentors.map(
                          (
                            mentor
                          ) => (
                            <option
                              key={
                                mentor.id ||
                                mentor.name
                              }
                              value={
                                mentor.name
                              }
                            >
                              {
                                mentor.name
                              }
                            </option>
                          )
                        )}

                        <option value="__manual__">
                          + Add New Mentor
                        </option>
                      </select>

                      <ChevronDown
                        size={17}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                      />
                    </div>

                    {/* Add New Mentor Button */}

                    <button
                      type="button"
                      onClick={() => {
                        setMentorMode(
                          "manual"
                        );

                        setManualMentor(
                          form.mentor ||
                            ""
                        );

                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            mentor:
                              previous.mentor ||
                              "",
                          })
                        );
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-[#2563EB] transition hover:bg-blue-100"
                    >
                      <UserPlus
                        size={17}
                      />

                      Add New Mentor
                    </button>
                  </div>

                  {/* Manual Mentor */}

                  {mentorMode ===
                    "manual" && (
                    <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50/40 p-3">
                      <label className="mb-2 block text-xs font-semibold text-[#64748B]">
                        New Mentor Name
                      </label>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={
                            manualMentor
                          }
                          onChange={(
                            event
                          ) => {
                            const value =
                              event
                                .target
                                .value;

                            setManualMentor(
                              value
                            );

                            setForm(
                              (
                                previous
                              ) => ({
                                ...previous,
                                mentor:
                                  value,
                              })
                            );
                          }}
                          placeholder="Enter mentor name"
                          className="flex-1 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#172033] outline-none transition focus:border-[#0891B2] focus:ring-2 focus:ring-cyan-100"
                        />

                        <button
                          type="button"
                          onClick={
                            handleAddManualMentor
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
                        >
                          <UserPlus
                            size={17}
                          />

                          Add Mentor
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-[#64748B]">
                        Enter the mentor name
                        and click Add Mentor
                        to assign it to this
                        team.
                      </p>

                      {manualMentor.trim() && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-cyan-200 bg-white px-3 py-2">
                          <UserRoundCheck
                            size={16}
                            className="text-[#0891B2]"
                          />

                          <span className="text-xs font-semibold text-[#172033]">
                            Assigned Mentor:
                          </span>

                          <span className="text-xs font-bold text-[#2563EB]">
                            {
                              manualMentor
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Project + Department */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#172033]">
                      Assigned Project
                    </label>

                    <input
                      type="text"
                      name="project"
                      value={
                        form.project
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Internship Portal"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#172033]">
                      Department
                    </label>

                    <select
                      name="department"
                      value={
                        form.department
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Development">
                        Development
                      </option>

                      <option value="Design">
                        Design
                      </option>

                      <option value="QA">
                        Quality Assurance
                      </option>

                      <option value="Marketing">
                        Marketing
                      </option>

                      <option value="Management">
                        Management
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>
                </div>

                {/* Dates */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#172033]">
                      Start Date
                    </label>

                    <input
                      type="date"
                      name="startDate"
                      value={
                        form.startDate
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#172033]">
                      End Date
                    </label>

                    <input
                      type="date"
                      name="endDate"
                      value={
                        form.endDate
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Status + Progress */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#172033]">
                      Team Status
                    </label>

                    <select
                      name="status"
                      value={
                        form.status
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center justify-between text-sm font-semibold text-[#172033]">
                      <span>
                        Team Progress
                      </span>

                      <span className="text-[#2563EB]">
                        {
                          form.progress
                        }
                        %
                      </span>
                    </label>

                    <input
                      type="number"
                      name="progress"
                      min="0"
                      max="100"
                      value={
                        form.progress
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                    />

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#22D3EE] to-[#EF4444] transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              Number(
                                form.progress
                              ) ||
                                0
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* ================================================= */}
                {/* TECHNOLOGIES */}
                {/* ================================================= */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#172033]">
                    Technologies Used
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={
                        technologyInput
                      }
                      onChange={(
                        event
                      ) =>
                        setTechnologyInput(
                          event
                            .target
                            .value
                        )
                      }
                      onKeyDown={
                        handleTechnologyKeyDown
                      }
                      placeholder="e.g. React, Node.js, MongoDB"
                      className="flex-1 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0891B2] focus:ring-2 focus:ring-cyan-100"
                    />

                    <button
                      type="button"
                      onClick={
                        addTechnology
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-bold text-[#0891B2] transition hover:bg-cyan-100"
                    >
                      <Plus size={17} />
                      Add Technology
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-[#94A3B8]">
                    Press Enter or click Add
                    Technology.
                  </p>

                  {form.technologies
                    .length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.technologies.map(
                        (
                          technology
                        ) => (
                          <span
                            key={
                              technology
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-[#0891B2]"
                          >
                            {
                              technology
                            }

                            <button
                              type="button"
                              onClick={() =>
                                removeTechnology(
                                  technology
                                )
                              }
                              className="rounded-full p-0.5 transition hover:bg-cyan-200"
                            >
                              <X
                                size={
                                  13
                                }
                              />
                            </button>
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#172033]">
                    Team Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    rows="4"
                    placeholder="Write a short description about this team's responsibilities..."
                    className="w-full resize-none rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Buttons */}

                <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                    disabled={saving}
                    className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-bold text-[#64748B] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                        Saving...
                      </>
                    ) : (
                      <>
                        {editingTeam
                          ? "Update Team"
                          : "Create Team"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamManagement;

