import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TeamPage } from "@/features/team/team-page";
import type { TeamMemberViewModel } from "@/lib/view-models/team-member";

const labels = {
  kicker: "The people behind CostaPulse",
  title: "Local knowledge. Personal hospitality.",
  description: "Meet the people behind every hosted day.",
  emptyTitle: "Our team profiles are coming soon.",
  emptyDescription: "Active team members will appear here.",
  featured: "Featured host",
  basedIn: "Based in",
  speaks: "Speaks",
  experience: "Experience",
  experienceYears: (years: number) => `${years}+ years`,
  specialties: "Specialties",
  certifications: "Certifications",
  availability: "View availability"
};

const baseMember: TeamMemberViewModel = {
  id: "5f11e692-aa88-4f70-8ed2-a020cdc011d4",
  slug: "kevin-de-vlieger",
  displayName: "Kevin De Vlieger",
  roleTitle: "Founder & Captain",
  shortBio:
    "A local maritime host with a long biography that remains readable.",
  tagline: "Passion. Experience. Leadership.",
  photoUrl: null,
  photoAlt: "Kevin",
  homeBase: "Costa Blanca, Spain",
  languages: [{ code: "en", label: "English" }],
  yearsExperience: 20,
  specialties: [
    {
      id: "ebae9972-e4e7-42b6-b1de-97a59f44f4db",
      title: "Navigation",
      description: null,
      iconKey: "navigation"
    }
  ],
  certifications: ["STCW Unlimited"],
  isFeatured: true
};

afterEach(() => cleanup());

describe("TeamPage", () => {
  it("renders a truthful empty state", () => {
    render(<TeamPage members={[]} labels={labels} />);

    expect(
      screen.getByRole("heading", { name: labels.emptyTitle })
    ).toBeTruthy();
  });

  it("renders the one-member featured layout with missing-media fallback", () => {
    render(<TeamPage members={[baseMember]} labels={labels} />);

    expect(
      screen.getByRole("heading", { name: "Kevin De Vlieger" })
    ).toBeTruthy();
    expect(screen.getByText("KD")).toBeTruthy();
    expect(screen.getByText("20+ years")).toBeTruthy();
    expect(screen.getByText("STCW Unlimited")).toBeTruthy();
  });

  it("renders multiple members using stable profile content", () => {
    const second = {
      ...baseMember,
      id: "ebae9972-e4e7-42b6-b1de-97a59f44f4db",
      slug: "second-host",
      displayName: "Second Host",
      isFeatured: false
    };

    render(<TeamPage members={[baseMember, second]} labels={labels} />);

    expect(
      screen.getByRole("heading", { name: "Kevin De Vlieger" })
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Second Host" })).toBeTruthy();
  });
});
