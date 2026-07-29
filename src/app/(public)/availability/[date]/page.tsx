import { notFound } from "next/navigation";
import { AvailabilityPageFeature } from "@/features/availability/availability-page";
import { isDateKey } from "@/lib/url/availability-calendar";

export const metadata = {
  title: "Daily availability | CostaPulse",
  robots: { index: false, follow: true }
};

type Params = Promise<{ date: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AvailabilityDatePage({
  params,
  searchParams
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { date } = await params;
  if (!isDateKey(date)) notFound();

  return (
    <AvailabilityPageFeature
      searchParams={await searchParams}
      selectedDate={date}
    />
  );
}
