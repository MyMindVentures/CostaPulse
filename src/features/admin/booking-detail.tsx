import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatMinorUnitAmount } from "@/lib/pricing/format-money";
import { AdminApiError } from "@/server/admin/schemas";
import { fetchAdminBookingDetail } from "@/server/repositories/admin-ops";
import { canMutateBookingStatus } from "@/server/auth/role-access";
import type { AppRole } from "@/server/auth/role-access";
import { AdminBookingStatusForm } from "./booking-status-form";

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
  bookingId: string;
  roles: readonly AppRole[];
};

export async function AdminBookingDetailFeature({ bookingId, roles }: Props) {
  const t = await getTranslations("Dashboards.admin");
  let booking = null;
  let errorMessage: string | null = null;

  try {
    booking = await fetchAdminBookingDetail(bookingId);
  } catch (error) {
    errorMessage =
      error instanceof AdminApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : t("loadErrorTitle");
  }

  if (errorMessage || !booking) {
    return (
      <section className="flex flex-col gap-4">
        <Link href="/admin/bookings" className="text-coral text-sm">
          ← {t("backToBookings")}
        </Link>
        <Alert variant="destructive">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{errorMessage ?? t("notFound")}</AlertDescription>
        </Alert>
      </section>
    );
  }

  const canMutate = canMutateBookingStatus(roles);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link href="/admin/bookings" className="text-coral text-sm">
          ← {t("backToBookings")}
        </Link>
        <div className="mt-4">
          <SectionKicker>{t("kicker")}</SectionKicker>
        </div>
        <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          {booking.booking_reference}
        </h1>
        <p className="text-muted mt-2">
          {booking.experience_title_snapshot ?? t("unknownExperience")}
          {booking.variant_name_snapshot
            ? ` · ${booking.variant_name_snapshot}`
            : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{booking.status}</Badge>
        <Badge variant="outline">{booking.payment_status}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="border-border rounded-[var(--radius)] border bg-white p-5">
          <h2 className="text-muted text-sm font-medium">
            {t("table.customer")}
          </h2>
          <p className="text-ink mt-2">
            {[booking.contact_first_name, booking.contact_last_name]
              .filter(Boolean)
              .join(" ") || "—"}
          </p>
          <p className="text-muted text-sm">{booking.customer_email ?? "—"}</p>
          <p className="text-muted text-sm">{booking.customer_phone ?? "—"}</p>
          {booking.customer_id ? (
            <Link
              href={`/admin/customers/${booking.customer_id}`}
              className="text-coral mt-3 inline-flex min-h-11 items-center text-sm underline-offset-2 hover:underline"
            >
              {t("viewCustomer")}
            </Link>
          ) : null}
        </article>
        <article className="border-border rounded-[var(--radius)] border bg-white p-5">
          <h2 className="text-muted text-sm font-medium">{t("table.when")}</h2>
          <p className="text-ink mt-2">
            {formatWhen(booking.starts_at_snapshot)}
          </p>
          <p className="text-muted text-sm">
            {booking.location_name_snapshot ??
              booking.current_location_name ??
              "—"}
          </p>
          <p className="text-muted mt-3 text-sm">
            {t("partySize")}: {booking.party_size}
          </p>
        </article>
        <article className="border-border rounded-[var(--radius)] border bg-white p-5">
          <h2 className="text-muted text-sm font-medium">{t("table.total")}</h2>
          <p className="text-ink mt-2 text-2xl font-semibold">
            {formatMinorUnitAmount(
              booking.total_amount_minor,
              booking.currency || "EUR"
            )}
          </p>
          <p className="text-muted text-sm">
            {t("createdAt")}: {formatWhen(booking.created_at)}
          </p>
        </article>
      </div>

      {booking.special_requests ? (
        <article className="border-border rounded-[var(--radius)] border bg-white p-5">
          <h2 className="text-muted text-sm font-medium">
            {t("specialRequests")}
          </h2>
          <p className="text-ink mt-2 whitespace-pre-wrap">
            {booking.special_requests}
          </p>
        </article>
      ) : null}

      {canMutate ? (
        <AdminBookingStatusForm
          bookingId={booking.id}
          currentStatus={booking.status}
        />
      ) : (
        <Alert>
          <AlertTitle>{t("readOnlyTitle")}</AlertTitle>
          <AlertDescription>{t("readOnlyStatusDescription")}</AlertDescription>
        </Alert>
      )}

      <article className="border-border rounded-[var(--radius)] border bg-white p-5">
        <h2 className="text-ink text-lg font-semibold">{t("statusHistory")}</h2>
        {booking.status_history.length === 0 ? (
          <p className="text-muted mt-2">{t("statusHistoryEmpty")}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {booking.status_history.map((entry, index) => {
              const row = entry as Record<string, unknown>;
              const key =
                typeof row.id === "string" ? row.id : `history-${index}`;
              return (
                <li
                  key={key}
                  className="border-border flex flex-wrap items-baseline justify-between gap-2 border-b pb-3 last:border-0"
                >
                  <span className="text-ink font-medium">
                    {String(row.previous_status ?? "—")} →{" "}
                    {String(row.new_status ?? "—")}
                  </span>
                  <span className="text-muted text-sm">
                    {formatWhen(
                      typeof row.created_at === "string" ? row.created_at : null
                    )}
                  </span>
                  {typeof row.reason === "string" && row.reason ? (
                    <p className="text-muted w-full text-sm">{row.reason}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </section>
  );
}
