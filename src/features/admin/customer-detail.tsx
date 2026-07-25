import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatMinorUnitAmount } from "@/lib/pricing/format-money";
import { AdminApiError } from "@/server/admin/schemas";
import { fetchAdminCustomerDetail } from "@/server/repositories/admin-ops";

function formatWhen(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

type Props = {
  customerId: string;
};

export async function AdminCustomerDetailFeature({ customerId }: Props) {
  const t = await getTranslations("Dashboards.admin");
  let customer = null;
  let errorMessage: string | null = null;

  try {
    customer = await fetchAdminCustomerDetail(customerId);
  } catch (error) {
    errorMessage =
      error instanceof AdminApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : t("loadErrorTitle");
  }

  if (errorMessage || !customer) {
    return (
      <section className="flex flex-col gap-4">
        <Link href="/admin/customers" className="text-coral text-sm">
          ← {t("backToCustomers")}
        </Link>
        <Alert variant="destructive">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{errorMessage ?? t("notFound")}</AlertDescription>
        </Alert>
      </section>
    );
  }

  const displayName =
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    customer.email ||
    customer.id;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link href="/admin/customers" className="text-coral text-sm">
          ← {t("backToCustomers")}
        </Link>
        <div className="mt-4">
          <SectionKicker>{t("kicker")}</SectionKicker>
        </div>
        <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          {displayName}
        </h1>
        <p className="text-muted mt-2">{customer.email ?? "—"}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="border-border rounded-[var(--radius)] border bg-white p-5">
          <h2 className="text-muted text-sm font-medium">{t("table.phone")}</h2>
          <p className="text-ink mt-2">{customer.phone ?? "—"}</p>
        </article>
        <article className="border-border rounded-[var(--radius)] border bg-white p-5">
          <h2 className="text-muted text-sm font-medium">
            {t("table.bookings")}
          </h2>
          <p className="text-ink mt-2 text-2xl font-semibold">
            {customer.booking_count_current ?? customer.lifetime_bookings ?? 0}
          </p>
        </article>
        <article className="border-border rounded-[var(--radius)] border bg-white p-5">
          <h2 className="text-muted text-sm font-medium">{t("table.spent")}</h2>
          <p className="text-ink mt-2 text-2xl font-semibold">
            {formatMinorUnitAmount(
              customer.paid_total_minor_current ??
                customer.lifetime_spent_minor ??
                0,
              "EUR"
            )}
          </p>
        </article>
      </div>

      {customer.notes ? (
        <article className="border-border rounded-[var(--radius)] border bg-white p-5">
          <h2 className="text-muted text-sm font-medium">{t("notes")}</h2>
          <p className="text-ink mt-2 whitespace-pre-wrap">{customer.notes}</p>
        </article>
      ) : null}

      <article className="border-border rounded-[var(--radius)] border bg-white p-5">
        <h2 className="text-ink text-lg font-semibold">
          {t("customerBookings")}
        </h2>
        {customer.bookings.length === 0 ? (
          <p className="text-muted mt-2">{t("customerBookingsEmpty")}</p>
        ) : (
          <ul className="divide-border mt-4 divide-y">
            {customer.bookings.map((booking) => (
              <li
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="text-coral font-medium underline-offset-2 hover:underline"
                  >
                    {booking.booking_reference}
                  </Link>
                  <p className="text-muted text-sm">
                    {booking.experience_title_snapshot ?? "—"} ·{" "}
                    {formatWhen(booking.starts_at_snapshot)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{booking.status}</Badge>
                  <Badge variant="outline">{booking.payment_status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
