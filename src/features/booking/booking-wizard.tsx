"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { ExperienceBooking } from "@/features/experiences/booking/experience-booking";
import { BookingStepper } from "./booking-stepper";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import {
  clearIdempotencyKey,
  getOrCreateAnonymousSessionId,
  getOrCreateIdempotencyKey
} from "./session";
import { DateTimeStep } from "./steps/datetime-step";
import { DetailsStep, type DetailsFormValues } from "./steps/details-step";
import { ExperienceStep } from "./steps/experience-step";
import { ExtrasStep } from "./steps/extras-step";
import { ReviewStep } from "./steps/review-step";
import {
  BOOKING_STEPS,
  createInitialDraft,
  type AvailabilitySlotDto,
  type BookingDraftState,
  type BookingStepId,
  type WizardExperienceOption,
  type WizardVariantOption
} from "./types";

type BookingWizardProps = {
  mode: "standalone" | "experience";
  experiences: WizardExperienceOption[];
  experience?: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string | null;
    imageUrl: string | null;
    timezone: string;
    locationName: string | null;
    languages: Array<{ code: string; displayName: string }>;
    variants: WizardVariantOption[];
  };
  initialStep?: BookingStepId;
};

function estimateTotal(
  variant: WizardVariantOption | undefined,
  partySize: number
) {
  if (!variant) return null;
  return variant.pricingModel === "per_group"
    ? variant.unitAmountMinor
    : variant.unitAmountMinor * partySize;
}

