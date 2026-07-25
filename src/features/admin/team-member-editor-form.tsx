"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { upsertTeamMemberAction } from "@/server/admin/actions-cms";
import { useUnsavedChangesWarning } from "@/features/admin/use-unsaved-changes";
import { MediaPicker } from "@/features/admin/media-picker";
import type { AdminMediaAsset } from "@/server/admin/schemas";

const schema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().min(1),
  role_title: z.string().trim().min(1),
  short_bio: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  tagline: z.string().optional(),
  home_base: z.string().optional(),
  years_experience: z.coerce.number().int().nonnegative().optional().nullable(),
  display_order: z.coerce.number().int().nonnegative(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  photo_path: z.string().optional(),
  photo_alt_text: z.string().optional(),
  hero_image_path: z.string().optional(),
  signature_path: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export function TeamMemberEditorForm({
  member,
  mediaLibrary = [],
  labels
}: {
  member?: Record<string, unknown> | null;
  mediaLibrary?: AdminMediaAsset[];
  labels: { save: string; unsavedChanges: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      slug: String(member?.slug ?? ""),
      first_name: String(member?.first_name ?? ""),
      last_name: String(member?.last_name ?? ""),
      role_title: String(member?.role_title ?? ""),
      short_bio: String(member?.short_bio ?? ""),
      bio: String(member?.bio ?? ""),
      email: String(member?.email ?? ""),
      phone: String(member?.phone ?? ""),
      tagline: String(member?.tagline ?? ""),
      home_base: String(member?.home_base ?? ""),
      years_experience:
        typeof member?.years_experience === "number"
          ? member.years_experience
          : null,
      display_order:
        typeof member?.display_order === "number" ? member.display_order : 0,
      is_featured: member?.is_featured === true,
      is_active: member?.is_active !== false,
      seo_title: String(member?.seo_title ?? ""),
      seo_description: String(member?.seo_description ?? ""),
      photo_path: String(member?.photo_path ?? ""),
      photo_alt_text: String(member?.photo_alt_text ?? ""),
      hero_image_path: String(member?.hero_image_path ?? ""),
      signature_path: String(member?.signature_path ?? "")
    }
  });
  useUnsavedChangesWarning(form.formState.isDirty);

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await upsertTeamMemberAction({
        id: typeof member?.id === "string" ? member.id : null,
        slug: values.slug,
        first_name: values.first_name,
        last_name: values.last_name,
        role_title: values.role_title,
        display_order: values.display_order,
        is_featured: values.is_featured,
        is_active: values.is_active,
        short_bio: values.short_bio || null,
        bio: values.bio || null,
        email: values.email || null,
        phone: values.phone || null,
        tagline: values.tagline || null,
        home_base: values.home_base || null,
        years_experience: values.years_experience ?? null,
        seo_title: values.seo_title || null,
        seo_description: values.seo_description || null,
        photo_path: values.photo_path || null,
        photo_alt_text: values.photo_alt_text || null,
        hero_image_path: values.hero_image_path || null,
        signature_path: values.signature_path || null,
        languages: Array.isArray(member?.languages) ? member.languages : [],
        certifications: Array.isArray(member?.certifications)
          ? member.certifications
          : [],
        social_links:
          member?.social_links && typeof member.social_links === "object"
            ? (member.social_links as Record<string, unknown>)
            : {},
        hobbies: Array.isArray(member?.hobbies) ? member.hobbies : []
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(labels.save);
      form.reset(values);
      if (!member?.id && result.id) router.push(`/admin/team/${result.id}`);
      router.refresh();
    });
  });

  const slug = useWatch({ control: form.control, name: "slug" });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      {form.formState.isDirty ? (
        <p className="bg-sand/40 rounded-md px-3 py-2 text-sm md:col-span-2">
          {labels.unsavedChanges}
        </p>
      ) : null}
      {(
        [
          ["first_name", "First name"],
          ["last_name", "Last name"],
          ["slug", "Slug"],
          ["role_title", "Role title"],
          ["email", "Email"],
          ["phone", "Phone"],
          ["tagline", "Tagline"],
          ["home_base", "Home base"],
          ["seo_title", "SEO title"],
          ["seo_description", "SEO description"],
          ["photo_path", "Photo path"],
          ["photo_alt_text", "Photo alt text"],
          ["hero_image_path", "Hero image path"],
          ["signature_path", "Signature path"]
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
      <label className="flex flex-col gap-1 text-sm">
        Years experience
        <input
          type="number"
          className="border-border min-h-11 rounded-md border px-3"
          {...form.register("years_experience")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Display order
        <input
          type="number"
          className="border-border min-h-11 rounded-md border px-3"
          {...form.register("display_order")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        Short bio
        <textarea
          className="border-border min-h-24 rounded-md border px-3 py-2"
          {...form.register("short_bio")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        Bio
        <textarea
          className="border-border min-h-40 rounded-md border px-3 py-2"
          {...form.register("bio")}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("is_featured")} />
        Featured
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("is_active")} />
        Active
      </label>

      {typeof member?.id === "string" && slug ? (
        <div className="md:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Profile media</h2>
          <MediaPicker
            scopeType="team_member"
            scopeKey={slug}
            role="avatar"
            entityId={member.id}
            libraryItems={mediaLibrary}
          />
        </div>
      ) : null}

      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {labels.save}
        </Button>
      </div>
    </form>
  );
}
