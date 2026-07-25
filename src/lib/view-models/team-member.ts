import { z } from "zod";
import type { Json, Tables } from "@/types/database";

/**
 * Team member summary shape returned inside map/calendar RPC JSON aggregates.
 */
export const teamMemberSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  displayName: z.string().min(1),
  roleTitle: z.string().nullable().optional().default(null),
  photoPath: z.string().nullable().optional().default(null),
  isPrimary: z.boolean().optional().default(false),
  roleLabel: z.string().nullable().optional().default(null)
});

export type TeamMemberSummary = z.infer<typeof teamMemberSummarySchema>;

export function parseTeamMemberSummaries(value: unknown): TeamMemberSummary[] {
  if (value == null) return [];
  const parsed = z.array(teamMemberSummarySchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

const teamMemberLanguageSchema = z.union([
  z
    .string()
    .min(1)
    .transform((label) => ({ code: null, label })),
  z.object({
    code: z.string().min(1).nullable().optional().default(null),
    label: z.string().min(1)
  })
]);

const teamMemberSpecialtySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable(),
  icon_key: z.string().nullable(),
  display_order: z.number().int().nonnegative()
});

export const publishedTeamMemberSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  display_name: z.string().nullable(),
  role_title: z.string().min(1),
  short_bio: z.string().nullable(),
  bio: z.string().nullable(),
  tagline: z.string().nullable(),
  photo_path: z.string().nullable(),
  photo_alt_text: z.string().nullable(),
  home_base: z.string().nullable(),
  languages: z.unknown(),
  years_experience: z.number().int().nonnegative().nullable(),
  certifications: z.unknown(),
  hobbies: z.unknown(),
  is_featured: z.boolean(),
  display_order: z.number().int().nonnegative(),
  team_member_specialties: z
    .array(teamMemberSpecialtySchema)
    .nullable()
    .default([])
});

export type PublishedTeamMemberRow = z.infer<typeof publishedTeamMemberSchema>;

export type TeamMemberViewModel = {
  id: string;
  slug: string;
  displayName: string;
  roleTitle: string;
  shortBio: string | null;
  tagline: string | null;
  photoUrl: string | null;
  photoAlt: string;
  homeBase: string | null;
  languages: Array<{ code: string | null; label: string }>;
  yearsExperience: number | null;
  specialties: Array<{
    id: string;
    title: string;
    description: string | null;
    iconKey: string | null;
  }>;
  certifications: string[];
  isFeatured: boolean;
};

type TeamMemberDatabaseRow = Tables<"team_members">;

function parseStringList(value: Json): string[] {
  const parsed = z.array(z.string().min(1)).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function mapPublishedTeamMember(
  row: PublishedTeamMemberRow,
  photoUrl: string | null
): TeamMemberViewModel {
  const languages = z.array(teamMemberLanguageSchema).safeParse(row.languages);

  return {
    id: row.id,
    slug: row.slug,
    displayName:
      row.display_name?.trim() ||
      `${row.first_name.trim()} ${row.last_name.trim()}`,
    roleTitle: row.role_title,
    shortBio: row.short_bio ?? row.bio,
    tagline: row.tagline,
    photoUrl,
    photoAlt:
      row.photo_alt_text?.trim() ||
      row.display_name?.trim() ||
      `${row.first_name.trim()} ${row.last_name.trim()}`,
    homeBase: row.home_base,
    languages: languages.success ? languages.data : [],
    yearsExperience: row.years_experience,
    specialties: (row.team_member_specialties ?? [])
      .toSorted((a, b) => a.display_order - b.display_order)
      .map((specialty) => ({
        id: specialty.id,
        title: specialty.title,
        description: specialty.description,
        iconKey: specialty.icon_key
      })),
    certifications: parseStringList(
      row.certifications as TeamMemberDatabaseRow["certifications"]
    ),
    isFeatured: row.is_featured
  };
}
