
import React, {
  useCallback,
  useEffect,
  useMemo,
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
  "https://internship-portal-backend-olive.vercel.app/api/program-manager-profile";

const NOTIFICATIONS_API_URL =
  "https://internship-portal-backend-olive.vercel.app/api/notifications";

const searchItems = [
  {
    name: "Dashboard",
    path: "/program-manager",
  },
  {
    name: "Cohorts",
    path: "/program-manager/cohorts",
  },
  {
    name: "Mentors",
    path: "/program-manager/mentors",
  },
  {
    name: "Projects Management",
    path: "/program-manager/projects",
  },
  {
    name: "Announcements",
    path: "/program-manager/announcements",
  },
  {
    name: "Notifications",
    path: "/program-manager/notifications",
  },
  {
    name: "Reports",
    path: "/program-manager/reports",
  },
  {
    name: "Profile",
    path: "/program-manager/profile",
  },
];

function extractProfile(response) {
  return (
    response?.data?.data ||
    response?.data?.profile ||
    response?.data ||
    null
  );
}

function extractNotifications(response) {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.notifications)) {
    return data.notifications;
  }

  return [];
}

function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "PM";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();
}

function ProgramManagerNavbar({ onMenuClick }) {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [searchValue, setSearchValue] = useState("");
  const [showSearchResults, setShowSearchResults] =
    useState(false);

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const [loadingProfile, setLoadingProfile] =
    useState(false);

  const token = localStorage.getItem("token");

  const authConfig = useMemo(() => {
    if (!token) {
      return {};
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);

      const response = await axios.get(
        PROFILE_API_URL,
        authConfig
      );

      setProfile(extractProfile(response));
    } catch (error) {
      console.error(
        "Program Manager Profile Error:",
        error
      );
    } finally {
      setLoadingProfile(false);
    }
  }, [authConfig]);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await axios.get(
        NOTIFICATIONS_API_URL,
        authConfig
      );

      const notifications =
        extractNotifications(response);

      const unread = notifications.filter(
        (item) =>
          item?.isRead === false ||
          item?.read === false ||
          item?.status === "Unread"
      ).length;

      setUnreadCount(unread);
    } catch (error) {
      console.error(
        "Program Manager Notifications Error:",
        error
      );
    }
  }, [authConfig]);

  useEffect(() => {
    loadProfile();
    loadNotifications();

    const profileHandler = () => {
      loadProfile();
    };

    const dataHandler = () => {
      loadProfile();
      loadNotifications();
    };

    const notificationHandler = () => {
      loadNotifications();
    };

    window.addEventListener(
      "programManagerProfileUpdated",
      profileHandler
    );

    window.addEventListener(
      "msnAcademyDataUpdated",
      dataHandler
    );

    window.addEventListener(
      "notificationDataUpdated",
      notificationHandler
    );

    const interval = setInterval(() => {
      loadProfile();
      loadNotifications();
    }, 10000);

    return () => {
      window.removeEventListener(
        "programManagerProfileUpdated",
        profileHandler
      );

      window.removeEventListener(
        "msnAcademyDataUpdated",
        dataHandler
      );

      window.removeEventListener(
        "notificationDataUpdated",
        notificationHandler
      );

      clearInterval(interval);
    };
  }, [loadProfile, loadNotifications]);

  const filteredSearchItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return searchItems.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [searchValue]);

  const handleSearchNavigate = (path) => {
    navigate(path);
    setSearchValue("");
    setShowSearchResults(false);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    if (filteredSearchItems.length > 0) {
      handleSearchNavigate(
        filteredSearchItems[0].path
      );
    }
  };

  const fullName =
    profile?.fullName ||
    profile?.name ||
    "Program Manager";

  const role =
    profile?.designation ||
    profile?.role ||
    "Program Manager";

  const email =
    profile?.email ||
    "programmanager@msnacademy.com";

  const avatar =
    profile?.avatar ||
    profile?.profileImage ||
    "";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0E2A52]/95 shadow-sm backdrop-blur-md">
      {/* Top Gradient Accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-red-500 via-blue-500 to-cyan-400" />

      <div className="flex h-[78px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Left Section */}
        <div className="flex min-w-0 items-center gap-3">

          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Gradient M Logo */}
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full p-[2px] bg-gradient-to-br from-red-500 via-blue-500 to-cyan-400 shadow-lg shadow-blue-500/10">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0E2A52]">
              <span className="bg-gradient-to-br from-red-400 via-blue-400 to-cyan-300 bg-clip-text text-lg font-extrabold text-transparent">
                M
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-white sm:text-xl">
              MSN Academy
            </h1>

            <p className="truncate text-xs text-blue-100 sm:text-sm">
              Program Manager Dashboard
            </p>

            <p className="hidden text-xs text-blue-200 sm:block">
              Welcome back, {fullName}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative hidden max-w-xl flex-1 md:block">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => {
                if (searchValue.trim()) {
                  setShowSearchResults(true);
                }
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search page..."
              className="h-11 w-full rounded-xl border border-white/10 bg-white px-11 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />

            {searchValue && (
              <button
                type="button"
                onClick={() => {
                  setSearchValue("");
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {showSearchResults &&
            filteredSearchItems.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                {filteredSearchItems.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() =>
                      handleSearchNavigate(item.path)
                    }
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Search
                      size={15}
                      className="mr-3"
                    />
                    {item.name}
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Notification */}
          <button
            type="button"
            onClick={() =>
              navigate("/program-manager/notifications")
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-[19px] min-w-[19px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="relative">

            {/* Gradient line above profile */}
            <div className="absolute -top-[5px] left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-red-500 via-blue-500 to-cyan-400" />

            <button
              type="button"
              onClick={() =>
                setShowProfileMenu((prev) => !prev)
              }
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-white transition hover:bg-white/10"
            >
              {/* Profile Circle with Gradient Border */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-blue-500 to-cyan-400 p-[2px]">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#0E2A52]">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : loadingProfile ? (
                    <span className="text-xs font-semibold text-white">
                      ...
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {getInitials(fullName)}
                    </span>
                  )}
                </div>
              </div>

              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-[130px] truncate text-sm font-semibold">
                  {fullName}
                </p>

                <p className="max-w-[130px] truncate text-[11px] text-blue-200">
                  {role}
                </p>
              </div>

              <ChevronDown
                size={16}
                className={`hidden transition-transform sm:block ${
                  showProfileMenu
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                {/* Gradient Dropdown Top */}
                <div className="h-[3px] w-full bg-gradient-to-r from-red-500 via-blue-500 to-cyan-400" />

                <div className="border-b border-slate-100 px-4 py-4">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {fullName}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {email}
                  </p>

                  <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {role}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate(
                      "/program-manager/profile"
                    );
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <UserCircle
                    size={18}
                    className="text-blue-600"
                  />
                  My Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default ProgramManagerNavbar;

