"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  availabilityServiceFilters,
  availabilityStatuses,
  getAvailabilityStatusSemantic
} from "@/lib/view-models/team-member-availability";
import type { AvailabilityFilters } from "./availability-calendar.types";
import { monthKey, shiftMonth } from "./availability-calendar.utils";

type Props = {
  applyFilters: (formData: FormData) => void;
  initialFilters: AvailabilityFilters;
  month: string;
  monthHref: (month: string) => string;
  monthLabel: string;
};

export function AvailabilityToolbar({
  applyFilters,
  initialFilters,
  month,
  monthHref,
  monthLabel
}: Props) {
  const t = useTranslations("Availability");

  return (
    <div className="border-border bg-card rounded-[var(--radius)] border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-ink text-2xl font-semibold capitalize">
          {monthLabel}
        </h2>
        <nav className="flex items-center gap-2" aria-label={t("monthNav")}>
          <Button asChild variant="outline" aria-label={t("previousMonth")}>
            <Link href={monthHref(shiftMonth(month, -1))}>
              <ChevronLeft aria-hidden className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={monthHref(monthKey(new Date()))}>{t("today")}</Link>
          </Button>
          <Button asChild variant="outline" aria-label={t("nextMonth")}>
            <Link href={monthHref(shiftMonth(month, 1))}>
              <ChevronRight aria-hidden className="size-4" />
            </Link>
          </Button>
        </nav>
      </div>

      <form
        action={applyFilters}
        className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5"
      >
        <label className="grid gap-1 text-sm">
          <span className="text-muted">{t("service")}</span>
          <select
            name="service_category"
            defaultValue={initialFilters.serviceCategory}
            className="border-input bg-card min-h-11 rounded-md border px-3"
          >
            <option value="">{t("allServices")}</option>
            {availabilityServiceFilters.map((category) => (
              <option key={category} value={category}>
                {t(`serviceFilters.${category}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted">{t("statusLabel")}</span>
          <select
            name="status"
            defaultValue={initialFilters.status}
            className="border-input bg-card min-h-11 rounded-md border px-3"
          >
            <option value="">{t("allStatuses")}</option>
            {availabilityStatuses.map((status) => (
              <option key={status} value={status}>
                {t(getAvailabilityStatusSemantic(status).labelKey)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted">{t("location")}</span>
          <input
            name="location"
            defaultValue={initialFilters.location}
            className="border-input bg-card min-h-11 rounded-md border px-3"
          />
        </label>
        <label className="flex min-h-11 items-center gap-2 self-end text-sm">
          <input
            name="available_only"
            type="checkbox"
            defaultChecked={initialFilters.availableOnly}
            className="size-5"
          />
          {t("availableOnly")}
        </label>
        <Button type="submit" className="min-h-11 self-end">
          {t("applyFilters")}
        </Button>
      </form>
    </div>
  );
}
