import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { EmptyState } from "@/components/shared/empty-state";
import { MediaLibraryClient } from "@/features/admin/media-picker";
import { fetchAdminMedia } from "@/server/repositories/admin-cms";

type SearchParams = Promise<{
  q?: string;
  type?: string;
  usage?: string;
}>;

export default async function AdminMediaPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const t = await getTranslations("Dashboards.admin");
  const media = await fetchAdminMedia({
    search: params.q ?? null,
    mediaType: params.type || null,
    usage: params.usage || null,
    pageSize: 48
  });

  return (
    <section className="flex flex-col gap-6">
      <header>
        <SectionKicker>{t("kicker")}</SectionKicker>
        <h1 className="text-ink mt-2 text-3xl font-semibold">
          {t("mediaHeading")}
        </h1>
        <p className="text-muted mt-2 max-w-2xl">{t("mediaDescription")}</p>
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
          name="usage"
          defaultValue={params.usage ?? ""}
          className="border-border bg-panel min-h-11 rounded-md border px-3"
          aria-label={t("filterUsage")}
        >
          <option value="">{t("all")}</option>
          <option value="used">{t("used")}</option>
          <option value="unused">{t("unused")}</option>
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
        initial={media}
        labels={{
          upload: t("upload"),
          delete: t("delete"),
          save: t("save"),
          search: t("search"),
          filterType: t("filterType"),
          filterUsage: t("filterUsage"),
          used: t("used"),
          unused: t("unused"),
          all: t("all")
        }}
      />
    </section>
  );
}
