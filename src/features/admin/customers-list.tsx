import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatMinorUnitAmount } from "@/lib/pricing/format-money";
import { AdminApiError } from "@/server/admin/schemas";
import { fetchAdminCustomers } from "@/server/repositories/admin-ops";
import { AdminCustomersFilters } from "./customers-filters";

function formatWhen(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium"
  }).format(date);
}

type Props = {
  search?: string | null;
  page?: number;
};

export async function AdminCustomersFeature({ search, page = 1 }: Props) {
  const t = await getTranslations("Dashboards.admin");
  let data = null;
  let errorMessage: string | null = null;

  try {
    data = await fetchAdminCustomers({ search, page, pageSize: 25 });
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
          {t("customersHeading")}
        </h1>
        <p className="text-muted mt-2 max-w-2xl">{t("customersDescription")}</p>
      </header>

      <AdminCustomersFilters initialSearch={search ?? ""} />

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {!errorMessage && data && data.items.length === 0 ? (
        <div className="border-border rounded-[var(--radius)] border bg-white p-8 text-center">
          <h2 className="text-ink text-lg font-semibold">
            {t("customersEmpty")}
          </h2>
          <p className="text-muted mt-2">{t("customersEmptyDescription")}</p>
        </div>
      ) : null}

      {data && data.items.length > 0 ? (
        <div className="border-border overflow-x-auto rounded-[var(--radius)] border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-border bg-panel text-muted border-b">
              <tr>
                <th className="px-4 py-3 font-medium">{t("table.customer")}</th>
                <th className="px-4 py-3 font-medium">{t("table.email")}</th>
                <th className="px-4 py-3 font-medium">{t("table.bookings")}</th>
                <th className="px-4 py-3 font-medium">{t("table.spent")}</th>
                <th className="px-4 py-3 font-medium">
                  {t("table.lastBooking")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-border hover:bg-panel/60 border-b last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-coral font-medium underline-offset-2 hover:underline"
                    >
                      {[customer.first_name, customer.last_name]
                        .filter(Boolean)
                        .join(" ") ||
                        customer.email ||
                        customer.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{customer.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    {customer.booking_count_current ??
                      customer.lifetime_bookings ??
                      0}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatMinorUnitAmount(
                      customer.paid_total_minor_current ??
                        customer.lifetime_spent_minor ??
                        0,
                      "EUR"
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatWhen(
                      customer.last_booking_at_current ??
                        customer.last_booking_at
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {data && data.page_count > 1 ? (
        <nav
          className="flex flex-wrap items-center gap-3 text-sm"
          aria-label={t("paginationLabel")}
        >
          <span className="text-muted">
            {t("paginationSummary", {
              page: data.page,
              pageCount: data.page_count,
              total: data.total
            })}
          </span>
          <div className="flex gap-2">
            {data.page > 1 ? (
              <Link
                className="border-border min-h-11 rounded-md border px-4 py-2"
                href={`/admin/customers?${buildQuery(search, data.page - 1)}`}
              >
                {t("previous")}
              </Link>
            ) : null}
            {data.page < data.page_count ? (
              <Link
                className="border-border min-h-11 rounded-md border px-4 py-2"
                href={`/admin/customers?${buildQuery(search, data.page + 1)}`}
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

function buildQuery(search: string | null | undefined, page: number): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (search) params.set("search", search);
  return params.toString();
}
