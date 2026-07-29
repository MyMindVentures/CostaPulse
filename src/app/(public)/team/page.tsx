import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TeamPage } from "@/features/team/team-page";
import { getPublishedTeamMembers } from "@/server/repositories/team";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("TeamPage.meta");
  return {
    title: t("title"),
    description: t("description")
  };
}

export default async function PublicTeamPage() {
  const [t, members] = await Promise.all([
    getTranslations("TeamPage"),
    getPublishedTeamMembers()
  ]);

  return (
    <TeamPage
      members={members}
      labels={{
        kicker: t("kicker"),
        title: t("title"),
        description: t("description"),
        emptyTitle: t("emptyTitle"),
        emptyDescription: t("emptyDescription"),
        featured: t("featured"),
        basedIn: t("basedIn"),
        speaks: t("speaks"),
        experience: t("experience"),
        experienceYears: (years) => t("experienceYears", { years }),
        specialties: t("specialties"),
        certifications: t("certifications"),
        availability: t("availabilityCta")
      }}
    />
  );
}
