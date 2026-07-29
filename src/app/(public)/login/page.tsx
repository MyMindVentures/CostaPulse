import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { LoginForm } from "@/features/auth/login-form";
import { resolveNoticeKey } from "@/features/auth/login-notices";

export const metadata = {
  title: "Log in",
  robots: { index: false, follow: false }
};

type SearchParams = Promise<{ auth?: string }>;

export default async function LoginPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const t = await getTranslations("Auth");
  const params = await searchParams;
  const noticeConfig = resolveNoticeKey(params.auth);
  const authNotice = noticeConfig
    ? {
        title: t(noticeConfig.titleKey),
        description: t(noticeConfig.descriptionKey),
        variant: noticeConfig.variant
      }
    : null;

  return (
    <main className="bg-panel min-h-dvh py-[clamp(3rem,8vw,6rem)]">
      <Container>
        <LoginForm
          labels={{
            title: t("login.title"),
            description: t("login.description"),
            email: t("login.email"),
            password: t("login.password"),
            submit: t("login.submit"),
            errorTitle: t("login.errorTitle"),
            magicLinkTitle: t("login.magicLinkTitle"),
            magicLinkDescription: t("login.magicLinkDescription"),
            magicLinkEmail: t("login.magicLinkEmail"),
            magicLinkSubmit: t("login.magicLinkSubmit"),
            magicLinkErrorTitle: t("login.magicLinkErrorTitle"),
            magicLinkSentTitle: t("login.magicLinkSentTitle")
          }}
          authNotice={authNotice}
        />
      </Container>
    </main>
  );
}
