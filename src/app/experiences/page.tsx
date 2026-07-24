import type { Metadata } from "next";
import { ExperiencesPageFeature } from "@/features/experiences/experiences-page";

export const metadata: Metadata = {
  title: "Costa Blanca Experiences | CostaPulse",
  description: "Explore private yacht trips, paddle adventures and personally hosted Costa Blanca experiences."
};

export default function ExperiencesPage() {
  return <ExperiencesPageFeature />;
}
