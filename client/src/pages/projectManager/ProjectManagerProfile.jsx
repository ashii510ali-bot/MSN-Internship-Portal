
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

import {
  UserCircle,
  Mail,
  Phone,
  BriefcaseBusiness,
  Building2,
  MapPin,
  FileText,
  Pencil,
  Save,
  X,
  CheckCircle2,
  ShieldCheck,
  Camera,
} from "lucide-react";

const PROFILE_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/project-manager/profile";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  designation: "Project Manager",
  department: "Project Management",
  location: "",
  bio: "",
  avatar: "",
};

// ============================================================
// HELPERS
// ============================================================

function getInitials(name = "") {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "PM";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
}

function extractProfile(data) {
  if (!data) return null;

  if (data.profile) return data.profile;
  if (data.data) return data.data;
  if (data.user) return data.user;

  return data;
}

function createFormFromProfile(profileData) {
  return {
    fullName:
      profileData?.fullName ||
      profileData?.name ||
      "",
    email:
      profileData?.email || "",
    phone:
      profileData?.phone || "",
    designation:
      profileData?.designation ||
      "Project Manager",
    department:
      profileData?.department ||
      "Project Management",
    location:
      profileData?.location || "",
    bio:
      profileData?.bio || "",
    avatar:
      profileData?.avatar || "",
  };
}

// ============================================================
// COMPONENT
// ============================================================

