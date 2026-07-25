"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Gift, LoaderCircle } from "lucide-react";
import { formatMinorUnitAmount } from "@/lib/pricing/format-money";
import type { IssuedVoucher } from "@/server/referrals/schema";

type VoucherState =
  | { status: "not_applicable" }
  | { status: "pending" }
  | { status: "failed" }
  | { status: "issued"; voucher: IssuedVoucher };

export function VoucherStatusPanel({
  sessionId,
  initialState,
  locale
}: {
  sessionId: string;
  initialState: VoucherState;
  locale: string;
}) {
  const t = useTranslations("Booking.success");
  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (state.status !== "pending") return;
    let attempts = 0;
    const id = window.setInterval(async () => {
      attempts += 1;
      try {
        const response = await fetch(
          `/api/referrals/voucher-status?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" }
        );
        const payload = (await response.json()) as VoucherState;
        if (
          payload.status === "issued" ||
          payload.status === "failed" ||
          payload.status === "not_applicable"
        ) {
          setState(payload);
          window.clearInterval(id);
        } else if (attempts >= 15) {
          setState({ status: "failed" });
          window.clearInterval(id);
        }
      } catch {
        if (attempts >= 15) {
          setState({ status: "failed" });
          window.clearInterval(id);
        }
      }
    }, 2000);
    return () => window.clearInterval(id);
  }, [sessionId, state.status]);

  if (state.status === "not_applicable") return null;
  if (state.status === "pending") {
    return (
      <div className="bg-turquoise/10 mt-6 rounded-2xl p-5" role="status">
        <LoaderCircle
          aria-hidden="true"
          className="text-turquoise animate-spin motion-reduce:animate-none"
        />
        <p className="mt-3">{t("voucherPending")}</p>
      </div>
    );
  }
  if (state.status === "failed") {
    return (
      <div
        className="border-coral mt-6 rounded-2xl border bg-white p-5"
        role="alert"
      >
        <p>{t("voucherFailed")}</p>
      </div>
    );
  }

  const { voucher } = state;
  return (
    <section className="bg-navy mt-6 rounded-2xl p-6 text-white">
      <Gift aria-hidden="true" className="text-gold" />
      <h2 className="mt-3 font-serif text-3xl">{t("voucherIssued")}</h2>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-white/70">{t("voucherCode")}</dt>
          <dd className="font-mono text-lg font-semibold">{voucher.code}</dd>
        </div>
        <div>
          <dt className="text-sm text-white/70">{t("voucherAmount")}</dt>
          <dd className="text-lg font-semibold">
            {formatMinorUnitAmount(
              voucher.voucher_amount_minor,
              voucher.currency,
              locale
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-white/70">{t("voucherPartner")}</dt>
          <dd>{voucher.partner.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-white/70">{t("voucherExpiry")}</dt>
          <dd>
            {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
              new Date(voucher.expires_at)
            )}
          </dd>
        </div>
      </dl>
      <p className="mt-5 text-sm text-white/80">
        {t("voucherRestriction", { partner: voucher.partner.name })}
      </p>
    </section>
  );
}
