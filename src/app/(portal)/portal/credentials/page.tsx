import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatCredentialCategory,
  formatCredentialComputedStatus,
  formatCredentialDocumentType,
  formatCredentialVerificationStatus
} from "@/features/credentials/labels";
import {
  CredentialPortfolioError,
  getAuthenticatedCredentialPortfolio
} from "@/server/repositories/credential-portal";

export const metadata = {
  title: "Credential Portal",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

function humanDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

function statusBadgeClass(status: string): string {
  if (status === "valid")
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (status.startsWith("expires_within_")) {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }
  if (status === "expired") return "bg-rose-50 text-rose-800 border-rose-200";
  return "bg-[color:var(--panel)] text-[color:var(--muted)] border-[color:var(--border)]";
}

type SearchParams = Promise<{
  search?: string;
  documentType?: string;
  category?: string;
  validity?: string;
  verification?: string;
  recordState?: string;
}>;

async function resolvePortfolio() {
  try {
    const portfolio = await getAuthenticatedCredentialPortfolio();
    return { kind: "ok" as const, portfolio };
  } catch (error) {
    if (error instanceof CredentialPortfolioError) {
      if (error.code === "UNAUTHORIZED") {
        return {
          kind: "redirect" as const,
          location: "/login?auth=required"
        };
      }
      if (error.code === "NOT_GRANTED") {
        return {
          kind: "redirect" as const,
          location: "/login?auth=grant_required"
        };
      }
    }
    throw error;
  }
}

export default async function PortalCredentialsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const result = await resolvePortfolio();
  if (result.kind === "redirect") {
    redirect(result.location);
  }

  const [t, filters] = await Promise.all([
    getTranslations("CredentialPortal"),
    searchParams
  ]);

  const search = filters.search?.trim().toLowerCase() ?? "";
  const documentType = filters.documentType?.trim() ?? "all";
  const category = filters.category?.trim() ?? "all";
  const validity = filters.validity?.trim() ?? "all";
  const verification = filters.verification?.trim() ?? "all";
  const recordState = filters.recordState?.trim() ?? "all";

  const { portfolio } = result;
  const availableDocumentTypes = Array.from(
    new Set(portfolio.credentials.map((item) => item.document_type))
  );
  const availableCategories = Array.from(
    new Set(portfolio.credentials.map((item) => item.category))
  );
  const availableVerifications = Array.from(
    new Set(portfolio.credentials.map((item) => item.verification_status))
  );

  const filteredCredentials = portfolio.credentials.filter((credential) => {
    if (documentType !== "all" && credential.document_type !== documentType) {
      return false;
    }

    if (category !== "all" && credential.category !== category) {
      return false;
    }

    if (
      verification !== "all" &&
      credential.verification_status !== verification
    ) {
      return false;
    }

    if (validity !== "all" && credential.computed_status !== validity) {
      return false;
    }

    if (recordState === "current" && credential.status === "replaced") {
      return false;
    }

    if (recordState === "historical" && credential.status !== "replaced") {
      return false;
    }

    if (!search) {
      return true;
    }

    return [
      credential.title,
      credential.issuing_authority ?? "",
      credential.document_type,
      credential.category
    ]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });

  return (
    <main className="bg-panel min-h-svh bg-[radial-gradient(circle_at_15%_0%,rgba(24,183,189,0.14),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(228,185,103,0.15),transparent_26%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-7">
        <header className="bg-navy relative overflow-hidden rounded-3xl border border-white/10 p-6 text-white shadow-[0_1.25rem_3rem_rgba(7,31,47,0.24)] sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            aria-hidden
            style={{
              background:
                "radial-gradient(circle at 0% 0%, rgba(24,183,189,.5), transparent 28%), radial-gradient(circle at 80% 20%, rgba(228,185,103,.45), transparent 30%)"
            }}
          />
          <div className="relative z-1">
            <p className="text-xs font-semibold tracking-[0.16em] text-white/78 uppercase">
              {t("headerKicker")}
            </p>
            <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
              {t("headerTitle")}
            </h1>
            <p className="mt-4 text-sm text-white/86 sm:text-base">
              {t("accessRecipient")} {portfolio.recipient_email}
              {portfolio.recipient_agency_label
                ? ` · ${portfolio.recipient_agency_label}`
                : ""}
            </p>
            <p className="mt-2 text-sm text-white/78">
              {t("accessExpires")} {humanDate(portfolio.access_expires_at)}
            </p>
          </div>
        </header>

        <section className="border-border rounded-3xl border bg-white/95 p-5 shadow-[0_1rem_2.5rem_rgba(7,31,47,0.08)] sm:p-6">
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="grid gap-1.5 text-sm font-medium text-[color:var(--ink)]">
              {t("filters.search")}
              <Input
                name="search"
                defaultValue={filters.search ?? ""}
                className="min-h-11"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-[color:var(--ink)]">
              {t("filters.documentType")}
              <select
                name="documentType"
                defaultValue={documentType}
                className="border-border bg-card min-h-11 rounded-md border px-3"
              >
                <option value="all">{t("filters.all")}</option>
                {availableDocumentTypes.map((item) => (
                  <option key={item} value={item}>
                    {formatCredentialDocumentType(item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-[color:var(--ink)]">
              {t("filters.category")}
              <select
                name="category"
                defaultValue={category}
                className="border-border bg-card min-h-11 rounded-md border px-3"
              >
                <option value="all">{t("filters.all")}</option>
                {availableCategories.map((item) => (
                  <option key={item} value={item}>
                    {formatCredentialCategory(item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-[color:var(--ink)]">
              {t("filters.validity")}
              <select
                name="validity"
                defaultValue={validity}
                className="border-border bg-card min-h-11 rounded-md border px-3"
              >
                <option value="all">{t("filters.all")}</option>
                <option value="valid">
                  {formatCredentialComputedStatus(t, "valid")}
                </option>
                <option value="validity_unknown">
                  {formatCredentialComputedStatus(t, "validity_unknown")}
                </option>
                <option value="expires_within_180_days">
                  {formatCredentialComputedStatus(t, "expires_within_180_days")}
                </option>
                <option value="expires_within_90_days">
                  {formatCredentialComputedStatus(t, "expires_within_90_days")}
                </option>
                <option value="expires_within_60_days">
                  {formatCredentialComputedStatus(t, "expires_within_60_days")}
                </option>
                <option value="expires_within_30_days">
                  {formatCredentialComputedStatus(t, "expires_within_30_days")}
                </option>
                <option value="expired">
                  {formatCredentialComputedStatus(t, "expired")}
                </option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-[color:var(--ink)]">
              {t("filters.verification")}
              <select
                name="verification"
                defaultValue={verification}
                className="border-border bg-card min-h-11 rounded-md border px-3"
              >
                <option value="all">{t("filters.all")}</option>
                {availableVerifications.map((item) => (
                  <option key={item} value={item}>
                    {formatCredentialVerificationStatus(t, item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-[color:var(--ink)]">
              {t("filters.recordState")}
              <select
                name="recordState"
                defaultValue={recordState}
                className="border-border bg-card min-h-11 rounded-md border px-3"
              >
                <option value="all">{t("filters.all")}</option>
                <option value="current">{t("filters.current")}</option>
                <option value="historical">{t("filters.historical")}</option>
              </select>
            </label>
            <div className="flex items-end md:col-span-2 xl:col-span-3">
              <Button type="submit" className="min-h-11">
                {t("filters.apply")}
              </Button>
            </div>
          </form>
        </section>

        {filteredCredentials.length === 0 ? (
          <section className="border-border rounded-3xl border bg-white p-8 text-center shadow-[0_1rem_2.5rem_rgba(7,31,47,0.08)]">
            <h2 className="text-ink font-serif text-2xl sm:text-3xl">
              {portfolio.credentials.length === 0
                ? t("empty.title")
                : t("empty.filteredTitle")}
            </h2>
            <p className="text-muted mx-auto mt-3 max-w-xl leading-relaxed">
              {portfolio.credentials.length === 0
                ? t("empty.description")
                : t("empty.filteredDescription")}
            </p>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCredentials.map((credential) => (
              <Link
                key={credential.id}
                href={`/portal/credentials/${credential.id}`}
                className="border-border focus-visible:ring-turquoise group flex min-h-60 flex-col rounded-3xl border bg-white p-5 shadow-[0_1rem_2.5rem_rgba(7,31,47,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_1.4rem_2.8rem_rgba(7,31,47,0.14)] focus-visible:ring-2 focus-visible:outline-none"
              >
                <p className="text-muted text-xs font-semibold tracking-[0.14em] uppercase">
                  {formatCredentialDocumentType(credential.document_type)}
                </p>
                <h2 className="text-ink mt-2 text-xl leading-tight font-semibold group-hover:text-[color:var(--turquoise-deep)]">
                  {credential.title}
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={statusBadgeClass(credential.computed_status)}
                  >
                    {formatCredentialComputedStatus(
                      t,
                      credential.computed_status
                    )}
                  </Badge>
                  <Badge variant="muted">
                    {formatCredentialVerificationStatus(
                      t,
                      credential.verification_status
                    )}
                  </Badge>
                  <Badge variant="outline">
                    {formatCredentialCategory(credential.category)}
                  </Badge>
                </div>
                <dl className="text-muted mt-4 grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt>{t("card.issuer")}</dt>
                    <dd className="text-ink truncate text-right">
                      {credential.issuing_authority ?? "-"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>{t("card.expires")}</dt>
                    <dd className="text-ink text-right">
                      {credential.does_not_expire
                        ? t("card.noExpiry")
                        : humanDate(credential.expires_on)}
                    </dd>
                  </div>
                </dl>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
