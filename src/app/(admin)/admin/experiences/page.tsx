import { ExperiencesListFeature } from "@/features/admin/experiences-list";
import type { Enums } from "@/types/database";

type SearchParams = Promise<{
  q?: string;
  status?: string;
}>;

export default async function AdminExperiencesPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status =
    params.status === "draft" ||
    params.status === "published" ||
    params.status === "archived"
      ? (params.status as Enums<"publication_status">)
      : "all";

  return <ExperiencesListFeature search={params.q} status={status} />;
}
