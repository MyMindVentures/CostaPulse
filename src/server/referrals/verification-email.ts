import "server-only";
import { sendTransactionalEmail } from "@/lib/resend";
import type { AppLocale } from "@/i18n/locales";

const copy: Record<
  AppLocale,
  {
    subject: string;
    heading: string;
    body: string;
    action: string;
    expiry: string;
  }
> = {
  en: {
    subject: "Verify your CostaPulse partner reward",
    heading: "Verify your email",
    body: "Confirm your email address to connect this partner visit to your CostaPulse booking.",
    action: "Verify email",
    expiry: "This single-use link expires in 15 minutes."
  },
  nl: {
    subject: "Verifieer je CostaPulse partnerbeloning",
    heading: "Verifieer je e-mail",
    body: "Bevestig je e-mailadres om dit partnerbezoek aan je CostaPulse-boeking te koppelen.",
    action: "E-mail verifiëren",
    expiry: "Deze eenmalige link verloopt over 15 minuten."
  },
  fr: {
    subject: "Vérifiez votre récompense partenaire CostaPulse",
    heading: "Vérifiez votre e-mail",
    body: "Confirmez votre adresse e-mail pour associer cette visite partenaire à votre réservation CostaPulse.",
    action: "Vérifier l’e-mail",
    expiry: "Ce lien à usage unique expire dans 15 minutes."
  },
  es: {
    subject: "Verifica tu recompensa de colaborador CostaPulse",
    heading: "Verifica tu correo",
    body: "Confirma tu correo para vincular esta visita del colaborador con tu reserva CostaPulse.",
    action: "Verificar correo",
    expiry: "Este enlace de un solo uso caduca en 15 minutos."
  },
  de: {
    subject: "Bestätige deine CostaPulse Partner-Belohnung",
    heading: "Bestätige deine E-Mail",
    body: "Bestätige deine E-Mail-Adresse, um diesen Partnerbesuch mit deiner CostaPulse-Buchung zu verknüpfen.",
    action: "E-Mail bestätigen",
    expiry: "Dieser einmalig nutzbare Link läuft in 15 Minuten ab."
  }
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderReferralVerificationEmail(input: {
  locale: AppLocale;
  firstName: string;
  partnerName: string;
  verificationUrl: string;
}) {
  const c = copy[input.locale];
  return {
    subject: c.subject,
    html: `
      <div style="background:#f8f4ec;padding:32px;font-family:Arial,sans-serif;color:#061b2c">
        <div style="margin:0 auto;max-width:560px;border-radius:20px;background:#fff;padding:32px">
          <p style="color:#16899a;font-weight:700;text-transform:uppercase">CostaPulse</p>
          <h1 style="font-family:Georgia,serif">${escapeHtml(c.heading)}</h1>
          <p>${escapeHtml(input.firstName)}, ${escapeHtml(c.body)}</p>
          <p><strong>${escapeHtml(input.partnerName)}</strong></p>
          <p style="margin:28px 0">
            <a href="${escapeHtml(input.verificationUrl)}" style="display:inline-block;border-radius:999px;background:#e06c3b;color:#fff;padding:14px 24px;text-decoration:none;font-weight:700">${escapeHtml(c.action)}</a>
          </p>
          <p style="font-size:14px;color:#5e6972">${escapeHtml(c.expiry)}</p>
        </div>
      </div>
    `
  };
}

export async function sendReferralVerificationEmail(input: {
  to: string;
  locale: AppLocale;
  firstName: string;
  partnerName: string;
  verificationUrl: string;
}) {
  const rendered = renderReferralVerificationEmail(input);
  return sendTransactionalEmail({
    to: input.to,
    subject: rendered.subject,
    html: rendered.html
  });
}
