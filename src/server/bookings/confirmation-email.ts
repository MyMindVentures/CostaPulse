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
  currency,
  customer_id,
  referral_id
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
  const { data: voucher } = await supabase
    .from("vouchers")
    .select(
      "id, code, partner_id, voucher_amount_minor, currency, expires_at, partner:partners(name)"
    )
    .eq("booking_id", bookingId)
    .maybeSingle();
  const voucherPartner = voucher
    ? Array.isArray(voucher.partner)
      ? voucher.partner[0]
      : voucher.partner
    : null;
  const rows = [
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
  ];
  if (voucher) {
    rows.push(
      { label: t("voucherCodeLabel"), value: voucher.code },
      {
        label: t("voucherAmountLabel"),
        value: formatMinorUnitAmount(
          voucher.voucher_amount_minor,
          voucher.currency,
          LOCALE_FORMAT_TAGS[locale]
        )
      },
      {
        label: t("voucherPartnerLabel"),
        value: voucherPartner?.name ?? notProvided
      },
      {
        label: t("voucherExpiryLabel"),
        value: voucher.expires_at
          ? new Intl.DateTimeFormat(LOCALE_FORMAT_TAGS[locale], {
              dateStyle: "long"
            }).format(new Date(voucher.expires_at))
          : notProvided
      },
      {
        label: t("voucherRestrictionLabel"),
        value: t("voucherRestriction", {
          partner: voucherPartner?.name ?? notProvided
        })
      }
    );
  }

  const html = buildBookingPaymentReceivedHtml({
    greeting: t("greeting", {
      name: displayName.length > 0 ? displayName : t("guestFallback")
    }),
    intro: t("intro"),
    rows,
    outro: t("outro")
  });

  const result = await sendTransactionalEmail({
    to: booking.customer_email,
    subject,
    html
  });
  if (voucher) {
    await supabase.from("partner_referral_events").insert({
      event_type: result.ok ? "voucher_email_sent" : "voucher_email_failed",
      partner_id: voucher.partner_id,
      referral_id: booking.referral_id,
      customer_id: booking.customer_id,
      booking_id: bookingId,
      voucher_id: voucher.id,
      metadata: result.ok ? { provider_message_id: result.id } : {}
    });
  }
  return result;
}
