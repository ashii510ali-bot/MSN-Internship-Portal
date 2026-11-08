
import { Outlet } from "react-router-dom";
import { AppShell } from "../../components/layout";

import {
  IconDashboard,
  IconUsers,
  IconPrograms,
  IconShield,
  IconBell,
  IconSettings,
  IconProfile,
  IconLogout,
} from "../../components/shared/icons";

import { useCurrentUser, useNotifications } from "../../api";

// SIDEBAR NAVIGATION
const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: IconDashboard,
  },
  {
    href: "/admin/users",
    label: "User & Role Management",
    icon: IconUsers,
  },
  {
    href: "/admin/programs",
    label: "Programs",
    icon: IconPrograms,
  },
  {
    href: "/admin/audit",
    label: "Security & Audit Logs",
    icon: IconShield,
  },
  {
    href: "/admin/notifications",
    label: "Notifications",
    icon: IconBell,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: IconSettings,
  },
];

// BOTTOM SIDEBAR ITEMS
const BOTTOM_ITEMS = [
  {
    href: "/admin/profile",
    label: "Profile",
    icon: IconProfile,
  },
  {
    href: "/admin/logout",
    label: "Logout",
    icon: IconLogout,
  },
];

export default function SuperAdminLayout() {
  const { data: user } = useCurrentUser();
  const { data: notifications } = useNotifications();

  const unreadCount =
    notifications?.filter((n) => !n.isRead).length ?? 0;

  const userName = user?.name || "Super Admin";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <AppShell
      navItems={NAV_ITEMS}
      bottomItems={BOTTOM_ITEMS}
      navbar={{
        eyebrow: "SYSTEM MANAGEMENT",
        title: "Super Admin Dashboard",
        subtitle: `Welcome back, ${userName} — system-wide overview.`,
        userName,
        userRoleLabel: "Super Admin",
        userInitial,
        notificationCount: unreadCount,
        searchPlaceholder: "Search users, programs, audit logs...",
        notificationsHref: "/admin/notifications",
      }}
    >
      <Outlet />
    </AppShell>
  );
}
