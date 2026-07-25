import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Container } from "@/components/ui/container";
import { formatMinorUnitAmount } from "@/lib/pricing/format-money";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

type SuccessPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

export default async function BookingSuccessPage({
  params,
  searchParams
}: SuccessPageProps) {
  const { slug } = await params;
  const { session_id: sessionId } = await searchParams;
  const t = await getTranslations("Booking");

  let reference: string | null = null;
  let status: string | null = null;
  let totalLabel: string | null = null;
  let title: string | null = null;

  if (sessionId && stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const bookingId = session.metadata?.bookingId;
      const supabase = createSupabaseAdminClient();

      if (bookingId && supabase) {
        const { data: booking } = await supabase
          .from("booking_detail")
          .select(
            "booking_reference, status, payment_status, total_amount_minor, currency, experience_title_snapshot"
          )
          .eq("id", bookingId)
          .maybeSingle();

        if (booking) {
          reference = booking.booking_reference;
          status = booking.status;
          title = booking.experience_title_snapshot;
          if (booking.total_amount_minor != null && booking.currency) {
            totalLabel = formatMinorUnitAmount(
              booking.total_amount_minor,
              booking.currency
            );
          }
        }
      }
    } catch {
      // Fall through to generic confirmation messaging.
    }
  }

  return (
    <main className="bk-result-page">
      <Container className="bk-result-card">
        <p className="bk-result-kicker">{t("success.kicker")}</p>
        <h1>{t("success.title")}</h1>
        <p>{t("success.subtitle")}</p>

        <dl className="bk-review-list">
          {title ? (
            <div>
              <dt>{t("review.experience")}</dt>
              <dd>{title}</dd>
            </div>
          ) : null}
          {reference ? (
            <div>
              <dt>{t("success.reference")}</dt>
              <dd>{reference}</dd>
            </div>
          ) : null}
          {status ? (
            <div>
              <dt>{t("success.status")}</dt>
              <dd>{status.replaceAll("_", " ")}</dd>
            </div>
          ) : null}
          {totalLabel ? (
            <div>
              <dt>{t("review.total")}</dt>
              <dd>{totalLabel}</dd>
            </div>
          ) : null}
        </dl>

        <div className="bk-actions">
          <Link className="button button-gold" href={`/experiences/${slug}`}>
            {t("success.backToExperience")}
          </Link>
          <Link className="button button-light" href="/">
            {t("success.backHome")}
          </Link>
        </div>
      </Container>
    </main>
  );
}
