import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { EmptyState } from "@/components/shared/empty-state";
import { MediaLibraryClient } from "@/features/admin/media-picker";
import { fetchAdminMedia } from "@/server/repositories/admin-cms";
import { requireAreaAccess } from "@/server/auth/protected-area";
import {
  canDeleteAdminMedia,
  canMutateAdminContent
} from "@/server/auth/role-access";

type SearchParams = Promise<{
  q?: string;
  type?: string;
  usage?: string;
  entityType?: string;
  mime?: string;
}>;

export default async function AdminMediaPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { roles } = await requireAreaAccess("admin");
  const t = await getTranslations("Dashboards.admin");
  const media = await fetchAdminMedia({
    search: params.q ?? null,
    mediaType: params.type || null,
    usage: params.usage || null,
    entityType: params.entityType || null,
    mimeType: params.mime || null,
    pageSize: 48
  });
  const mediaResultKey = JSON.stringify([
    params.q ?? "",
    params.type ?? "",
    params.usage ?? "",
    params.entityType ?? "",
    params.mime ?? ""
  ]);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionKicker>{t("kicker")}</SectionKicker>
          <h1 className="text-ink mt-2 text-3xl font-semibold">
            {t("mediaHeading")}
          </h1>
          <p className="text-muted mt-2 max-w-2xl">{t("mediaDescription")}</p>
        </div>
        <Link
          href="/admin/media/upload"
          className="button button-coral inline-flex min-h-11 items-center px-4"
        >
          {t("upload")}
        </Link>
      </header>

      <form className="flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={params.q}
          placeholder={t("search")}
          className="border-border bg-panel min-h-11 min-w-[12rem] flex-1 rounded-md border px-3"
        />
        <select
          name="type"
          defaultValue={params.type ?? ""}
          className="border-border bg-panel min-h-11 rounded-md border px-3"
          aria-label={t("filterType")}
        >
          <option value="">{t("all")}</option>
          <option value="image">image</option>
          <option value="video">video</option>
          <option value="document">document</option>
        </select>
        <select
          name="entityType"
          defaultValue={params.entityType ?? ""}
          className="border-border bg-panel min-h-11 rounded-md border px-3"
          aria-label={t("mediaFilterEntityType")}
        >
          <option value="">{t("all")}</option>
          <option value="experience">experience</option>
          <option value="experience_variant">experience variant</option>
          <option value="location">location</option>
          <option value="team_member">team member</option>
          <option value="partner">partner</option>
          <option value="site_content">site content</option>
        </select>
        <select
          name="usage"
          defaultValue={params.usage ?? ""}
          className="border-border bg-panel min-h-11 rounded-md border px-3"
          aria-label={t("filterUsage")}
        >
          <option value="">{t("all")}</option>
          <option value="used">{t("used")}</option>
          <option value="unused">{t("unused")}</option>
        </select>
        <select
          name="mime"
          defaultValue={params.mime ?? ""}
          className="border-border bg-panel min-h-11 rounded-md border px-3"
          aria-label={t("mediaFilterMime")}
        >
          <option value="">{t("all")}</option>
          <option value="image/">image/*</option>
          <option value="video/">video/*</option>
          <option value="application/pdf">application/pdf</option>
        </select>
        <button
          type="submit"
          className="button button-outline inline-flex min-h-11 items-center px-4"
        >
          {t("search")}
        </button>
      </form>

      {media.items.length === 0 ? (
        <EmptyState
          title={t("mediaEmpty")}
          description={t("mediaEmptyDescription")}
        />
      ) : null}

      <MediaLibraryClient
        key={mediaResultKey}
        initial={media}
        canDelete={canDeleteAdminMedia(roles)}
        canEdit={canMutateAdminContent(roles)}
        labels={{
          upload: t("upload"),
          delete: t("delete"),
          save: t("save"),
          search: t("search"),
          filterType: t("filterType"),
          filterUsage: t("filterUsage"),
          used: t("used"),
          unused: t("unused"),
          all: t("all"),
          detach: t("mediaDetach"),
          setPrimary: t("mediaSetPrimary"),
          replace: t("mediaReplace"),
          deleteTitle: t("mediaDeleteTitle"),
          deleteDescription: t("mediaDeleteDescription"),
          deleteInUse: t("mediaDeleteInUse"),
          deleteCancel: t("mediaDeleteCancel"),
          deleteConfirm: t("mediaDeleteConfirm"),
          deleteSuccess: t("mediaDeleteSuccess"),
          editTitle: t("mediaEditTitle"),
          edit: t("mediaEdit"),
          cancel: t("mediaEditCancel"),
          saveChanges: t("mediaSaveChanges"),
          updateSuccess: t("mediaUpdateSuccess"),
          updateError: t("mediaUpdateError"),
          discard: t("mediaDiscardChanges")
        }}
      />
    </section>
  );
}
