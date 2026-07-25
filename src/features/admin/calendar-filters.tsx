"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  experiences: Array<{ id: string; title: string }>;
  locations: Array<{ id: string; name: string; city?: string | null }>;
  teamMembers: Array<{ id: string; display_name: string }>;
  initial: {
    from: string;
    to: string;
    experienceId: string;
    locationId: string;
    teamMemberId: string;
  };
};

function toIsoLocal(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
}

export function AdminCalendarFilters({
  experiences,
  locations,
  teamMembers,
  initial
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    const params = new URLSearchParams();
    const from = toIsoLocal(String(formData.get("from") ?? ""));
    const to = toIsoLocal(String(formData.get("to") ?? ""));
    const experienceId = String(formData.get("experience_id") ?? "");
    const locationId = String(formData.get("location_id") ?? "");
    const teamMemberId = String(formData.get("team_member_id") ?? "");

    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (experienceId) params.set("experience_id", experienceId);
    if (locationId) params.set("location_id", locationId);
    if (teamMemberId) params.set("team_member_id", teamMemberId);

    startTransition(() => {
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <form
      action={onSubmit}
      className="border-border grid gap-4 rounded-[var(--radius)] border bg-white p-4 md:grid-cols-2 xl:grid-cols-5"
    >
      <div>
        <Label htmlFor="calendar-from">From</Label>
        <Input
          id="calendar-from"
          name="from"
          type="datetime-local"
          defaultValue={initial.from}
          className="mt-1.5 min-h-11"
        />
      </div>
      <div>
        <Label htmlFor="calendar-to">To</Label>
        <Input
          id="calendar-to"
          name="to"
          type="datetime-local"
          defaultValue={initial.to}
          className="mt-1.5 min-h-11"
        />
      </div>
      <div>
        <Label htmlFor="calendar-experience">Experience</Label>
        <select
          id="calendar-experience"
          name="experience_id"
          defaultValue={initial.experienceId}
          className="border-input bg-card mt-1.5 flex h-11 w-full rounded-md border px-3 text-sm"
        >
          <option value="">Any</option>
          {experiences.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="calendar-location">Location</Label>
        <select
          id="calendar-location"
          name="location_id"
          defaultValue={initial.locationId}
          className="border-input bg-card mt-1.5 flex h-11 w-full rounded-md border px-3 text-sm"
        >
          <option value="">Any</option>
          {locations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.city ? `${item.name} · ${item.city}` : item.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="calendar-team">Team member</Label>
        <select
          id="calendar-team"
          name="team_member_id"
          defaultValue={initial.teamMemberId}
          className="border-input bg-card mt-1.5 flex h-11 w-full rounded-md border px-3 text-sm"
        >
          <option value="">Any</option>
          {teamMembers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.display_name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end xl:col-span-5">
        <Button type="submit" disabled={pending} className="min-h-11">
          Apply range
        </Button>
      </div>
    </form>
  );
}
