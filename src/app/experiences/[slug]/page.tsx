import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExperienceDetailPageFeature } from "@/features/experiences/experience-detail-page";
import { getPublishedExperienceBySlug } from "@/server/repositories/catalog";

type ExperiencePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ExperiencePageProps): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getPublishedExperienceBySlug(slug);

  if (!experience) {
    return { title: "Experience not found | CostaPulse" };
  }

  return {
    title: `${experience.title} | CostaPulse`,
    description: experience.shortDescription ?? `Discover ${experience.title} on the Costa Blanca.`
  };
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { slug } = await params;
  const experience = await getPublishedExperienceBySlug(slug);

  if (!experience) notFound();

  return <ExperienceDetailPageFeature experience={experience} />;
}
