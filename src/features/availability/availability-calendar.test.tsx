/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within
} from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import messages from "../../../messages/en.json";
import type { PublicAvailabilityEntry } from "@/lib/view-models/team-member-availability";
import { AvailabilityCalendar } from "./availability-calendar";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/availability",
  useRouter: () => ({ push })
}));

afterEach(() => {
  cleanup();
  push.mockClear();
});

const baseEntry: PublicAvailabilityEntry = {
  id: "00000000-0000-4000-8000-000000000001",
  dateKey: "2026-08-10",
  startsAt: "2026-08-10T08:00:00+02:00",
  endsAt: "2026-08-10T12:00:00+02:00",
  timezone: "Europe/Madrid",
  isAllDay: false,
  status: "available",
  entryType: "professional_service",
  title: "Relief captain",
  summary: "Professional support",
  locationLabel: "Costa Blanca",
  geographicScope: "Spain",
  travelAvailable: true,
  capacityTotal: 4,
  capacityReserved: 1,
  capacityRemaining: 3,
  service: {
    id: "10000000-0000-4000-8000-000000000001",
    slug: "relief-captain",
    category: "relief_captain",
    audience: ["agencies"]
  },
  experience: null,
  cta: {
    type: "request_service",
    label: "Request service",
    path: "/contact"
  }
};

function renderCalendar(entries: PublicAvailabilityEntry[] = [baseEntry]) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <AvailabilityCalendar
        entries={entries}
        month="2026-08"
        locale="en"
        initialFilters={{
          serviceCategory: "",
          status: "",
          availableOnly: false,
          location: ""
        }}
      />
    </NextIntlClientProvider>
  );
}

describe("AvailabilityCalendar", () => {
  it("renders month navigation and semantic date routes", () => {
    renderCalendar();
    expect(
      screen.getByRole("link", { name: "Previous month" })
    ).toHaveAttribute("href", "/availability?month=2026-07");
    expect(screen.getByRole("link", { name: "Next month" })).toHaveAttribute(
      "href",
      "/availability?month=2026-09"
    );
    expect(
      screen.getAllByRole("link", { name: "Monday, August 10, 2026" })
    ).toHaveLength(2);
  });

  it("renders entry details, mobile agenda cards, and overflow", () => {
    const entries = Array.from({ length: 4 }, (_, index) => ({
      ...baseEntry,
      id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      title: `Captain option ${index + 1}`
    }));
    renderCalendar(entries);

    expect(screen.getByText("+2 more")).toBeInTheDocument();
    const entryButtons = screen.getAllByRole("button", {
      name: /Captain option 1/i
    });
    fireEvent.click(entryButtons[0]!);
    expect(
      screen.getAllByRole("heading", { name: "Captain option 1" })
    ).toHaveLength(2);
    expect(screen.getAllByText("Costa Blanca").length).toBeGreaterThan(0);
  });

  it("maps filters to the range RPC URL contract", () => {
    renderCalendar();
    fireEvent.change(screen.getByLabelText("Service"), {
      target: { value: "watersports" }
    });
    fireEvent.change(screen.getByLabelText("Availability status"), {
      target: { value: "limited" }
    });
    fireEvent.change(screen.getByLabelText("Location or region"), {
      target: { value: "Alicante" }
    });
    fireEvent.click(screen.getByLabelText("Available only"));
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    expect(push).toHaveBeenCalledWith(
      "/availability?month=2026-08&service_category=watersports&status=limited&location=Alicante&available_only=true"
    );
  });

  it("uses the shared status mapping for the complete legend", () => {
    renderCalendar([]);
    const legend = screen.getByRole("region", {
      name: "Availability legend"
    });
    for (const label of [
      "Available",
      "Limited",
      "On request",
      "Partially booked",
      "Fully booked",
      "Unavailable",
      "Travelling",
      "Confirmed captain assignment",
      "Cancelled"
    ]) {
      expect(within(legend).getByText(label)).toBeInTheDocument();
    }
    expect(screen.getAllByText("No public availability found")).toHaveLength(2);
  });
});
