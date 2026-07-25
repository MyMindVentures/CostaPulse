"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { LocateFixed, ScanSearch } from "lucide-react";
import {
  MAP_CLUSTER_MAX_ZOOM,
  MAP_FALLBACK_CENTER,
  MAP_FIT_PADDING_PX,
  MAP_SINGLE_MARKER_MIN_ZOOM,
  resolveMapStyleUrl
} from "@/lib/map/config";
import type { PartnerDirectoryItem } from "@/lib/view-models/partner-directory";

type MapLibreModule = typeof import("maplibre-gl");
const SOURCE = "partner-points";
const CLUSTERS = "partner-clusters";
const COUNTS = "partner-cluster-count";
const POINTS = "partner-points-layer";
const SELECTED = "partner-selected";

const reducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function PartnerMapCanvas({
  items,
  selectedSlug,
  onSelect,
  styleUrl
}: {
  items: PartnerDirectoryItem[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  styleUrl: string;
}) {
  const t = useTranslations("PartnerDirectory");
  const nodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<InstanceType<MapLibreModule["Map"]> | null>(null);
  const libRef = useRef<MapLibreModule | null>(null);
  const itemsRef = useRef(items);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    itemsRef.current = items;
    onSelectRef.current = onSelect;
  }, [items, onSelect]);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let resizeFrame: number | null = null;
    let resize: (() => void) | null = null;
    let loadTimeout: number | null = null;

    async function initialize() {
      if (!nodeRef.current) return;
      try {
        const imported = await import("maplibre-gl");
        const defaultExport = (imported as { default?: unknown }).default;
        const nestedDefault =
          defaultExport && typeof defaultExport === "object"
            ? (defaultExport as { default?: unknown }).default
            : undefined;
        const maplibre = [imported, defaultExport, nestedDefault].find(
          (candidate) =>
            candidate !== null &&
            typeof candidate === "object" &&
            typeof (candidate as { Map?: unknown }).Map === "function"
        ) as MapLibreModule | undefined;
        if (!maplibre) throw new Error("MapLibre module is unavailable");
        if (cancelled || !nodeRef.current) return;
        libRef.current = maplibre;
        const map = new maplibre.Map({
          container: nodeRef.current,
          style: resolveMapStyleUrl(styleUrl),
          center: [MAP_FALLBACK_CENTER.longitude, MAP_FALLBACK_CENTER.latitude],
          zoom: MAP_FALLBACK_CENTER.zoom
        });
        mapRef.current = map;
        map.addControl(new maplibre.NavigationControl(), "top-right");

        resize = () => {
          if (!nodeRef.current) return;
          const { width, height } = nodeRef.current.getBoundingClientRect();
          if (width > 0 && height > 0) map.resize();
        };
        resizeObserver = new ResizeObserver(() => {
          if (resizeFrame != null) window.cancelAnimationFrame(resizeFrame);
          resizeFrame = window.requestAnimationFrame(() => resize?.());
        });
        resizeObserver.observe(nodeRef.current);
        window.addEventListener("resize", resize);
        resizeFrame = window.requestAnimationFrame(resize);
        loadTimeout = window.setTimeout(() => {
          if (!cancelled && !map.isStyleLoaded()) setFailed(true);
        }, 10_000);

        map.on("load", () => {
          if (cancelled) return;
          if (loadTimeout != null) {
            window.clearTimeout(loadTimeout);
            loadTimeout = null;
          }
          map.addSource(SOURCE, {
            type: "geojson",
            data: toGeoJson(itemsRef.current),
            cluster: true,
            clusterMaxZoom: MAP_CLUSTER_MAX_ZOOM,
            clusterRadius: 46,
            promoteId: "slug"
          });
          map.addLayer({
            id: CLUSTERS,
            type: "circle",
            source: SOURCE,
            filter: ["has", "point_count"],
            paint: {
              "circle-color": "#0f6f78",
              "circle-radius": ["step", ["get", "point_count"], 18, 5, 23],
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 2
            }
          });
          map.addLayer({
            id: COUNTS,
            type: "symbol",
            source: SOURCE,
            filter: ["has", "point_count"],
            layout: {
              "text-field": "{point_count_abbreviated}",
              "text-size": 12
            },
            paint: { "text-color": "#ffffff" }
          });
          map.addLayer({
            id: POINTS,
            type: "circle",
            source: SOURCE,
            filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-color": [
                "case",
                ["boolean", ["get", "featured"], false],
                "#c99a3d",
                "#061b2c"
              ],
              "circle-radius": 10,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 3
            }
          });
          map.addLayer({
            id: SELECTED,
            type: "circle",
            source: SOURCE,
            filter: [
              "all",
              ["!", ["has", "point_count"]],
              ["==", ["get", "slug"], ""]
            ],
            paint: {
              "circle-color": "#0f6f78",
              "circle-radius": 15,
              "circle-stroke-color": "#f0c778",
              "circle-stroke-width": 4
            }
          });
          map.on("click", POINTS, (event) => {
            const slug = event.features?.[0]?.properties?.slug as
              | string
              | undefined;
            if (slug) onSelectRef.current(slug);
          });
          map.on("click", CLUSTERS, (event) => {
            const feature = event.features?.[0];
            if (!feature || feature.geometry.type !== "Point") return;
            const coordinates = feature.geometry.coordinates as [
              number,
              number
            ];
            const source = map.getSource(
              SOURCE
            ) as import("maplibre-gl").GeoJSONSource;
            void source
              .getClusterExpansionZoom(Number(feature.properties?.cluster_id))
              .then((zoom) =>
                map.easeTo({
                  center: coordinates,
                  zoom,
                  duration: reducedMotion() ? 0 : 350
                })
              );
          });
          for (const layer of [POINTS, CLUSTERS]) {
            map.on(
              "mouseenter",
              layer,
              () => (map.getCanvas().style.cursor = "pointer")
            );
            map.on(
              "mouseleave",
              layer,
              () => (map.getCanvas().style.cursor = "")
            );
          }
          setFailed(false);
          setReady(true);
          resize?.();
          fit(map, maplibre, itemsRef.current);
        });
      } catch (error) {
        console.error("[PartnerMapCanvas]", error);
        setFailed(true);
      }
    }
    void initialize();
    return () => {
      cancelled = true;
      if (loadTimeout != null) window.clearTimeout(loadTimeout);
      if (resizeFrame != null) window.cancelAnimationFrame(resizeFrame);
      resizeObserver?.disconnect();
      if (resize) window.removeEventListener("resize", resize);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [styleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!map || !lib || !ready) return;
    (map.getSource(SOURCE) as import("maplibre-gl").GeoJSONSource).setData(
      toGeoJson(items)
    );
    fit(map, lib, items);
  }, [items, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setFilter(SELECTED, [
      "all",
      ["!", ["has", "point_count"]],
      ["==", ["get", "slug"], selectedSlug ?? ""]
    ]);
    const selected = items.find((item) => item.slug === selectedSlug);
    if (selected) {
      map.easeTo({
        center: [selected.location.longitude, selected.location.latitude],
        zoom: Math.max(
          map.getZoom(),
          Math.min(selected.location.zoom, MAP_CLUSTER_MAX_ZOOM + 1)
        ),
        duration: reducedMotion() ? 0 : 400
      });
    }
  }, [items, ready, selectedSlug]);

  return (
    <div className="relative h-full min-h-0 w-full">
      <div
        ref={nodeRef}
        className="absolute inset-0"
        role="region"
        aria-label={t("mapLabel")}
      />
      {!failed ? (
        <>
          <button
            type="button"
            className="border-border bg-panel text-navy absolute top-3 left-3 z-10 flex min-h-11 items-center gap-2 rounded-lg border px-3 text-xs font-semibold shadow-sm"
            onClick={() => {
              const map = mapRef.current;
              const lib = libRef.current;
              if (map && lib) fit(map, lib, itemsRef.current);
            }}
          >
            <ScanSearch className="size-4" aria-hidden />
            {t("fitPartners")}
          </button>
          <button
            type="button"
            className="border-border bg-panel text-navy absolute right-3 bottom-8 z-10 grid size-11 place-items-center rounded-lg border shadow-sm"
            aria-label={t("fitPartners")}
            onClick={() => {
              const map = mapRef.current;
              const lib = libRef.current;
              if (map && lib) fit(map, lib, itemsRef.current);
            }}
          >
            <LocateFixed className="size-4" aria-hidden />
          </button>
        </>
      ) : null}
      {failed ? (
        <div
          className="bg-sand/95 absolute inset-0 flex items-center justify-center p-8 text-center"
          role="status"
        >
          <p className="text-muted">{t("mapUnavailable")}</p>
        </div>
      ) : null}
    </div>
  );
}

function toGeoJson(items: PartnerDirectoryItem[]) {
  return {
    type: "FeatureCollection" as const,
    features: items.map((item) => ({
      type: "Feature" as const,
      id: item.slug,
      properties: { slug: item.slug, featured: item.isFeatured },
      geometry: {
        type: "Point" as const,
        coordinates: [item.location.longitude, item.location.latitude]
      }
    }))
  };
}

function fit(
  map: InstanceType<MapLibreModule["Map"]>,
  lib: MapLibreModule,
  items: PartnerDirectoryItem[]
) {
  if (!items.length) return;
  if (items.length === 1) {
    map.easeTo({
      center: [items[0]!.location.longitude, items[0]!.location.latitude],
      zoom: MAP_SINGLE_MARKER_MIN_ZOOM,
      duration: reducedMotion() ? 0 : 300
    });
    return;
  }
  const bounds = new lib.LngLatBounds();
  items.forEach((item) =>
    bounds.extend([item.location.longitude, item.location.latitude])
  );
  map.fitBounds(bounds, {
    padding: MAP_FIT_PADDING_PX,
    maxZoom: 13,
    duration: reducedMotion() ? 0 : 350
  });
}
