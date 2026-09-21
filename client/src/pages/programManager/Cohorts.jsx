import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Users,
  CalendarDays,
  Pencil,
  Trash2,
  X,
  UserRound,
  GraduationCap,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_URL = "https://internship-portal-backend-olive.vercel.app/api/cohorts";
const MENTORS_API_URL = "https://internship-portal-backend-olive.vercel.app/api/auth/mentors";

const initialForm = {
  name: "",
  program: "",
  mentorId: "",
  mentorName: "",
  interns: "",
  status: "Active",
  startDate: "",
  endDate: "",
  description: "",
  internIds: [],
};

const Cohorts = () => {
  const [cohorts, setCohorts] = useState([]);
  const [mentors, setMentors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [mentorsLoading, setMentorsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingCohort, setEditingCohort] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // ==========================================================
  // TOAST
  // ==========================================================
  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 3000);
  };

  // ==========================================================
  // LOAD COHORTS
  // ==========================================================
  const loadCohorts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API_URL);

      console.log("Cohorts API response:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data ||
          response.data?.cohorts ||
          [];

      setCohorts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load cohorts error:", error);

      showToast(
        error.response?.data?.message ||
          "Failed to load cohorts.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOAD MENTORS
  // ==========================================================
  const loadMentors = async () => {
    try {
      setMentorsLoading(true);

      const response = await axios.get(
        MENTORS_API_URL
      );

      console.log(
        "Mentors API response:",
        response.data
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.mentors ||
          response.data?.data ||
          [];

      setMentors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Load mentors error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to load mentors.",
        "error"
      );
    } finally {
      setMentorsLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================
  useEffect(() => {
    loadCohorts();
    loadMentors();
  }, []);

  // ==========================================================
  // FORM INPUT
  // ==========================================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "mentorId") {
      const selectedMentor = mentors.find(
        (mentor) =>
          String(mentor._id || mentor.id) ===
          String(value)
      );

      setForm((previous) => ({
        ...previous,
        mentorId: value,
        mentorName: selectedMentor?.name || "",
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // OPEN CREATE MODAL
  // ==========================================================
  const openCreateModal = () => {
    setEditingCohort(null);

    setForm({
      ...initialForm,
      status: "Active",
    });

    setShowModal(true);

    if (mentors.length === 0) {
      loadMentors();
    }
  };

  // ==========================================================
  // OPEN EDIT MODAL
  // ==========================================================
  const openEditModal = (cohort) => {
    setEditingCohort(cohort);

    setForm({
      name: cohort.name || "",
      program: cohort.program || "",
      mentorId: cohort.mentorId || "",
      mentorName: cohort.mentorName || "",
      interns: cohort.interns ?? "",
      status: cohort.status || "Upcoming",
      startDate: cohort.startDate
        ? String(cohort.startDate).slice(0, 10)
        : "",
      endDate: cohort.endDate
        ? String(cohort.endDate).slice(0, 10)
        : "",
      description: cohort.description || "",
      internIds: cohort.internIds || [],
    });

    setShowModal(true);

    if (mentors.length === 0) {
      loadMentors();
    }
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================
  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingCohort(null);
    setForm(initialForm);
  };

  // ==========================================================
  // RESET FORM
  // ==========================================================
  const resetForm = () => {
    setForm(initialForm);
    setEditingCohort(null);
  };

  // ==========================================================
  // CREATE / UPDATE COHORT
  // ==========================================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      showToast(
        "Cohort name is required.",
        "error"
      );
      return;
    }

    if (!form.program.trim()) {
      showToast(
        "Program is required.",
        "error"
      );
      return;
    }

    if (!form.mentorId) {
      showToast(
        "Please select a mentor.",
        "error"
      );
      return;
    }

    if (
      form.interns === "" ||
      Number(form.interns) < 1
    ) {
      showToast(
        "Intern capacity must be at least 1.",
        "error"
      );
      return;
    }

    if (
      !form.startDate ||
      !form.endDate
    ) {
      showToast(
        "Start date and end date are required.",
        "error"
      );
      return;
    }

    if (
      new Date(form.startDate) >
      new Date(form.endDate)
    ) {
      showToast(
        "Start date cannot be after end date.",
        "error"
      );
      return;
    }

    try {
      setSubmitting(true);

      const selectedMentor = mentors.find(
        (mentor) =>
          String(mentor._id || mentor.id) ===
          String(form.mentorId)
      );

      const payload = {
        name: form.name.trim(),

        program: form.program.trim(),

        mentorId: form.mentorId,

        mentorName:
          selectedMentor?.name ||
          form.mentorName ||
          "",

        interns: Number(form.interns),

        status: form.status,

        startDate: form.startDate,

        endDate: form.endDate,

        description:
          form.description.trim(),

        internIds:
          editingCohort?.internIds || [],
      };

      console.log(
        "Cohort payload:",
        payload
      );

      // ======================================================
      // UPDATE
      // ======================================================
      if (editingCohort) {
        const cohortId =
          editingCohort.id ||
          editingCohort._id;

        const response =
          await axios.put(
            `${API_URL}/${cohortId}`,
            payload
          );

        console.log(
          "Update cohort response:",
          response.data
        );

        showToast(
          response.data?.message ||
            "Cohort updated successfully.",
          "success"
        );
      }

      // ======================================================
      // CREATE
      // ======================================================
      else {
        const response =
          await axios.post(
            API_URL,
            payload
          );

        console.log(
          "Create cohort response:",
          response.data
        );

        showToast(
          response.data?.message ||
            "Cohort created successfully.",
          "success"
        );
      }

      // ======================================================
      // RELOAD COHORTS
      // ======================================================
      await loadCohorts();

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error(
        "Save cohort error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to save cohort.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // DELETE COHORT
  // ==========================================================
  const handleDelete = async (cohort) => {
    const cohortId =
      cohort.id || cohort._id;

    if (!cohortId) {
      showToast(
        "Cohort ID not found.",
        "error"
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${cohort.name}"?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/${cohortId}`
      );

      showToast(
        "Cohort deleted successfully.",
        "success"
      );

      await loadCohorts();
    } catch (error) {
      console.error(
        "Delete cohort error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to delete cohort.",
        "error"
      );
    }
  };

  // ==========================================================
  // FILTERED COHORTS
  // ==========================================================
  const filteredCohorts = useMemo(() => {
    return cohorts.filter((cohort) => {
      const search =
        searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        cohort.name
          ?.toLowerCase()
          .includes(search) ||
        cohort.program
          ?.toLowerCase()
          .includes(search) ||
        cohort.mentorName
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        cohort.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    cohorts,
    searchTerm,
    statusFilter,
  ]);

  // ==========================================================
  // STATUS STYLE
  // ==========================================================
  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";

      case "Completed":
        return "bg-blue-50 text-blue-600 border-blue-200";

      case "Upcoming":
        return "bg-amber-50 text-amber-600 border-amber-200";

      case "Inactive":
        return "bg-red-50 text-red-600 border-red-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  // ==========================================================
  // FORMAT DATE
  // ==========================================================
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded-xl bg-slate-200" />

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="h-72 rounded-2xl bg-white shadow-sm"
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      {/* ======================================================
          TOAST
      ====================================================== */}
      {toast.show && (
        <div className="fixed right-5 top-5 z-[100]">
          <div
            className={`flex min-w-[300px] items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl ${
              toast.type === "error"
                ? "border-red-200"
                : "border-emerald-200"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle
                size={20}
                className="text-red-500"
              />
            ) : (
              <CheckCircle2
                size={20}
                className="text-emerald-500"
              />
            )}

            <p className="text-sm font-medium text-slate-700">
              {toast.message}
            </p>

            <button
              onClick={() =>
                setToast({
                  show: false,
                  message: "",
                  type: "success",
                })
              }
              className="ml-auto text-slate-400 hover:text-slate-700"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        {/* ====================================================
            HEADER
        ==================================================== */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="h-1 w-8 rounded-full bg-red-500" />

              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Program Manager
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Cohorts
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage internship cohorts,
              mentors and intern capacity.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Cohort
          </button>
        </div>

        {/* ====================================================
            SEARCH + FILTER
        ==================================================== */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
          <div className="relative flex-1">
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
              placeholder="Search cohort, program or mentor..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Upcoming">
              Upcoming
            </option>

            <option value="Completed">
              Completed
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>
        </div>

        {/* ====================================================
            STATS
        ==================================================== */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOTAL */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Total Cohorts
              </span>

              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <GraduationCap
                  size={20}
                />
              </div>
            </div>

            <p className="text-2xl font-bold text-slate-900">
              {cohorts.length}
            </p>
          </div>

          {/* ACTIVE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Active
              </span>

              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CheckCircle2
                  size={20}
                />
              </div>
            </div>

            <p className="text-2xl font-bold text-slate-900">
              {
                cohorts.filter(
                  (item) =>
                    item.status ===
                    "Active"
                ).length
              }
            </p>
          </div>

          {/* UPCOMING */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Upcoming
              </span>

              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <Clock3 size={20} />
              </div>
            </div>

            <p className="text-2xl font-bold text-slate-900">
              {
                cohorts.filter(
                  (item) =>
                    item.status ===
                    "Upcoming"
                ).length
              }
            </p>
          </div>

          {/* CAPACITY */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Intern Capacity
              </span>

              <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
                <Users size={20} />
              </div>
            </div>

            <p className="text-2xl font-bold text-slate-900">
              {cohorts.reduce(
                (total, cohort) =>
                  total +
                  (Number(
                    cohort.interns
                  ) || 0),
                0
              )}
            </p>
          </div>
        </div>

        {/* ====================================================
            COHORT CARDS
        ==================================================== */}
        {filteredCohorts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <GraduationCap
                size={28}
              />
            </div>

            <h3 className="text-lg font-semibold text-slate-800">
              No cohorts found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {searchTerm ||
              statusFilter !== "All"
                ? "Try changing your search or status filter."
                : "Create your first cohort to get started."}
            </p>

            {!searchTerm &&
              statusFilter ===
                "All" && (
                <button
                  onClick={
                    openCreateModal
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus size={17} />
                  Create Cohort
                </button>
              )}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCohorts.map(
              (cohort) => (
                <div
                  key={
                    cohort.id ||
                    cohort._id
                  }
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* CARD TOP */}
                  <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-red-500" />

                  <div className="p-5">
                    {/* TITLE */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {cohort.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {cohort.program}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                          cohort.status
                        )}`}
                      >
                        {cohort.status}
                      </span>
                    </div>

                    {/* MENTOR */}
                    <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <UserRound
                          size={19}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-400">
                          Mentor
                        </p>

                        <p className="truncate text-sm font-semibold text-slate-700">
                          {cohort.mentorName ||
                            "No mentor assigned"}
                        </p>
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="mb-1 flex items-center gap-2 text-slate-400">
                          <Users
                            size={15}
                          />

                          <span className="text-xs">
                            Capacity
                          </span>
                        </div>

                        <p className="text-sm font-bold text-slate-700">
                          {cohort.interns ||
                            0}{" "}
                          Interns
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="mb-1 flex items-center gap-2 text-slate-400">
                          <CalendarDays
                            size={15}
                          />

                          <span className="text-xs">
                            Start
                          </span>
                        </div>

                        <p className="text-sm font-bold text-slate-700">
                          {formatDate(
                            cohort.startDate
                          )}
                        </p>
                      </div>
                    </div>

                    {/* DATES */}
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Start:{" "}
                        <strong className="text-slate-700">
                          {formatDate(
                            cohort.startDate
                          )}
                        </strong>
                      </span>

                      <span>
                        End:{" "}
                        <strong className="text-slate-700">
                          {formatDate(
                            cohort.endDate
                          )}
                        </strong>
                      </span>
                    </div>

                    {/* DESCRIPTION */}
                    {cohort.description && (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                        {
                          cohort.description
                        }
                      </p>
                    )}

                    {/* ACTIONS */}
                    <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                      <button
                        onClick={() =>
                          openEditModal(
                            cohort
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                      >
                        <Pencil
                          size={16}
                        />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            cohort
                          )
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2
                          size={16}
                        />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCohort
                    ? "Edit Cohort"
                    : "Create Cohort"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingCohort
                    ? "Update cohort information."
                    : "Add a new internship cohort."}
                </p>
              </div>

              <button
                onClick={
                  closeModal
                }
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5 sm:p-6"
            >
              {/* NAME + PROGRAM */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Cohort Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. MERN Cohort 01"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Program
                  </label>

                  <input
                    type="text"
                    name="program"
                    value={
                      form.program
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Full Stack Development"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* MENTOR + CAPACITY */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Mentor
                  </label>

                  <select
                    name="mentorId"
                    value={
                      form.mentorId
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      mentorsLoading
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    <option value="">
                      {mentorsLoading
                        ? "Loading mentors..."
                        : "Select mentor"}
                    </option>

                    {mentors
                      .filter(
                        (mentor) =>
                          mentor.status ===
                          "Active"
                      )
                      .map(
                        (mentor) => (
                          <option
                            key={
                              mentor._id ||
                              mentor.id
                            }
                            value={
                              mentor._id ||
                              mentor.id
                            }
                          >
                            {
                              mentor.name
                            }
                          </option>
                        )
                      )}
                  </select>

                  {!mentorsLoading &&
                    mentors.filter(
                      (mentor) =>
                        mentor.status ===
                        "Active"
                    ).length ===
                      0 && (
                      <p className="mt-2 text-xs text-red-500">
                        No active mentors available.
                      </p>
                    )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Intern Capacity
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="interns"
                    value={
                      form.interns
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 30"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* STATUS */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Status
                </label>

                <select
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Upcoming">
                    Upcoming
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>

              {/* DATES */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
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
                  placeholder="Write a short description about this cohort..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    submitting
                  }
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />

                      {editingCohort
                        ? "Update Cohort"
                        : "Create Cohort"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cohorts;