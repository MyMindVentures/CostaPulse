import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ReferralContactForm } from "@/features/referrals/referral-contact-form";
import { resolveAppLocale } from "@/i18n/locales";
import { getSiteLogoAsset } from "@/server/repositories/media-assets";
import {
  getPublicReferralLanding,
  resolveReferralMedia
} from "@/server/referrals/service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export default async function ReferralContactPage({
  params
}: {
  params: Promise<{ visitToken: string }>;
}) {
  const { visitToken } = await params;
  const locale = resolveAppLocale(await getLocale());
  const [landing, logo, t] = await Promise.all([
    getPublicReferralLanding(visitToken, locale),
    getSiteLogoAsset(),
    getTranslations("Referral")
  ]);

  if (!landing) {
    const verificationError = visitToken === "verification-unavailable";
    return (
      <main className="bg-sand flex min-h-screen items-center justify-center px-4 py-10">
        <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
          <Image
            src={logo.url}
            alt={logo.alt}
            width={240}
            height={80}
            className="mx-auto h-auto w-56"
          />
          <h1 className="mt-8 font-serif text-4xl">
            {verificationError ? t("expiredTitle") : t("unavailableTitle")}
          </h1>
          <p className="text-muted mt-4">
            {verificationError
              ? t("expiredDescription")
              : t("unavailableDescription")}
          </p>
          <Link href="/experiences" className="button button-gold mt-7">
            CostaPulse Experiences
          </Link>
        </section>
      </main>
    );
  }

  const background = resolveReferralMedia(landing, "gallery");
  const partnerLogo = resolveReferralMedia(landing, "logo");

  return (
    <main className="bg-sand relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      {background?.url ? (
        <>
          <Image
            src={background.url}
            alt={background.alt}
            fill
            priority
            className="object-cover"
          />
          <div className="bg-navy/60 absolute inset-0" />
        </>
      ) : null}
      <section className="relative z-10 w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl sm:p-10">
        <div className="text-center">
          <Image
            src={logo.url}
            alt={logo.alt}
            width={240}
            height={80}
            className="mx-auto h-auto w-52"
          />
          {partnerLogo?.url ? (
            <Image
              src={partnerLogo.url}
              alt={partnerLogo.alt}
              width={180}
              height={90}
              className="mx-auto mt-6 max-h-20 w-auto object-contain"
            />
          ) : (
            <p className="mt-6 font-serif text-2xl">{landing.partner.name}</p>
          )}
          <p className="text-turquoise mt-7 text-sm font-semibold tracking-wider uppercase">
            {t("formKicker")}
          </p>
          <h1 className="mt-2 font-serif text-4xl">{t("formTitle")}</h1>
          <p className="text-muted mt-3">{t("formDescription")}</p>
        </div>
        <div className="mt-8">
          <ReferralContactForm
            visitToken={visitToken}
            locale={locale}
            partnerName={landing.partner.name}
          />
        </div>
      </section>
    </main>
  );
}
