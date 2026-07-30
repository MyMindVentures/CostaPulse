import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Button } from "@/components/ui/button";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canAccessAdminSection } from "@/server/auth/role-access";
import {
  replaceProfessionalDocumentFileAction,
  updateProfessionalDocumentAction
} from "@/server/documents/actions";
import { fetchAdminDocumentDetail } from "@/server/repositories/admin-documents";

export const metadata = {
  title: "Edit document",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ documentId: string }>;
  searchParams: Promise<{ status?: string; message?: string }>;
};

export default async function AdminDocumentEditPage({
  params,
  searchParams
}: Props) {
  const { roles } = await requireAreaAccess("admin");
  if (!canAccessAdminSection(roles, "documents")) {
    redirect("/admin?auth=forbidden");
  }

  const t = await getTranslations("Dashboards.admin");
  const [{ documentId }, query] = await Promise.all([params, searchParams]);
  const result = await fetchAdminDocumentDetail(documentId);

  if (result.status === "unauthenticated") {
    redirect("/login?auth=required");
  }

  if (result.status === "not_found") {
    redirect("/admin/documents?status=error&message=Document%20not%20found");
  }

  if (
    result.status === "missing_config" ||
    result.status === "missing_profile"
  ) {
    redirect("/admin/documents?auth=configuration_error");
  }

  if (result.status !== "ok") {
    return null;
  }

  const document = result.document;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link
          href={`/admin/documents/${documentId}`}
          className="text-muted text-sm underline underline-offset-4"
        >
          {t("documentsActionView")}
        </Link>
        <SectionKicker>{t("kicker")}</SectionKicker>
        <h1 className="text-ink mt-2 text-3xl font-semibold">
          {t("documentsActionEdit")}
        </h1>
        <div className="mt-3">
          <Link
            href={`/admin/documents/new?renewFrom=${document.id}`}
            className="text-sm font-medium underline underline-offset-4"
          >
            {t("documentsActionRenew")}
          </Link>
        </div>
      </div>

      {query.status === "updated" ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {t("documentsSaved")}
        </p>
      ) : null}

      {query.status === "file_replaced" ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {t("documentsFileReplaced")}
        </p>
      ) : null}

      {query.status === "error" && query.message ? (
        <p className="border-coral bg-coral/10 text-ink rounded-md border px-4 py-3 text-sm">
          {query.message}
        </p>
      ) : null}

      <form
        action={updateProfessionalDocumentAction}
        className="border-border grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-2"
      >
        <input type="hidden" name="documentId" value={document.id} />

        <label className="flex flex-col gap-1 text-sm">
          {t("documentsTableType")}
          <select
            name="documentType"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={document.document_type}
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
            <option value="motivation_letter">motivation letter</option>
            <option value="assessment">assessment</option>
            <option value="other">other</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("documentsLanguageCode")}
          <input
            name="languageCode"
            className="border-border min-h-11 rounded-md border px-3"
            placeholder="en"
            defaultValue={document.language_code ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("documentsPageCount")}
          <input
            name="pageCount"
            type="number"
            min={1}
            step={1}
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={document.page_count ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Category
          <select
            name="category"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={document.category}
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
          {t("documentsTableDocument")}
          <input
            name="title"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={document.title}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Document number
          <input
            name="documentNumber"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={document.document_number ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("documentsTableIssuer")}
          <input
            name="issuingAuthority"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={document.issuing_authority ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Issuing country code
          <input
            name="issuingCountryCode"
            className="border-border min-h-11 rounded-md border px-3"
            maxLength={2}
            defaultValue={document.issuing_country_code ?? ""}
            placeholder="CR"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Qualification
          <input
            name="qualification"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={document.qualification ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          STCW code
          <input
            name="stcwCode"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={document.stcw_code ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Issued on
          <input
            type="date"
            name="issuedOn"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={document.issued_on ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Valid from
          <input
            type="date"
            name="validFrom"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={document.valid_from ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {t("documentsTableExpiry")}
          <input
            type="date"
            name="expiresOn"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={document.expires_on ?? ""}
          />
        </label>

        <label className="flex items-center gap-2 self-end text-sm">
          <input
            type="checkbox"
            name="doesNotExpire"
            defaultChecked={document.does_not_expire}
          />
          {t("documentsDoesNotExpire")}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Confidentiality
          <select
            name="confidentialityLevel"
            className="border-border min-h-11 rounded-md border px-3"
            defaultValue={document.confidentiality_level}
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
            defaultValue={document.team_member_certificate_id ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          Restrictions
          <textarea
            name="restrictions"
            className="border-border min-h-24 rounded-md border px-3 py-2"
            defaultValue={document.restrictions ?? ""}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          Notes
          <textarea
            name="notes"
            className="border-border min-h-24 rounded-md border px-3 py-2"
            defaultValue={document.notes ?? ""}
          />
        </label>

        <div className="md:col-span-2">
          <Button type="submit" className="min-h-11">
            {t("documentsSaveChanges")}
          </Button>
        </div>
      </form>

      <form
        action={replaceProfessionalDocumentFileAction}
        className="border-border grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-2"
      >
        <input type="hidden" name="documentId" value={document.id} />
        <h2 className="text-ink text-xl font-semibold md:col-span-2">
          {t("documentsReplaceFile")}
        </h2>

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

        <label className="flex flex-col gap-1 text-sm">
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
          <Button type="submit" variant="outline" className="min-h-11">
            {t("documentsReplaceFileAction")}
          </Button>
        </div>
      </form>
    </section>
  );
}
