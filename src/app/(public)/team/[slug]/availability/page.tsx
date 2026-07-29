import { AvailabilityPageFeature } from "@/features/availability/availability-page";

export const metadata = {
  title: "Team availability | CostaPulse",
  description: "Current professional and experience availability."
};

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TeamAvailabilityPage({
  params,
  searchParams
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  return (
    <AvailabilityPageFeature
      searchParams={await searchParams}
      teamMemberSlug={slug}
    />
  );
}
