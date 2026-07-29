"use client";

import {
  Anchor,
  Ban,
  Check,
  Gauge,
  LockKeyhole,
  MessageCircle,
  Plane,
  Users,
  XCircle
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  availabilityStatuses,
  getAvailabilityStatusSemantic,
  type AvailabilityStatus
} from "@/lib/view-models/team-member-availability";
import { cn } from "@/lib/utils";

const statusIcons = {
  check: Check,
  gauge: Gauge,
  message: MessageCircle,
  users: Users,
  lock: LockKeyhole,
  ban: Ban,
  plane: Plane,
  anchor: Anchor,
  x: XCircle
} as const;

export function AvailabilityStatusBadge({
  status,
  visuallyHiddenLabel = false
}: {
  status: AvailabilityStatus;
  visuallyHiddenLabel?: boolean;
}) {
  const t = useTranslations("Availability");
  const semantic = getAvailabilityStatusSemantic(status);
  const Icon = statusIcons[semantic.icon];

  return (
    <span
      className={cn(
        visuallyHiddenLabel
          ? "flex min-w-0 items-center gap-1"
          : "availability-status inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
        !visuallyHiddenLabel && semantic.className
      )}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" />
      <span className={visuallyHiddenLabel ? "sr-only" : undefined}>
        {t(semantic.labelKey)}
      </span>
    </span>
  );
}

export function AvailabilityLegend() {
  const t = useTranslations("Availability");

  return (
    <section
      aria-label={t("legend")}
      className="border-border bg-card flex flex-wrap gap-2 rounded-[var(--radius)] border p-3"
    >
      {availabilityStatuses.map((status) => (
        <AvailabilityStatusBadge key={status} status={status} />
      ))}
    </section>
  );
}
