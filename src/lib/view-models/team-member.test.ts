import { describe, expect, it } from "vitest";
import {
  mapPublishedTeamMember,
  publishedTeamMemberSchema
} from "@/lib/view-models/team-member";

const memberId = "5f11e692-aa88-4f70-8ed2-a020cdc011d4";

describe("mapPublishedTeamMember", () => {
  it("maps verified database content into a focused UI contract", () => {
    const row = publishedTeamMemberSchema.parse({
      id: memberId,
      slug: "kevin-de-vlieger",
      first_name: "Kevin",
      last_name: "De Vlieger",
      display_name: null,
      role_title: "Founder & Captain",
      short_bio: "Maritime host",
      bio: "Long biography",
      tagline: "Passion. Experience. Leadership.",
      photo_path: "team/kevin-de-vlieger.png",
      photo_alt_text: null,
      home_base: "Costa Blanca",
      languages: [
        { code: "en", label: "English" },
        { code: "nl", label: "Nederlands" }
      ],
      years_experience: 20,
      certifications: ["STCW Unlimited"],
      hobbies: [],
      is_featured: true,
      display_order: 0,
      team_member_specialties: [
        {
          id: "37d11a9b-1bf3-44ff-9b73-1349d9b611d1",
          title: "Harbour Operations",
          description: null,
          icon_key: "anchor",
          display_order: 1
        },
        {
          id: "ebae9972-e4e7-42b6-b1de-97a59f44f4db",
          title: "Navigation",
          description: "Close-quarters manoeuvring",
          icon_key: "navigation",
          display_order: 0
        }
      ]
    });

    const result = mapPublishedTeamMember(
      row,
      "https://example.supabase.co/team/kevin.png"
    );

    expect(result.displayName).toBe("Kevin De Vlieger");
    expect(result.photoAlt).toBe("Kevin De Vlieger");
    expect(result.languages.map((language) => language.label)).toEqual([
      "English",
      "Nederlands"
    ]);
    expect(result.specialties.map((specialty) => specialty.title)).toEqual([
      "Navigation",
      "Harbour Operations"
    ]);
    expect(result.certifications).toEqual(["STCW Unlimited"]);
  });

  it("truthfully tolerates malformed optional JSON collections", () => {
    const row = publishedTeamMemberSchema.parse({
      id: memberId,
      slug: "host",
      first_name: "Local",
      last_name: "Host",
      display_name: "Local Host",
      role_title: "Host",
      short_bio: null,
      bio: null,
      tagline: null,
      photo_path: null,
      photo_alt_text: null,
      home_base: null,
      languages: { unexpected: true },
      years_experience: null,
      certifications: { unexpected: true },
      hobbies: [],
      is_featured: false,
      display_order: 1,
      team_member_specialties: []
    });

    const result = mapPublishedTeamMember(row, null);

    expect(result.languages).toEqual([]);
    expect(result.certifications).toEqual([]);
    expect(result.photoUrl).toBeNull();
  });
});
