"use client";

import { BookingSummary } from "@/features/booking/booking-summary";
import type { BookingDraftState } from "@/features/booking/types";

type ExperienceBookingProps = {
  draft: BookingDraftState;
};

export function ExperienceBooking({ draft }: ExperienceBookingProps) {
  return <BookingSummary draft={draft} />;
}
