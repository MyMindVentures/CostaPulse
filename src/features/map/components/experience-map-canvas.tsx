"use client";

import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useTranslations } from "next-intl";
import type { ExperienceMapItem } from "@/lib/view-models/experience-map";
import {
  MAP_CLUSTER_MAX_ZOOM,
  MAP_FALLBACK_CENTER,
  MAP_FIT_PADDING_PX,
  MAP_SINGLE_MARKER_MIN_ZOOM,
  resolveMapStyleUrl
} from "@/lib/map/config";
import { ExperienceMapPopupContent } from "./experience-map-popup";

type ExperienceMapCanvasProps = {
  items: ExperienceMapItem[];
  selectedMarkerKey: string | null;
  onSelect: (markerKey: string | null) => void;
  styleUrl?: string;
};

type MapLibreModule = typeof import("maplibre-gl");

const SOURCE_ID = "experience-map-points";
const CLUSTER_LAYER = "experience-clusters";
const CLUSTER_COUNT_LAYER = "experience-cluster-count";
const POINT_LAYER = "experience-unclustered";
const SELECTED_LAYER = "experience-selected";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fitMapToItems(
  map: InstanceType<MapLibreModule["Map"]>,
  maplibregl: MapLibreModule,
  nextItems: ExperienceMapItem[]
) {
  if (nextItems.length === 0) {
    map.easeTo({
      center: [MAP_FALLBACK_CENTER.longitude, MAP_FALLBACK_CENTER.latitude],
      zoom: MAP_FALLBACK_CENTER.zoom,
      duration: prefersReducedMotion() ? 0 : 300
    });
    return;
  }

  if (nextItems.length === 1) {
    const only = nextItems[0]!;
    map.easeTo({
      center: [only.location.longitude, only.location.latitude],
      zoom: Math.max(only.location.zoom || MAP_SINGLE_MARKER_MIN_ZOOM, 11),
      duration: prefersReducedMotion() ? 0 : 300
    });
    return;
  }

  const bounds = new maplibregl.LngLatBounds();
  for (const item of nextItems) {
    bounds.extend([item.location.longitude, item.location.latitude]);
  }
  map.fitBounds(bounds, {
    padding: MAP_FIT_PADDING_PX,
    maxZoom: 13,
    duration: prefersReducedMotion() ? 0 : 400
  });
}

function itemsToGeoJson(items: ExperienceMapItem[]) {
  return {
    type: "FeatureCollection" as const,
    features: items.map((item) => ({
      type: "Feature" as const,
      id: item.markerKey,
      properties: {
        markerKey: item.markerKey,
        title: item.title,
        locationName: item.location.name,
        selected: false
      },
      geometry: {
        type: "Point" as const,
        coordinates: [item.location.longitude, item.location.latitude]
      }
    }))
  };
}

