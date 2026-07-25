"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signInWithPasswordAction } from "@/server/auth/actions";
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
  };
};

export function LoginForm({ labels }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    setError(null);

    startTransition(async () => {
      const result = await signInWithPasswordAction({ email, password });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.replace(result.redirectTo);
      router.refresh();
    });
  }

  return (
    <form
      action={onSubmit}
      className="border-border mx-auto grid w-full max-w-md gap-4 rounded-[var(--radius)] border bg-white p-6 shadow-xs"
    >
      <div>
        <h1 className="text-ink text-2xl font-semibold tracking-tight">
          {labels.title}
        </h1>
        <p className="text-muted mt-2 text-sm">{labels.description}</p>
      </div>

      <div>
        <Label htmlFor="login-email">{labels.email}</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1.5 min-h-11"
          disabled={pending}
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
          disabled={pending}
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{labels.errorTitle}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={pending} className="min-h-11">
        {labels.submit}
      </Button>
    </form>
  );
}
