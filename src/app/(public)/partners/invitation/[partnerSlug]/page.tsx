import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { PartnerInvitationPage } from "@/features/partners/partner-invitation-page";
import { getPublicPartnerInvitation } from "@/server/repositories/partner-invitations";

type Props = { params: Promise<{ partnerSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { partnerSlug } = await params;
  const locale = await getLocale();
  const [invitation, t] = await Promise.all([
    getPublicPartnerInvitation(partnerSlug, locale),
    getTranslations("PartnerInvitation.meta")
  ]);
  if (!invitation)
    return {
      title: t("unavailableTitle"),
      robots: { index: false, follow: false }
    };
  const title = t("title", { partner: invitation.name });
  const description = t("description", { partner: invitation.name });
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costapulse.club";
  const canonical = `${siteUrl.replace(/\/+$/, "")}/partners/invitation/${invitation.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: invitation.image.url
        ? [{ url: invitation.image.url, alt: invitation.image.alt }]
        : undefined
    },
    robots: { index: false, follow: false }
  };
}

export default async function InvitationRoute({ params }: Props) {
  const { partnerSlug } = await params;
  const locale = await getLocale();
  const invitation = await getPublicPartnerInvitation(partnerSlug, locale);
  if (!invitation) notFound();
  return <PartnerInvitationPage invitation={invitation} />;
}
