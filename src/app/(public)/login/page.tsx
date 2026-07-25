import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { LoginForm } from "@/features/auth/login-form";

export const metadata = {
  title: "Log in",
  robots: { index: false, follow: false }
};

export default async function LoginPage() {
  const t = await getTranslations("Auth");

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
            errorTitle: t("login.errorTitle")
          }}
        />
      </Container>
    </main>
  );
}
