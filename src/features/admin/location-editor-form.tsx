"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { upsertLocationAction } from "@/server/admin/actions-cms";
import { useUnsavedChangesWarning } from "@/features/admin/use-unsaved-changes";
import type { AdminLocation } from "@/server/admin/schemas";

const schema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1),
  short_name: z.string().optional(),
  description: z.string().optional(),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().trim().min(1),
  province: z.string().optional(),
  country_code: z.string().length(2),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  map_zoom: z.coerce.number().int().min(1).max(20),
  meeting_point_notes: z.string().optional(),
  parking_notes: z.string().optional(),
  is_active: z.boolean()
});

type FormValues = z.infer<typeof schema>;

function optionalString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function LocationEditorForm({
  location,
  labels
}: {
  location?: AdminLocation | null;
  labels: { save: string; unsavedChanges: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      slug: location?.slug ?? "",
      name: location?.name ?? "",
      short_name: optionalString(location?.short_name),
      description: optionalString(location?.description),
      address_line_1: optionalString(location?.address_line_1),
      address_line_2: optionalString(location?.address_line_2),
      postal_code: optionalString(location?.postal_code),
      city: location?.city ?? "",
      province: optionalString(location?.province),
      country_code: optionalString(location?.country_code) || "ES",
      latitude: Number(location?.latitude ?? 38.5),
      longitude: Number(location?.longitude ?? -0.1),
      map_zoom: Number(location?.map_zoom ?? 13),
      meeting_point_notes: optionalString(location?.meeting_point_notes),
      parking_notes: optionalString(location?.parking_notes),
      is_active: location?.is_active ?? true
    }
  });
  useUnsavedChangesWarning(form.formState.isDirty);

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await upsertLocationAction({
        id: location?.id,
        slug: values.slug,
        name: values.name,
        city: values.city,
        country_code: values.country_code,
        latitude: values.latitude,
        longitude: values.longitude,
        map_zoom: values.map_zoom,
        is_active: values.is_active,
        short_name: values.short_name || null,
        description: values.description || null,
        address_line_1: values.address_line_1 || null,
        address_line_2: values.address_line_2 || null,
        postal_code: values.postal_code || null,
        province: values.province || null,
        meeting_point_notes: values.meeting_point_notes || null,
        parking_notes: values.parking_notes || null
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(labels.save);
      form.reset(values);
      if (!location?.id && result.id)
        router.push(`/admin/locations/${result.id}`);
      router.refresh();
    });
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      {form.formState.isDirty ? (
        <p className="bg-sand/40 rounded-md px-3 py-2 text-sm md:col-span-2">
          {labels.unsavedChanges}
        </p>
      ) : null}
      {(
        [
          ["name", "Name"],
          ["slug", "Slug"],
          ["short_name", "Short name"],
          ["city", "City"],
          ["province", "Province"],
          ["country_code", "Country"],
          ["address_line_1", "Address line 1"],
          ["address_line_2", "Address line 2"],
          ["postal_code", "Postal code"]
        ] as const
      ).map(([name, label]) => (
        <label key={name} className="flex flex-col gap-1 text-sm">
          {label}
          <input
            className="border-border min-h-11 rounded-md border px-3"
            {...form.register(name)}
          />
        </label>
      ))}
      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        Description
        <textarea
          className="border-border min-h-28 rounded-md border px-3 py-2"
          {...form.register("description")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Latitude
        <input
          type="number"
          step="any"
          className="border-border min-h-11 rounded-md border px-3"
          {...form.register("latitude")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Longitude
        <input
          type="number"
          step="any"
          className="border-border min-h-11 rounded-md border px-3"
          {...form.register("longitude")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Map zoom
        <input
          type="number"
          className="border-border min-h-11 rounded-md border px-3"
          {...form.register("map_zoom")}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("is_active")} />
        Active
      </label>
      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        Meeting point notes
        <textarea
          className="border-border min-h-24 rounded-md border px-3 py-2"
          {...form.register("meeting_point_notes")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        Parking notes
        <textarea
          className="border-border min-h-24 rounded-md border px-3 py-2"
          {...form.register("parking_notes")}
        />
      </label>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {labels.save}
        </Button>
      </div>
    </form>
  );
}
