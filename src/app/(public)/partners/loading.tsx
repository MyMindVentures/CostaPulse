import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";

export default async function PartnersLoading() {
  const t = await getTranslations("PartnerDirectory");
  return (
    <main aria-busy="true" aria-label={t("loading")}>
      <section className="border-border bg-sand/35 border-b">
        <Container className="grid w-[min(100%-1.25rem,92rem)] gap-5 py-6 sm:w-[min(100%-2rem,92rem)] lg:grid-cols-[1fr_34rem]">
          <div className="space-y-3">
            <div className="bg-sand h-12 w-80 max-w-full animate-pulse rounded-lg" />
            <div className="bg-sand h-5 w-96 max-w-full animate-pulse rounded" />
          </div>
          <div className="bg-panel border-border h-20 animate-pulse rounded-xl border" />
        </Container>
      </section>
      <Container className="w-[min(100%-1.25rem,92rem)] py-4 sm:w-[min(100%-2rem,92rem)]">
        <div className="mb-3 flex gap-2 overflow-hidden" aria-hidden>
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="bg-sand h-11 w-32 shrink-0 animate-pulse rounded-lg"
            />
          ))}
        </div>
        <div className="border-border grid min-h-[42rem] overflow-hidden rounded-xl border xl:grid-cols-[23rem_minmax(0,1fr)_23rem]">
          <div className="bg-panel space-y-2 border-r p-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="bg-sand h-30 animate-pulse rounded-xl"
              />
            ))}
          </div>
          <div className="bg-sand animate-pulse" />
          <div className="bg-panel hidden border-l xl:block" />
        </div>
      </Container>
    </main>
  );
}
