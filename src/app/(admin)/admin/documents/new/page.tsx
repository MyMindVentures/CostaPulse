import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Button } from "@/components/ui/button";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canAccessAdminSection } from "@/server/auth/role-access";
import { redirect } from "next/navigation";
import { createProfessionalDocumentAction } from "@/server/documents/actions";
import { fetchAdminDocumentDetail } from "@/server/repositories/admin-documents";

export const metadata = {
  title: "Upload professional document",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  status?: string;
  message?: string;
  renewFrom?: string;
}>;

export default async function AdminNewDocumentPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const { roles } = await requireAreaAccess("admin");
  if (!canAccessAdminSection(roles, "documents")) {
    redirect("/admin?auth=forbidden");
  }

  const [t, params] = await Promise.all([
    getTranslations("Dashboards.admin"),
    searchParams
  ]);

  const renewResult = params.renewFrom
    ? await fetchAdminDocumentDetail(params.renewFrom)
    : null;

  if (
    renewResult &&
    (renewResult.status === "missing_config" ||
      renewResult.status === "missing_profile")
  ) {
    redirect("/admin/documents?auth=configuration_error");
  }

  const renewDocument =
    renewResult?.status === "ok" ? renewResult.document : null;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/documents"
          className="text-muted text-sm underline underline-offset-4"
        >
          {t("documentsBackToOverview")}
        </Link>
        <SectionKicker>{t("kicker")}</SectionKicker>
        <h1 className="text-ink mt-2 text-3xl font-semibold">
          {t("documentsUpload")}
        </h1>
        {renewDocument ? (
          <p className="text-muted mt-2 text-sm">
            {t("documentsRenewingFromLabel")}: {renewDocument.title}
          </p>
        ) : null}
      </div>

      {params.status === "error" && params.message ? (
        <p className="border-coral bg-coral/10 text-ink rounded-md border px-4 py-3 text-sm">
          {params.message}
        </p>
      ) : null}

      <form
        action={createProfessionalDocumentAction}
        className="border-border grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-2"
      >
        {renewDocument ? (
          <input
            type="hidden"
            name="replacesDocumentId"
            value={renewDocument.id}
          />
        ) : null}

        <label className="flex flex-col gap-1 text-sm">
          Document type
          <select
            name="documentType"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={renewDocument?.document_type ?? "passport"}
            required
          >
            <option value="passport">passport</option>
            <option value="seamans_book">seaman&apos;s book</option>
            <option value="certificate_of_competency">
              certificate of competency
            </option>
            <option value="stcw_certificate">stcw certificate</option>
            <option value="stcw_refresher">stcw refresher</option>
            <option value="medical_certificate">medical certificate</option>
            <option value="gmdss">gmdss</option>
            <option value="license">license</option>
            <option value="visa">visa</option>
            <option value="vaccination_certificate">
              vaccination certificate
            </option>
            <option value="training_certificate">training certificate</option>
            <option value="insurance">insurance</option>
            <option value="cv">cv</option>
            <option value="assessment">assessment</option>
            <option value="other">other</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Category
          <select
            name="category"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={renewDocument?.category ?? "identity"}
            required
          >
            <option value="identity">identity</option>
            <option value="maritime_license">maritime license</option>
            <option value="stcw">stcw</option>
            <option value="medical">medical</option>
            <option value="travel">travel</option>
            <option value="training">training</option>
            <option value="employment">employment</option>
            <option value="insurance">insurance</option>
            <option value="other">other</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          Title
          <input
            name="title"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={renewDocument?.title ?? ""}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Document number
          <input
            name="documentNumber"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={renewDocument?.document_number ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Issuing authority
          <input
            name="issuingAuthority"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={renewDocument?.issuing_authority ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Issuing country code
          <input
            name="issuingCountryCode"
            className="border-border min-h-11 rounded-md border px-3"
            maxLength={2}
            defaultValue={renewDocument?.issuing_country_code ?? ""}
            placeholder="CR"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Qualification
          <input
            name="qualification"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={renewDocument?.qualification ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          STCW code
          <input
            name="stcwCode"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={renewDocument?.stcw_code ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Issued on
          <input
            type="date"
            name="issuedOn"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={renewDocument?.issued_on ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Valid from
          <input
            type="date"
            name="validFrom"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={renewDocument?.valid_from ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Expires on
          <input
            type="date"
            name="expiresOn"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={renewDocument?.expires_on ?? ""}
          />
        </label>

        <label className="flex items-center gap-2 self-end text-sm">
          <input
            type="checkbox"
            name="doesNotExpire"
            defaultChecked={renewDocument?.does_not_expire ?? false}
          />
          Does not expire
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Confidentiality
          <select
            name="confidentialityLevel"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={renewDocument?.confidentiality_level ?? "private"}
            required
          >
            <option value="private">private</option>
            <option value="restricted">restricted</option>
            <option value="administrative">administrative</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Team member certificate id
          <input
            name="teamMemberCertificateId"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={renewDocument?.team_member_certificate_id ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          Restrictions
          <textarea
            name="restrictions"
            className="border-border min-h-24 rounded-md border px-3 py-2"
            defaultValue={renewDocument?.restrictions ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          Notes
          <textarea
            name="notes"
            className="border-border min-h-24 rounded-md border px-3 py-2"
            defaultValue={renewDocument?.notes ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          File role
          <select
            name="fileRole"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue="primary"
            required
          >
            <option value="primary">primary</option>
            <option value="front">front</option>
            <option value="back">back</option>
            <option value="translation">translation</option>
            <option value="attachment">attachment</option>
            <option value="supporting_evidence">supporting evidence</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          File
          <input
            type="file"
            name="file"
            className="border-border min-h-11 rounded-md border px-3 py-2"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            required
          />
        </label>

        <div className="md:col-span-2">
          <Button type="submit" className="min-h-11">
            {t("documentsUpload")}
          </Button>
        </div>
      </form>
    </section>
  );
}
