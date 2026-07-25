"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { upsertPartnerAction } from "@/server/admin/actions-cms";
import { useUnsavedChangesWarning } from "@/features/admin/use-unsaved-changes";
import { MediaPicker } from "@/features/admin/media-picker";
import type {
  AdminMediaAsset,
  AdminPartnerDetail
} from "@/server/admin/schemas";

const schema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1),
  status: z.enum(["draft", "active", "disabled"]),
  attribution_window_hours: z.coerce.number().int().positive(),
  voucher_percent: z.coerce.number().min(0).max(100),
  website_url: z.string().optional(),
  business_type: z.string().optional(),
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country_code: z.string().length(2),
  referral_code: z.string().optional(),
  owner_profile_id: z.string().uuid().optional().or(z.literal(""))
});

type FormValues = z.infer<typeof schema>;

type Props = {
  partner?: AdminPartnerDetail | null;
  mediaLibrary?: AdminMediaAsset[];
  referralUrl?: string | null;
  ownerProfiles?: Array<{
    id: string;
    display_name: string | null;
    email: string | null;
  }>;
  labels: { save: string; unsavedChanges: string; referralQr: string };
};

export function PartnerEditorForm({
  partner,
  mediaLibrary = [],
  referralUrl,
  ownerProfiles = [],
  labels
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      slug: partner?.slug ?? "",
      name: partner?.name ?? "",
      status: partner?.status ?? "draft",
      attribution_window_hours: partner?.attribution_window_hours ?? 720,
      voucher_percent: (partner?.voucher_percent_basis_points ?? 1000) / 100,
      website_url: partner?.website_url ?? "",
      business_type: partner?.business_type ?? "",
      contact_name: partner?.contact_name ?? "",
      phone: partner?.phone ?? "",
      email: partner?.email ?? "",
      address_line_1: partner?.address_line_1 ?? "",
      address_line_2: partner?.address_line_2 ?? "",
      postal_code: partner?.postal_code ?? "",
      city: partner?.city ?? "",
      province: partner?.province ?? "",
      country_code: partner?.country_code ?? "ES",
      referral_code: partner?.referral_code ?? "",
      owner_profile_id: partner?.owner_profile_id ?? ""
    }
  });
  useUnsavedChangesWarning(form.formState.isDirty);

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await upsertPartnerAction({
        id: partner?.id,
        slug: values.slug,
        name: values.name,
        status: values.status,
        attribution_window_hours: values.attribution_window_hours,
        voucher_percent_basis_points: Math.round(values.voucher_percent * 100),
        website_url: values.website_url || null,
        business_type: values.business_type || null,
        contact_name: values.contact_name || null,
        phone: values.phone || null,
        email: values.email || null,
        address_line_1: values.address_line_1 || null,
        address_line_2: values.address_line_2 || null,
        postal_code: values.postal_code || null,
        city: values.city || null,
        province: values.province || null,
        country_code: values.country_code,
        referral_code: values.referral_code || undefined,
        owner_profile_id: values.owner_profile_id || null
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(labels.save);
      form.reset(values);
      if (!partner?.id && result.id) {
        router.push(`/admin/partners/${result.id}`);
      }
      router.refresh();
    });
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      {form.formState.isDirty ? (
        <p className="bg-sand/40 rounded-md px-3 py-2 text-sm">
          {labels.unsavedChanges}
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {(
          [
            ["name", "Business name"],
            ["slug", "Slug"],
            ["business_type", "Business type"],
            ["contact_name", "Contact person"],
            ["phone", "Phone"],
            ["email", "Email"],
            ["website_url", "Website"],
            ["address_line_1", "Address line 1"],
            ["address_line_2", "Address line 2"],
            ["postal_code", "Postal code"],
            ["city", "City"],
            ["province", "Province"],
            ["country_code", "Country"],
            ["referral_code", "Referral code"]
          ] as const
        ).map(([name, label]) => (
          <label key={name} className="flex flex-col gap-1 text-sm">
            {label}
            <input
              className="border-border min-h-11 rounded-md border px-3"
              {...form.register(name)}
            />
          </label>
        ))}
        <label className="flex flex-col gap-1 text-sm">
          Partner account owner
          <select
            className="border-border min-h-11 rounded-md border px-3"
            {...form.register("owner_profile_id")}
          >
            <option value="">Unassigned</option>
            {ownerProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.display_name ?? profile.email ?? profile.id}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Status
          <select
            className="border-border min-h-11 rounded-md border px-3"
            {...form.register("status")}
          >
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="disabled">disabled</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Attribution window (hours)
          <input
            type="number"
            className="border-border min-h-11 rounded-md border px-3"
            {...form.register("attribution_window_hours")}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Voucher percent
          <input
            type="number"
            step="0.01"
            className="border-border min-h-11 rounded-md border px-3"
            {...form.register("voucher_percent")}
          />
        </label>
      </div>

      {partner?.id ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Logo / gallery</h2>
          <MediaPicker
            scopeType="partner"
            scopeKey={partner.slug}
            role="logo"
            entityId={partner.id}
            libraryItems={mediaLibrary}
            initialSelectedIds={(partner.media ?? [])
              .filter((item) => item.role === "logo")
              .map((item) => String(item.id))}
          />
          <MediaPicker
            scopeType="partner"
            scopeKey={partner.slug}
            role="gallery"
            entityId={partner.id}
            libraryItems={mediaLibrary}
            initialSelectedIds={(partner.media ?? [])
              .filter((item) => item.role === "gallery")
              .map((item) => String(item.id))}
          />
        </section>
      ) : null}

      {referralUrl ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{labels.referralQr}</h2>
          <p className="text-muted text-sm break-all">{referralUrl}</p>
          <p className="text-muted text-sm">
            QR artwork is generated locally on the owning partner account.
          </p>
        </section>
      ) : null}

      <Button type="submit" disabled={pending}>
        {labels.save}
      </Button>
    </form>
  );
}
