import { getLocale, getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Container } from "@/components/ui/container";
import { isMonthKey } from "@/lib/url/availability-calendar";
import {
  availabilityServiceFilterSchema,
  availabilityStatusSchema,
  type AvailabilityServiceFilter,
  type AvailabilityStatus
} from "@/lib/view-models/team-member-availability";
import {
  getPrimaryAvailabilityOwnerSlug,
  getPublicTeamMemberAvailability
} from "@/server/repositories/team-member-availability";
import { AvailabilityCalendar } from "./availability-calendar";

export type AvailabilitySearchParams = Record<
  string,
  string | string[] | undefined
>;

function firstValue(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function rangeForMonth(monthKey: string): {
  rangeStart: string;
  rangeEnd: string;
} {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, -6));
  const end = new Date(Date.UTC(year, month + 1, 8));
  return { rangeStart: start.toISOString(), rangeEnd: end.toISOString() };
}

type Props = {
  searchParams: AvailabilitySearchParams;
  teamMemberSlug?: string | null;
  selectedDate?: string | null;
};

export async function AvailabilityPageFeature({
  searchParams,
  teamMemberSlug,
  selectedDate
}: Props) {
  const locale = await getLocale();
  const t = await getTranslations("Availability");
  const requestedMonth = firstValue(searchParams.month);
  const month = isMonthKey(requestedMonth)
    ? requestedMonth
    : selectedDate?.slice(0, 7) || currentMonthKey();
  const ownerSlug = teamMemberSlug ?? (await getPrimaryAvailabilityOwnerSlug());

  if (!ownerSlug) {
    return (
      <Container className="py-12">
        <EmptyState
          title={t("ownerMissing")}
          description={t("ownerMissingDescription")}
        />
      </Container>
    );
  }

  const parsedServiceCategory = availabilityServiceFilterSchema.safeParse(
    firstValue(searchParams.service_category)
  );
  const serviceCategory: AvailabilityServiceFilter | null =
    parsedServiceCategory.success ? parsedServiceCategory.data : null;
  const parsedStatus = availabilityStatusSchema.safeParse(
    firstValue(searchParams.status)
  );
  const status: AvailabilityStatus | null = parsedStatus.success
    ? parsedStatus.data
    : null;
  const availableOnly = firstValue(searchParams.available_only) === "true";
  const location = firstValue(searchParams.location).slice(0, 120);
  const range = rangeForMonth(month);

  const entries = await getPublicTeamMemberAvailability({
    teamMemberSlug: ownerSlug,
    ...range,
    locale,
    serviceCategory,
    status,
    availableOnly,
    location: location || null
  });

  return (
    <main className="min-w-0 py-10 md:py-14">
      <Container className="grid gap-8">
        <header className="max-w-3xl">
          <SectionKicker>{t("kicker")}</SectionKicker>
          <h1 className="text-ink mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            {selectedDate ? t("dayHeading") : t("heading")}
          </h1>
          <p className="text-muted mt-4 text-lg">
            {selectedDate ? t("dayDescription") : t("description")}
          </p>
        </header>
        <AvailabilityCalendar
          entries={entries}
          month={month}
          locale={locale}
          initialFilters={{
            serviceCategory: serviceCategory ?? "",
            status: status ?? "",
            availableOnly,
            location
          }}
          selectedDate={selectedDate}
        />
      </Container>
    </main>
  );
}
