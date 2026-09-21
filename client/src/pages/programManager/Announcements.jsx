
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Bell,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Megaphone,
  Users,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  CalendarDays,
  Send,
  Check,
} from "lucide-react";

const API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/announcements";

// ============================================================
// EMPTY FORM
// ============================================================

const emptyForm = {
  title: "",
  description: "",
  audience: "All Interns",
  priority: "Medium",
  status: "Published",
  date: "",
};

// ============================================================
// MAIN COMPONENT
// ============================================================

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] =
    useState(false);

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState(null);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] =
    useState(emptyForm);

  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  // ============================================================
  // SHOW SUCCESS MESSAGE
  // ============================================================

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // ============================================================
  // FETCH ANNOUNCEMENTS
  // ============================================================

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setPageError("");

      const response = await axios.get(API_URL);

      const data = response.data;

      if (Array.isArray(data)) {
        setAnnouncements(data);
      } else if (Array.isArray(data?.data)) {
        setAnnouncements(data.data);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error(
        "Failed to load announcements:",
        error
      );

      setPageError(
        error.response?.data?.message ||
          "Failed to load announcements from database."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const title =
        announcement.title || "";

      const description =
        announcement.description || "";

      const search =
        searchTerm.toLowerCase();

      const matchesSearch =
        title.toLowerCase().includes(search) ||
        description
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        announcement.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        announcement.priority ===
          priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    announcements,
    searchTerm,
    statusFilter,
    priorityFilter,
  ]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalAnnouncements =
    announcements.length;

  const publishedCount =
    announcements.filter(
      (item) => item.status === "Published"
    ).length;

  const draftCount =
    announcements.filter(
      (item) => item.status === "Draft"
    ).length;

  const highPriorityCount =
    announcements.filter(
      (item) => item.priority === "High"
    ).length;

  // ============================================================
  // CREATE MODAL
  // ============================================================

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      ...emptyForm,
      date: new Date()
        .toISOString()
        .split("T")[0],
    });
    setFormError("");
    setShowForm(true);
  };

  // ============================================================
  // EDIT MODAL
  // ============================================================

  const openEditModal = (announcement) => {
    setEditingId(
      announcement._id
    );

    setFormData({
      title: announcement.title || "",
      description:
        announcement.description || "",
      audience:
        announcement.audience ||
        "All Interns",
      priority:
        announcement.priority ||
        "Medium",
      status:
        announcement.status ||
        "Published",
      date: announcement.date
        ? announcement.date.substring(
            0,
            10
          )
        : "",
    });

    setFormError("");
    setShowForm(true);
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setFormError(
        "Please enter an announcement title."
      );
      return;
    }

    if (!formData.description.trim()) {
      setFormError(
        "Please enter announcement description."
      );
      return;
    }

    if (!formData.date) {
      setFormError(
        "Please select an announcement date."
      );
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      // ======================================================
      // UPDATE
      // ======================================================

      if (editingId) {
        const response = await axios.put(
          `${API_URL}/${editingId}`,
          formData
        );

        const updated =
          response.data?.data;

        setAnnouncements((previous) =>
          previous.map((item) =>
            item._id === editingId
              ? updated
              : item
          )
        );

        closeAllModals();

        showSuccessMessage(
          "Announcement updated successfully."
        );
      }

      // ======================================================
      // CREATE
      // ======================================================

      else {
        const response = await axios.post(
          API_URL,
          formData
        );

        const created =
          response.data?.data;

        setAnnouncements((previous) => [
          created,
          ...previous,
        ]);

        closeAllModals();

        showSuccessMessage(
          "Announcement created successfully."
        );
      }
    } catch (error) {
      console.error(
        "Save announcement error:",
        error
      );

      setFormError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // VIEW
  // ============================================================

  const openViewModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowView(true);
  };

  // ============================================================
  // DELETE CONFIRMATION
  // ============================================================

  const openDeleteModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDelete(true);
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async () => {
    if (!selectedAnnouncement?._id) {
      return;
    }

    try {
      setSubmitting(true);

      await axios.delete(
        `${API_URL}/${selectedAnnouncement._id}`
      );

      setAnnouncements((previous) =>
        previous.filter(
          (item) =>
            item._id !==
            selectedAnnouncement._id
        )
      );

      closeAllModals();

      showSuccessMessage(
        "Announcement deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete announcement error:",
        error
      );

      setPageError(
        error.response?.data?.message ||
          "Failed to delete announcement."
      );

      closeAllModals();
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // CLOSE MODALS
  // ============================================================

  const closeAllModals = () => {
    setShowForm(false);
    setShowView(false);
    setShowDelete(false);
    setSelectedAnnouncement(null);
    setEditingId(null);
    setFormData(emptyForm);
    setFormError("");
  };

  // ============================================================
  // DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ============================================================
  // PRIORITY
  // ============================================================

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "bg-red-50 text-red-600 border-red-200";
    }

    if (priority === "Medium") {
      return "bg-blue-50 text-blue-600 border-blue-200";
    }

    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  // ============================================================
  // STATUS
  // ============================================================

  const getStatusStyle = (status) => {
    if (status === "Published") {
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    }

    return "bg-amber-50 text-amber-600 border-amber-200";
  };

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
            SUCCESS MESSAGE
        ====================================================== */}

        {successMessage && (
          <div className="fixed right-5 top-5 z-[200] flex max-w-sm items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-xl">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check size={18} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Success
              </p>

              <p className="text-xs text-slate-500">
                {successMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage("")
              }
              className="ml-2 text-slate-400 hover:text-slate-700"
            >
              <X size={16} />
            </button>

          </div>
        )}

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
                <Megaphone size={20} />
              </div>

              <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Communication
              </span>

            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Announcements
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage important
              announcements for the internship
              program.
            </p>

          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plus size={18} />
              Create Announcement
            </span>
          </button>

        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {pageError && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">

            <span>{pageError}</span>

            <button
              type="button"
              onClick={() => setPageError("")}
            >
              <X size={17} />
            </button>

          </div>
        )}

        {/* ======================================================
            STAT CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={Bell}
            title="Total Announcements"
            value={totalAnnouncements}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            icon={CheckCircle2}
            title="Published"
            value={publishedCount}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            icon={Clock3}
            title="Drafts"
            value={draftCount}
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            icon={AlertTriangle}
            title="High Priority"
            value={highPriorityCount}
            iconClass="bg-red-50 text-red-600"
          />

        </div>

        {/* ======================================================
            FILTERS
        ====================================================== */}

        <div className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 outline-none"
            >
              <option value="All">
                All Status
              </option>
              <option value="Published">
                Published
              </option>
              <option value="Draft">
                Draft
              </option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 outline-none"
            >
              <option value="All">
                All Priority
              </option>
              <option value="High">
                High
              </option>
              <option value="Medium">
                Medium
              </option>
              <option value="Low">
                Low
              </option>
            </select>

          </div>
        </div>

        {/* ======================================================
            CONTENT
        ====================================================== */}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading announcements...
            </p>

          </div>
        ) : filteredAnnouncements.length ===
          0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Bell size={24} />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No announcements found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create your first announcement
              to get started.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {filteredAnnouncements.map(
              (announcement) => (
                <AnnouncementCard
                  key={announcement._id}
                  announcement={announcement}
                  onView={openViewModal}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  formatDate={formatDate}
                  getPriorityStyle={
                    getPriorityStyle
                  }
                  getStatusStyle={
                    getStatusStyle
                  }
                />
              )
            )}

          </div>
        )}

      </div>

      {/* ========================================================
          CREATE / EDIT MODAL
      ======================================================== */}

      {showForm && (
        <ModalOverlay onClose={closeAllModals}>

          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  {editingId
                    ? "Edit Announcement"
                    : "Create Announcement"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update announcement details."
                    : "Create a new announcement."}
                </p>

              </div>

              <button
                type="button"
                onClick={closeAllModals}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>

            </div>

            {/* SCROLLABLE FORM BODY */}

            <form
              onSubmit={handleSubmit}
              className="min-h-0 flex-1 overflow-y-auto"
            >

              <div className="space-y-5 p-6">

                {formError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">

                    <AlertTriangle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{formError}</span>

                  </div>
                )}

                {/* TITLE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Announcement Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter announcement title"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                    rows={6}
                    placeholder="Write announcement details..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                </div>

                {/* FIELDS */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Audience
                    </label>

                    <select
                      name="audience"
                      value={
                        formData.audience
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
                    >
                      <option value="All">
                        All
                      </option>

                      <option value="All Interns">
                        All Interns
                      </option>

                      <option value="Project Managers">
                        Project Managers
                      </option>

                      <option value="Mentors">
                        Mentors
                      </option>
                    </select>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Priority
                    </label>

                    <select
                      name="priority"
                      value={
                        formData.priority
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
                    >
                      <option value="Low">
                        Low
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="High">
                        High
                      </option>
                    </select>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Status
                    </label>

                    <select
                      name="status"
                      value={
                        formData.status
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
                    >
                      <option value="Published">
                        Published
                      </option>

                      <option value="Draft">
                        Draft
                      </option>
                    </select>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Date
                    </label>

                    <input
                      type="date"
                      name="date"
                      value={
                        formData.date
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
                    />

                  </div>

                </div>

              </div>

              {/* STICKY FOOTER */}

              <div className="sticky bottom-0 flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">

                <button
                  type="button"
                  onClick={closeAllModals}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      {editingId
                        ? "Update Announcement"
                        : "Create Announcement"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </ModalOverlay>
      )}

      {/* ========================================================
          VIEW MODAL
      ======================================================== */}

      {showView &&
        selectedAnnouncement && (
          <ModalOverlay
            onClose={closeAllModals}
          >

            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

              <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Megaphone size={20} />
                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-slate-900">
                      {
                        selectedAnnouncement.title
                      }
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      By{" "}
                      {selectedAnnouncement.createdBy ||
                        "Program Manager"}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={closeAllModals}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X size={19} />
                </button>

              </div>

              <div className="min-h-0 overflow-y-auto p-6">

                <div className="space-y-5">

                  <div className="flex flex-wrap gap-2">

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                        selectedAnnouncement.status
                      )}`}
                    >
                      {
                        selectedAnnouncement.status
                      }
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityStyle(
                        selectedAnnouncement.priority
                      )}`}
                    >
                      {
                        selectedAnnouncement.priority
                      }{" "}
                      Priority
                    </span>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-5">

                    <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                      {
                        selectedAnnouncement.description
                      }
                    </p>

                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <InfoItem
                      icon={Users}
                      label="Audience"
                      value={
                        selectedAnnouncement.audience ||
                        "-"
                      }
                    />

                    <InfoItem
                      icon={CalendarDays}
                      label="Date"
                      value={formatDate(
                        selectedAnnouncement.date
                      )}
                    />

                  </div>

                </div>

              </div>

              <div className="flex shrink-0 justify-end border-t border-slate-100 bg-white px-6 py-4">

                <button
                  type="button"
                  onClick={closeAllModals}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Close
                </button>

              </div>

            </div>

          </ModalOverlay>
        )}

      {/* ========================================================
          DELETE MODAL
      ======================================================== */}

      {showDelete &&
        selectedAnnouncement && (
          <ModalOverlay
            onClose={closeAllModals}
          >

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={21} />
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Delete Announcement?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">

                Are you sure you want to delete{" "}

                <span className="font-semibold text-slate-700">
                  "
                  {
                    selectedAnnouncement.title
                  }
                  "
                </span>

                ? This action cannot be undone.

              </p>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeAllModals}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {submitting
                    ? "Deleting..."
                    : "Delete Announcement"}
                </button>

              </div>

            </div>

          </ModalOverlay>
        )}

    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon: Icon,
  title,
  value,
  iconClass,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl p-[1px]">

      <div className="absolute inset-0 bg-[linear-gradient(90deg,#2563EB,#DC2626,#2563EB)] bg-[length:200%_100%] opacity-70 transition-all duration-700 group-hover:animate-[gradientMove_3s_linear_infinite]" />

      <div className="relative rounded-[15px] bg-white/95 p-5">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm font-medium text-slate-500">
              {title}
            </p>

            <h3 className="mt-2 text-3xl font-bold text-slate-900">
              {value}
            </h3>

          </div>

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
          >
            <Icon size={22} />
          </div>

        </div>

      </div>
    </div>
  );
}

