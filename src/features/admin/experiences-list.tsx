import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { fetchAdminExperiences } from "@/server/repositories/admin-cms";
import type { Enums } from "@/types/database";

type Props = {
  search?: string;
  status?: Enums<"publication_status"> | "all";
};

export async function ExperiencesListFeature({
  search,
  status = "all"
}: Props) {
  const t = await getTranslations("Dashboards.admin");
  const items = await fetchAdminExperiences({
    search: search || null,
    status: status === "all" ? null : status
  });

  return (
    <section className="admin-main flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionKicker>{t("kicker")}</SectionKicker>
          <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight">
            {t("experiencesHeading")}
          </h1>
          <p className="text-muted mt-2 max-w-2xl">
            {t("experiencesDescription")}
          </p>
        </div>
        <Link
          href="/admin/experiences/new"
          className={cn(buttonVariants({ variant: "coral" }), "min-h-11")}
        >
          {t("createExperience")}
        </Link>
      </header>

      <form className="flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={search}
          placeholder={t("search")}
          className="border-border bg-panel text-ink min-h-11 min-w-[12rem] flex-1 rounded-md border px-3"
        />
        <select
          name="status"
          defaultValue={status}
          className="border-border bg-panel text-ink min-h-11 rounded-md border px-3"
          aria-label={t("filterStatus")}
        >
          <option value="all">{t("all")}</option>
          <option value="draft">{t("draft")}</option>
          <option value="published">{t("published")}</option>
          <option value="archived">{t("archived")}</option>
        </select>
        <button
          type="submit"
          className={cn(buttonVariants({ variant: "outline" }), "min-h-11")}
        >
          {t("search")}
        </button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title={t("experiencesEmpty")}
          description={t("experiencesEmptyDescription")}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-muted border-border border-b">
              <tr>
                <th className="px-2 py-3 font-medium">
                  {t("table.experience")}
                </th>
                <th className="px-2 py-3 font-medium">{t("table.status")}</th>
                <th className="px-2 py-3 font-medium">Variants</th>
                <th className="px-2 py-3 font-medium">Media</th>
                <th className="px-2 py-3 font-medium">Locations</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-border border-b">
                  <td className="px-2 py-3">
                    <Link
                      href={`/admin/experiences/${item.id}`}
                      className="text-ink font-medium underline-offset-4 hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="text-muted text-xs">{item.slug}</p>
                  </td>
                  <td className="px-2 py-3">
                    <Badge variant="outline">{item.status}</Badge>
                  </td>
                  <td className="px-2 py-3">{item.variants_count ?? 0}</td>
                  <td className="px-2 py-3">{item.media_count ?? 0}</td>
                  <td className="px-2 py-3">{item.locations_count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
