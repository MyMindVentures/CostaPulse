import { UsersRound } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionKicker } from "@/components/shared/section-kicker";
import { PageContainer } from "@/components/layout/PageContainer";
import { TeamMemberCard } from "@/features/team/team-member-card";
import type { TeamMemberViewModel } from "@/lib/view-models/team-member";

type TeamPageLabels = {
  kicker: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  featured: string;
  basedIn: string;
  speaks: string;
  experience: string;
  experienceYears: (years: number) => string;
  specialties: string;
  certifications: string;
};

type TeamPageProps = {
  members: TeamMemberViewModel[];
  labels: TeamPageLabels;
};

export function TeamPage({ members, labels }: TeamPageProps) {
  const cardLabels = {
    featured: labels.featured,
    basedIn: labels.basedIn,
    speaks: labels.speaks,
    experience: labels.experience,
    experienceYears: labels.experienceYears,
    specialties: labels.specialties,
    certifications: labels.certifications
  };
  const singleFeaturedMember =
    members.length === 1 && members[0]?.isFeatured ? members[0] : null;

  return (
    <main className="min-w-0 overflow-x-clip">
      <section className="bg-navy text-white">
        <PageContainer
          spacing="comfortable"
          className="grid items-end gap-10 sm:py-20 lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.75fr)] lg:py-24"
        >
          <div className="min-w-0">
            <SectionKicker light>{labels.kicker}</SectionKicker>
            <h1 className="mt-5 max-w-4xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl">
              {labels.title}
            </h1>
          </div>
          <div className="border-turquoise/60 border-l-2 pl-5">
            <p className="max-w-xl text-base leading-7 text-white/78 sm:text-lg">
              {labels.description}
            </p>
          </div>
        </PageContainer>
      </section>

      <PageContainer size="wide" spacing="comfortable" className="sm:py-20">
        {members.length === 0 ? (
          <EmptyState
            className="mx-auto max-w-2xl"
            title={labels.emptyTitle}
            description={labels.emptyDescription}
          >
            <UsersRound
              className="text-turquoise mx-auto mt-6 size-10"
              aria-hidden
            />
          </EmptyState>
        ) : singleFeaturedMember ? (
          <TeamMemberCard
            member={singleFeaturedMember}
            labels={cardLabels}
            featured
          />
        ) : (
          <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                labels={cardLabels}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </main>
  );
}
