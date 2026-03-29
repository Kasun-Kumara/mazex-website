"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  SunMedium,
} from "lucide-react";
import { logoutAdminAction } from "@/app/admin/actions";

type AdminDashboardShellProps = {
  adminEmail: string;
  adminLabel: string;
  adminName: string;
};

type ThemeMode = "dark" | "light";

const themeStorageKey = "mazex-admin-theme";

const summaryCards = [
  {
    label: "Unique visitors",
    value: "12.8K",
    change: "+14.2%",
    detail: "Compared with last event announcement week",
  },
  {
    label: "Registration starts",
    value: "486",
    change: "+8.1%",
    detail: "People who opened the form and began filling it",
  },
  {
    label: "Completion rate",
    value: "68%",
    change: "+5.4%",
    detail: "Healthy handoff from landing page to form submit",
  },
  {
    label: "Avg. session",
    value: "4m 12s",
    change: "+32s",
    detail: "Visitors are spending longer on key sections",
  },
];

const weeklyTraffic = [
  { label: "Mon", value: 48 },
  { label: "Tue", value: 62 },
  { label: "Wed", value: 74 },
  { label: "Thu", value: 58 },
  { label: "Fri", value: 89 },
  { label: "Sat", value: 72 },
  { label: "Sun", value: 66 },
];

const trafficSources = [
  { label: "Instagram", value: 42 },
  { label: "Direct", value: 28 },
  { label: "IEEE channels", value: 18 },
  { label: "Campus shares", value: 12 },
];

const funnelStages = [
  { label: "Landing page views", value: "12.8K" },
  { label: "CTA clicks", value: "2.9K" },
  { label: "Form starts", value: "486" },
  { label: "Completed submissions", value: "331" },
];

