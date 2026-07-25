"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  publishExperienceAction,
  replaceExperienceCollectionAction,
  upsertExperienceAction,
  upsertVariantAction
} from "@/server/admin/actions-cms";
import { useUnsavedChangesWarning } from "@/features/admin/use-unsaved-changes";
import { MediaPicker } from "@/features/admin/media-picker";
import type { AdminExperienceDetail } from "@/server/admin/schemas";
import type {
  AdminLocation,
  AdminMediaAsset,
  AdminTeamMember
} from "@/server/admin/schemas";

const formSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(200),
  short_description: z.string().optional(),
  description: z.string().optional(),
  category_label: z.string().optional(),
  location_name: z.string().optional(),
  timezone: z.string().min(1),
  duration_minutes: z.coerce.number().int().positive(),
  base_capacity: z.coerce.number().int().positive(),
  base_currency: z.string().length(3),
  manual_confirmation_required: z.boolean(),
  mentor_required: z.boolean(),
  is_featured: z.boolean(),
  sort_order: z.coerce.number().int(),
  experience_type: z
    .enum([
      "paddlesurf_mentor",
      "boat_experience",
      "bbq_experience",
      "kayak_mentor",
      ""
    ])
    .optional(),
  highlightsText: z.string().optional(),
  inclusionsText: z.string().optional(),
  hero_image_path: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  experience?: AdminExperienceDetail | null;
  locations: AdminLocation[];
  teamMembers: AdminTeamMember[];
  mediaLibrary?: AdminMediaAsset[];
  labels: {
    save: string;
    publish: string;
    unpublish: string;
    archive: string;
    unsavedChanges: string;
    publishBlocked: string;
    previewPublic: string;
  };
};

