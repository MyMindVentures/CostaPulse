import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatMinorUnitAmount } from "@/lib/pricing/format-money";
import { AdminApiError } from "@/server/admin/schemas";
import {
  fetchAdminBookings,
  fetchAdminReferenceData,
  type AdminBookingsQuery
} from "@/server/repositories/admin-ops";
import { AdminBookingsFilters } from "./bookings-filters";

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
  query: AdminBookingsQuery;
};

export async function AdminBookingsFeature({ query }: Props) {
  const t = await getTranslations("Dashboards.admin");

  let page = null;
  let reference = null;
  let errorMessage: string | null = null;

  try {
    [page, reference] = await Promise.all([
      fetchAdminBookings(query),
      fetchAdminReferenceData()
    ]);
  } catch (error) {
    errorMessage =
      error instanceof AdminApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : t("loadErrorTitle");
  }

  return (
    <section className="flex flex-col gap-6">
      <header>
        <SectionKicker>{t("kicker")}</SectionKicker>
        <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          {t("bookingsHeading")}
        </h1>
        <p className="text-muted mt-2 max-w-2xl">{t("bookingsDescription")}</p>
      </header>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {reference ? (
        <AdminBookingsFilters
          experiences={reference.experiences}
          locations={reference.locations}
          initial={{
            search: query.search ?? "",
            status: query.status ?? "",
            paymentStatus: query.paymentStatus ?? "",
            experienceId: query.experienceId ?? "",
            locationId: query.locationId ?? ""
          }}
        />
      ) : null}

      {!errorMessage && page && page.items.length === 0 ? (
        <div className="border-border rounded-[var(--radius)] border bg-white p-8 text-center">
          <h2 className="text-ink text-lg font-semibold">
            {t("bookingsEmpty")}
          </h2>
          <p className="text-muted mt-2">{t("bookingsEmptyDescription")}</p>
        </div>
      ) : null}

      {page && page.items.length > 0 ? (
        <div className="border-border overflow-x-auto rounded-[var(--radius)] border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-border bg-panel text-muted border-b">
              <tr>
                <th className="px-4 py-3 font-medium">
                  {t("table.reference")}
                </th>
                <th className="px-4 py-3 font-medium">{t("table.customer")}</th>
                <th className="px-4 py-3 font-medium">
                  {t("table.experience")}
                </th>
                <th className="px-4 py-3 font-medium">{t("table.when")}</th>
                <th className="px-4 py-3 font-medium">{t("table.status")}</th>
                <th className="px-4 py-3 font-medium">{t("table.payment")}</th>
                <th className="px-4 py-3 font-medium">{t("table.total")}</th>
              </tr>
            </thead>
            <tbody>
              {page.items.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-border hover:bg-panel/60 border-b last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="text-coral font-medium underline-offset-2 hover:underline"
                    >
                      {booking.booking_reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink">
                      {[booking.contact_first_name, booking.contact_last_name]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </div>
                    <div className="text-muted text-xs">
                      {booking.customer_email ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{booking.experience_title_snapshot ?? "—"}</div>
                    <div className="text-muted text-xs">
                      {booking.variant_name_snapshot ?? ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatWhen(booking.starts_at_snapshot)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{booking.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{booking.payment_status}</Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatMinorUnitAmount(
                      booking.total_amount_minor,
                      booking.currency || "EUR"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {page && page.page_count > 1 ? (
        <nav
          className="flex flex-wrap items-center gap-3 text-sm"
          aria-label={t("paginationLabel")}
        >
          <span className="text-muted">
            {t("paginationSummary", {
              page: page.page,
              pageCount: page.page_count,
              total: page.total
            })}
          </span>
          <div className="flex gap-2">
            {page.page > 1 ? (
              <Link
                className="border-border min-h-11 rounded-md border px-4 py-2"
                href={`/admin/bookings?${buildPageQuery(query, page.page - 1)}`}
              >
                {t("previous")}
              </Link>
            ) : null}
            {page.page < page.page_count ? (
              <Link
                className="border-border min-h-11 rounded-md border px-4 py-2"
                href={`/admin/bookings?${buildPageQuery(query, page.page + 1)}`}
              >
                {t("next")}
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </section>
  );
}

function buildPageQuery(query: AdminBookingsQuery, page: number): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.paymentStatus) params.set("payment_status", query.paymentStatus);
  if (query.experienceId) params.set("experience_id", query.experienceId);
  if (query.locationId) params.set("location_id", query.locationId);
  return params.toString();
}
