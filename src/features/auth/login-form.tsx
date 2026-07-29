"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  requestPortalMagicLinkAction,
  signInWithPasswordAction
} from "@/server/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Props = {
  labels: {
    title: string;
    description: string;
    email: string;
    password: string;
    submit: string;
    errorTitle: string;
    magicLinkTitle: string;
    magicLinkDescription: string;
    magicLinkEmail: string;
    magicLinkSubmit: string;
    magicLinkErrorTitle: string;
    magicLinkSentTitle: string;
  };
  authNotice?: {
    title: string;
    description: string;
    variant: "default" | "destructive";
  } | null;
};

export function LoginForm({ labels, authNotice = null }: Props) {
  const router = useRouter();
  const [passwordPending, startPasswordTransition] = useTransition();
  const [magicLinkPending, startMagicLinkTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);
  const [magicLinkSuccess, setMagicLinkSuccess] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    setError(null);

    startPasswordTransition(async () => {
      const result = await signInWithPasswordAction({ email, password });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.replace(result.redirectTo);
      router.refresh();
    });
  }

  function onRequestMagicLink(formData: FormData) {
    const email = String(formData.get("magicLinkEmail") ?? "");
    setMagicLinkError(null);
    setMagicLinkSuccess(null);

    startMagicLinkTransition(async () => {
      const result = await requestPortalMagicLinkAction({ email });
      if (!result.ok) {
        setMagicLinkError(result.message);
        return;
      }

      setMagicLinkSuccess(result.message);
    });
  }

  return (
    <section className="mx-auto grid w-full max-w-lg gap-5">
      <div className="bg-navy relative overflow-hidden rounded-[1.4rem] border border-white/10 p-6 text-white shadow-[0_1.2rem_2.6rem_rgba(7,31,47,0.24)] sm:p-7">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          aria-hidden
          style={{
            background:
              "radial-gradient(circle at 8% 12%, rgba(24,183,189,.55), transparent 30%), radial-gradient(circle at 86% 18%, rgba(228,185,103,.45), transparent 28%)"
          }}
        />
        <div className="relative z-1">
          <h1 className="font-serif text-3xl leading-tight sm:text-4xl">
            {labels.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/84">
            {labels.description}
          </p>
        </div>
      </div>

      <div className="border-border grid gap-5 rounded-[1.2rem] border bg-white p-6 shadow-[0_1rem_2.5rem_rgba(7,31,47,0.08)] sm:p-7">
        {authNotice ? (
          <Alert variant={authNotice.variant}>
            <AlertTitle>{authNotice.title}</AlertTitle>
            <AlertDescription>{authNotice.description}</AlertDescription>
          </Alert>
        ) : null}

        <form action={onSubmit} className="grid gap-4">
          <div>
            <Label htmlFor="login-email">{labels.email}</Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1.5 min-h-11"
              disabled={passwordPending}
            />
          </div>

          <div>
            <Label htmlFor="login-password">{labels.password}</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1.5 min-h-11"
              disabled={passwordPending}
            />
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>{labels.errorTitle}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            type="submit"
            disabled={passwordPending}
            className="min-h-11 w-full sm:w-auto"
          >
            {labels.submit}
          </Button>
        </form>
      </div>

      <div className="border-border grid gap-4 rounded-[1.2rem] border bg-white p-6 shadow-[0_1rem_2.5rem_rgba(7,31,47,0.08)] sm:p-7">
        <div>
          <h2 className="text-ink text-lg font-semibold tracking-tight">
            {labels.magicLinkTitle}
          </h2>
          <p className="text-muted mt-2 text-sm">
            {labels.magicLinkDescription}
          </p>
        </div>

        <form action={onRequestMagicLink} className="grid gap-4">
          <div>
            <Label htmlFor="magic-link-email">{labels.magicLinkEmail}</Label>
            <Input
              id="magic-link-email"
              name="magicLinkEmail"
              type="email"
              autoComplete="email"
              required
              className="mt-1.5 min-h-11"
              disabled={magicLinkPending}
            />
          </div>

          {magicLinkError ? (
            <Alert variant="destructive">
              <AlertTitle>{labels.magicLinkErrorTitle}</AlertTitle>
              <AlertDescription>{magicLinkError}</AlertDescription>
            </Alert>
          ) : null}

          {magicLinkSuccess ? (
            <Alert>
              <AlertTitle>{labels.magicLinkSentTitle}</AlertTitle>
              <AlertDescription>{magicLinkSuccess}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            type="submit"
            disabled={magicLinkPending}
            className="min-h-11 w-full sm:w-auto"
          >
            {labels.magicLinkSubmit}
          </Button>
        </form>
      </div>
    </section>
  );
}
