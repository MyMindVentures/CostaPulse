import { CalendarDays, Compass, Settings, Users } from "lucide-react";

const cards = [
  { label: "Bookings", value: "—", note: "Awaiting data connection", icon: CalendarDays },
  { label: "Users", value: "—", note: "Awaiting data connection", icon: Users },
  { label: "Experiences", value: "—", note: "Awaiting data connection", icon: Compass }
];

export const metadata = { title: "Admin overview", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/" className="brand">Costa<span>Pulse</span></a>
        <nav aria-label="Admin navigation">
          <a href="#overview" aria-current="page">Overview</a>
          <a href="#bookings">Bookings</a>
          <a href="#users">Users</a>
          <a href="#experiences-admin">Experiences</a>
          <a href="#settings">Settings</a>
        </nav>
        <p>Admin workspace</p>
      </aside>
      <section className="admin-main" id="overview">
        <header><div><p className="section-kicker">CostaPulse operations</p><h1>Overview</h1></div><span className="status"><i /> System ready</span></header>
        <div className="admin-cards">
          {cards.map(({ label, value, note, icon: Icon }) => <article key={label} id={label === "Experiences" ? "experiences-admin" : label.toLowerCase()}><Icon aria-hidden /><p>{label}</p><strong>{value}</strong><small>{note}</small></article>)}
        </div>
        <div className="admin-placeholder">
          <div><p className="section-kicker">Activity</p><h2>Bookings</h2></div>
          <p>Booking activity will appear here when the operational database is connected.</p>
        </div>
        <div className="admin-placeholder compact" id="settings">
          <div><Settings aria-hidden /><h2>Settings</h2></div><p>Workspace configuration is ready for the next implementation phase.</p>
        </div>
      </section>
    </main>
  );
}
