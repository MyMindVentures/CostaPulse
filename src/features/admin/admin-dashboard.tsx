import { CalendarDays, Compass, Settings, Users } from "lucide-react";
import { BrandLink } from "@/components/shared/brand-link";
import { SectionKicker } from "@/components/shared/section-kicker";
import { requireAdminAccess } from "@/server/auth/admin";
import { getAdminDashboardSnapshot } from "@/server/repositories/admin-dashboard";

const cardIcons = {
  bookings: CalendarDays,
  users: Users,
  experiences: Compass
} as const;

export async function AdminDashboardFeature() {
  const adminContext = await requireAdminAccess();
  const snapshot = await getAdminDashboardSnapshot();

  const cards = [
    {
      key: "bookings",
      label: "Bookings",
      value: snapshot.metrics.bookings,
      note: snapshot.dataConnected
        ? "Live Supabase count"
        : "Awaiting Supabase credentials"
    },
    {
      key: "users",
      label: "Users",
      value: snapshot.metrics.users,
      note: snapshot.dataConnected
        ? "Live Supabase count"
        : "Awaiting Supabase credentials"
    },
    {
      key: "experiences",
      label: "Experiences",
      value: snapshot.metrics.experiences,
      note: snapshot.dataConnected
        ? "Live Supabase count"
        : "Awaiting Supabase credentials"
    }
  ] as const;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <BrandLink href="/" />
        <nav aria-label="Admin navigation">
          <a href="#overview" aria-current="page">
            Overview
          </a>
          <a href="#readiness">Readiness</a>
          <a href="#roles">Roles</a>
          <a href="#settings">Settings</a>
        </nav>
        <p>Protected admin workspace</p>
      </aside>

      <section className="admin-main" id="overview">
        <header className="admin-header">
          <div>
            <SectionKicker>CostaPulse operations</SectionKicker>
            <h1>Overview</h1>
          </div>
          <span className="status">
            <i />
            {snapshot.dataConnected ? "Database connected" : "Config required"}
          </span>
        </header>

        <div className="admin-cards">
          {cards.map(({ key, label, value, note }) => {
            const Icon = cardIcons[key];

            return (
              <article key={key}>
                <Icon aria-hidden />
                <p>{label}</p>
                <strong>{value}</strong>
                <small>{note}</small>
              </article>
            );
          })}
        </div>

        <div className="admin-panel" id="readiness">
          <div>
            <SectionKicker>Readiness</SectionKicker>
            <h2>Backend foundations are now wired</h2>
          </div>
          <p>
            This dashboard is protected by Supabase-backed role checks, and the
            cards above now read from typed repositories instead of placeholder
            page data.
          </p>
        </div>

        <div className="admin-panel compact" id="roles">
          <div>
            <Users aria-hidden />
            <h2>Signed-in roles</h2>
          </div>
          <ul className="role-pill-list">
            {adminContext.roles.map((role) => (
              <li key={role}>{role.replaceAll("_", " ")}</li>
            ))}
          </ul>
        </div>

        <div className="admin-panel compact" id="settings">
          <div>
            <Settings aria-hidden />
            <h2>Settings</h2>
          </div>
          <p>
            Readiness checks, booking draft creation, and Stripe webhook
            scaffolding are active.
          </p>
        </div>
      </section>
    </main>
  );
}
