/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import { ExperienceMapList } from "./experience-map-list";
import { ExperienceMapFilters } from "./experience-map-filters";
import { MapListToggle } from "./map-list-toggle";
import type { ExperienceMapItem } from "@/lib/view-models/experience-map";
import messages from "../../../../messages/en.json";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/experiences/map",
  useSearchParams: () => new URLSearchParams()
}));

afterEach(() => cleanup());

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }))
});

HTMLDialogElement.prototype.show = function show() {
  this.open = true;
};

function wrap(ui: React.ReactNode) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

function sampleItem(
  overrides: Partial<ExperienceMapItem> = {}
): ExperienceMapItem {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    markerKey:
      "11111111-1111-4111-8111-111111111111:22222222-2222-4222-8222-222222222222",
    slug: "sunset-cruise",
    title: "Sunset Cruise",
    description: "Evening sail",
    category: "Yacht",
    experienceType: "boat_experience",
    imageUrl: "https://example.com/hero.jpg",
    heroImagePath: "sunset/hero.jpg",
    durationMinutes: 180,
    baseCapacity: 8,
    isFeatured: true,
    price: { amountMinor: 49500, currency: "EUR" },
    location: {
      id: "22222222-2222-4222-8222-222222222222",
      slug: "altea",
      name: "Altea",
      city: "Altea",
      province: "Alicante",
      latitude: 38.6,
      longitude: -0.05,
      zoom: 12,
      meetingPoint: null
    },
    availability: {
      nextAvailableAt: "2026-08-01T17:00:00+02:00",
      slotCount: 3
    },
    teamMembers: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        slug: "alex",
        displayName: "Alex",
        roleTitle: "Skipper",
        photoPath: null,
        isPrimary: true,
        roleLabel: null
      }
    ],
    ...overrides
  };
}

describe("ExperienceMapList", () => {
  it("renders empty state when there are no items", () => {
    const onClear = vi.fn();
    render(
      wrap(
        <ExperienceMapList
          items={[]}
          selectedMarkerKey={null}
          onSelect={vi.fn()}
          onClearFilters={onClear}
          hasActiveFilters
        />
      )
    );

    expect(
      screen.getByText(/No experiences match these filters/i)
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Clear filters/i }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("renders items with missing media/price/availability and selected state", () => {
    const onSelect = vi.fn();
    const item = sampleItem();
    const missing = sampleItem({
      markerKey: "other:loc",
      id: "99999999-9999-4999-8999-999999999999",
      slug: "kayak",
      title: "Kayak Mentor",
      imageUrl: null,
      price: { amountMinor: null, currency: "EUR" },
      availability: { nextAvailableAt: null, slotCount: 0 },
      teamMembers: [],
      category: null
    });

    render(
      wrap(
        <ExperienceMapList
          items={[item, missing]}
          selectedMarkerKey={item.markerKey}
          onSelect={onSelect}
          onClearFilters={vi.fn()}
          hasActiveFilters={false}
        />
      )
    );

    expect(screen.getByText("Sunset Cruise")).toBeTruthy();
    expect(screen.getByText("Kayak Mentor")).toBeTruthy();
    expect(
      screen.getByText(/No upcoming availability in this window/i)
    ).toBeTruthy();
    expect(document.querySelector(".map-list-item.is-selected")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Select Kayak Mentor at Altea/i
      })
    );
    expect(onSelect).toHaveBeenCalledWith("other:loc");
  });
});

describe("MapListToggle", () => {
  it("toggles between map and list", () => {
    const onChange = vi.fn();
    render(wrap(<MapListToggle view="map" onChange={onChange} />));
    fireEvent.click(screen.getByRole("button", { name: /^List$/i }));
    expect(onChange).toHaveBeenCalledWith("list");
  });
});

describe("ExperienceMapFilters", () => {
  const filters = {
    date: null,
    experienceType: null,
    location: null,
    teamMember: null,
    experience: null,
    view: "map" as const
  };

  const options = {
    experienceTypes: ["kayak_mentor", "paddlesurf_mentor"],
    teamMembers: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        slug: "alex",
        displayName: "Alex"
      }
    ],
    locations: [{ slug: "nerja", name: "Nerja" }]
  };

  it("renders all verified filter options and disables reset when inactive", () => {
    render(wrap(<ExperienceMapFilters filters={filters} options={options} />));

    expect(screen.getByLabelText("Experience type")).toBeTruthy();
    expect(screen.getByRole("option", { name: "kayak mentor" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Alex" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Nerja" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Clear filters" })
    ).toBeDisabled();
  });

  it("enables reset when a URL-backed filter is active", () => {
    render(
      wrap(
        <ExperienceMapFilters
          filters={{ ...filters, location: "nerja" }}
          options={options}
        />
      )
    );

    expect(screen.getByRole("button", { name: "Clear filters" })).toBeEnabled();
  });
});
