import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PartnerDirectoryItem } from "@/lib/view-models/partner-directory";
import { PartnerMapCanvas } from "./partner-map-canvas";

const mapMocks = vi.hoisted(() => ({
  addSource: vi.fn(),
  addLayer: vi.fn(),
  resize: vi.fn(),
  setData: vi.fn(),
  setFilter: vi.fn(),
  easeTo: vi.fn()
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock("maplibre-gl", () => ({
  Map: undefined,
  NavigationControl: undefined,
  LngLatBounds: undefined,
  default: {
    Map: class {
      constructor({ container }: { container: HTMLElement }) {
        container.classList.add("maplibregl-map");
      }
      addControl() {}
      addSource = mapMocks.addSource;
      addLayer = mapMocks.addLayer;
      resize = mapMocks.resize;
      setFilter = mapMocks.setFilter;
      easeTo = mapMocks.easeTo;
      getZoom() {
        return 13;
      }
      getCanvas() {
        return document.createElement("canvas");
      }
      getSource() {
        return { setData: mapMocks.setData };
      }
      isStyleLoaded() {
        return true;
      }
      on(event: string, handler: (...args: unknown[]) => void) {
        if (event === "load") queueMicrotask(handler);
      }
      remove() {}
      fitBounds() {}
    },
    NavigationControl: class {},
    LngLatBounds: class {
      extend() {
        return this;
      }
    }
  }
}));

const item: PartnerDirectoryItem = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "la-plata",
  name: "La Plata Casa Matilde",
  category: "restaurant",
  description: null,
  websiteUrl: null,
  phone: null,
  isFeatured: false,
  publishedAt: "2026-07-25T00:00:00Z",
  image: { url: null, alt: "La Plata" },
  logo: { url: null, alt: "La Plata" },
  location: {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "benajarafe",
    name: "Benajarafe",
    addressLine1: null,
    postalCode: null,
    city: "Benajarafe",
    province: "Málaga",
    countryCode: "ES",
    latitude: 36.716,
    longitude: -4.18,
    zoom: 17,
    directionsUrl: null
  },
  metrics: { scans: 0, bookings: 0, conversionRate: 0 },
  mostBookedExperience: null
};

describe("PartnerMapCanvas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 720,
      height: 672,
      top: 0,
      right: 720,
      bottom: 672,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({})
    });
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(private readonly callback: ResizeObserverCallback) {}
        observe() {
          this.callback([], this as unknown as ResizeObserver);
        }
        disconnect() {}
        unobserve() {}
      }
    );
  });

  it("creates a visible map source and resizes it to its rendered container", async () => {
    render(
      <PartnerMapCanvas
        items={[item]}
        selectedSlug={item.slug}
        onSelect={vi.fn()}
        styleUrl="https://tiles.openfreemap.org/styles/liberty"
      />
    );

    await waitFor(() => expect(mapMocks.addSource).toHaveBeenCalledOnce());

    const mapRegion = screen.getByRole("region", { name: "mapLabel" });
    expect(mapRegion).toHaveClass("map-canvas", "maplibregl-map");
    expect(mapRegion.parentElement).toHaveClass(
      "map-canvas-wrap",
      "relative",
      "min-h-0"
    );
    expect(mapMocks.addSource).toHaveBeenCalledWith(
      "partner-points",
      expect.objectContaining({
        data: expect.objectContaining({
          features: [
            expect.objectContaining({
              properties: expect.objectContaining({ slug: "la-plata" }),
              geometry: {
                type: "Point",
                coordinates: [-4.18, 36.716]
              }
            })
          ]
        })
      })
    );
    expect(mapMocks.resize).toHaveBeenCalled();
    expect(mapMocks.setFilter).toHaveBeenCalledWith(
      "partner-selected",
      expect.arrayContaining([expect.any(Array)])
    );
  });
});