const recentActivity = [
  {
    title: "Spike in workshop page visits",
    time: "12 minutes ago",
    detail: "Traffic picked up after a fresh social post went live.",
  },
  {
    title: "Registration form completion improved",
    time: "1 hour ago",
    detail: "Mobile drop-off reduced after shortening the first step.",
  },
  {
    title: "Admin session policy verified",
    time: "Today",
    detail: "Protected routes are still limited to verified admin users.",
  },
];

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function AdminDashboardShell({
  adminEmail,
  adminLabel,
  adminName,
}: AdminDashboardShellProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const hasLoadedStoredTheme = useRef(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(themeStorageKey);
    const frameId = window.requestAnimationFrame(() => {
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }

      hasLoadedStoredTheme.current = true;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredTheme.current) {
      return;
    }

    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date()),
    [],
  );

  const displayName = adminName.trim() || adminEmail.split("@")[0] || "Admin";

  return (
    <div
      className="admin-shell min-h-screen"
      data-theme={theme}
      suppressHydrationWarning
    >
      <div className="flex min-h-screen">
        <div
          className={cn(
            "fixed inset-0 z-30 lg:hidden",
            mobileSidebarOpen ? "block" : "hidden",
          )}
        >
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="h-full w-full bg-[#020617]"
            onClick={() => setMobileSidebarOpen(false)}
          />
        </div>

        <aside
          className={cn(
            "admin-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r transition-transform duration-300 lg:static lg:translate-x-0",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
            sidebarCollapsed ? "lg:w-24" : "lg:w-72",
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--admin-sidebar-border)] px-5 py-5">
            <div
              className={cn(
                "min-w-0",
                sidebarCollapsed && "lg:hidden",
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">
                MazeX
              </p>
              <h1 className="mt-2 text-xl font-semibold text-[var(--admin-text)]">
                Admin
              </h1>
            </div>
            <button
              type="button"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setSidebarCollapsed((current) => !current)}
              className="admin-icon-button hidden lg:inline-flex"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4.5 w-4.5" />
              ) : (
                <PanelLeftClose className="h-4.5 w-4.5" />
              )}
            </button>
          </div>

          <div className="flex-1 px-4 py-5">
            <p
              className={cn(
                "px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--admin-muted)]",
                sidebarCollapsed && "lg:hidden",
              )}
            >
              Workspace
            </p>
            <nav className="mt-4">
              <button
                type="button"
                className="admin-nav-item w-full"
                data-active="true"
              >
                <BarChart3 className="h-5 w-5 shrink-0" />
                <span className={cn(sidebarCollapsed && "lg:hidden")}>
                  Analytics
                </span>
                <ChevronRight
                  className={cn(
                    "ml-auto h-4 w-4",
                    sidebarCollapsed && "lg:hidden",
                  )}
                />
              </button>
            </nav>
          </div>

          <div className="border-t border-[var(--admin-sidebar-border)] px-4 py-4">
            <div className="admin-panel-subtle flex items-center gap-3 p-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-accent)] text-[var(--admin-accent-contrast)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className={cn("min-w-0", sidebarCollapsed && "lg:hidden")}>
                <p className="truncate text-sm font-semibold text-[var(--admin-text)]">
                  {displayName}
                </p>
                <p className="truncate text-sm text-[var(--admin-muted)]">
                  {adminEmail}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "mt-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-3 text-sm text-[var(--admin-muted)]",
                sidebarCollapsed && "lg:hidden",
              )}
            >
              Verified with the <span className="font-semibold text-[var(--admin-text)]">{adminLabel}</span> label.
            </div>

            <form action={logoutAdminAction} className="mt-4">
              <button
                type="submit"
                className={cn(
                  "admin-button-secondary flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold",
                  sidebarCollapsed && "lg:px-0",
                )}
              >
                <LogOut className="h-4.5 w-4.5 shrink-0" />
                <span className={cn(sidebarCollapsed && "lg:hidden")}>
                  Sign out
                </span>
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-[var(--admin-border)] bg-[var(--admin-header)] px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Open sidebar"
                  className="admin-icon-button inline-flex lg:hidden"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--admin-muted)]">
                    Analytics dashboard
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--admin-text)]">
                    MazeX overview
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-sm text-[var(--admin-muted)]">
                  {formattedDate}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTheme((current) =>
                      current === "dark" ? "light" : "dark",
                    )
                  }
                  className="admin-button-secondary inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
                >
                  {theme === "dark" ? (
                    <SunMedium className="h-4.5 w-4.5" />
                  ) : (
                    <Moon className="h-4.5 w-4.5" />
                  )}
                  <span>
                    {theme === "dark" ? "Light theme" : "Dark theme"}
                  </span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 bg-[var(--admin-bg)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <article key={card.label} className="admin-panel p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-[var(--admin-muted)]">
                        {card.label}
                      </p>
                      <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
                        {card.value}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--admin-accent)] px-3 py-1 text-xs font-semibold text-[var(--admin-accent-contrast)]">
                      {card.change}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--admin-muted)]">
                    {card.detail}
                  </p>
                </article>
              ))}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
              <article className="admin-panel p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">
                      Weekly traffic
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[var(--admin-text)]">
                      Solid snapshot of visitor momentum
                    </h3>
                  </div>
                  <span className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-1 text-sm text-[var(--admin-muted)]">
                    Preview data
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-7 items-end gap-3">
                  {weeklyTraffic.map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-3">
                      <div className="flex h-56 w-full items-end rounded-3xl bg-[var(--admin-surface-muted)] p-2">
                        <div
                          className="w-full rounded-2xl bg-[var(--admin-chart-1)]"
                          style={{ height: `${item.value}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-[var(--admin-text)]">
                          {item.label}
                        </p>
                        <p className="mt-1 text-xs text-[var(--admin-muted)]">
                          {item.value}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="admin-panel p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-chart-2)] text-[var(--admin-accent-contrast)]">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">
                      Traffic sources
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-[var(--admin-text)]">
                      Where attention is coming from
                    </h3>
                  </div>
                </div>

                <div className="mt-8 space-y-5">
                  {trafficSources.map((source) => (
                    <div key={source.label}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-[var(--admin-text)]">
                          {source.label}
                        </p>
                        <p className="text-sm text-[var(--admin-muted)]">
                          {source.value}%
                        </p>
                      </div>
                      <div className="h-3 rounded-full bg-[var(--admin-surface-muted)]">
                        <div
                          className="h-3 rounded-full bg-[var(--admin-chart-2)]"
                          style={{ width: `${source.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
              <article className="admin-panel p-5 sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">
                  Registration funnel
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--admin-text)]">
                  Conversion path from interest to submit
                </h3>

                <div className="mt-8 space-y-4">
                  {funnelStages.map((stage, index) => (
                    <div key={stage.label} className="admin-panel-subtle p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-[var(--admin-muted)]">
                            Step {index + 1}
                          </p>
                          <p className="mt-1 text-base font-semibold text-[var(--admin-text)]">
                            {stage.label}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-[var(--admin-text)]">
                          {stage.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="admin-panel p-5 sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--admin-muted)]">
                  Recent notes
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--admin-text)]">
                  Operational pulse for the admin team
                </h3>

                <div className="mt-8 space-y-4">
                  {recentActivity.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-[var(--admin-text)]">
                            {item.title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                            {item.detail}
                          </p>
                        </div>
                        <span className="rounded-full bg-[var(--admin-chart-3)] px-3 py-1 text-xs font-semibold text-[var(--admin-accent-contrast)]">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
