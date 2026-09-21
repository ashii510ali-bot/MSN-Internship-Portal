
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  UserCircle,
  Mail,
  Phone,
  BriefcaseBusiness,
  Building2,
  MapPin,
  CalendarDays,
  Pencil,
  Save,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

const API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/program-manager-profile";

/* ============================================================
   EMPTY FORM
   No default/sample personal information
============================================================ */

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  role: "",
  department: "",
  location: "",
  bio: "",
  joinedDate: "",
};

/* ============================================================
   RESPONSE HELPERS
============================================================ */

function extractProfile(responseData) {
  if (!responseData) {
    return null;
  }

  // { profile: {...} }
  if (responseData.profile) {
    return responseData.profile;
  }

  // { data: { profile: {...} } }
  if (responseData.data?.profile) {
    return responseData.data.profile;
  }

  // { data: {...} }
  if (
    responseData.data &&
    typeof responseData.data === "object" &&
    !Array.isArray(responseData.data)
  ) {
    if (
      responseData.data.fullName ||
      responseData.data.email ||
      responseData.data.phone ||
      responseData.data.role ||
      responseData.data.department
    ) {
      return responseData.data;
    }
  }

  // Direct profile object
  if (
    responseData.fullName ||
    responseData.email ||
    responseData.phone ||
    responseData.role ||
    responseData.department
  ) {
    return responseData;
  }

  return null;
}

function getResponseMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not provided";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatInputDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  // Already in YYYY-MM-DD
  if (
    typeof dateValue === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
  ) {
    return dateValue;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitials(name = "") {
  const cleanName = name.trim();

  if (!cleanName) {
    return "P";
  }

  const words = cleanName
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    ...emptyForm,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  /* ============================================================
     SET FORM FROM SAVED PROFILE
  ============================================================ */

  const setFormFromProfile = (data) => {
    if (!data) {
      setFormData({
        ...emptyForm,
      });
      return;
    }

    setFormData({
      fullName: data.fullName || "",
      email: data.email || "",
      phone: data.phone || "",
      role: data.role || "",
      department: data.department || "",
      location: data.location || "",
      bio: data.bio || "",
      joinedDate: formatInputDate(
        data.joinedDate
      ),
    });
  };

  /* ============================================================
     CLEAR MESSAGES
  ============================================================ */

  const clearMessages = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  /* ============================================================
     UPDATE OTHER PAGES
  ============================================================ */

  const emitProfileUpdated = () => {
    window.dispatchEvent(
      new Event("programManagerProfileUpdated")
    );

    window.dispatchEvent(
      new Event("msnAcademyDataUpdated")
    );
  };

  /* ============================================================
     LOAD PROFILE
  ============================================================ */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.get(
        API_URL
      );

      const profileData = extractProfile(
        response.data
      );

      if (!profileData) {
        setProfile(null);
        setFormData({
          ...emptyForm,
        });
        return;
      }

      setProfile(profileData);
      setFormFromProfile(profileData);
    } catch (error) {
      console.error(
        "LOAD PROFILE ERROR:",
        error
      );

      if (
        error?.response?.status === 404
      ) {
        setProfile(null);
        setFormData({
          ...emptyForm,
        });

        return;
      }

      setErrorMessage(
        getResponseMessage(
          error,
          "Unable to load profile."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     INITIAL LOAD + GLOBAL EVENTS
  ============================================================ */

  useEffect(() => {
    loadProfile();

    const handleProfileUpdated = () => {
      loadProfile();
    };

    window.addEventListener(
      "programManagerProfileUpdated",
      handleProfileUpdated
    );

    return () => {
      window.removeEventListener(
        "programManagerProfileUpdated",
        handleProfileUpdated
      );
    };
  }, []);

  /* ============================================================
     AUTO CLEAR MESSAGES
  ============================================================ */

  useEffect(() => {
    if (!successMessage && !errorMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [
    successMessage,
    errorMessage,
  ]);

  /* ============================================================
     HANDLE INPUT CHANGE
  ============================================================ */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ============================================================
     CREATE / EDIT PROFILE
  ============================================================ */

  const openEditModal = () => {
    clearMessages();

    if (profile) {
      setFormFromProfile(profile);
    } else {
      setFormData({
        ...emptyForm,
      });
    }

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (saving) {
      return;
    }

    if (profile) {
      setFormFromProfile(profile);
    } else {
      setFormData({
        ...emptyForm,
      });
    }

    setShowEditModal(false);
  };

  /* ============================================================
     SAVE PROFILE
============================================================ */

  const handleSave = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!formData.fullName.trim()) {
      setErrorMessage(
        "Please enter your full name."
      );
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage(
        "Please enter your email address."
      );
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage(
        "Please enter your phone number."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        fullName:
          formData.fullName.trim(),

        email:
          formData.email.trim(),

        phone:
          formData.phone.trim(),

        role:
          formData.role.trim(),

        department:
          formData.department.trim(),

        location:
          formData.location.trim(),

        bio:
          formData.bio.trim(),

        joinedDate:
          formData.joinedDate || null,
      };

      console.log(
        "PROFILE SAVE REQUEST:",
        payload
      );

      const response = await axios.put(
        API_URL,
        payload
      );

      console.log(
        "PROFILE SAVE RESPONSE:",
        response.data
      );

      const updatedProfile =
        extractProfile(response.data);

      if (!updatedProfile) {
        throw new Error(
          "The profile was saved, but the updated information was not returned."
        );
      }

      /*
        IMPORTANT:
        Immediately update the dashboard
        with the saved response.
      */
      setProfile(updatedProfile);

      /*
        Keep form synchronized with saved data.
      */
      setFormFromProfile(updatedProfile);

      /*
        Close form after successful save.
      */
      setShowEditModal(false);

      /*
        Show success message.
      */
      setSuccessMessage(
        response.data?.message ||
          "Profile saved successfully."
      );

      /*
        Notify other pages.
      */
      emitProfileUpdated();
    } catch (error) {
      console.error(
        "SAVE PROFILE ERROR:",
        error
      );

      setErrorMessage(
        getResponseMessage(
          error,
          "Unable to save profile."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     REMOVE PROFILE
  ============================================================ */

  const handleDelete = async () => {
    clearMessages();

    try {
      setDeleting(true);

      const response = await axios.delete(
        API_URL
      );

      console.log(
        "PROFILE DELETE RESPONSE:",
        response.data
      );

      /*
        Clear current profile.
      */
      setProfile(null);

      setFormData({
        ...emptyForm,
      });

      setShowDeleteModal(false);

      setSuccessMessage(
        response.data?.message ||
          "Profile removed successfully."
      );

      emitProfileUpdated();
    } catch (error) {
      console.error(
        "DELETE PROFILE ERROR:",
        error
      );

      setErrorMessage(
        getResponseMessage(
          error,
          "Unable to remove profile."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 border-r-red-500" />

          <p className="text-sm font-medium text-slate-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     NO PROFILE
  ============================================================ */

  if (!profile) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage your profile information.
          </p>
        </div>

        {/* Messages */}
        {successMessage && (
          <MessageBox
            type="success"
            message={successMessage}
          />
        )}

        {errorMessage && (
          <MessageBox
            type="error"
            message={errorMessage}
          />
        )}

        {/* Empty State */}
        <div className="relative overflow-hidden rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-600 via-cyan-400 to-red-600" />

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <UserCircle className="h-12 w-12 text-slate-400" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-[#172033]">
            Create Your Profile
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Add your personal and professional information
            to create your profile.
          </p>

          <button
            type="button"
            onClick={openEditModal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Pencil className="h-4 w-4" />
            Create Profile
          </button>
        </div>

        {/* Create Modal */}
        {showEditModal && (
          <EditProfileModal
            formData={formData}
            saving={saving}
            handleChange={handleChange}
            handleSave={handleSave}
            closeEditModal={closeEditModal}
            isCreating
          />
        )}
      </div>
    );
  }

  /* ============================================================
     PROFILE DASHBOARD
  ============================================================ */

  return (
    <div className="space-y-6">
      {/* ========================================================
         PAGE HEADER
      ======================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage your profile information.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={openEditModal}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>

          <button
            type="button"
            onClick={() => {
              clearMessages();
              setShowDeleteModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>

      {/* ========================================================
         MESSAGES
      ======================================================== */}

      {successMessage && (
        <MessageBox
          type="success"
          message={successMessage}
        />
      )}

      {errorMessage && (
        <MessageBox
          type="error"
          message={errorMessage}
        />
      )}

      {/* ========================================================
         PROFILE HERO
      ======================================================== */}

      <ProfileCard>
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {/* Avatar */}
          <div className="relative h-28 w-28 shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 via-cyan-400 to-red-600 p-[3px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#F3F6FB]">
                <span className="text-3xl font-bold text-[#172033]">
                  {getInitials(
                    profile.fullName
                  )}
                </span>
              </div>
            </div>

            <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white bg-emerald-500" />
          </div>

          {/* Main profile */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-[#172033] sm:text-3xl">
                {profile.fullName}
              </h2>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {profile.status || "Active"}
              </span>
            </div>

            {profile.role && (
              <p className="mt-2 text-sm font-semibold text-blue-600">
                {profile.role}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
              {profile.email && (
                <MiniInfo
                  icon={Mail}
                  value={profile.email}
                  iconClass="text-blue-600"
                />
              )}

              {profile.phone && (
                <MiniInfo
                  icon={Phone}
                  value={profile.phone}
                  iconClass="text-red-500"
                />
              )}

              {profile.location && (
                <MiniInfo
                  icon={MapPin}
                  value={profile.location}
                  iconClass="text-cyan-600"
                />
              )}
            </div>
          </div>
        </div>
      </ProfileCard>

      {/* ========================================================
         PERSONAL INFORMATION
      ======================================================== */}

      <ProfileCard>
        <SectionHeader
          icon={UserCircle}
          title="Personal Information"
          description="Your saved personal and contact details."
          iconBoxClass="bg-blue-50"
          iconClass="text-blue-600"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            icon={UserCircle}
            label="Full Name"
            value={profile.fullName}
            iconClass="text-blue-600"
          />

          <InfoItem
            icon={Mail}
            label="Email Address"
            value={profile.email}
            iconClass="text-red-500"
          />

          <InfoItem
            icon={Phone}
            label="Phone Number"
            value={profile.phone}
            iconClass="text-cyan-600"
          />

          <InfoItem
            icon={MapPin}
            label="Location"
            value={profile.location}
            iconClass="text-red-500"
          />

          <InfoItem
            icon={CalendarDays}
            label="Joined Date"
            value={formatDate(
              profile.joinedDate
            )}
            iconClass="text-blue-600"
          />

          <InfoItem
            icon={ShieldCheck}
            label="Status"
            value={
              profile.status || "Active"
            }
            iconClass="text-emerald-600"
          />
        </div>
      </ProfileCard>

      {/* ========================================================
         PROFESSIONAL INFORMATION
      ======================================================== */}

      <ProfileCard>
        <SectionHeader
          icon={BriefcaseBusiness}
          title="Professional Information"
          description="Your professional role and organization details."
          iconBoxClass="bg-red-50"
          iconClass="text-red-600"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <InfoItem
            icon={BriefcaseBusiness}
            label="Role"
            value={profile.role}
            iconClass="text-blue-600"
          />

          <InfoItem
            icon={Building2}
            label="Department"
            value={profile.department}
            iconClass="text-cyan-600"
          />
        </div>
      </ProfileCard>

      {/* ========================================================
         ABOUT ME
      ======================================================== */}

      <ProfileCard>
        <SectionHeader
          icon={UserCircle}
          title="About Me"
          description="Your professional profile summary."
          iconBoxClass="bg-cyan-50"
          iconClass="text-cyan-600"
        />

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
          {profile.bio ? (
            <p className="text-sm leading-7 text-slate-600">
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm italic text-slate-400">
              No bio added yet.
            </p>
          )}
        </div>
      </ProfileCard>

      {/* ========================================================
         ACCOUNT STATUS + ACCESS
      ======================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Status */}
        <ProfileCard>
          <SectionHeader
            icon={ShieldCheck}
            title="Account Status"
            description="Current profile account state."
            iconBoxClass="bg-emerald-50"
            iconClass="text-emerald-600"
          />

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <p className="font-bold text-emerald-800">
                  {profile.status ||
                    "Active"}
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  Your profile is currently active.
                </p>
              </div>
            </div>
          </div>
        </ProfileCard>

        {/* Access */}
        <ProfileCard>
          <SectionHeader
            icon={ShieldCheck}
            title="Access Level"
            description="Current Program Manager permissions."
            iconBoxClass="bg-blue-50"
            iconClass="text-blue-600"
          />

          <div className="grid gap-2">
            {[
              "Manage cohorts",
              "Manage mentors",
              "Monitor reports",
              "Manage announcements",
              "Manage notifications",
            ].map((permission) => (
              <div
                key={permission}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />

                <span className="text-sm font-medium text-slate-700">
                  {permission}
                </span>
              </div>
            ))}
          </div>
        </ProfileCard>
      </div>

      {/* ========================================================
         MEMBER SINCE
      ======================================================== */}

      <ProfileCard>
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-cyan-50 p-3">
            <CalendarDays className="h-6 w-6 text-cyan-600" />
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Member Since
            </p>

            <p className="mt-1 text-lg font-bold text-[#172033]">
              {formatDate(
                profile.joinedDate
              )}
            </p>
          </div>
        </div>
      </ProfileCard>

      {/* ========================================================
         EDIT PROFILE MODAL
      ======================================================== */}

      {showEditModal && (
        <EditProfileModal
          formData={formData}
          saving={saving}
          handleChange={handleChange}
          handleSave={handleSave}
          closeEditModal={closeEditModal}
        />
      )}

      {/* ========================================================
         DELETE MODAL
      ======================================================== */}

      {showDeleteModal && (
        <DeleteProfileModal
          deleting={deleting}
          handleDelete={handleDelete}
          closeModal={() =>
            setShowDeleteModal(false)
          }
        />
      )}
    </div>
  );
}

/* ============================================================
   PROFILE CARD
============================================================ */

function ProfileCard({ children }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-7">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-600 via-cyan-400 to-red-600" />

      {children}
    </div>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  icon: Icon,
  title,
  description,
  iconBoxClass,
  iconClass,
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div
        className={`rounded-xl p-3 ${iconBoxClass}`}
      >
        <Icon
          className={`h-5 w-5 ${iconClass}`}
        />
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#172033]">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   INFORMATION ITEM
============================================================ */

function InfoItem({
  icon: Icon,
  label,
  value,
  iconClass = "text-blue-600",
}) {
  const hasValue =
    value !== undefined &&
    value !== null &&
    String(value).trim() !== "" &&
    String(value).trim() !== "Not provided";

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-white hover:shadow-sm">
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`}
        />

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p
            className={`mt-1 break-words text-sm font-semibold ${
              hasValue
                ? "text-[#172033]"
                : "italic text-slate-400"
            }`}
          >
            {hasValue
              ? value
              : "Not provided"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MINI INFORMATION
============================================================ */

function MiniInfo({
  icon: Icon,
  value,
  iconClass,
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <Icon
        className={`h-4 w-4 ${iconClass}`}
      />

      <span className="break-all">
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   EDIT PROFILE MODAL
============================================================ */

function EditProfileModal({
  formData,
  saving,
  handleChange,
  handleSave,
  closeEditModal,
  isCreating = false,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Gradient border */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-600 via-cyan-400 to-red-600" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-[#172033]">
              {isCreating
                ? "Create Profile"
                : "Edit Profile"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isCreating
                ? "Add your personal and professional information."
                : "Update your profile information."}
            </p>
          </div>

          <button
            type="button"
            onClick={closeEditModal}
            disabled={saving}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSave}
          className="max-h-[calc(92vh-145px)] overflow-y-auto p-5 sm:p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            {/* Full Name */}
            <FormField
              label="Full Name"
              icon={UserCircle}
            >
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="form-input"
              />
            </FormField>

            {/* Email */}
            <FormField
              label="Email Address"
              icon={Mail}
            >
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="form-input"
              />
            </FormField>

            {/* Phone */}
            <FormField
              label="Phone Number"
              icon={Phone}
            >
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="form-input"
              />
            </FormField>

            {/* Role */}
            <FormField
              label="Role"
              icon={BriefcaseBusiness}
            >
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Enter your role"
                className="form-input"
              />
            </FormField>

            {/* Department */}
            <FormField
              label="Department"
              icon={Building2}
            >
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Enter your department"
                className="form-input"
              />
            </FormField>

            {/* Location */}
            <FormField
              label="Location"
              icon={MapPin}
            >
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter your location"
                className="form-input"
              />
            </FormField>

            {/* Joined Date */}
            <FormField
              label="Joined Date"
              icon={CalendarDays}
            >
              <input
                type="date"
                name="joinedDate"
                value={formData.joinedDate}
                onChange={handleChange}
                className="form-input"
              />
            </FormField>
          </div>

          {/* Bio */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Bio
            </label>

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={5}
              placeholder="Write a short professional bio"
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Buttons */}
          <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={closeEditModal}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   FORM FIELD
============================================================ */

function FormField({
  label,
  icon: Icon,
  children,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <div className="[&_.form-input]:w-full [&_.form-input]:rounded-xl [&_.form-input]:border [&_.form-input]:border-slate-200 [&_.form-input]:bg-white [&_.form-input]:py-3 [&_.form-input]:pl-10 [&_.form-input]:pr-4 [&_.form-input]:text-sm [&_.form-input]:text-slate-700 [&_.form-input]:outline-none [&_.form-input]:transition [&_.form-input]:placeholder:text-slate-400 [&_.form-input]:focus:border-blue-500 [&_.form-input]:focus:ring-4 [&_.form-input]:focus:ring-blue-500/10">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DELETE PROFILE MODAL
============================================================ */

function DeleteProfileModal({
  deleting,
  handleDelete,
  closeModal,
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-600 via-cyan-400 to-red-600" />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#172033]">
                  Remove Profile
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  This action will remove your saved profile.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeModal}
              disabled={deleting}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm leading-6 text-red-700">
              Are you sure you want to remove your profile?
              All saved profile information will be deleted.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              disabled={deleting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />

              {deleting
                ? "Removing..."
                : "Remove Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MESSAGE BOX
============================================================ */

function MessageBox({
  type,
  message,
}) {
  const isSuccess =
    type === "success";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      ) : (
        <AlertCircle className="h-5 w-5 shrink-0" />
      )}

      <span>{message}</span>
    </div>
  );
}

export default Profile;

