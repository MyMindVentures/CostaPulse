"use client";

import { useMemo, useState, useTransition } from "react";
import { upsertSlotAction } from "@/server/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Props = {
  experiences: Array<{ id: string; title: string }>;
  variants: Array<{
    id: string;
    experience_id: string;
    name: string;
    is_active: boolean;
  }>;
  locations: Array<{ id: string; name: string; city?: string | null }>;
};

function toIsoLocal(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
}

export function AdminSlotForm({ experiences, variants, locations }: Props) {
  const [pending, startTransition] = useTransition();
  const [experienceId, setExperienceId] = useState(experiences[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredVariants = useMemo(
    () =>
      variants.filter(
        (variant) => variant.experience_id === experienceId && variant.is_active
      ),
    [experienceId, variants]
  );

  function onSubmit(formData: FormData) {
    const experience = String(formData.get("experience_id") ?? "");
    const variantId = String(formData.get("experience_variant_id") ?? "");
    const startsAt = toIsoLocal(String(formData.get("starts_at") ?? ""));
    const endsAt = toIsoLocal(String(formData.get("ends_at") ?? ""));
    const capacityTotal = Number(formData.get("capacity_total") ?? 1);
    const locationId = String(formData.get("location_id") ?? "") || null;
    const notes = String(formData.get("notes") ?? "").trim() || null;

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await upsertSlotAction({
        experienceId: experience,
        experienceVariantId: variantId,
        startsAt,
        endsAt,
        capacityTotal,
        locationId,
        notes,
        timezone: "Europe/Madrid",
        status: "scheduled"
      });
      if (result.ok) {
        setMessage("Slot saved");
      } else {
        setError(result.message);
      }
    });
  }

  if (experiences.length === 0) {
    return null;
  }

  return (
    <form
      action={onSubmit}
      className="border-border grid gap-4 rounded-[var(--radius)] border bg-white p-5 md:grid-cols-2 xl:grid-cols-3"
    >
      <h2 className="text-ink text-lg font-semibold md:col-span-2 xl:col-span-3">
        Create availability slot
      </h2>
      <div>
        <Label htmlFor="slot-experience">Experience</Label>
        <select
          id="slot-experience"
          name="experience_id"
          value={experienceId}
          onChange={(event) => setExperienceId(event.target.value)}
          className="border-input bg-card mt-1.5 flex h-11 w-full rounded-md border px-3 text-sm"
          disabled={pending}
        >
          {experiences.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="slot-variant">Variant</Label>
        <select
          id="slot-variant"
          name="experience_variant_id"
          className="border-input bg-card mt-1.5 flex h-11 w-full rounded-md border px-3 text-sm"
          disabled={pending || filteredVariants.length === 0}
          required
        >
          {filteredVariants.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="slot-location">Location</Label>
        <select
          id="slot-location"
          name="location_id"
          className="border-input bg-card mt-1.5 flex h-11 w-full rounded-md border px-3 text-sm"
          disabled={pending}
        >
          <option value="">None</option>
          {locations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.city ? `${item.name} · ${item.city}` : item.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="slot-starts">Starts</Label>
        <Input
          id="slot-starts"
          name="starts_at"
          type="datetime-local"
          className="mt-1.5 min-h-11"
          required
          disabled={pending}
        />
      </div>
      <div>
        <Label htmlFor="slot-ends">Ends</Label>
        <Input
          id="slot-ends"
          name="ends_at"
          type="datetime-local"
          className="mt-1.5 min-h-11"
          required
          disabled={pending}
        />
      </div>
      <div>
        <Label htmlFor="slot-capacity">Capacity</Label>
        <Input
          id="slot-capacity"
          name="capacity_total"
          type="number"
          min={1}
          defaultValue={8}
          className="mt-1.5 min-h-11"
          required
          disabled={pending}
        />
      </div>
      <div className="md:col-span-2 xl:col-span-3">
        <Label htmlFor="slot-notes">Notes</Label>
        <Input
          id="slot-notes"
          name="notes"
          className="mt-1.5 min-h-11"
          disabled={pending}
        />
      </div>
      <div className="md:col-span-2 xl:col-span-3">
        <Button
          type="submit"
          disabled={pending || filteredVariants.length === 0}
          className="min-h-11"
        >
          Save slot
        </Button>
      </div>
      {message ? (
        <Alert className="md:col-span-2 xl:col-span-3">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive" className="md:col-span-2 xl:col-span-3">
          <AlertTitle>Save failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
