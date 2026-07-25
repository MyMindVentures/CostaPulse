import Image from "next/image";
import {
  Award,
  Languages,
  MapPin,
  Navigation,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamMemberViewModel } from "@/lib/view-models/team-member";

type TeamMemberCardLabels = {
  featured: string;
  basedIn: string;
  speaks: string;
  experience: string;
  experienceYears: (years: number) => string;
  specialties: string;
  certifications: string;
};

type TeamMemberCardProps = {
  member: TeamMemberViewModel;
  labels: TeamMemberCardLabels;
  featured?: boolean;
};

function MemberPortrait({
  member,
  featured,
  featuredLabel
}: {
  member: TeamMemberViewModel;
  featured: boolean;
  featuredLabel: string;
}) {
  const initials = member.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");

  return (
    <div
      className={cn(
        "bg-navy-soft relative min-h-80 overflow-hidden",
        featured ? "lg:min-h-[35rem]" : "aspect-[4/5]"
      )}
    >
      {member.photoUrl ? (
        <Image
          src={member.photoUrl}
          alt={member.photoAlt}
          fill
          priority={featured}
          sizes={
            featured
              ? "(max-width: 1024px) 100vw, 46vw"
              : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          }
          className="object-cover object-top"
          unoptimized
        />
      ) : (
        <div className="from-navy-soft to-navy grid h-full min-h-80 place-items-center bg-linear-to-br">
          <span
            className="text-turquoise text-7xl font-semibold"
            aria-hidden="true"
          >
            {initials}
          </span>
        </div>
      )}
      <div className="from-navy/70 absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t to-transparent" />
      {member.isFeatured ? (
        <span className="bg-gold text-navy absolute top-5 left-5 rounded-full px-3 py-1.5 text-xs font-extrabold tracking-[0.12em] uppercase">
          {featuredLabel}
        </span>
      ) : null}
    </div>
  );
}

function MemberFacts({
  member,
  labels,
  featured
}: {
  member: TeamMemberViewModel;
  labels: TeamMemberCardLabels;
  featured: boolean;
}) {
  return (
    <dl
      className={cn(
        "grid gap-4",
        featured ? "sm:grid-cols-3" : "sm:grid-cols-2"
      )}
    >
      {member.homeBase ? (
        <div className="flex min-w-0 gap-3">
          <MapPin
            className="text-turquoise mt-0.5 size-5 shrink-0"
            aria-hidden
          />
          <div className="min-w-0">
            <dt className="text-muted text-xs font-bold tracking-wider uppercase">
              {labels.basedIn}
            </dt>
            <dd className="text-ink mt-1 text-sm">{member.homeBase}</dd>
          </div>
        </div>
      ) : null}
      {member.languages.length > 0 ? (
        <div className="flex min-w-0 gap-3">
          <Languages
            className="text-turquoise mt-0.5 size-5 shrink-0"
            aria-hidden
          />
          <div className="min-w-0">
            <dt className="text-muted text-xs font-bold tracking-wider uppercase">
              {labels.speaks}
            </dt>
            <dd className="text-ink mt-1 text-sm">
              {member.languages.map((language) => language.label).join(", ")}
            </dd>
          </div>
        </div>
      ) : null}
      {member.yearsExperience !== null ? (
        <div className="flex min-w-0 gap-3">
          <Award
            className="text-turquoise mt-0.5 size-5 shrink-0"
            aria-hidden
          />
          <div className="min-w-0">
            <dt className="text-muted text-xs font-bold tracking-wider uppercase">
              {labels.experience}
            </dt>
            <dd className="text-ink mt-1 text-sm">
              {labels.experienceYears(member.yearsExperience)}
            </dd>
          </div>
        </div>
      ) : null}
    </dl>
  );
}

export function TeamMemberCard({
  member,
  labels,
  featured = false
}: TeamMemberCardProps) {
  return (
    <article
      className={cn(
        "border-border bg-panel shadow-card min-w-0 overflow-hidden rounded-3xl border",
        featured && "lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
      )}
    >
      <MemberPortrait
        member={member}
        featured={featured}
        featuredLabel={labels.featured}
      />
      <div
        className={cn(
          "flex min-w-0 flex-col p-6 sm:p-8",
          featured && "justify-center lg:p-12"
        )}
      >
        <p className="text-coral text-xs font-extrabold tracking-[0.16em] uppercase">
          {member.roleTitle}
        </p>
        <h2
          className={cn(
            "text-navy mt-3 font-semibold tracking-tight",
            featured ? "text-4xl sm:text-5xl" : "text-3xl"
          )}
        >
          {member.displayName}
        </h2>
        {member.tagline ? (
          <p className="text-turquoise-deep mt-3 text-xl font-medium italic">
            {member.tagline}
          </p>
        ) : null}
        {member.shortBio ? (
          <p className="text-muted mt-5 text-base leading-7">
            {member.shortBio}
          </p>
        ) : null}

        <div className="border-border mt-7 border-t pt-6">
          <MemberFacts member={member} labels={labels} featured={featured} />
        </div>

        {member.specialties.length > 0 ? (
          <section
            className="mt-7"
            aria-labelledby={`specialties-${member.id}`}
          >
            <h3
              id={`specialties-${member.id}`}
              className="text-navy flex items-center gap-2 text-sm font-extrabold tracking-wider uppercase"
            >
              <Navigation className="text-turquoise size-4" aria-hidden />
              {labels.specialties}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {member.specialties.map((specialty) => (
                <li
                  key={specialty.id}
                  className="bg-sand text-ink rounded-full px-3 py-2 text-sm"
                >
                  {specialty.title}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {featured && member.certifications.length > 0 ? (
          <section
            className="mt-7"
            aria-labelledby={`certifications-${member.id}`}
          >
            <h3
              id={`certifications-${member.id}`}
              className="text-navy flex items-center gap-2 text-sm font-extrabold tracking-wider uppercase"
            >
              <ShieldCheck className="text-turquoise size-4" aria-hidden />
              {labels.certifications}
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {member.certifications.map((certification) => (
                <li
                  key={certification}
                  className="text-ink flex items-start gap-2 text-sm"
                >
                  <span
                    className="bg-turquoise mt-2 size-1.5 shrink-0 rounded-full"
                    aria-hidden="true"
                  />
                  {certification}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}
