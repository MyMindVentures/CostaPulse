"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

const detailsSchema = z.object({
  contactFirstName: z.string().trim().min(1).max(80),
  contactLastName: z.string().trim().min(1).max(80),
  customerEmail: z.email(),
  customerPhone: z.string().trim().min(5).max(40).optional().or(z.literal("")),
  preferredLanguage: z.string().min(2).max(8),
  specialRequests: z.string().trim().max(1000).optional().or(z.literal(""))
});

export type DetailsFormValues = z.infer<typeof detailsSchema>;

type DetailsStepProps = {
  languages: Array<{ code: string; displayName: string }>;
  defaults: DetailsFormValues;
  onBack: () => void;
  onContinue: (values: DetailsFormValues) => void;
};

export function DetailsStep({
  languages,
  defaults,
  onBack,
  onContinue
}: DetailsStepProps) {
  const t = useTranslations("Booking");
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: defaults
  });

  return (
    <section className="bk-panel" aria-labelledby="booking-details-title">
      <header className="bk-panel-header">
        <h1 id="booking-details-title">{t("details.title")}</h1>
        <p>{t("details.subtitle")}</p>
      </header>

      <form
        className="bk-form"
        onSubmit={handleSubmit((values) => onContinue(values))}
        noValidate
      >
        <div className="bk-form-grid grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="bk-field">
            <span>{t("details.firstName")}</span>
            <input
              {...register("contactFirstName")}
              autoComplete="given-name"
            />
            {errors.contactFirstName ? (
              <em role="alert">{t("details.required")}</em>
            ) : null}
          </label>
          <label className="bk-field">
            <span>{t("details.lastName")}</span>
            <input
              {...register("contactLastName")}
              autoComplete="family-name"
            />
            {errors.contactLastName ? (
              <em role="alert">{t("details.required")}</em>
            ) : null}
          </label>
        </div>

        <label className="bk-field">
          <span>{t("details.email")}</span>
          <input
            {...register("customerEmail")}
            type="email"
            autoComplete="email"
          />
          {errors.customerEmail ? (
            <em role="alert">{t("details.emailInvalid")}</em>
          ) : null}
        </label>

        <label className="bk-field">
          <span>{t("details.phone")}</span>
          <input {...register("customerPhone")} type="tel" autoComplete="tel" />
        </label>

        <label className="bk-field">
          <span>{t("details.language")}</span>
          <select {...register("preferredLanguage")}>
            {(languages.length > 0
              ? languages
              : [
                  { code: "en", displayName: "English" },
                  { code: "es", displayName: "Spanish" },
                  { code: "nl", displayName: "Dutch" }
                ]
            ).map((language) => (
              <option key={language.code} value={language.code}>
                {language.displayName}
              </option>
            ))}
          </select>
        </label>

        <label className="bk-field">
          <span>{t("details.specialRequests")}</span>
          <textarea
            {...register("specialRequests")}
            rows={4}
            placeholder={t("details.specialRequestsPlaceholder")}
          />
        </label>

        <div className="bk-actions">
          <button
            type="button"
            className="button button-light"
            onClick={onBack}
          >
            {t("actions.back")}
          </button>
          <button type="submit" className="button button-gold">
            {t("actions.continueToExtras")}
          </button>
        </div>
      </form>
    </section>
  );
}
