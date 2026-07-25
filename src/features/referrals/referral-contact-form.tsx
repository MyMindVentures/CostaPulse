"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldErrors = Partial<
  Record<
    | "firstName"
    | "lastName"
    | "email"
    | "phone"
    | "marketingConsent"
    | "whatsappConsent",
    string
  >
>;

export function ReferralContactForm({
  visitToken,
  locale,
  partnerName
}: {
  visitToken: string;
  locale: string;
  partnerName: string;
}) {
  const t = useTranslations("Referral");
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function submit(formData: FormData) {
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      const response = await fetch("/api/referrals/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          visitToken,
          locale,
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          phone: formData.get("phone") || undefined,
          marketingConsent: formData.get("marketingConsent") === "on",
          whatsappConsent: formData.get("whatsappConsent") === "on"
        })
      });
      const payload = (await response.json().catch(() => null)) as {
        issues?: Array<{ path: string; message: string }>;
      } | null;
      if (!response.ok) {
        if (payload?.issues) {
          setFieldErrors(
            Object.fromEntries(
              payload.issues.map((issue) => [issue.path, issue.message])
            ) as FieldErrors
          );
          setError(t("validationError"));
        } else {
          setError(t("sendError"));
        }
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="text-center" role="status">
        <span className="bg-turquoise/10 text-turquoise mx-auto flex size-14 items-center justify-center rounded-full">
          <Mail aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-serif text-3xl">{t("checkEmailTitle")}</h2>
        <p className="text-muted mt-3">{t("checkEmailDescription")}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setSent(false)}
        >
          {t("resend")}
        </Button>
      </div>
    );
  }

  return (
    <form action={submit} className="grid gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="firstName"
          label={t("firstName")}
          autoComplete="given-name"
          error={fieldErrors.firstName}
        />
        <Field
          name="lastName"
          label={t("lastName")}
          autoComplete="family-name"
          error={fieldErrors.lastName}
        />
      </div>
      <Field
        name="email"
        type="email"
        label={t("email")}
        autoComplete="email"
        error={fieldErrors.email}
      />
      <Field
        name="phone"
        type="tel"
        label={t("phone")}
        autoComplete="tel"
        error={fieldErrors.phone}
        required={false}
      />

      <label className="flex cursor-pointer gap-3 text-sm leading-relaxed">
        <input
          type="checkbox"
          name="marketingConsent"
          className="accent-turquoise mt-1 size-5 shrink-0"
        />
        <span>{t("marketingConsent")}</span>
      </label>
      <label className="flex cursor-pointer gap-3 text-sm leading-relaxed">
        <input
          type="checkbox"
          name="whatsappConsent"
          className="accent-turquoise mt-1 size-5 shrink-0"
        />
        <span>{t("whatsappConsent")}</span>
      </label>

      {error ? (
        <p role="alert" className="text-destructive text-sm font-medium">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="min-h-12">
        {pending ? t("submitting") : t("submit")}
      </Button>
      <p className="text-muted flex items-center justify-center gap-2 text-center text-sm">
        <CheckCircle2 aria-hidden="true" size={18} />
        {partnerName}
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  type = "text",
  autoComplete,
  required = true
}: {
  name: string;
  label: string;
  error?: string;
  type?: string;
  autoComplete: string;
  required?: boolean;
}) {
  const errorId = `${name}-error`;
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error ? (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
