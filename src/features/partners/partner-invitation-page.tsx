import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Compass,
  Handshake,
  QrCode,
  Sparkles
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BrandLink } from "@/components/shared/brand-link";
import { Button } from "@/components/ui/button";
import type { PartnerInvitation } from "@/lib/view-models/partner-invitation";
import styles from "./partner-invitation-page.module.css";

type Props = { invitation: PartnerInvitation };

export async function PartnerInvitationPage({ invitation }: Props) {
  const t = await getTranslations("PartnerInvitation");
  const selectionReasons = [
    "identity",
    "hospitality",
    "quality",
    "vision",
    "region"
  ] as const;
  const benefits = [
    "visibility",
    "storytelling",
    "guides",
    "referrals",
    "introductions",
    "influence"
  ] as const;
  const journey = ["introduction", "fit", "profile", "launch"] as const;
  const location = [invitation.location.city, invitation.location.province]
    .filter(Boolean)
    .join(", ");

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="invitation-title">
        {invitation.image.url ? (
          <Image
            src={invitation.image.url}
            alt={invitation.image.alt}
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
        ) : null}
        <div className={styles.heroShade} />
        <div className={styles.heroInner}>
          <div className={styles.brandRow}>
            <BrandLink className={styles.brand} />
            {invitation.logo.url ? (
              <Image
                src={invitation.logo.url}
                alt={invitation.logo.alt}
                width={144}
                height={72}
                className={styles.partnerLogo}
              />
            ) : null}
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{t("eyebrow")}</p>
            <h1 id="invitation-title">
              {t("heading", { partner: invitation.name })}
            </h1>
            <p className={styles.intro}>{t("founderIntro")}</p>
            <div className={styles.actions}>
              <Button asChild>
                <Link href="/contact">
                  {t("meetingCta")}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="light">
                <Link href="/">{t("exploreCta")}</Link>
              </Button>
            </div>
          </div>
          <p className={styles.scrollCue}>
            {t("preparedFor", { partner: invitation.name })}
          </p>
        </div>
      </section>

      <section className={styles.lightSection} aria-labelledby="why-heading">
        <div className={styles.container}>
          <div className={styles.sectionLead}>
            <p className={styles.darkEyebrow}>{t("whyEyebrow")}</p>
            <h2 id="why-heading">
              {t("whyHeading", { partner: invitation.name })}
            </h2>
            {invitation.description ? <p>{invitation.description}</p> : null}
            {location ? <p className={styles.location}>{location}</p> : null}
          </div>
          <ul className={styles.reasonGrid}>
            {selectionReasons.map((reason) => (
              <li key={reason}>
                <Check aria-hidden />
                <span>{t(`reasons.${reason}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.vision} aria-labelledby="vision-heading">
        <div className={styles.container}>
          <div className={styles.visionIcon}>
            <Compass aria-hidden />
          </div>
          <p className={styles.eyebrow}>{t("visionEyebrow")}</p>
          <h2 id="vision-heading">{t("visionHeading")}</h2>
          <p className={styles.visionStatement}>{t("visionBody")}</p>
          <div className={styles.visionRule}>
            <span>{t("qualityOverQuantity")}</span>
          </div>
        </div>
      </section>

      <section
        className={styles.sandSection}
        aria-labelledby="benefits-heading"
      >
        <div className={styles.container}>
          <p className={styles.darkEyebrow}>{t("benefitsEyebrow")}</p>
          <h2 id="benefits-heading">{t("benefitsHeading")}</h2>
          <div className={styles.benefitGrid}>
            {benefits.map((benefit, index) => (
              <article key={benefit}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{t(`benefits.${benefit}.title`)}</h3>
                <p>{t(`benefits.${benefit}.body`)}</p>
              </article>
            ))}
          </div>
          <p className={styles.disclaimer}>{t("benefitsDisclaimer")}</p>
        </div>
      </section>

      <section
        className={styles.letterSection}
        aria-labelledby="letter-heading"
      >
        <div className={styles.letterShell}>
          <div className={styles.letterHeader}>
            <Sparkles aria-hidden />
            <div>
              <p>{t("letterEyebrow")}</p>
              <h2 id="letter-heading">{invitation.outreachSubject}</h2>
            </div>
          </div>
          <div className={styles.letterBody}>{invitation.invitationBody}</div>
          <footer>
            <p>{t("letterSignature")}</p>
            <strong>Kevin De Vlieger</strong>
            <span>{t("founderTitle")}</span>
          </footer>
        </div>
      </section>

      <section
        className={styles.journeySection}
        aria-labelledby="journey-heading"
      >
        <div className={styles.container}>
          <p className={styles.eyebrow}>{t("journeyEyebrow")}</p>
          <h2 id="journey-heading">{t("journeyHeading")}</h2>
          <ol className={styles.journey}>
            {journey.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                <div>
                  <h3>{t(`journey.${step}.title`)}</h3>
                  <p>{t(`journey.${step}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="closing-heading">
        <Handshake aria-hidden />
        <p className={styles.darkEyebrow}>{t("closingEyebrow")}</p>
        <h2 id="closing-heading">
          {t("closingHeading", { partner: invitation.name })}
        </h2>
        <p>{t("closingBody")}</p>
        <div className={styles.actions}>
          <Button asChild>
            <Link href="/contact">
              {t("meetingCta")}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{t("websiteCta")}</Link>
          </Button>
          {invitation.websiteUrl ? (
            <Button asChild variant="outline">
              <a href={invitation.websiteUrl} target="_blank" rel="noreferrer">
                {t("partnerWebsiteCta")}
                <QrCode aria-hidden />
              </a>
            </Button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
