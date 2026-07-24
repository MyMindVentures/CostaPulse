import { formatDurationHours } from "@/lib/pricing/format-money";
import { cn } from "@/lib/utils";

type DurationMessages = {
  hour: (values: { hours: number }) => string;
  hours: (values: { hours: number }) => string;
  hoursMinutes: (values: { hours: number; minutes: number }) => string;
  minutes: (values: { minutes: number }) => string;
};

type DurationDisplayProps = {
  durationMinutes: number;
  messages: DurationMessages;
  className?: string;
};

/**
 * Localized duration label for experience cards and summaries.
 */
export function formatDurationLabel(
  durationMinutes: number,
  messages: DurationMessages
): string {
  if (durationMinutes % 60 === 0) {
    const { hours, labelKey } = formatDurationHours(durationMinutes);
    return labelKey === "hour"
      ? messages.hour({ hours })
      : messages.hours({ hours });
  }

  const hours = Math.floor(durationMinutes / 60);
  const remainingMinutes = durationMinutes % 60;
  if (hours > 0) {
    return messages.hoursMinutes({
      hours,
      minutes: remainingMinutes
    });
  }

  return messages.minutes({ minutes: durationMinutes });
}

export function DurationDisplay({
  durationMinutes,
  messages,
  className
}: DurationDisplayProps) {
  return (
    <span className={cn(className)} data-slot="duration-display">
      {formatDurationLabel(durationMinutes, messages)}
    </span>
  );
}