export function BookingWizard({
  mode,
  experiences,
  experience,
  initialStep
}: BookingWizardProps) {
  const t = useTranslations("Booking");
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialVariant =
    experience?.variants.find(
      (variant) => variant.id === searchParams.get("variantId")
    ) ??
    experience?.variants.find((variant) => variant.isDefault) ??
    experience?.variants[0];

  const [step, setStep] = useState<BookingStepId>(() => {
    if (initialStep) return initialStep;
    if (mode === "experience") return "datetime";
    return "experience";
  });

  const [draft, setDraft] = useState<BookingDraftState>(() =>
    createInitialDraft({
      experienceSlug: experience?.slug ?? null,
      experienceId: experience?.id ?? null,
      experienceTitle: experience?.title ?? null,
      experienceImageUrl: experience?.imageUrl ?? null,
      experienceShortDescription: experience?.shortDescription ?? null,
      variantId: initialVariant?.id ?? searchParams.get("variantId"),
      variantName: initialVariant?.name ?? null,
      date: searchParams.get("date"),
      slotId: searchParams.get("slotId"),
      partySize: Number(searchParams.get("partySize") ?? 2) || 2,
      locationName: experience?.locationName ?? null,
      preferredLanguage: searchParams.get("lang") ?? "en",
      referralCode: searchParams.get("ref"),
      currency: initialVariant?.currency ?? null,
      totalAmountMinor: estimateTotal(
        initialVariant,
        Number(searchParams.get("partySize") ?? 2) || 2
      )
    })
  );

  const selectedVariant = useMemo(
    () =>
      experience?.variants.find((variant) => variant.id === draft.variantId),
    [draft.variantId, experience?.variants]
  );

  function goTo(next: BookingStepId) {
    setStep(next);
  }

  function updateDraft(patch: Partial<BookingDraftState>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  const handleSlotSelect = useCallback((slot: AvailabilitySlotDto | null) => {
    setDraft((current) => {
      if (slot) {
        if (
          current.slotId === slot.id &&
          current.slotLabel === slot.localStartLabel &&
          current.startsAt === slot.startsAt
        ) {
          return current;
        }
        return {
          ...current,
          slotId: slot.id,
          slotLabel: slot.localStartLabel,
          startsAt: slot.startsAt
        };
      }

      if (
        current.slotId === null &&
        current.slotLabel === null &&
        current.startsAt === null
      ) {
        return current;
      }

      return {
        ...current,
        slotId: null,
        slotLabel: null,
        startsAt: null
      };
    });
  }, []);

  async function createAndPay() {
    if (
      !draft.slotId ||
      !draft.experienceSlug ||
      !draft.contactFirstName ||
      !draft.contactLastName ||
      !draft.customerEmail ||
      !draft.termsAccepted
    ) {
      throw new Error(t("review.incomplete"));
    }

    const anonymousSessionId = getOrCreateAnonymousSessionId();
    const idempotencyKey = getOrCreateIdempotencyKey(
      `costapulse.booking.idempotency.${draft.slotId}.${draft.customerEmail}`
    );

    let bookingId = draft.bookingId;
    let expiresAt = draft.expiresAt;
    let totalAmountMinor = draft.totalAmountMinor;
    let currency = draft.currency;
    let bookingReference = draft.bookingReference;

    if (!bookingId) {
      const createResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availabilitySlotId: draft.slotId,
          partySize: draft.partySize,
          customerEmail: draft.customerEmail,
          contactFirstName: draft.contactFirstName,
          contactLastName: draft.contactLastName,
          customerPhone: draft.customerPhone || undefined,
          preferredLanguage: draft.preferredLanguage,
          specialRequests: draft.specialRequests || undefined,
          termsAccepted: true,
          idempotencyKey,
          anonymousSessionId,
          referralCode: draft.referralCode || undefined,
          participants: Array.from({ length: draft.partySize }, (_, index) => ({
            firstName:
              index === 0
                ? draft.contactFirstName
                : t("review.guestLabel", { number: index + 1 }),
            lastName: index === 0 ? draft.contactLastName : undefined,
            email: index === 0 ? draft.customerEmail : undefined,
            phone: index === 0 ? draft.customerPhone || undefined : undefined,
            isLead: index === 0
          }))
        })
      });

      const createPayload = (await createResponse.json()) as {
        error?: string;
        booking?: {
          id: string;
          bookingReference: string;
          expiresAt: string | null;
          totalAmountMinor: number;
          currency: string;
        };
      };

      if (!createResponse.ok || !createPayload.booking) {
        throw new Error(createPayload.error ?? t("review.createError"));
      }

      bookingId = createPayload.booking.id;
      expiresAt = createPayload.booking.expiresAt;
      totalAmountMinor = createPayload.booking.totalAmountMinor;
      currency = createPayload.booking.currency;
      bookingReference = createPayload.booking.bookingReference;

      updateDraft({
        bookingId,
        bookingReference,
        expiresAt,
        totalAmountMinor,
        currency
      });
    }

    const checkoutResponse = await fetch(
      `/api/bookings/${bookingId}/checkout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceSlug: draft.experienceSlug,
          email: draft.customerEmail,
          sessionId: anonymousSessionId
        })
      }
    );

    const checkoutPayload = (await checkoutResponse.json()) as {
      error?: string;
      checkoutUrl?: string;
    };

    if (!checkoutResponse.ok || !checkoutPayload.checkoutUrl) {
      throw new Error(checkoutPayload.error ?? t("review.payError"));
    }

    clearIdempotencyKey(
      `costapulse.booking.idempotency.${draft.slotId}.${draft.customerEmail}`
    );
    window.location.assign(checkoutPayload.checkoutUrl);
  }

  return (
    <main className="bk-page">
      <Container className="bk-shell">
        <header className="bk-topbar">
          <Link href="/" className="bk-brand">
            CostaPulse
          </Link>
          <BookingStepper current={step} />
          <LanguageSwitcher currentLocale="en" />
        </header>

        <div className="bk-layout">
          <div className="bk-main">
            {step === "experience" ? (
              <ExperienceStep
                experiences={experiences}
                selectedSlug={draft.experienceSlug}
                onSelect={(selected) => {
                  updateDraft({
                    experienceSlug: selected.slug,
                    experienceId: selected.id,
                    experienceTitle: selected.title,
                    experienceShortDescription: selected.shortDescription,
                    experienceImageUrl: selected.heroImageUrl,
                    currency: selected.currency,
                    totalAmountMinor: selected.startingPriceMinor
                  });
                }}
                onContinue={() => {
                  if (!draft.experienceSlug) return;
                  router.push(`/book/${draft.experienceSlug}`);
                }}
              />
            ) : null}

            {step === "datetime" && experience ? (
              <DateTimeStep
                experienceSlug={experience.slug}
                timezone={experience.timezone}
                variants={experience.variants}
                variantId={draft.variantId}
                date={draft.date}
                partySize={draft.partySize}
                slotId={draft.slotId}
                onVariantChange={(variant) =>
                  updateDraft({
                    variantId: variant.id,
                    variantName: variant.name,
                    currency: variant.currency,
                    totalAmountMinor: estimateTotal(variant, draft.partySize),
                    slotId: null,
                    slotLabel: null,
                    startsAt: null
                  })
                }
                onDateChange={(date) =>
                  updateDraft({
                    date,
                    slotId: null,
                    slotLabel: null,
                    startsAt: null
                  })
                }
                onPartySizeChange={(partySize) =>
                  updateDraft({
                    partySize,
                    totalAmountMinor: estimateTotal(selectedVariant, partySize),
                    slotId: null,
                    slotLabel: null,
                    startsAt: null
                  })
                }
                onSlotSelect={handleSlotSelect}
                onContinue={() => goTo("details")}
                onBack={() =>
                  mode === "standalone"
                    ? router.push("/book")
                    : router.push(`/experiences/${experience.slug}`)
                }
              />
            ) : null}

            {step === "details" ? (
              <DetailsStep
                languages={experience?.languages ?? []}
                defaults={{
                  contactFirstName: draft.contactFirstName,
                  contactLastName: draft.contactLastName,
                  customerEmail: draft.customerEmail,
                  customerPhone: draft.customerPhone,
                  preferredLanguage: draft.preferredLanguage,
                  specialRequests: draft.specialRequests
                }}
                onBack={() => goTo("datetime")}
                onContinue={(values: DetailsFormValues) => {
                  updateDraft({
                    contactFirstName: values.contactFirstName,
                    contactLastName: values.contactLastName,
                    customerEmail: values.customerEmail,
                    customerPhone: values.customerPhone ?? "",
                    preferredLanguage: values.preferredLanguage,
                    specialRequests: values.specialRequests ?? ""
                  });
                  goTo("extras");
                }}
              />
            ) : null}

            {step === "extras" ? (
              <ExtrasStep
                onBack={() => goTo("details")}
                onContinue={() => goTo("review")}
              />
            ) : null}

            {step === "review" ? (
              <ReviewStep
                draft={draft}
                expiresAt={draft.expiresAt}
                onBack={() => goTo("extras")}
                onTermsChange={(termsAccepted) =>
                  updateDraft({ termsAccepted })
                }
                onCreateAndPay={createAndPay}
              />
            ) : null}
          </div>

          <ExperienceBooking draft={draft} />
        </div>

        <p className="bk-step-hint">
          {t("stepHint", {
            step: BOOKING_STEPS.indexOf(step) + 1,
            total: BOOKING_STEPS.length
          })}
        </p>
      </Container>
    </main>
  );
}