function ProjectManagerProfile() {
  const [profile, setProfile] =
    useState(null);

  const [formData, setFormData] =
    useState(initialForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================================
  // LOAD PROFILE
  // ==========================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axios.get(
          PROFILE_API_URL
        );

      const profileData =
        extractProfile(
          response.data
        );

      if (!profileData) {
        throw new Error(
          "Profile data not found."
        );
      }

      setProfile(profileData);

      setFormData(
        createFormFromProfile(
          profileData
        )
      );
    } catch (err) {
      console.error(
        "Project Manager Profile Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load Project Manager profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ==========================================================
  // CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  const handleOpenEdit = () => {
    setError("");
    setMessage("");

    // Always start editing from current saved profile
    setFormData(
      createFormFromProfile(
        profile
      )
    );

    setEditing(true);
  };

  // ==========================================================
  // CLOSE EDIT
  // ==========================================================

  const handleCloseEdit = () => {
    // Reset fields to saved data
    setFormData(
      createFormFromProfile(
        profile
      )
    );

    // IMPORTANT:
    // This completely removes the edit form
    // from the DOM.
    setEditing(false);

    setError("");
  };

  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSave = async (
    event
  ) => {
    event.preventDefault();

    if (
      !formData.fullName.trim()
    ) {
      setError(
        "Full name is required."
      );
      return;
    }

    if (
      !formData.email.trim()
    ) {
      setError(
        "Email is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        fullName:
          formData.fullName.trim(),

        email:
          formData.email.trim(),

        phone:
          formData.phone.trim(),

        designation:
          formData.designation.trim(),

        department:
          formData.department.trim(),

        location:
          formData.location.trim(),

        bio:
          formData.bio.trim(),

        avatar:
          formData.avatar.trim(),
      };

      const response =
        await axios.put(
          PROFILE_API_URL,
          payload
        );

      const updatedProfile =
        extractProfile(
          response.data
        );

      if (!updatedProfile) {
        throw new Error(
          "Updated profile data not returned."
        );
      }

      // Update saved profile
      setProfile(
        updatedProfile
      );

      // Update form data in background
      setFormData(
        createFormFromProfile(
          updatedProfile
        )
      );

      // IMPORTANT:
      // Immediately close/remove form
      setEditing(false);

      // Show success message on details page
      setMessage(
        "Profile updated successfully."
      );

      window.dispatchEvent(
        new Event(
          "projectManagerProfileUpdated"
        )
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error(
        "Project Manager Profile Update Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // PROFILE DISPLAY DATA
  // ==========================================================

  const displayName =
    profile?.fullName ||
    profile?.name ||
    "Project Manager";

  const displayEmail =
    profile?.email ||
    "Not provided";

  const displayPhone =
    profile?.phone ||
    "Not provided";

  const displayDesignation =
    profile?.designation ||
    "Project Manager";

  const displayDepartment =
    profile?.department ||
    "Project Management";

  const displayLocation =
    profile?.location ||
    "Not specified";

  const displayBio =
    profile?.bio ||
    "No professional bio added yet.";

  const displayAvatar =
    profile?.avatar ||
    "";

  const initials =
    useMemo(
      () =>
        getInitials(
          displayName
        ),
      [displayName]
    );

  const completionFields = [
    displayName,
    displayEmail,
    displayPhone !==
    "Not provided"
      ? displayPhone
      : "",
    displayDesignation,
    displayDepartment,
    displayLocation !==
    "Not specified"
      ? displayLocation
      : "",
    displayBio !==
    "No professional bio added yet."
      ? displayBio
      : "",
    displayAvatar,
  ];

  const completedFields =
    completionFields.filter(
      (field) =>
        String(
          field || ""
        ).trim().length > 0
    ).length;

  const completionPercentage =
    Math.round(
      (completedFields /
        completionFields.length) *
        100
    );

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#F3F6FB] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-8 w-64 rounded-lg bg-slate-200" />

          <div className="mt-2 h-4 w-80 rounded bg-slate-200" />

          <div className="mt-7 grid gap-6 lg:grid-cols-[330px_1fr]">
            <div className="h-[570px] rounded-3xl bg-white" />
            <div className="h-[570px] rounded-3xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F3F6FB]">

      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

        {/* ====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
              <ShieldCheck size={14} />
              Project Manager Account
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#172033] sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#64748B]">
              View and manage your professional profile information.
            </p>
          </div>

          {/* ==================================================
              EDIT BUTTON
          =================================================== */}

          <button
            type="button"
            onClick={
              handleOpenEdit
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#DC2626] via-[#2563EB] to-[#22D3EE] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(37,99,235,0.24)]"
          >
            <Pencil size={16} />
            Edit Profile
          </button>
        </div>

        {/* ====================================================
            SUCCESS MESSAGE
        ===================================================== */}

        {message && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2
              size={18}
            />
            {message}
          </div>
        )}

        {/* ====================================================
            ERROR
        ===================================================== */}

        {error && !editing && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ====================================================
            PROFILE DETAILS
            NO FORM HERE
        ===================================================== */}

        <div className="grid items-start gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">

          {/* ==================================================
              LEFT IDENTITY CARD
          =================================================== */}

          <section className="relative overflow-hidden rounded-3xl border border-white bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">

            <div className="h-[3px] w-full bg-gradient-to-r from-[#DC2626] via-[#2563EB] to-[#22D3EE]" />

            <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-52 -translate-x-1/2 rounded-full bg-gradient-to-r from-red-500/10 via-blue-500/10 to-cyan-400/10 blur-3xl" />

            <div className="relative p-6">

              {/* Avatar */}

              <div className="flex justify-center">
                <div className="relative">

                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#DC2626] via-[#2563EB] to-[#22D3EE] p-[3px] shadow-[0_12px_35px_rgba(37,99,235,0.18)]">

                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#0E2A52] text-3xl font-bold text-white">

                      {displayAvatar ? (
                        <img
                          src={
                            displayAvatar
                          }
                          alt={
                            displayName
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials
                      )}

                    </div>
                  </div>

                  <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md">
                    <CheckCircle2
                      size={14}
                    />
                  </span>

                </div>
              </div>

              {/* Identity */}

              <div className="mt-5 text-center">

                <h2 className="break-words text-xl font-bold text-[#172033]">
                  {displayName}
                </h2>

                <p className="mt-1 text-sm font-medium text-[#64748B]">
                  {displayDesignation}
                </p>

                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active Account
                </div>
              </div>

              {/* Quick Information */}

              <div className="mt-7 space-y-3 border-t border-slate-100 pt-6">

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Mail size={17} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-slate-700">
                      {displayEmail}
                    </p>

                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <Phone size={17} />
                  </div>

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {displayPhone}
                    </p>

                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Building2 size={17} />
                  </div>

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Department
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {displayDepartment}
                    </p>

                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <MapPin size={17} />
                  </div>

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {displayLocation}
                    </p>

                  </div>
                </div>

              </div>

              {/* Completion */}

              <div className="mt-6 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4">

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-xs font-bold text-slate-600">
                    Profile Completion
                  </span>

                  <span className="text-xs font-bold text-blue-600">
                    {completionPercentage}%
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-200">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#DC2626] via-[#2563EB] to-[#22D3EE] transition-all duration-700"
                    style={{
                      width: `${completionPercentage}%`,
                    }}
                  />

                </div>
              </div>

            </div>
          </section>

          {/* ==================================================
              RIGHT PROFESSIONAL INFORMATION
          =================================================== */}

          <section className="relative overflow-hidden rounded-3xl border border-white bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">

            <div className="h-[3px] w-full bg-gradient-to-r from-[#DC2626] via-[#2563EB] to-[#22D3EE]" />

            <div className="p-5 sm:p-6 lg:p-8">

              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                    Profile Details
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#172033]">
                    Professional Information
                  </h2>

                  <p className="mt-1 text-sm text-[#64748B]">
                    Your current account and professional details.
                  </p>

                </div>

                <div className="hidden items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 sm:flex">

                  <BriefcaseBusiness
                    size={15}
                    className="text-blue-600"
                  />

                  <span className="text-xs font-semibold text-slate-600">
                    Project Manager
                  </span>

                </div>
              </div>

              {/* Details */}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <UserCircle
                        size={18}
                      />
                    </div>

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Full Name
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {displayName}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Mail size={18} />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Email Address
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                        {displayEmail}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                      <Phone size={18} />
                    </div>

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Phone
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {displayPhone}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <BriefcaseBusiness
                        size={18}
                      />
                    </div>

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Designation
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {displayDesignation}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <Building2
                        size={18}
                      />
                    </div>

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Department
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {displayDepartment}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                      <MapPin
                        size={18}
                      />
                    </div>

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        Location
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {displayLocation}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* Bio */}

              <div className="mt-5 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <FileText
                      size={18}
                    />
                  </div>

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Professional Bio
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      About the Project Manager
                    </p>

                  </div>

                </div>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {displayBio}
                </p>

              </div>

              {/* Account Status */}

              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <ShieldCheck
                      size={17}
                    />
                  </div>

                  <div>

                    <p className="text-xs font-bold text-slate-700">
                      Account Status
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Your Project Manager account is active.
                    </p>

                  </div>
                </div>

                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>

              </div>

            </div>
          </section>
        </div>

        {/* ====================================================
            EDIT FORM
            THIS IS THE ONLY PLACE FORM EXISTS
        ===================================================== */}

        {editing && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                if (!saving) {
                  handleCloseEdit();
                }
              }
            }}
          >
            <div
              className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-[0_25px_80px_rgba(15,23,42,0.30)]"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >

              {/* Gradient Stroke */}

              <div className="h-[4px] w-full bg-gradient-to-r from-[#DC2626] via-[#2563EB] to-[#22D3EE]" />

              {/* Header */}

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                    Edit Profile
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#172033]">
                    Update Your Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Update your professional profile details.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseEdit
                  }
                  disabled={saving}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50"
                >
                  <X size={19} />
                </button>

              </div>

              {/* Form Content */}

              <div className="max-h-[calc(92vh-105px)] overflow-y-auto p-5 sm:p-7">

                {error && (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={
                    handleSave
                  }
                >

                  <div className="grid gap-5 md:grid-cols-2">

                    {/* FULL NAME */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Full Name
                      </label>

                      <div className="relative">

                        <UserCircle
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          name="fullName"
                          value={
                            formData.fullName
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Enter full name"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />

                      </div>
                    </div>

                    {/* EMAIL */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Email
                      </label>

                      <div className="relative">

                        <Mail
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="email"
                          name="email"
                          value={
                            formData.email
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Enter email address"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />

                      </div>
                    </div>

                    {/* PHONE */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Phone
                      </label>

                      <div className="relative">

                        <Phone
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          name="phone"
                          value={
                            formData.phone
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Enter phone number"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                        />

                      </div>
                    </div>

                    {/* DESIGNATION */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Designation
                      </label>

                      <div className="relative">

                        <BriefcaseBusiness
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          name="designation"
                          value={
                            formData.designation
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Project Manager"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />

                      </div>
                    </div>

                    {/* DEPARTMENT */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Department
                      </label>

                      <div className="relative">

                        <Building2
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          name="department"
                          value={
                            formData.department
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Project Management"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />

                      </div>
                    </div>

                    {/* LOCATION */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Location
                      </label>

                      <div className="relative">

                        <MapPin
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          name="location"
                          value={
                            formData.location
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Enter location"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />

                      </div>
                    </div>

                    {/* AVATAR */}

                    <div className="md:col-span-2">

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Avatar URL
                      </label>

                      <div className="relative">

                        <Camera
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="url"
                          name="avatar"
                          value={
                            formData.avatar
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="https://example.com/profile.jpg"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                        />

                      </div>
                    </div>

                    {/* BIO */}

                    <div className="md:col-span-2">

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Professional Bio
                      </label>

                      <div className="relative">

                        <FileText
                          size={17}
                          className="absolute left-3.5 top-3.5 text-slate-400"
                        />

                        <textarea
                          name="bio"
                          value={
                            formData.bio
                          }
                          onChange={
                            handleChange
                          }
                          rows={5}
                          placeholder="Write a short professional bio..."
                          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />

                      </div>
                    </div>

                  </div>

                  {/* FOOTER */}

                  <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                    <button
                      type="button"
                      onClick={
                        handleCloseEdit
                      }
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      <X size={16} />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#DC2626] via-[#2563EB] to-[#22D3EE] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.18)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save size={16} />

                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>

                  </div>

                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectManagerProfile;

