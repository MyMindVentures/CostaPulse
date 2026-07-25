export const BOOKING_STEPS = [
  "experience",
  "datetime",
  "details",
  "extras",
  "review"
] as const;

export type BookingStepId = (typeof BOOKING_STEPS)[number];

export type BookingDraftState = {
  experienceSlug: string | null;
  experienceId: string | null;
  experienceTitle: string | null;
  experienceImageUrl: string | null;
  experienceShortDescription: string | null;
  variantId: string | null;
  variantName: string | null;
  date: string | null;
  slotId: string | null;
  slotLabel: string | null;
  startsAt: string | null;
  partySize: number;
  locationName: string | null;
  preferredLanguage: string;
  contactFirstName: string;
  contactLastName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests: string;
  termsAccepted: boolean;
  selectedReferralId: string | null;
  bookingId: string | null;
  bookingReference: string | null;
  expiresAt: string | null;
  totalAmountMinor: number | null;
  currency: string | null;
};

export type EligiblePartnerReferral = {
  referralId: string;
  partnerId: string;
  partnerName: string;
  businessType: string | null;
  rewardBasisPoints: number;
  expiresAt: string;
};

export type BookingReferralContext = {
  verifiedCustomer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null;
  eligiblePartners: EligiblePartnerReferral[];
};

export type WizardExperienceOption = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  heroImageUrl: string | null;
  startingPriceMinor: number | null;
  currency: string | null;
  pricingModel: "per_person" | "per_group" | null;
};

export type WizardVariantOption = {
  id: string;
  name: string;
  unitAmountMinor: number;
  currency: string;
  pricingModel: "per_person" | "per_group";
  minPartySize: number;
  maxPartySize: number | null;
  isDefault: boolean;
};

export type AvailabilitySlotDto = {
  id: string;
  startsAt: string;
  endsAt: string;
  localStartLabel: string;
  capacityRemaining: number;
  capacityTotal: number;
  isInstantConfirmation: boolean;
  locationId: string | null;
};

export type CalendarDayDto = {
  date: string;
  level: "good" | "limited" | "full" | "none";
  capacityAvailable: number;
  capacityTotal: number;
  slotCount: number;
};

export function createInitialDraft(
  partial?: Partial<BookingDraftState>
): BookingDraftState {
  return {
    experienceSlug: null,
    experienceId: null,
    experienceTitle: null,
    experienceImageUrl: null,
    experienceShortDescription: null,
    variantId: null,
    variantName: null,
    date: null,
    slotId: null,
    slotLabel: null,
    startsAt: null,
    partySize: 2,
    locationName: null,
    preferredLanguage: "en",
    contactFirstName: "",
    contactLastName: "",
    customerEmail: "",
    customerPhone: "",
    specialRequests: "",
    termsAccepted: false,
    selectedReferralId: null,
    bookingId: null,
    bookingReference: null,
    expiresAt: null,
    totalAmountMinor: null,
    currency: null,
    ...partial
  };
}