export function ExperienceMapCanvas({
  items,
  selectedMarkerKey,
  onSelect,
  styleUrl
}: ExperienceMapCanvasProps) {
  const t = useTranslations("MapPage");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<InstanceType<MapLibreModule["Map"]> | null>(null);
  const maplibreglRef = useRef<MapLibreModule | null>(null);
  const popupRef = useRef<InstanceType<MapLibreModule["Popup"]> | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const itemsRef = useRef(items);
  const onSelectRef = useRef(onSelect);
  const [mapError, setMapError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    itemsRef.current = items;
    onSelectRef.current = onSelect;
  }, [items, onSelect]);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    async function init() {
      if (!containerRef.current) return;

      try {
        const maplibregl = await import("maplibre-gl");
        if (cancelled || !containerRef.current) return;

        maplibreglRef.current = maplibregl;
        const map = new maplibregl.Map({
          container: containerRef.current,
          style: resolveMapStyleUrl(styleUrl),
          center: [MAP_FALLBACK_CENTER.longitude, MAP_FALLBACK_CENTER.latitude],
          zoom: MAP_FALLBACK_CENTER.zoom
        });

        map.addControl(
          new maplibregl.NavigationControl({ visualizePitch: false }),
          "top-right"
        );

        mapRef.current = map;

        map.on("load", () => {
          if (cancelled) return;

          map.addSource(SOURCE_ID, {
            type: "geojson",
            data: itemsToGeoJson(itemsRef.current),
            cluster: true,
            clusterMaxZoom: MAP_CLUSTER_MAX_ZOOM,
            clusterRadius: 48,
            promoteId: "markerKey"
          });

          map.addLayer({
            id: CLUSTER_LAYER,
            type: "circle",
            source: SOURCE_ID,
            filter: ["has", "point_count"],
            paint: {
              "circle-color": "#0f3a4b",
              "circle-radius": [
                "step",
                ["get", "point_count"],
                16,
                4,
                20,
                8,
                26
              ],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff"
            }
          });

          map.addLayer({
            id: CLUSTER_COUNT_LAYER,
            type: "symbol",
            source: SOURCE_ID,
            filter: ["has", "point_count"],
            layout: {
              "text-field": "{point_count_abbreviated}",
              "text-size": 12
            },
            paint: {
              "text-color": "#ffffff"
            }
          });

          map.addLayer({
            id: POINT_LAYER,
            type: "circle",
            source: SOURCE_ID,
            filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-color": "#eb674d",
              "circle-radius": 9,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff"
            }
          });

          map.addLayer({
            id: SELECTED_LAYER,
            type: "circle",
            source: SOURCE_ID,
            filter: [
              "all",
              ["!", ["has", "point_count"]],
              ["==", ["get", "markerKey"], ""]
            ],
            paint: {
              "circle-color": "#061b2c",
              "circle-radius": 12,
              "circle-stroke-width": 3,
              "circle-stroke-color": "#f0c778"
            }
          });

          map.on("click", CLUSTER_LAYER, (event) => {
            const feature = event.features?.[0];
            if (!feature || feature.geometry.type !== "Point") return;
            const clusterId = feature.properties?.cluster_id as
              | number
              | undefined;
            const source = map.getSource(SOURCE_ID) as
              | maplibregl.GeoJSONSource
              | undefined;
            if (clusterId == null || !source) return;
            const coordinates = feature.geometry.coordinates as [
              number,
              number
            ];
            void source.getClusterExpansionZoom(clusterId).then((zoom) => {
              map.easeTo({
                center: coordinates,
                zoom,
                duration: prefersReducedMotion() ? 0 : 400
              });
            });
          });

          map.on("click", POINT_LAYER, (event) => {
            const feature = event.features?.[0];
            const markerKey = feature?.properties?.markerKey as
              | string
              | undefined;
            if (!markerKey) return;
            onSelectRef.current(markerKey);
          });

          map.on("mouseenter", CLUSTER_LAYER, () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", CLUSTER_LAYER, () => {
            map.getCanvas().style.cursor = "";
          });
          map.on("mouseenter", POINT_LAYER, () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", POINT_LAYER, () => {
            map.getCanvas().style.cursor = "";
          });

          setReady(true);
          fitMapToItems(map, maplibregl, itemsRef.current);
        });

        map.on("error", () => {
          if (!cancelled) setMapError(true);
        });

        resizeObserver = new ResizeObserver(() => {
          map.resize();
        });
        resizeObserver.observe(containerRef.current);
      } catch (error) {
        console.error("[ExperienceMapCanvas]", error);
        if (!cancelled) setMapError(true);
      }
    }

    void init();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      popupRootRef.current?.unmount();
      popupRootRef.current = null;
      popupRef.current?.remove();
      popupRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [styleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = maplibreglRef.current;
    if (!map || !ready || !maplibregl) return;
    const source = map.getSource(SOURCE_ID) as
      | { setData: (data: ReturnType<typeof itemsToGeoJson>) => void }
      | undefined;
    if (!source) return;
    source.setData(itemsToGeoJson(items));
    fitMapToItems(map, maplibregl, items);
  }, [items, ready]);

  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = maplibreglRef.current;
    if (!map || !ready || !maplibregl) return;

    if (map.getLayer(SELECTED_LAYER)) {
      map.setFilter(SELECTED_LAYER, [
        "all",
        ["!", ["has", "point_count"]],
        ["==", ["get", "markerKey"], selectedMarkerKey ?? ""]
      ]);
    }

    const selected = items.find((item) => item.markerKey === selectedMarkerKey);
    if (!selected) {
      popupRef.current?.remove();
      popupRootRef.current?.unmount();
      popupRootRef.current = null;
      popupRef.current = null;
      return;
    }

    const coincident = items.filter(
      (item) =>
        item.location.latitude === selected.location.latitude &&
        item.location.longitude === selected.location.longitude
    );

    const container = document.createElement("div");
    const root = createRoot(container);
    popupRootRef.current?.unmount();
    popupRootRef.current = root;
    root.render(
      <ExperienceMapPopupContent
        items={coincident}
        onClose={() => onSelectRef.current(null)}
        onSelect={(markerKey) => onSelectRef.current(markerKey)}
      />
    );

    popupRef.current?.remove();
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 18,
      className: "map-libre-popup",
      maxWidth: "280px"
    })
      .setLngLat([selected.location.longitude, selected.location.latitude])
      .setDOMContent(container)
      .addTo(map);
    popupRef.current = popup;

    const duration = prefersReducedMotion() ? 0 : 450;
    map.easeTo({
      center: [selected.location.longitude, selected.location.latitude],
      zoom: Math.max(map.getZoom(), MAP_SINGLE_MARKER_MIN_ZOOM),
      duration
    });
  }, [selectedMarkerKey, items, ready]);

  return (
    <div className="map-canvas-wrap">
      <div
        ref={containerRef}
        className="map-canvas"
        role="region"
        aria-label={t("mapRegionLabel")}
      />
      {mapError ? (
        <div className="map-canvas-error" role="status">
          <p className="map-canvas-error__title">{t("mapError.title")}</p>
          <p>{t("mapError.description")}</p>
        </div>
      ) : null}
    </div>
  );
}