// ============================================================
// ANNOUNCEMENT CARD
// ============================================================

function AnnouncementCard({
  announcement,
  onView,
  onEdit,
  onDelete,
  formatDate,
  getPriorityStyle,
  getStatusStyle,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl p-[1px]">

      <div className="absolute inset-0 bg-[linear-gradient(90deg,#2563EB,#DC2626,#2563EB)] bg-[length:200%_100%] opacity-50 transition-all duration-700 group-hover:animate-[gradientMove_3s_linear_infinite] group-hover:opacity-80" />

      <div className="relative rounded-[15px] bg-white/95 p-5 transition-all duration-300 group-hover:-translate-y-0.5">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex min-w-0 gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600">
              <Bell size={21} />
            </div>

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="truncate text-base font-bold text-slate-900">
                  {announcement.title}
                </h3>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getPriorityStyle(
                    announcement.priority
                  )}`}
                >
                  {announcement.priority}
                </span>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                    announcement.status
                  )}`}
                >
                  {announcement.status}
                </span>

              </div>

              <p className="mt-2 line-clamp-2 max-w-4xl text-sm leading-6 text-slate-500">
                {announcement.description}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">

                <span className="flex items-center gap-1.5">
                  <Users size={14} />
                  {announcement.audience}
                </span>

                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  {formatDate(
                    announcement.date
                  )}
                </span>

                <span>
                  By{" "}
                  {announcement.createdBy ||
                    "Program Manager"}
                </span>

              </div>

            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">

            <button
              type="button"
              onClick={() =>
                onView(announcement)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <Eye size={17} />
            </button>

            <button
              type="button"
              onClick={() =>
                onEdit(announcement)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <Pencil size={17} />
            </button>

            <button
              type="button"
              onClick={() =>
                onDelete(announcement)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={17} />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
          <Icon size={17} />
        </div>

        <div>

          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 text-sm font-semibold text-slate-700">
            {value}
          </p>

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
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

export default Announcements;

