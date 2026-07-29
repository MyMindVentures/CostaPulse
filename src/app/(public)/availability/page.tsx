import { AvailabilityPageFeature } from "@/features/availability/availability-page";

export const metadata = {
  title: "Availability | CostaPulse",
  description: "Current CostaPulse professional and experience availability."
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AvailabilityPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  return <AvailabilityPageFeature searchParams={await searchParams} />;
}
