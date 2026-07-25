import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AdminApiError } from "@/server/admin/schemas";
import {
  fetchAdminCalendar,
  fetchAdminReferenceData
} from "@/server/repositories/admin-ops";
import type { AppRole } from "@/server/auth/role-access";
import { canMutateAdminSlots } from "@/server/auth/role-access";
import { AdminCalendarFilters } from "./calendar-filters";
import { AdminSlotForm } from "./slot-form";
import { AdminSlotTeamForm } from "./slot-team-form";

function formatWhen(value: string, timeZone?: string | null): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timeZone || undefined
  }).format(date);
}

function defaultRange(): { from: string; to: string } {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 14);
  return { from: from.toISOString(), to: to.toISOString() };
}

type Props = {
  roles: readonly AppRole[];
  from?: string | null;
  to?: string | null;
  experienceId?: string | null;
  locationId?: string | null;
  teamMemberId?: string | null;
};

export async function AdminCalendarFeature({
  roles,
  from,
  to,
  experienceId,
  locationId,
  teamMemberId
}: Props) {
  const t = await getTranslations("Dashboards.admin");
  const range = {
    from: from && from.length > 0 ? from : defaultRange().from,
    to: to && to.length > 0 ? to : defaultRange().to
  };

  let slots = null;
  let reference = null;
  let errorMessage: string | null = null;
  const canMutate = canMutateAdminSlots(roles);

  try {
    [slots, reference] = await Promise.all([
      fetchAdminCalendar({
        from: range.from,
        to: range.to,
        experienceId,
        locationId,
        teamMemberId
      }),
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
          {t("calendarHeading")}
        </h1>
        <p className="text-muted mt-2 max-w-2xl">{t("calendarDescription")}</p>
      </header>

      {reference ? (
        <AdminCalendarFilters
          experiences={reference.experiences}
          locations={reference.locations}
          teamMembers={reference.team_members}
          initial={{
            from: range.from.slice(0, 16),
            to: range.to.slice(0, 16),
            experienceId: experienceId ?? "",
            locationId: locationId ?? "",
            teamMemberId: teamMemberId ?? ""
          }}
        />
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {canMutate && reference ? (
        <AdminSlotForm
          experiences={reference.experiences}
          variants={reference.variants}
          locations={reference.locations}
        />
      ) : null}

      {!errorMessage && slots && slots.length === 0 ? (
        <div className="border-border rounded-[var(--radius)] border bg-white p-8 text-center">
          <h2 className="text-ink text-lg font-semibold">
            {t("calendarEmpty")}
          </h2>
          <p className="text-muted mt-2">{t("calendarEmptyDescription")}</p>
        </div>
      ) : null}

      {slots && slots.length > 0 ? (
        <ul className="grid gap-4">
          {slots.map((slot) => {
            const team = Array.isArray(slot.assigned_team)
              ? slot.assigned_team
              : [];
            return (
              <li
                key={slot.availability_slot_id}
                className="border-border rounded-[var(--radius)] border bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-ink text-lg font-semibold">
                      {slot.experience_title ?? t("unknownExperience")}
                    </h2>
                    <p className="text-muted text-sm">
                      {slot.variant_name ?? "—"} ·{" "}
                      {slot.location_name ?? slot.city ?? "—"}
                    </p>
                    <p className="text-ink mt-2">
                      {formatWhen(slot.starts_at, slot.timezone)} –{" "}
                      {formatWhen(slot.ends_at, slot.timezone)}
                    </p>
                  </div>
                  <Badge variant="secondary">{slot.status}</Badge>
                </div>
                <p className="text-muted mt-3 text-sm">
                  {t("capacitySummary", {
                    available: slot.capacity_available,
                    reserved: slot.capacity_reserved,
                    total: slot.capacity_total
                  })}
                </p>
                {team.length > 0 ? (
                  <p className="text-muted mt-2 text-sm">
                    {t("assignedTeam")}:{" "}
                    {team
                      .map((member) => {
                        const row = member as Record<string, unknown>;
                        return (
                          String(
                            row.display_name ?? row.team_member_id ?? ""
                          ) || "—"
                        );
                      })
                      .join(", ")}
                  </p>
                ) : (
                  <p className="text-muted mt-2 text-sm">
                    {t("noTeamAssigned")}
                  </p>
                )}
                {canMutate && reference ? (
                  <div className="border-border mt-4 border-t pt-4">
                    <AdminSlotTeamForm
                      slotId={slot.availability_slot_id}
                      teamMembers={reference.team_members}
                      initialTeamMemberIds={team
                        .map((member) => {
                          const row = member as Record<string, unknown>;
                          return typeof row.team_member_id === "string"
                            ? row.team_member_id
                            : typeof row.id === "string"
                              ? row.id
                              : null;
                        })
                        .filter((id): id is string => Boolean(id))}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
