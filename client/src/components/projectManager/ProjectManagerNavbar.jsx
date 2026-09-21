
import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  UserCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PROFILE_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/project-manager-profile";

const NOTIFICATIONS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/project-manager/notifications";

const searchItems = [
  {
    name: "Dashboard",
    path: "/project-manager",
  },
  {
    name: "Team Management",
    path: "/project-manager/team",
  },
  {
    name: "Projects & Tasks",
    path: "/project-manager/projects-tasks",
  },
  {
    name: "Scrum Review",
    path: "/project-manager/scrum-review",
  },
  {
    name: "Notifications",
    path: "/project-manager/notifications",
  },
  {
    name: "Profile",
    path: "/project-manager/profile",
  },
];

function extractProfile(data) {
  if (!data) return null;

  if (data.profile) return data.profile;
  if (data.user) return data.user;
  if (data.data) return data.data;

  return data;
}

function extractNotifications(data) {
  if (!data) return [];

  if (Array.isArray(data)) return data;

  if (Array.isArray(data.notifications)) {
    return data.notifications;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

function getInitials(profile) {
  if (!profile) return "PM";

  const firstName =
    profile.firstName ||
    profile.first_name ||
    "";

  const lastName =
    profile.lastName ||
    profile.last_name ||
    "";

  if (firstName || lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
      .toUpperCase();
  }

  if (profile.name) {
    return profile.name
      .split(" ")
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return "PM";
}

function ProjectManagerNavbar({
  onMenuClick,
}) {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState(null);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [showSearchResults, setShowSearchResults] =
    useState(false);

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);

  // ==========================================================
  // LOAD PROFILE
  // ==========================================================

  const loadProfile = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {};

      const response = await axios.get(
        PROFILE_API_URL,
        config
      );

      const profileData = extractProfile(
        response.data
      );

      setProfile(profileData);
    } catch (error) {
      console.log(
        "Project Manager profile API not available yet."
      );
    }
  };

  // ==========================================================
  // LOAD NOTIFICATIONS
  // ==========================================================

  const loadNotifications = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {};

      const response = await axios.get(
        NOTIFICATIONS_API_URL,
        config
      );

      const notifications =
        extractNotifications(
          response.data
        );

      const unread =
        notifications.filter(
          (notification) =>
            notification.isRead !== true
        );

      setUnreadCount(unread.length);
    } catch (error) {
      setUnreadCount(0);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadProfile();
    loadNotifications();

    const profileHandler = () => {
      loadProfile();
    };

    const notificationHandler = () => {
      loadNotifications();
    };

    window.addEventListener(
      "projectManagerProfileUpdated",
      profileHandler
    );

    window.addEventListener(
      "projectManagerNotificationDataUpdated",
      notificationHandler
    );

    window.addEventListener(
      "msnAcademyDataUpdated",
      profileHandler
    );

    const interval = setInterval(() => {
      loadProfile();
      loadNotifications();
    }, 10000);

    return () => {
      window.removeEventListener(
        "projectManagerProfileUpdated",
        profileHandler
      );

      window.removeEventListener(
        "projectManagerNotificationDataUpdated",
        notificationHandler
      );

      window.removeEventListener(
        "msnAcademyDataUpdated",
        profileHandler
      );

      clearInterval(interval);
    };
  }, []);

  // ==========================================================
  // CLICK OUTSIDE
  // ==========================================================

  useEffect(() => {
    const handleClickOutside = (
      event
    ) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target
        )
      ) {
        setShowSearchResults(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredSearchItems =
    searchItems.filter((item) =>
      item.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const handleSearchNavigate = (
    path
  ) => {
    navigate(path);
    setSearch("");
    setShowSearchResults(false);
  };

  const handleSearchKeyDown = (
    event
  ) => {
    if (event.key === "Escape") {
      setSearch("");
      setShowSearchResults(false);
      return;
    }

    if (
      event.key === "Enter" &&
      filteredSearchItems.length > 0
    ) {
      handleSearchNavigate(
        filteredSearchItems[0].path
      );
    }
  };

  // ==========================================================
  // PROFILE DATA
  // ==========================================================

  const displayName =
    profile?.name ||
    profile?.fullName ||
    `${profile?.firstName || ""} ${
      profile?.lastName || ""
    }`.trim() ||
    "Project Manager";

  const displayRole =
    profile?.role ||
    profile?.designation ||
    "Project Manager";

  const initials =
    getInitials(profile);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0E2A52]/95 shadow-[0_8px_30px_rgba(11,35,69,0.15)] backdrop-blur-xl">

      {/* =========================
          TOP GRADIENT STROKE
      ========================== */}

      <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-red-500 via-blue-500 to-cyan-400" />

      <div className="flex min-h-[80px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* =========================
            LEFT SECTION
        ========================== */}

        <div className="flex min-w-0 items-center gap-3">

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="rounded-xl border border-white/10 bg-white/[0.05] p-2 text-white transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.10] lg:hidden"
          >
            <Menu size={22} />
          </button>

          {/* Gradient M Logo */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-blue-500 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/10">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0E2A52]">
              <span className="bg-gradient-to-br from-red-400 via-blue-400 to-cyan-300 bg-clip-text text-base font-extrabold text-transparent">
                M
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-white sm:text-lg">
                Project Manager Dashboard
              </h1>

              <span className="hidden rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 sm:inline-flex">
                MSN Academy
              </span>
            </div>

            <p className="mt-0.5 truncate text-xs text-blue-100 sm:text-sm">
              Manage your projects and team
            </p>
          </div>
        </div>

        {/* =========================
            RIGHT SECTION
        ========================== */}

        <div className="flex items-center gap-2 sm:gap-3">

          {/* =========================
              SEARCH
          ========================== */}

          <div
            ref={searchRef}
            className="relative hidden md:block"
          >
            <div className="flex h-10 w-[220px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-3 transition-all duration-300 focus-within:border-cyan-400/50 focus-within:bg-white/[0.10] focus-within:shadow-[0_0_20px_rgba(34,211,238,0.10)] lg:w-[280px]">

              <Search
                size={17}
                className="shrink-0 text-blue-200"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );

                  setShowSearchResults(
                    event.target.value.length >
                      0
                  );
                }}
                onFocus={() => {
                  if (search.length > 0) {
                    setShowSearchResults(
                      true
                    );
                  }
                }}
                onKeyDown={
                  handleSearchKeyDown
                }
                placeholder="Search page..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-blue-200/70"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setShowSearchResults(
                      false
                    );
                  }}
                  className="text-blue-200 transition hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {showSearchResults && (
              <div className="absolute right-0 top-12 w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">

                {/* Gradient Top */}
                <div className="h-[2px] w-full bg-gradient-to-r from-red-500 via-blue-500 to-cyan-400" />

                {filteredSearchItems.length >
                0 ? (
                  filteredSearchItems.map(
                    (item) => (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() =>
                          handleSearchNavigate(
                            item.path
                          )
                        }
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#172033] transition hover:bg-[#F3F6FB] hover:text-blue-600"
                      >
                        <Search
                          size={15}
                          className="text-blue-600"
                        />

                        {item.name}
                      </button>
                    )
                  )
                ) : (
                  <div className="px-4 py-4 text-sm text-[#64748B]">
                    No page found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =========================
              NOTIFICATIONS
          ========================== */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/project-manager/notifications"
              )
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-white transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/[0.11] hover:text-cyan-300"
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]">
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          {/* =========================
              PROFILE
          ========================== */}

          <div
            ref={profileRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setShowProfileMenu(
                  (previous) =>
                    !previous
                )
              }
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-2 py-1.5 transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/[0.11]"
            >

              {/* Gradient Avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-blue-500 to-cyan-400 p-[2px]">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#0E2A52] text-xs font-bold text-white">
                  {profile?.avatar ||
                  profile?.profileImage ? (
                    <img
                      src={
                        profile.avatar ||
                        profile.profileImage
                      }
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
              </div>

              <div className="hidden text-left sm:block">
                <p className="max-w-[120px] truncate text-xs font-semibold text-white">
                  {displayName}
                </p>

                <p className="max-w-[120px] truncate text-[10px] text-blue-200">
                  {displayRole}
                </p>
              </div>

              <ChevronDown
                size={15}
                className={`hidden text-blue-200 transition-transform sm:block ${
                  showProfileMenu
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.20)]">

                {/* Gradient Header */}
                <div className="h-[3px] w-full bg-gradient-to-r from-red-500 via-blue-500 to-cyan-400" />

                <div className="bg-gradient-to-r from-[#0E2A52] via-[#12345D] to-[#0E2A52] p-4">
                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-blue-500 to-cyan-400 p-[2px]">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0E2A52] text-sm font-bold text-white">
                        {initials}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {displayName}
                      </p>

                      <p className="truncate text-xs text-blue-200">
                        {displayRole}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="p-2">

                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/project-manager/profile"
                      );
                      setShowProfileMenu(
                        false
                      );
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#F3F6FB] hover:text-blue-600"
                  >
                    <UserCircle
                      size={17}
                      className="text-blue-600"
                    />

                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        "/project-manager/notifications"
                      );
                      setShowProfileMenu(
                        false
                      );
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#F3F6FB] hover:text-cyan-600"
                  >
                    <Bell
                      size={17}
                      className="text-cyan-600"
                    />

                    Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default ProjectManagerNavbar;

