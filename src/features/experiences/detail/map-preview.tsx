import type { ExperienceDetailLocation } from "@/server/repositories/catalog";

type MapPreviewProps = {
  locations: ExperienceDetailLocation[];
  title: string;
};

export function MapPreview({ locations, title }: MapPreviewProps) {
  const plotted = locations.filter(
    (location) => location.latitude !== null && location.longitude !== null
  );

  if (plotted.length === 0) return null;

  const lats = plotted.map((location) => location.latitude!);
  const lngs = plotted.map((location) => location.longitude!);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = Math.max(maxLat - minLat, 0.04);
  const lngSpan = Math.max(maxLng - minLng, 0.04);

  return (
    <section className="xp-map-preview" aria-label={`${title} map preview`}>
      <div className="xp-map-canvas" aria-hidden>
        {plotted.map((location) => {
          const x = ((location.longitude! - minLng) / lngSpan) * 70 + 15;
          const y = ((maxLat - location.latitude!) / latSpan) * 70 + 15;
          return (
            <span
              key={location.id}
              className="xp-map-pin"
              style={{ left: `${x}%`, top: `${y}%` }}
              title={location.name}
            />
          );
        })}
      </div>
      <a href="#location" className="button button-navy xp-map-cta">
        View on Map
      </a>
    </section>
  );
}
