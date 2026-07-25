import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getSiteLogoAsset } from "@/server/repositories/media-assets";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export default async function ReferralEntryPage() {
  const [t, logo] = await Promise.all([
    getTranslations("Referral"),
    getSiteLogoAsset()
  ]);
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
        <h1 className="mt-8 font-serif text-4xl">{t("entryTitle")}</h1>
        <p className="text-muted mt-4">{t("entryDescription")}</p>
        <Link href="/partners" className="button button-gold mt-7">
          {t("entryCta")}
        </Link>
      </section>
    </main>
  );
}