function linesToJsonArray(value: string | undefined) {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ExperienceEditorForm({
  experience,
  locations,
  teamMembers,
  mediaLibrary = [],
  labels
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(() =>
    (experience?.locations ?? [])
      .map((row) => {
        const locationId =
          typeof row.location_id === "string"
            ? row.location_id
            : typeof (row as { location?: { id?: string } }).location?.id ===
                "string"
              ? (row as { location: { id: string } }).location.id
              : null;
        return locationId;
      })
      .filter((id): id is string => Boolean(id))
  );
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(() =>
    (experience?.team_members ?? [])
      .map((row) =>
        typeof row.team_member_id === "string" ? row.team_member_id : null
      )
      .filter((id): id is string => Boolean(id))
  );
  const [languagesText, setLanguagesText] = useState(() =>
    (experience?.languages ?? [])
      .map((row) => {
        const code =
          typeof row.language_code === "string" ? row.language_code : "";
        const name =
          typeof row.display_name === "string" ? row.display_name : code;
        return code ? `${code}|${name}` : "";
      })
      .filter(Boolean)
      .join("\n")
  );
  const [itineraryText, setItineraryText] = useState(() =>
    (experience?.itinerary ?? [])
      .map((row) => {
        const title = typeof row.title === "string" ? row.title : "";
        const description =
          typeof row.description === "string" ? row.description : "";
        return title ? `${title}|${description}` : "";
      })
      .filter(Boolean)
      .join("\n")
  );
  const [requirementsText, setRequirementsText] = useState(() =>
    (experience?.requirements ?? [])
      .map((row) => {
        const title = typeof row.title === "string" ? row.title : "";
        const description =
          typeof row.description === "string" ? row.description : "";
        return title ? `${title}|${description}` : "";
      })
      .filter(Boolean)
      .join("\n")
  );
  const [policiesText, setPoliciesText] = useState(() =>
    (experience?.policies ?? [])
      .map((row) => {
        const type =
          typeof row.policy_type === "string" ? row.policy_type : "general";
        const title = typeof row.title === "string" ? row.title : "";
        const description =
          typeof row.description === "string" ? row.description : "";
        return title ? `${type}|${title}|${description}` : "";
      })
      .filter(Boolean)
      .join("\n")
  );

  const defaultValues = useMemo<FormValues>(
    () => ({
      slug: experience?.slug ?? "",
      title: experience?.title ?? "",
      short_description:
        typeof experience?.short_description === "string"
          ? experience.short_description
          : "",
      description:
        typeof experience?.description === "string"
          ? experience.description
          : "",
      category_label:
        typeof experience?.category_label === "string"
          ? experience.category_label
          : "",
      location_name:
        typeof experience?.location_name === "string"
          ? experience.location_name
          : "",
      timezone:
        typeof experience?.timezone === "string"
          ? experience.timezone
          : "Europe/Madrid",
      duration_minutes:
        typeof experience?.duration_minutes === "number"
          ? experience.duration_minutes
          : 60,
      base_capacity:
        typeof experience?.base_capacity === "number"
          ? experience.base_capacity
          : 1,
      base_currency:
        typeof experience?.base_currency === "string"
          ? experience.base_currency
          : "EUR",
      manual_confirmation_required:
        experience?.manual_confirmation_required !== false,
      mentor_required: experience?.mentor_required === true,
      is_featured: experience?.is_featured === true,
      sort_order:
        typeof experience?.sort_order === "number" ? experience.sort_order : 0,
      experience_type:
        (experience?.experience_type as FormValues["experience_type"]) ?? "",
      highlightsText: Array.isArray(experience?.highlights)
        ? experience.highlights
            .map((item) =>
              typeof item === "string"
                ? item
                : typeof item === "object" &&
                    item &&
                    "text" in item &&
                    typeof item.text === "string"
                  ? item.text
                  : ""
            )
            .filter(Boolean)
            .join("\n")
        : "",
      inclusionsText: Array.isArray(experience?.inclusions)
        ? experience.inclusions
            .map((item) =>
              typeof item === "string"
                ? item
                : typeof item === "object" &&
                    item &&
                    "text" in item &&
                    typeof item.text === "string"
                  ? item.text
                  : ""
            )
            .filter(Boolean)
            .join("\n")
        : "",
      hero_image_path:
        typeof experience?.hero_image_path === "string"
          ? experience.hero_image_path
          : ""
    }),
    [experience]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues
  });
  useUnsavedChangesWarning(form.formState.isDirty);

  const publishIssues = useMemo(() => {
    const values = form.getValues();
    const issues: string[] = [];
    if (!values.slug) issues.push("Slug is required");
    if (!values.title) issues.push("Title is required");
    if ((experience?.variants ?? []).length === 0) {
      issues.push("At least one variant is required");
    }
    if (selectedLocationIds.length === 0) {
      issues.push("At least one location is required");
    }
    return issues;
  }, [experience?.variants, form, selectedLocationIds.length]);

  const onSave = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await upsertExperienceAction({
        id: experience?.id,
        slug: values.slug,
        title: values.title,
        short_description: values.short_description || null,
        description: values.description || null,
        category_label: values.category_label || null,
        location_name: values.location_name || null,
        timezone: values.timezone,
        status:
          (experience?.status as "draft" | "published" | "archived") ?? "draft",
        duration_minutes: values.duration_minutes,
        base_capacity: values.base_capacity,
        base_currency: values.base_currency,
        manual_confirmation_required: values.manual_confirmation_required,
        mentor_required: values.mentor_required,
        is_featured: values.is_featured,
        sort_order: values.sort_order,
        experience_type: values.experience_type || null,
        highlights: linesToJsonArray(values.highlightsText),
        inclusions: linesToJsonArray(values.inclusionsText),
        hero_image_path: values.hero_image_path || null,
        media_folder: values.slug
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      const experienceId = experience?.id ?? result.id;
      if (!experienceId) {
        toast.error("Experience id missing after save");
        return;
      }

      const locationResult = await replaceExperienceCollectionAction({
        experienceId,
        collection: "locations",
        items: selectedLocationIds.map((locationId, index) => ({
          location_id: locationId,
          is_primary: index === 0,
          display_order: index,
          is_active: true
        }))
      });
      if (!locationResult.ok) {
        toast.error(locationResult.message);
        return;
      }

      const teamResult = await replaceExperienceCollectionAction({
        experienceId,
        collection: "team_members",
        items: selectedTeamIds.map((teamMemberId, index) => ({
          team_member_id: teamMemberId,
          role_label: "Host",
          is_primary: index === 0,
          display_order: index
        }))
      });
      if (!teamResult.ok) {
        toast.error(teamResult.message);
        return;
      }

      const languageItems = languagesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const [language_code, display_name] = line
            .split("|")
            .map((part) => part.trim());
          return {
            language_code,
            display_name: display_name || language_code,
            is_primary: index === 0
          };
        })
        .filter((item) => item.language_code);
      const languagesResult = await replaceExperienceCollectionAction({
        experienceId,
        collection: "languages",
        items: languageItems
      });
      if (!languagesResult.ok) {
        toast.error(languagesResult.message);
        return;
      }

      const itineraryItems = itineraryText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const [title, description = ""] = line
            .split("|")
            .map((part) => part.trim());
          return {
            title,
            description: description || null,
            starts_after_minutes: index * 15,
            duration_minutes: 15,
            display_order: index
          };
        })
        .filter((item) => item.title);
      const itineraryResult = await replaceExperienceCollectionAction({
        experienceId,
        collection: "itinerary",
        items: itineraryItems
      });
      if (!itineraryResult.ok) {
        toast.error(itineraryResult.message);
        return;
      }

      const requirementItems = requirementsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const [title, description = ""] = line
            .split("|")
            .map((part) => part.trim());
          return {
            requirement_type: "general",
            title,
            description: description || null,
            is_mandatory: true,
            display_order: index
          };
        })
        .filter((item) => item.title);
      const requirementsResult = await replaceExperienceCollectionAction({
        experienceId,
        collection: "requirements",
        items: requirementItems
      });
      if (!requirementsResult.ok) {
        toast.error(requirementsResult.message);
        return;
      }

      const policyItems = policiesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const parts = line.split("|").map((part) => part.trim());
          const policy_type = parts[0] || "cancellation";
          const title = parts[1] || parts[0];
          const description = parts[2] ?? "";
          return {
            policy_type,
            title,
            description: description || null,
            value_minutes: null,
            is_active: true,
            display_order: index
          };
        })
        .filter((item) => item.title);
      const policiesResult = await replaceExperienceCollectionAction({
        experienceId,
        collection: "policies",
        items: policyItems
      });
      if (!policiesResult.ok) {
        toast.error(policiesResult.message);
        return;
      }

      toast.success(labels.save);
      form.reset(values);
      if (!experience?.id) {
        router.push(`/admin/experiences/${experienceId}`);
        router.refresh();
        return;
      }
      router.refresh();
    });
  });

  async function setStatus(status: "published" | "draft" | "archived") {
    if (!experience?.id) return;
    if (status === "published" && publishIssues.length > 0) {
      toast.error(labels.publishBlocked);
      return;
    }
    startTransition(async () => {
      const result = await publishExperienceAction({
        id: experience.id,
        status
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(status);
      router.refresh();
    });
  }

  async function addDefaultVariant() {
    if (!experience?.id) {
      toast.error("Save the experience draft before adding variants");
      return;
    }
    startTransition(async () => {
      const result = await upsertVariantAction({
        experience_id: experience.id,
        slug: `${experience.slug}-standard`,
        name: "Standard",
        pricing_model: "per_person",
        unit_amount_minor: 0,
        currency: "EUR",
        min_party_size: 1,
        is_default: true,
        is_active: true
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Variant created");
      router.refresh();
    });
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={onSave}>
      {form.formState.isDirty ? (
        <p className="bg-sand/40 text-ink rounded-md px-3 py-2 text-sm">
          {labels.unsavedChanges}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Title
          <input
            className="border-border min-h-11 rounded-md border px-3"
            {...form.register("title")}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Slug
          <input
            className="border-border min-h-11 rounded-md border px-3"
            {...form.register("slug")}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          Short description
          <textarea
            className="border-border min-h-24 rounded-md border px-3 py-2"
            {...form.register("short_description")}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          Description
          <textarea
            className="border-border min-h-40 rounded-md border px-3 py-2"
            {...form.register("description")}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Category
          <input
            className="border-border min-h-11 rounded-md border px-3"
            {...form.register("category_label")}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Experience type
          <select
            className="border-border min-h-11 rounded-md border px-3"
            {...form.register("experience_type")}
          >
            <option value="">—</option>
            <option value="paddlesurf_mentor">Paddlesurf mentor</option>
            <option value="boat_experience">Boat experience</option>
            <option value="bbq_experience">BBQ experience</option>
            <option value="kayak_mentor">Kayak mentor</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Duration (minutes)
          <input
            type="number"
            className="border-border min-h-11 rounded-md border px-3"
            {...form.register("duration_minutes")}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Base capacity
          <input
            type="number"
            className="border-border min-h-11 rounded-md border px-3"
            {...form.register("base_capacity")}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          Highlights (one per line)
          <textarea
            className="border-border min-h-28 rounded-md border px-3 py-2"
            {...form.register("highlightsText")}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          Inclusions (one per line)
          <textarea
            className="border-border min-h-28 rounded-md border px-3 py-2"
            {...form.register("inclusionsText")}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            {...form.register("manual_confirmation_required")}
          />
          Manual confirmation required
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("is_featured")} />
          Featured
        </label>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Locations</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {locations.map((location) => {
            const checked = selectedLocationIds.includes(location.id);
            return (
              <label
                key={location.id}
                className="border-border flex min-h-11 items-center gap-2 rounded-md border px-3"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    setSelectedLocationIds((current) =>
                      event.target.checked
                        ? [...current, location.id]
                        : current.filter((id) => id !== location.id)
                    );
                    form.setValue("title", form.getValues("title"), {
                      shouldDirty: true
                    });
                  }}
                />
                <span>
                  {location.name}
                  {location.city ? ` · ${location.city}` : ""}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Hosts / team</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {teamMembers.map((member) => {
            const checked = selectedTeamIds.includes(member.id);
            const name =
              typeof member.display_name === "string" && member.display_name
                ? member.display_name
                : `${member.first_name} ${member.last_name}`;
            return (
              <label
                key={member.id}
                className="border-border flex min-h-11 items-center gap-2 rounded-md border px-3"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    setSelectedTeamIds((current) =>
                      event.target.checked
                        ? [...current, member.id]
                        : current.filter((id) => id !== member.id)
                    );
                    form.setValue("title", form.getValues("title"), {
                      shouldDirty: true
                    });
                  }}
                />
                <span>
                  {name}
                  {member.role_title ? ` · ${member.role_title}` : ""}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Languages (code|name, one per line)
          <textarea
            className="border-border min-h-28 rounded-md border px-3 py-2"
            value={languagesText}
            onChange={(event) => {
              setLanguagesText(event.target.value);
              form.setValue("title", form.getValues("title"), {
                shouldDirty: true
              });
            }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Itinerary (title|description, one per line)
          <textarea
            className="border-border min-h-28 rounded-md border px-3 py-2"
            value={itineraryText}
            onChange={(event) => {
              setItineraryText(event.target.value);
              form.setValue("title", form.getValues("title"), {
                shouldDirty: true
              });
            }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Requirements (title|description, one per line)
          <textarea
            className="border-border min-h-28 rounded-md border px-3 py-2"
            value={requirementsText}
            onChange={(event) => {
              setRequirementsText(event.target.value);
              form.setValue("title", form.getValues("title"), {
                shouldDirty: true
              });
            }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Policies (type|title|description, one per line)
          <textarea
            className="border-border min-h-28 rounded-md border px-3 py-2"
            value={policiesText}
            onChange={(event) => {
              setPoliciesText(event.target.value);
              form.setValue("title", form.getValues("title"), {
                shouldDirty: true
              });
            }}
          />
        </label>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Variants</h2>
          <Button
            type="button"
            variant="outline"
            disabled={pending || !experience?.id}
            onClick={() => void addDefaultVariant()}
          >
            Add standard variant
          </Button>
        </div>
        <ul className="text-sm">
          {(experience?.variants ?? []).map((variant) => (
            <li
              key={String(variant.id)}
              className="border-border border-b py-2"
            >
              {String(variant.name)} · {String(variant.unit_amount_minor)}{" "}
              {String(variant.currency)} ·{" "}
              {variant.is_active ? "active" : "inactive"}
            </li>
          ))}
        </ul>
      </section>

      {experience?.id ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Media gallery</h2>
          <MediaPicker
            scopeType="experience"
            scopeKey={String(experience.slug)}
            role="gallery"
            libraryItems={mediaLibrary}
            initialSelectedIds={(experience.media ?? [])
              .map((item) => (typeof item.id === "string" ? item.id : null))
              .filter((id): id is string => Boolean(id))}
          />
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {labels.save}
        </Button>
        {experience?.id ? (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => void setStatus("published")}
            >
              {labels.publish}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => void setStatus("draft")}
            >
              {labels.unpublish}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => void setStatus("archived")}
            >
              {labels.archive}
            </Button>
            {experience.status === "published" ? (
              <a
                className="button button-outline inline-flex min-h-11 items-center px-4"
                href={`/experiences/${experience.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                {labels.previewPublic}
              </a>
            ) : null}
          </>
        ) : null}
      </div>

      {publishIssues.length > 0 ? (
        <ul className="text-coral list-disc pl-5 text-sm">
          {publishIssues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
