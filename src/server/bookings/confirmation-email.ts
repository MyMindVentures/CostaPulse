import "server-only";
import { createTranslator } from "next-intl";
import { loadMessages } from "@/i18n/load-messages";
import {
  LOCALE_FORMAT_TAGS,
  resolveAppLocale,
  type AppLocale
} from "@/i18n/locales";
import { formatMinorUnitAmount } from "@/lib/pricing/format-money";
import {
  sendTransactionalEmail,
  type SendTransactionalEmailResult
} from "@/lib/resend";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildBookingPaymentReceivedHtml } from "./confirmation-email-html";

export { buildBookingPaymentReceivedHtml } from "./confirmation-email-html";

const bookingEmailSelect = `
  booking_reference,
  customer_email,
  contact_first_name,
  contact_last_name,
  preferred_language,
  experience_title_snapshot,
  variant_name_snapshot,
  location_name_snapshot,
  starts_at_snapshot,
  timezone_snapshot,
  party_size,
  total_amount_minor,
  currency
` as const;

export type BookingPaymentReceivedEmailResult =
  | SendTransactionalEmailResult
  | { ok: false; reason: "missing_booking" | "admin_disabled" };

function formatWhen(
  startsAt: string | null,
  timeZone: string | null,
  locale: AppLocale,
  fallback: string
): string {
  if (!startsAt) {
    return fallback;
  }

  try {
    return new Intl.DateTimeFormat(LOCALE_FORMAT_TAGS[locale], {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: timeZone && timeZone.trim().length > 0 ? timeZone : "UTC"
    }).format(new Date(startsAt));
  } catch {
    return fallback;
  }
}

export async function sendBookingPaymentReceivedEmail(
  bookingId: string
): Promise<BookingPaymentReceivedEmailResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { ok: false, reason: "admin_disabled" };
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(bookingEmailSelect)
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !booking?.customer_email) {
    return { ok: false, reason: "missing_booking" };
  }

  const locale = resolveAppLocale(booking.preferred_language);
  const messages = await loadMessages(locale);
  const t = createTranslator({
    locale,
    messages,
    namespace: "Booking.email.paymentReceived"
  });

  const displayName = [booking.contact_first_name, booking.contact_last_name]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter((part) => part.length > 0)
    .join(" ");

  const notProvided = t("notProvided");
  const when = formatWhen(
    booking.starts_at_snapshot,
    booking.timezone_snapshot,
    locale,
    t("whenFallback")
  );

  const subject = t("subject", { reference: booking.booking_reference });
  const html = buildBookingPaymentReceivedHtml({
    greeting: t("greeting", {
      name: displayName.length > 0 ? displayName : t("guestFallback")
    }),
    intro: t("intro"),
    rows: [
      { label: t("referenceLabel"), value: booking.booking_reference },
      {
        label: t("experienceLabel"),
        value: booking.experience_title_snapshot?.trim() || notProvided
      },
      {
        label: t("variantLabel"),
        value: booking.variant_name_snapshot?.trim() || notProvided
      },
      { label: t("whenLabel"), value: when },
      {
        label: t("locationLabel"),
        value: booking.location_name_snapshot?.trim() || notProvided
      },
      { label: t("guestsLabel"), value: String(booking.party_size) },
      {
        label: t("totalLabel"),
        value: formatMinorUnitAmount(
          booking.total_amount_minor,
          booking.currency,
          LOCALE_FORMAT_TAGS[locale]
        )
      }
    ],
    outro: t("outro")
  });

  return sendTransactionalEmail({
    to: booking.customer_email,
    subject,
    html
  });
}
