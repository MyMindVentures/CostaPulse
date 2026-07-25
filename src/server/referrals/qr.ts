import "server-only";
import QRCode from "qrcode";

const QR_ERROR_CORRECTION_LEVEL = "H" as const;

export function getPartnerReferralUrl(referralCode: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is required to generate partner QR codes."
    );
  }

  return new URL(`/r/${encodeURIComponent(referralCode)}`, siteUrl).toString();
}

export async function generatePartnerQrSvg(referralCode: string) {
  return QRCode.toString(getPartnerReferralUrl(referralCode), {
    type: "svg",
    errorCorrectionLevel: QR_ERROR_CORRECTION_LEVEL,
    margin: 1,
    color: {
      dark: "#061b2c",
      light: "#ffffff"
    }
  });
}
