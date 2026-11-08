//admin@msnacademy.com
//Msn@12345
import { useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQueryClient } from "@tanstack/react-query";
import {
  HeroCard,
  KpiCard,
  StatusBadge,
  statusToneFor,
  DataTable,
  ProgressBar,
} from "../../components/shared";
import {
  IconRefresh,
  IconUsers,
  IconLayers,
  IconHeartPulse,
  IconClipboard,
  IconDownload,
} from "../../components/shared/icons";
import { useUsers, usePrograms, useAuditLogs, queryKeys } from "../../api";
import {
  ROLE_LABEL,
  STATUS_LABEL,
  formatTimestampShort,
} from "../../lib/labels";

export default function SuperAdminDashboardPage() {
  const queryClient = useQueryClient();

  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 50 });
  const { data: programsData, isLoading: programsLoading } = usePrograms();
  const { data: auditData, isLoading: auditLoading } = useAuditLogs({
    limit: 5,
  });

  const users = usersData?.data ?? [];
  const programs = programsData ?? [];
  const logs = auditData?.data ?? [];

  const loading = usersLoading || programsLoading || auditLoading;

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all });
  }, [queryClient]);

  // Derived KPI values optimized with useMemo
  const kpis = useMemo(() => {
    const totalUsers = users.length;
    const distinctRoles = new Set(users.map((u) => u.role)).size;
    const activeUsers = users.filter(
      (u) => (u.status ?? "").toLowerCase() === "active",
    ).length;
    return {
      totalUsers,
      distinctRoles,
      activeUsers,
      // NOTE: systemHealth is static until a real /health endpoint is available
      systemHealth: "Nominal",
    };
  }, [users]);

  const userColumns = useMemo(
    () => [
      { key: "name", header: "Name" },
      {
        key: "role",
        header: "Role",
        cell: (row) => ROLE_LABEL[row.role] ?? row.role,
      },
      {
        key: "statusLabel",
        header: "Status",
        cell: (row) => (
          <StatusBadge tone={statusToneFor(row.status)}>
            {STATUS_LABEL[row.status] ?? row.status}
          </StatusBadge>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        width: "120px",
        cell: () => (
          <Link
            to="/admin/users"
            className="text-sm font-semibold text-[#2563EB] hover:underline"
          >
            Edit
          </Link>
        ),
      },
    ],
    [],
  );

  const userRows = useMemo(
    () =>
      users.slice(0, 5).map((u) => ({
        ...u,
        statusLabel: STATUS_LABEL[u.status] ?? u.status,
      })),
    [users],
  );

  const auditColumns = useMemo(
    () => [
      {
        key: "timestamp",
        header: "Timestamp",
        cell: (row) => formatTimestampShort(row.timestamp),
        sortable: true,
        sortFn: (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      },
      { key: "userName", header: "User" },
      {
        key: "action",
        header: "Action",
        cell: (row) => {
          const label = row.action.replace(/_/g, " ");
          return (
            <span className="font-medium capitalize text-[#172033]">
              {label}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <Helmet>
        <title>Dashboard | Super Admin | MSN Academy</title>
      </Helmet>
      <div className="space-y-6">
        <HeroCard
          eyebrow="SYSTEM MANAGEMENT"
          title="Super Admin Dashboard"
          description="System-wide overview, users, programs, and security at a glance."
          eyebrowTone="blue"
          badge={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2">
                <span
                  aria-hidden
                  className="grid h-7 w-7 place-items-center rounded-lg bg-[#ECFDF5] text-[#10B981]"
                >
                  <IconHeartPulse size={16} />
                </span>
                <div className="leading-tight">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#64748B]">
                    System
                  </div>
                  <div className="text-sm font-semibold text-[#10B981]">
                    {kpis.systemHealth}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                aria-label="Refresh dashboard"
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#E2E8F0] bg-white text-[#2563EB] hover:bg-[#F8FAFC] transition-colors"
              >
                <IconRefresh
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          }
        />

        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={IconUsers}
            value={loading ? "—" : kpis.totalUsers}
            label="Total Users"
            description="Across all roles"
            tone="blue"
          />

          <KpiCard
            icon={IconLayers}
            value={loading ? "—" : kpis.distinctRoles}
            label="Roles"
            description="Configured role types"
            tone="violet"
          />

          <KpiCard
            icon={IconClipboard}
            value={loading ? "—" : kpis.activeUsers}
            label="Active Users"
            description="Accounts with Active status"
            tone="cyan"
          />

          <KpiCard
            icon={IconHeartPulse}
            value={kpis.systemHealth}
            label="System Health"
            description="All services nominal"
            tone="green"
          />
        </div>

        {/* User Accounts summary table */}
        <div className="mt-2 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[#172033]">
            User Accounts
          </h3>
          <Link
            to="/admin/users"
            className="text-xs font-semibold text-[#2563EB] hover:underline"
          >
            Manage all →
          </Link>
        </div>
        <DataTable
          columns={userColumns}
          rows={userRows}
          rowKey={(r) => r.id}
          emptyText={loading ? "Loading users..." : "No users yet."}
        />

        {/* Programs preview */}
        <div className="mt-2 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[#172033]">
            Programs Snapshot
          </h3>
          <Link
            to="/admin/programs"
            className="text-xs font-semibold text-[#2563EB] hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {programs.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_2px_6px_rgba(15,23,42,0.04)] hover-lift-card"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748B]">
                    Cohort
                  </div>
                  <div className="mt-0.5 truncate text-sm font-semibold text-[#172033]">
                    {p.name}
                  </div>
                </div>
                <StatusBadge tone={statusToneFor(p.status)}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </StatusBadge>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-[#64748B]">
                <span>PM: {p.programManager}</span>
                <span>{p.cohortSize} interns</span>
              </div>
              <div className="mt-3">
                <ProgressBar value={p.progress} />
              </div>
            </div>
          ))}
        </div>

        {/* Audit log preview */}
        <div className="mt-2 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[#172033]">
            Audit Log
          </h3>
          <Link
            to="/admin/audit"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline"
          >
            <IconDownload size={12} />
            Open full log
          </Link>
        </div>
        <DataTable
          columns={auditColumns}
          rows={logs}
          rowKey={(r) => r.id}
          emptyText={loading ? "Loading..." : "No audit events."}
        />
      </div>
    </>
  );
}
