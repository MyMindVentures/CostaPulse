import { getLocale } from "next-intl/server";
import { resolveMapStyleUrl } from "@/lib/map/config";
import { getPublishedExperienceCards } from "@/server/repositories/catalog";
import { getPublicPartnerDirectory } from "@/server/repositories/partners";
import { PartnerDirectoryShell } from "./partner-directory-shell";

export async function PartnerDirectoryPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const locale = await getLocale();
  const [result, nearbyExperiences] = await Promise.all([
    getPublicPartnerDirectory(locale),
    getPublishedExperienceCards(3, locale)
  ]);
  const directory = result.ok
    ? result.data
    : {
        items: [],
        totals: { partners: 0, scans: 0, bookings: 0 },
        categories: [],
        areas: []
      };
  return (
    <>
      {directory.items.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": directory.items.map((item) => ({
                "@type": "LocalBusiness",
                "@id": `https://www.costapulse.club/partners?partner=${item.slug}`,
                name: item.name,
                description: item.description,
                url: item.websiteUrl,
                telephone: item.phone,
                image: item.image.url,
                address: {
                  "@type": "PostalAddress",
                  streetAddress: item.location.addressLine1,
                  postalCode: item.location.postalCode,
                  addressLocality: item.location.city,
                  addressRegion: item.location.province,
                  addressCountry: item.location.countryCode
                },
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: item.location.latitude,
                  longitude: item.location.longitude
                }
              }))
            }).replaceAll("<", "\\u003c")
          }}
        />
      ) : null}
      <PartnerDirectoryShell
        data={directory}
        nearbyExperiences={nearbyExperiences}
        initialSearchParams={searchParams}
        loadError={!result.ok}
        mapStyleUrl={resolveMapStyleUrl()}
      />
    </>
  );
}
