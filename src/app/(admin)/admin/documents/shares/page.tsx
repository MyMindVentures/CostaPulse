import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Button } from "@/components/ui/button";
import {
  createCredentialGrantAndSendMagicLinkAction,
  createCredentialShareLinkAction,
  resendCredentialMagicLinkAction,
  revokeCredentialGrantAction,
  type CreateCredentialGrantAndInviteResult,
  type CreateCredentialShareLinkResult,
  type RevokeCredentialGrantResult,
  type ResendCredentialMagicLinkResult
} from "@/server/credentials/actions";
import { requireAreaAccess } from "@/server/auth/protected-area";
import { canAccessAdminSection } from "@/server/auth/role-access";
import {
  listOwnerCredentialAccessGrants,
  listShareableCredentialDocuments
} from "@/server/repositories/credential-portal";

export const metadata = {
  title: "Admin document shares",
  robots: { index: false, follow: false }
};

type SearchParams = Promise<{
  status?: string;
  message?: string;
  shareUrl?: string;
}>;

const FILE_ROLE_VALUES = [
  "primary",
  "front",
  "back",
  "translation",
  "attachment",
  "supporting_evidence"
] as const;

type FileRole = (typeof FILE_ROLE_VALUES)[number];

function humanDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

export default async function AdminDocumentSharesPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const { roles } = await requireAreaAccess("admin");
  if (!canAccessAdminSection(roles, "documentsShares")) {
    redirect("/admin?auth=forbidden");
  }

  const [t, params, documents, grants] = await Promise.all([
    getTranslations("Dashboards.admin"),
    searchParams,
    listShareableCredentialDocuments(),
    listOwnerCredentialAccessGrants()
  ]);

  async function createShareAction(formData: FormData) {
    "use server";

    const recipientEmail = String(formData.get("recipientEmail") ?? "").trim();
    const recipientAgencyLabel = String(
      formData.get("recipientAgencyLabel") ?? ""
    ).trim();
    const documentIds = formData
      .getAll("documentIds")
      .map((item) => String(item))
      .filter(Boolean);
    const selectedFileRolesRaw = formData
      .getAll("selectedFileRoles")
      .map((item) => String(item))
      .filter(Boolean);
    const selectedFileRoles = selectedFileRolesRaw.filter(
      (value): value is FileRole =>
        (FILE_ROLE_VALUES as readonly string[]).includes(value)
    );
    const accessExpiresAtRaw = String(
      formData.get("accessExpiresAt") ?? ""
    ).trim();
    const message = String(formData.get("message") ?? "").trim();

    const payload = {
      recipientEmail,
      recipientAgencyLabel: recipientAgencyLabel || null,
      documentIds,
      selectedFileRoles:
        selectedFileRoles.length > 0
          ? selectedFileRoles
          : (["primary"] as FileRole[]),
      accessExpiresAt: accessExpiresAtRaw
        ? new Date(accessExpiresAtRaw).toISOString()
        : null,
      permissionViewFiles: formData.get("permissionViewFiles") === "on",
      permissionDownloadFiles: formData.get("permissionDownloadFiles") === "on",
      permissionIncludeHistory:
        formData.get("permissionIncludeHistory") === "on",
      permissionIncludeDocumentNumber:
        formData.get("permissionIncludeDocumentNumber") === "on",
      message: message || null
    };

    const result: CreateCredentialGrantAndInviteResult =
      await createCredentialGrantAndSendMagicLinkAction(payload);

    if (!result.ok) {
      redirect(
        `/admin/documents/shares?status=error&message=${encodeURIComponent(result.message)}`
      );
    }

    redirect("/admin/documents/shares?status=success");
  }

  async function createShareLinkForGrantAction(formData: FormData) {
    "use server";

    const grantId = String(formData.get("grantId") ?? "").trim();
    const expiresAtRaw = String(formData.get("shareExpiresAt") ?? "").trim();
    const maxViewsRaw = String(formData.get("maxViews") ?? "").trim();
    const maxDownloadsRaw = String(formData.get("maxDownloads") ?? "").trim();

    const result: CreateCredentialShareLinkResult =
      await createCredentialShareLinkAction({
        grantId,
        expiresAt: expiresAtRaw
          ? new Date(expiresAtRaw).toISOString()
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        recipientEmail:
          String(formData.get("shareRecipientEmail") ?? "").trim() || null,
        recipientAgencyLabel:
          String(formData.get("shareRecipientAgency") ?? "").trim() || null,
        maxViews: maxViewsRaw ? Number(maxViewsRaw) : null,
        maxDownloads: maxDownloadsRaw ? Number(maxDownloadsRaw) : null
      });

    if (!result.ok) {
      redirect(
        `/admin/documents/shares?status=error&message=${encodeURIComponent(result.message)}`
      );
    }

    redirect(
      `/admin/documents/shares?status=share_created&shareUrl=${encodeURIComponent(result.shareUrl)}`
    );
  }

  async function revokeGrantAction(formData: FormData) {
    "use server";

    const grantId = String(formData.get("grantId") ?? "").trim();
    const reason = String(formData.get("revokeReason") ?? "").trim();

    const result: RevokeCredentialGrantResult =
      await revokeCredentialGrantAction({
        grantId,
        reason: reason || null
      });

    if (!result.ok) {
      redirect(
        `/admin/documents/shares?status=error&message=${encodeURIComponent(result.message)}`
      );
    }

    redirect("/admin/documents/shares?status=revoked");
  }

  async function resendMagicLinkAction(formData: FormData) {
    "use server";

    const grantId = String(formData.get("grantId") ?? "").trim();
    const recipientEmail = String(formData.get("recipientEmail") ?? "").trim();

    const result: ResendCredentialMagicLinkResult =
      await resendCredentialMagicLinkAction({ grantId, recipientEmail });

    if (!result.ok) {
      redirect(
        `/admin/documents/shares?status=error&message=${encodeURIComponent(result.message)}`
      );
    }

    redirect("/admin/documents/shares?status=resent");
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <SectionKicker>{t("kicker")}</SectionKicker>
        <h1 className="text-ink text-3xl font-semibold tracking-tight">
          {t("documentsSharesHeading")}
        </h1>
        <p className="text-muted max-w-3xl">
          {t("documentsSharesDescription")}
        </p>
      </header>

      {params.status === "success" ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {t("documentsSharesInviteSent")}
        </p>
      ) : null}
      {params.status === "share_created" && params.shareUrl ? (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p>{t("documentsSharesShareCreated")}</p>
          <p className="mt-2 font-medium break-all">{params.shareUrl}</p>
        </div>
      ) : null}
      {params.status === "revoked" ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t("documentsSharesGrantRevoked")}
        </p>
      ) : null}
      {params.status === "resent" ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {t("documentsSharesInviteResent")}
        </p>
      ) : null}
      {params.status === "error" && params.message ? (
        <p className="border-coral bg-coral/10 text-ink rounded-md border px-4 py-3 text-sm">
          {params.message}
        </p>
      ) : null}

      <form
        action={createShareAction}
        className="border-border rounded-3xl border bg-white p-6 shadow-sm"
      >
        <h2 className="text-ink text-xl font-semibold">
          {t("documentsSharesCreateTitle")}
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            {t("documentsSharesRecipientEmail")}
            <input
              required
              type="email"
              name="recipientEmail"
              className="border-border min-h-11 rounded-md border px-3"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t("documentsSharesAgencyLabel")}
            <input
              name="recipientAgencyLabel"
              className="border-border min-h-11 rounded-md border px-3"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t("documentsSharesExpiry")}
            <input
              type="datetime-local"
              name="accessExpiresAt"
              className="border-border min-h-11 rounded-md border px-3"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            {t("documentsSharesMessage")}
            <textarea
              name="message"
              rows={3}
              className="border-border rounded-md border px-3 py-2"
            />
          </label>
        </div>

        <fieldset className="mt-6">
          <legend className="text-ink text-sm font-semibold">
            {t("documentsSharesPermissions")}
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="permissionViewFiles" />
              {t("documentsSharesPermissionViewFiles")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="permissionDownloadFiles" />
              {t("documentsSharesPermissionDownloadFiles")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="permissionIncludeHistory" />
              {t("documentsSharesPermissionHistory")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="permissionIncludeDocumentNumber" />
              {t("documentsSharesPermissionDocumentNumber")}
            </label>
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-ink text-sm font-semibold">
            {t("documentsSharesFileRoles")}
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {FILE_ROLE_VALUES.map((role) => (
              <label key={role} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="selectedFileRoles"
                  value={role}
                  defaultChecked={role === "primary"}
                />
                {role.replaceAll("_", " ")}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-ink text-sm font-semibold">
            {t("documentsSharesDocuments")}
          </legend>
          {documents.length === 0 ? (
            <p className="text-muted mt-2 text-sm">
              {t("documentsSharesDocumentsEmpty")}
            </p>
          ) : (
            <div className="mt-3 grid gap-2">
              {documents.map((document) => (
                <label
                  key={document.id}
                  className="border-border flex items-start gap-3 rounded-xl border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="documentIds"
                    value={document.id}
                  />
                  <span className="flex flex-col">
                    <strong className="text-ink font-medium">
                      {document.title}
                    </strong>
                    <span className="text-muted text-xs">
                      {document.document_type.replaceAll("_", " ")} ·{" "}
                      {document.verification_status.replaceAll("_", " ")} ·{" "}
                      {document.status.replaceAll("_", " ")}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <div className="mt-6">
          <Button type="submit" className="min-h-11">
            {t("documentsSharesSendMagicLink")}
          </Button>
        </div>
      </form>

      <section className="border-border rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-ink text-xl font-semibold">
          {t("documentsSharesExistingTitle")}
        </h2>
        {grants.length === 0 ? (
          <p className="text-muted mt-2 text-sm">
            {t("documentsSharesExistingEmpty")}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="border-border text-muted border-b">
                <tr>
                  <th className="px-2 py-2">
                    {t("documentsSharesTableRecipient")}
                  </th>
                  <th className="px-2 py-2">
                    {t("documentsSharesTableAgency")}
                  </th>
                  <th className="px-2 py-2">
                    {t("documentsSharesTableExpires")}
                  </th>
                  <th className="px-2 py-2">
                    {t("documentsSharesTableStatus")}
                  </th>
                  <th className="px-2 py-2">{t("documentsSharesTableSent")}</th>
                  <th className="px-2 py-2">
                    {t("documentsSharesTableActions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {grants.map((grant) => (
                  <tr key={grant.id} className="border-border border-b">
                    <td className="px-2 py-3">{grant.recipient_email}</td>
                    <td className="px-2 py-3">
                      {grant.recipient_agency_label ?? "-"}
                    </td>
                    <td className="px-2 py-3">
                      {humanDate(grant.access_expires_at)}
                    </td>
                    <td className="px-2 py-3">
                      {grant.revoked_at
                        ? t("documentsSharesStatusRevoked")
                        : t("documentsSharesStatusActive")}
                    </td>
                    <td className="px-2 py-3">
                      {humanDate(grant.last_magic_link_sent_at)}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex flex-col gap-2">
                        {!grant.revoked_at ? (
                          <form
                            action={createShareLinkForGrantAction}
                            className="grid gap-2"
                          >
                            <input
                              type="hidden"
                              name="grantId"
                              value={grant.id}
                            />
                            <input
                              type="datetime-local"
                              name="shareExpiresAt"
                              className="border-border min-h-10 rounded-md border px-2 text-xs"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                min={1}
                                name="maxViews"
                                placeholder={t("documentsSharesShareMaxViews")}
                                className="border-border min-h-10 rounded-md border px-2 text-xs"
                              />
                              <input
                                type="number"
                                min={1}
                                name="maxDownloads"
                                placeholder={t(
                                  "documentsSharesShareMaxDownloads"
                                )}
                                className="border-border min-h-10 rounded-md border px-2 text-xs"
                              />
                            </div>
                            <Button
                              type="submit"
                              variant="outline"
                              className="min-h-10 text-xs"
                            >
                              {t("documentsSharesCreateShareLink")}
                            </Button>
                          </form>
                        ) : null}

                        {!grant.revoked_at ? (
                          <form
                            action={resendMagicLinkAction}
                            className="grid gap-2"
                          >
                            <input
                              type="hidden"
                              name="grantId"
                              value={grant.id}
                            />
                            <input
                              type="hidden"
                              name="recipientEmail"
                              value={grant.recipient_email}
                            />
                            <Button
                              type="submit"
                              variant="light"
                              className="min-h-10 text-xs"
                            >
                              {t("documentsSharesResendInvite")}
                            </Button>
                          </form>
                        ) : null}

                        {!grant.revoked_at ? (
                          <form
                            action={revokeGrantAction}
                            className="grid gap-2"
                          >
                            <input
                              type="hidden"
                              name="grantId"
                              value={grant.id}
                            />
                            <input
                              type="text"
                              name="revokeReason"
                              placeholder={t("documentsSharesRevokeReason")}
                              className="border-border min-h-10 rounded-md border px-2 text-xs"
                            />
                            <Button
                              type="submit"
                              variant="light"
                              className="min-h-10 text-xs"
                            >
                              {t("documentsSharesRevokeGrant")}
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-muted mt-4 text-xs">
          <Link href="/admin" className="underline underline-offset-2">
            {t("documentsSharesBackToAdmin")}
          </Link>
        </p>
      </section>
    </section>
  );
}
