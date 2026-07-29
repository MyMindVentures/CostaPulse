export type LoginNoticeConfig = {
  titleKey: string;
  descriptionKey: string;
  variant: "default" | "destructive";
};

export function resolveNoticeKey(
  reason: string | undefined
): LoginNoticeConfig | null {
  switch (reason) {
    case "required":
      return {
        titleKey: "login.authNoticeRequiredTitle",
        descriptionKey: "login.authNoticeRequiredDescription",
        variant: "default"
      };
    case "forbidden":
      return {
        titleKey: "login.authNoticeForbiddenTitle",
        descriptionKey: "login.authNoticeForbiddenDescription",
        variant: "destructive"
      };
    case "invalid_magic_link":
      return {
        titleKey: "login.authNoticeInvalidMagicLinkTitle",
        descriptionKey: "login.authNoticeInvalidMagicLinkDescription",
        variant: "destructive"
      };
    case "magic_link_expired":
      return {
        titleKey: "login.authNoticeMagicLinkExpiredTitle",
        descriptionKey: "login.authNoticeMagicLinkExpiredDescription",
        variant: "destructive"
      };
    case "grant_required":
      return {
        titleKey: "login.authNoticeGrantRequiredTitle",
        descriptionKey: "login.authNoticeGrantRequiredDescription",
        variant: "destructive"
      };
    default:
      return null;
  }
}
