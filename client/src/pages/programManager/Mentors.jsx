
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Search,
  Plus,
  UsersRound,
  Pencil,
  UserX,
  X,
  Phone,
  BriefcaseBusiness,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";

const API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/auth/mentors";

const emptyForm = {
  name: "",
  specialization: "",
  phone: "",
  status: "Active",
  bio: "",
};

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [editingMentor, setEditingMentor] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  const [saving, setSaving] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [selectedMentor, setSelectedMentor] =
    useState(null);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [deactivatingId, setDeactivatingId] =
    useState(null);

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  // ==========================================================
  // TOAST
  // ==========================================================
  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast({
        show: false,
        type: "",
        message: "",
      });
    }, 3500);
  };

  // ==========================================================
  // TOKEN
  // ==========================================================
  const getConfig = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      "";

    if (!token) return {};

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ==========================================================
  // LOAD MENTORS
  // ==========================================================
  const loadMentors = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        API_URL,
        getConfig()
      );

      const data =
        response.data?.mentors ||
        response.data?.data ||
        [];

      setMentors(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Load mentors error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to load mentors."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentors();
  }, []);

  // ==========================================================
  // HANDLE CHANGE
  // ==========================================================
  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // OPEN CREATE
  // ==========================================================
  const openCreateModal = () => {
    setEditingMentor(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  // ==========================================================
  // OPEN EDIT
  // ==========================================================
  const openEditModal = (mentor) => {
    setEditingMentor(mentor);

    setForm({
      name: mentor.name || "",
      specialization:
        mentor.specialization || "",
      phone: mentor.phone || "",
      status: mentor.status || "Active",
      bio: mentor.bio || "",
    });

    setShowModal(true);
  };

  // ==========================================================
  // CLOSE FORM
  // ==========================================================
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingMentor(null);
    setForm(emptyForm);
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      showToast(
        "error",
        "Mentor name is required."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        specialization:
          form.specialization.trim(),
        phone: form.phone.trim(),
        status: form.status,
        bio: form.bio.trim(),
      };

      if (editingMentor) {
        const mentorId =
          editingMentor._id ||
          editingMentor.id;

        await axios.put(
          `${API_URL}/${mentorId}`,
          payload,
          getConfig()
        );

        showToast(
          "success",
          "Mentor updated successfully."
        );
      } else {
        await axios.post(
          API_URL,
          payload,
          getConfig()
        );

        showToast(
          "success",
          "Mentor created successfully."
        );
      }

      closeModal();

      await loadMentors();
    } catch (error) {
      console.error(
        "Save mentor error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to save mentor."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DEACTIVATE
  // ==========================================================
  const handleDeactivate = async (
    mentor
  ) => {
    const mentorId =
      mentor._id || mentor.id;

    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${mentor.name}?`
    );

    if (!confirmed) return;

    try {
      setDeactivatingId(mentorId);

      await axios.patch(
        `${API_URL}/${mentorId}/deactivate`,
        {},
        getConfig()
      );

      showToast(
        "success",
        `${mentor.name} has been deactivated.`
      );

      await loadMentors();
    } catch (error) {
      console.error(
        "Deactivate mentor error:",
        error
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to deactivate mentor."
      );
    } finally {
      setDeactivatingId(null);
    }
  };

  // ==========================================================
  // VIEW
  // ==========================================================
  const openViewModal = (mentor) => {
    setSelectedMentor(mentor);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setSelectedMentor(null);
    setShowViewModal(false);
  };

  // ==========================================================
  // FILTER
  // ==========================================================
  const filteredMentors = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return mentors.filter((mentor) => {
      const matchesSearch =
        !search ||
        mentor.name
          ?.toLowerCase()
          .includes(search) ||
        mentor.specialization
          ?.toLowerCase()
          .includes(search) ||
        mentor.phone
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        mentor.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    mentors,
    searchTerm,
    statusFilter,
  ]);

  // ==========================================================
  // STATS
  // ==========================================================
  const totalMentors =
    mentors.length;

  const activeMentors =
    mentors.filter(
      (mentor) =>
        mentor.status === "Active"
    ).length;

  const inactiveMentors =
    mentors.filter(
      (mentor) =>
        mentor.status === "Inactive"
    ).length;

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div className="min-h-screen bg-[#f4f7fb] px-4 py-5 sm:px-6 lg:px-8">

      {/* ======================================================
          TOAST
      ======================================================= */}
      {toast.show && (
        <div className="fixed right-5 top-5 z-[100]">
          <div
            className={`flex min-w-[300px] items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-2xl ${
              toast.type === "success"
                ? "border-emerald-200"
                : "border-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2
                size={21}
                className="mt-0.5 text-emerald-500"
              />
            ) : (
              <AlertCircle
                size={21}
                className="mt-0.5 text-red-500"
              />
            )}

            <div>
              <p className="text-sm font-semibold text-slate-800">
                {toast.type === "success"
                  ? "Success"
                  : "Something went wrong"}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setToast({
                  show: false,
                  type: "",
                  message: "",
                })
              }
              className="ml-auto text-slate-400 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          HEADER
      ======================================================= */}
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />

            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Program Manager
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#102a4c] sm:text-4xl">
            Mentors
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage mentors and assign them to
            internship cohorts.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1557a8] to-[#e63946] px-5 py-3 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Plus
            size={19}
            className="transition-transform group-hover:rotate-90"
          />

          Create Mentor
        </button>
      </div>

      {/* ======================================================
          STATS
      ======================================================= */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Total */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Mentors
              </p>

              <p className="mt-2 text-3xl font-extrabold text-[#102a4c]">
                {totalMentors}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <UsersRound size={22} />
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Mentors
              </p>

              <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                {activeMentors}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Inactive */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Inactive Mentors
              </p>

              <p className="mt-2 text-3xl font-extrabold text-red-500">
                {inactiveMentors}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-3 text-red-500">
              <XCircle size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          SEARCH
      ======================================================= */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search by mentor name, expertise or phone..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>
        </div>
      </div>

      {/* ======================================================
          TABLE
      ======================================================= */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-[#102a4c]">
            Mentor Directory
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            {filteredMentors.length} mentor
            {filteredMentors.length !== 1
              ? "s"
              : ""}{" "}
            found
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2
                size={30}
                className="animate-spin text-blue-600"
              />

              <p className="text-sm text-slate-500">
                Loading mentors...
              </p>
            </div>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
            <div className="mb-4 rounded-2xl bg-blue-50 p-4 text-blue-600">
              <UsersRound size={30} />
            </div>

            <h3 className="text-base font-bold text-slate-700">
              No mentors found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Create a mentor to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Mentor
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Expertise
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Phone
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredMentors.map(
                  (mentor) => {
                    const mentorId =
                      mentor._id ||
                      mentor.id;

                    return (
                      <tr
                        key={mentorId}
                        className="group border-b border-slate-100 last:border-b-0 transition hover:bg-blue-50/30"
                      >
                        {/* Mentor */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-red-500 text-sm font-extrabold text-white">
                              {mentor.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "M"}
                            </div>

                            <div>
                              <p className="text-sm font-bold text-slate-700">
                                {mentor.name}
                              </p>

                              <p className="text-xs text-slate-400">
                                Mentor
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Expertise */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <BriefcaseBusiness
                              size={15}
                              className="text-blue-500"
                            />

                            {mentor.specialization ||
                              "Not specified"}
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone
                              size={15}
                              className="text-slate-400"
                            />

                            {mentor.phone ||
                              "Not provided"}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          {mentor.status ===
                          "Active" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openViewModal(
                                  mentor
                                )
                              }
                              title="View mentor"
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  mentor
                                )
                              }
                              title="Edit mentor"
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil size={16} />
                            </button>

                            {mentor.status ===
                              "Active" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeactivate(
                                    mentor
                                  )
                                }
                                disabled={
                                  deactivatingId ===
                                  mentorId
                                }
                                title="Deactivate mentor"
                                className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                {deactivatingId ===
                                mentorId ? (
                                  <Loader2
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <UserX
                                    size={16}
                                  />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================
          CREATE / EDIT MODAL
      ======================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#071a32]/60 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600">
                    Mentor Management
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-[#102a4c]">
                  {editingMentor
                    ? "Edit Mentor"
                    : "Create Mentor"}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Add professional mentor
                  information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-6 py-6"
            >
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Mentor Name
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <User
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Ali Ahmed"
                    disabled={saving}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              {/* Specialization */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Area of Expertise
                </label>

                <div className="relative">
                  <BriefcaseBusiness
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="specialization"
                    value={
                      form.specialization
                    }
                    onChange={handleChange}
                    placeholder="e.g. Full Stack Development"
                    disabled={saving}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. 0300 1234567"
                    disabled={saving}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={saving}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>

              {/* Bio */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Short Bio
                </label>

                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Briefly describe the mentor's experience..."
                  rows={4}
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* Info */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                <div className="flex gap-3">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <p className="text-xs leading-5 text-blue-700">
                    Active mentors will be available
                    for assignment when creating a
                    new cohort.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1557a8] to-[#e63946] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />

                      {editingMentor
                        ? "Update Mentor"
                        : "Create Mentor"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          VIEW MODAL
      ======================================================= */}
      {showViewModal &&
        selectedMentor && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#071a32]/60 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#102f5f] to-[#1557a8] px-6 py-7 text-white">
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="absolute right-4 top-4 rounded-xl p-2 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X size={19} />
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-extrabold">
                    {selectedMentor.name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "M"}
                  </div>

                  <div>
                    <p className="text-lg font-extrabold">
                      {selectedMentor.name}
                    </p>

                    <p className="text-sm text-blue-100">
                      {selectedMentor.specialization ||
                        "Mentor"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4 px-6 py-6">

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Expertise
                  </p>

                  <p className="text-sm font-semibold text-slate-700">
                    {selectedMentor.specialization ||
                      "Not specified"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Phone
                  </p>

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Phone
                      size={16}
                      className="text-blue-600"
                    />

                    {selectedMentor.phone ||
                      "Not provided"}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </p>

                  {selectedMentor.status ===
                  "Active" ? (
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600">
                      <CheckCircle2 size={17} />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-red-500">
                      <XCircle size={17} />
                      Inactive
                    </span>
                  )}
                </div>

                {selectedMentor.bio && (
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Bio
                    </p>

                    <p className="text-sm leading-6 text-slate-600">
                      {selectedMentor.bio}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={closeViewModal}
                  className="w-full rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Mentors;


