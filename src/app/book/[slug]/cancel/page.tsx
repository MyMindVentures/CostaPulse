import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type CancelPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bookingId?: string }>;
};

export default async function BookingCancelPage({
  params,
  searchParams
}: CancelPageProps) {
  const { slug } = await params;
  const { bookingId } = await searchParams;
  const t = await getTranslations("Booking");

  let status: string | null = null;

  if (bookingId) {
    const supabase = createSupabaseAdminClient();
    if (supabase) {
      const { data: booking } = await supabase
        .from("bookings")
        .select("status, expires_at, payment_status")
        .eq("id", bookingId)
        .maybeSingle();

      if (booking) {
        status = booking.status;
      }
    }
  }

  const expired = status === "cancelled";

  return (
    <main className="bk-result-page">
      <Container className="bk-result-card">
        <p className="bk-result-kicker">{t("cancel.kicker")}</p>
        <h1>{t("cancel.title")}</h1>
        <p>{expired ? t("cancel.expired") : t("cancel.subtitle")}</p>
        {status ? (
          <p className="bk-hold-note">
            {t("cancel.status", { status: status.replaceAll("_", " ") })}
          </p>
        ) : null}

        <div className="bk-actions">
          <Link
            className="button button-gold"
            href={
              bookingId
                ? `/book/${slug}?bookingId=${encodeURIComponent(bookingId)}`
                : `/book/${slug}`
            }
          >
            {t("cancel.resume")}
          </Link>
          <Link className="button button-light" href={`/experiences/${slug}`}>
            {t("cancel.backToExperience")}
          </Link>
        </div>
      </Container>
    </main>
  );
}
