import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import outline from "../assets/chile-outline.json";
import type { DirectoryGym } from "../domain/gymDirectory";
import type { Theme } from "../state/AppState";

interface Props {
  gyms: DirectoryGym[];
  /** Gyms the view should fit; defaults to all of `gyms`. */
  fit?: DirectoryGym[];
  selectedId: string | null;
  homeId: string | null;
  savedIds: Set<string>;
  me: { lat: number; lng: number } | null;
  onSelect: (id: string) => void;
  theme: Theme;
  ariaLabel: string;
  meLabel: string;
}

// Basemap: OpenStreetMap's standard tiles (keyless) — streets, communes and
// city names. CSS filters (components.css, .gym-map--osm) tone them down to the
// app's monochrome look, inverted for the dark theme. If a CARTO key is
// provided at build time (VITE_CARTO_KEY), CARTO's Positron / Dark Matter
// styles are used instead. Viewed tiles are cached by the service worker.
const CARTO_KEY: string | undefined = import.meta.env.VITE_CARTO_KEY;
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

function tileSource(theme: Theme): { url: string; attribution: string; subdomains?: string } {
  if (CARTO_KEY) {
    const style = theme === "dark" ? "dark_all" : "light_all";
    return {
      url: `https://basemaps.cartocdn.com/rastertiles/${style}/{z}/{x}/{y}.png?key=${encodeURIComponent(CARTO_KEY)}`,
      attribution: `${OSM_ATTRIBUTION} &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>`,
    };
  }
  return { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: OSM_ATTRIBUTION };
}

const CHILE_CENTER: L.LatLngExpression = [-33.45, -70.65];

// Natural Earth coastline, drawn *under* the tiles: invisible once tiles load,
// but it keeps the map readable offline before any tile has been cached.
const COAST: L.LatLngExpression[][] = (outline as number[][][]).map((ring) => ring.map(([lng, lat]) => [lat!, lng!]));

export default function GymMap({ gyms, fit, selectedId, homeId, savedIds, me, onSelect, theme, ariaLabel, meLabel }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const tiles = useRef<L.TileLayer | null>(null);
  const markers = useRef<L.LayerGroup | null>(null);
  const meLayer = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Create once.
  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, {
      center: CHILE_CENTER,
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
      worldCopyJump: false,
      minZoom: 4,
      maxZoom: 19,
    });
    m.attributionControl.setPrefix(false);
    m.createPane("coast");
    m.getPane("coast")!.style.zIndex = "150";
    L.polygon(COAST, { pane: "coast", className: "gym-map__coast", interactive: false }).addTo(m);
    L.control.scale({ imperial: false, position: "bottomleft" }).addTo(m);
    markers.current = L.layerGroup().addTo(m);
    meLayer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
      tiles.current = null;
    };
  }, []);

  // Theme-matched tiles.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    tiles.current?.remove();
    const src = tileSource(theme);
    tiles.current = L.tileLayer(src.url, {
      attribution: src.attribution,
      maxZoom: 19,
      detectRetina: false,
      className: CARTO_KEY ? "gym-map__tiles" : "gym-map__tiles gym-map__tiles--osm",
    }).addTo(m);
  }, [theme]);

  // Markers.
  useEffect(() => {
    const group = markers.current;
    if (!group) return;
    group.clearLayers();
    for (const g of gyms) {
      const isSel = g.id === selectedId;
      const classes = [
        "gym-pin",
        g.kind === "outdoor" ? "gym-pin--outdoor" : "",
        savedIds.has(g.id) ? "gym-pin--saved" : "",
        g.id === homeId ? "gym-pin--home" : "",
        isSel ? "gym-pin--selected" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const marker = L.marker([g.lat, g.lng], {
        icon: L.divIcon({ className: classes, iconSize: [22, 22], iconAnchor: [11, 11] }),
        title: g.name,
        alt: g.name,
        keyboard: true,
        riseOnHover: true,
        zIndexOffset: isSel ? 1000 : g.id === homeId ? 500 : 0,
      });
      marker.bindTooltip(g.name, {
        direction: "top",
        offset: [0, -12],
        className: "gym-tooltip",
        permanent: isSel,
      });
      marker.on("click", () => onSelectRef.current(g.id));
      marker.addTo(group);
    }
  }, [gyms, selectedId, homeId, savedIds]);

  // "You are here".
  useEffect(() => {
    const layer = meLayer.current;
    if (!layer) return;
    layer.clearLayers();
    if (!me) return;
    L.marker([me.lat, me.lng], {
      icon: L.divIcon({ className: "me-pin", iconSize: [18, 18], iconAnchor: [9, 9] }),
      interactive: false,
      zIndexOffset: 2000,
    })
      .bindTooltip(meLabel, { permanent: true, direction: "right", offset: [10, 0], className: "gym-tooltip gym-tooltip--me" })
      .addTo(layer);
  }, [me, meLabel]);

  // Frame the visible set whenever it changes (filters, search, near me).
  const fitKey = (fit ?? gyms).map((g) => g.id).join(",") + (me ? `|${me.lat},${me.lng}` : "");
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const pts: L.LatLngExpression[] = (fit ?? gyms).map((g) => [g.lat, g.lng]);
    if (me) pts.push([me.lat, me.lng]);
    if (pts.length === 0) return;
    if (pts.length === 1) m.setView(pts[0]!, 15);
    else m.fitBounds(L.latLngBounds(pts), { padding: [36, 36], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);

  // Bring the selected gym into view without losing the climber's zoom.
  useEffect(() => {
    const m = map.current;
    const g = gyms.find((x) => x.id === selectedId);
    if (!m || !g) return;
    m.flyTo([g.lat, g.lng], Math.max(m.getZoom(), 14), { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return <div ref={el} className="gym-map" role="region" aria-label={ariaLabel} />;
}
