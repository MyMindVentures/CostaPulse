import type { ExperienceDetailViewModel } from "@/server/repositories/catalog";
import { DetailHero } from "./detail-hero";

type ExperienceDetailProps = {
  experience: ExperienceDetailViewModel;
};

export function ExperienceDetail({ experience }: ExperienceDetailProps) {
  return <DetailHero experience={experience} />;
}
