import {
  CalendarDays,
  Compass,
  CreditCard,
  Users,
  AlertTriangle
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatMinorUnitAmount } from "@/lib/pricing/format-money";
import { getAdminDashboardSnapshot } from "@/server/repositories/admin-dashboard";

export async function AdminDashboardFeature() {
  const t = await getTranslations("Dashboards.admin");
  const snapshot = await getAdminDashboardSnapshot();
  const overview = snapshot.overview;

  const cards = [
    {
      key: "bookings",
      label: t("metrics.bookingsTotal"),
      value: overview?.bookings_total ?? "—",
      icon: CalendarDays
    },
    {
      key: "confirmed",
      label: t("metrics.bookingsConfirmed"),
      value: overview?.bookings_confirmed ?? "—",
      icon: Compass
    },
    {
      key: "pending",
      label: t("metrics.pendingManual"),
      value: overview?.pending_manual_confirmation ?? "—",
      icon: AlertTriangle
    },
    {
      key: "customers",
      label: t("metrics.customers"),
      value: overview?.customers_total ?? "—",
      icon: Users
    },
    {
      key: "revenue",
      label: t("metrics.paidRevenue"),
      value:
        overview != null
          ? formatMinorUnitAmount(overview.paid_revenue_minor, "EUR")
          : "—",
      icon: CreditCard
    },
    {
      key: "slots",
      label: t("metrics.upcomingSlots"),
      value: overview?.upcoming_slots ?? "—",
      icon: CalendarDays
    }
  ] as const;

  return (
    <section className="admin-main flex flex-col gap-8" id="overview">
      <header className="admin-header flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionKicker>{t("kicker")}</SectionKicker>
          <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {t("overviewHeading")}
          </h1>
          <p className="text-muted mt-2 max-w-2xl">
            {t("overviewDescription")}
          </p>
        </div>
        <span className="status bg-navy/5 text-ink inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
          <i
            className={`size-2 rounded-full ${snapshot.dataConnected ? "bg-turquoise" : "bg-coral"}`}
            aria-hidden
          />
          {snapshot.dataConnected
            ? t("statusConnected")
            : t("statusDisconnected")}
        </span>
      </header>

      {!snapshot.dataConnected && snapshot.errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{snapshot.errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="admin-cards grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ key, label, value, icon: Icon }) => (
          <article
            key={key}
            className="border-border flex flex-col gap-2 rounded-[var(--radius)] border bg-white p-5"
          >
            <Icon className="text-coral size-5" aria-hidden />
            <p className="text-muted text-sm">{label}</p>
            <strong className="text-ink text-2xl font-semibold">{value}</strong>
          </article>
        ))}
      </div>

      {overview ? (
        <div className="admin-panel border-border grid gap-3 rounded-[var(--radius)] border bg-white p-5 sm:grid-cols-3">
          <div>
            <p className="text-muted text-sm">{t("metrics.failedPayments")}</p>
            <strong className="text-ink text-xl">
              {overview.failed_payments}
            </strong>
          </div>
          <div>
            <p className="text-muted text-sm">{t("metrics.refunds")}</p>
            <strong className="text-ink text-xl">
              {formatMinorUnitAmount(overview.refunds_minor, "EUR")}
            </strong>
          </div>
          <div>
            <p className="text-muted text-sm">{t("metrics.reviewsPending")}</p>
            <strong className="text-ink text-xl">
              {overview.reviews_pending}
            </strong>
          </div>
        </div>
      ) : null}
    </section>
  );
}
