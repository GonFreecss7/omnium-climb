import { useMemo } from "react";
import outline from "../assets/chile-outline.json";
import type { DirectoryGym } from "../domain/gymDirectory";

interface Props {
  gyms: DirectoryGym[];
  /** Gyms the frame should fit; defaults to all of `gyms`. */
  fit?: DirectoryGym[];
  selectedId: string | null;
  homeId: string | null;
  savedIds: Set<string>;
  me: { lat: number; lng: number } | null;
  onSelect: (id: string) => void;
  ariaLabel: string;
  meLabel: string;
}

const SIZE = 1000;
const PAD = 0.14;
const MIN_SPAN_DEG = 0.06;
const COAST = outline as number[][][];

/**
 * Offline map: an equirectangular projection fitted to the visible gyms,
 * over Chile's coastline (Natural Earth 1:50m via world-atlas). No tiles,
 * no network — it stays usable at the gym on bad wifi.
 */
export default function GymMap({ gyms, fit, selectedId, homeId, savedIds, me, onSelect, ariaLabel, meLabel }: Props) {
  const frame = useMemo(() => {
    const pts = (fit ?? gyms).map((g) => [g.lng, g.lat] as const);
    if (me) pts.push([me.lng, me.lat] as const);
    if (pts.length === 0) pts.push([-70.65, -33.45] as const);
    let minLng = Math.min(...pts.map((p) => p[0]));
    let maxLng = Math.max(...pts.map((p) => p[0]));
    let minLat = Math.min(...pts.map((p) => p[1]));
    let maxLat = Math.max(...pts.map((p) => p[1]));
    const midLat = (minLat + maxLat) / 2;
    const kx = Math.cos((midLat * Math.PI) / 180);
    // Work in "projected degrees" so the box is square in real distance.
    let w = Math.max((maxLng - minLng) * kx, MIN_SPAN_DEG);
    let h = Math.max(maxLat - minLat, MIN_SPAN_DEG);
    const span = Math.max(w, h) * (1 + PAD * 2);
    const cx = ((minLng + maxLng) / 2) * kx;
    const cy = (minLat + maxLat) / 2;
    w = span;
    h = span;
    const scale = SIZE / span;
    const x = (lng: number) => (lng * kx - (cx - w / 2)) * scale;
    const y = (lat: number) => (cy + h / 2 - lat) * scale;
    return { x, y, scale, kx, spanDeg: span };
  }, [gyms, fit, me]);

  const coastPath = useMemo(
    () =>
      COAST.map(
        (ring) =>
          ring.map(([lng, lat], i) => `${i === 0 ? "M" : "L"}${frame.x(lng!).toFixed(1)} ${frame.y(lat!).toFixed(1)}`).join("") + "Z",
      ).join(""),
    [frame],
  );

  // Scale bar: a round number of km close to a fifth of the map width.
  const kmPerUnit = (111.32 * frame.spanDeg) / SIZE;
  const target = kmPerUnit * SIZE * 0.22;
  const steps = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500];
  const barKm = steps.reduce((best, s) => (Math.abs(s - target) < Math.abs(best - target) ? s : best), steps[0]!);
  const barLen = barKm / kmPerUnit;

  const selected = gyms.find((g) => g.id === selectedId) ?? null;
  const dotR = 11;

  return (
    <svg className="gym-map" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={ariaLabel}>
      <rect className="gym-map__sea" x="0" y="0" width={SIZE} height={SIZE} />
      <path className="gym-map__land" d={coastPath} />

      {gyms.map((g) => {
        const isSel = g.id === selectedId;
        const cls = [
          "gym-map__dot",
          g.kind === "outdoor" ? "gym-map__dot--outdoor" : "",
          savedIds.has(g.id) ? "gym-map__dot--saved" : "",
          g.id === homeId ? "gym-map__dot--home" : "",
          isSel ? "gym-map__dot--selected" : "",
        ].join(" ");
        return (
          <g key={g.id} className={cls} onClick={() => onSelect(g.id)}>
            <circle cx={frame.x(g.lng)} cy={frame.y(g.lat)} r={34} className="gym-map__hit" />
            {g.id === homeId && <circle cx={frame.x(g.lng)} cy={frame.y(g.lat)} r={dotR + 9} className="gym-map__ring" />}
            <circle cx={frame.x(g.lng)} cy={frame.y(g.lat)} r={isSel ? dotR + 5 : dotR} className="gym-map__pin" />
          </g>
        );
      })}

      {me && (
        <g className="gym-map__me">
          <circle cx={frame.x(me.lng)} cy={frame.y(me.lat)} r={30} className="gym-map__me-halo" />
          <circle cx={frame.x(me.lng)} cy={frame.y(me.lat)} r={11} className="gym-map__me-dot" />
          <text x={frame.x(me.lng) + 20} y={frame.y(me.lat) - 18} className="gym-map__label gym-map__label--me">
            {meLabel}
          </text>
        </g>
      )}

      {selected && (
        <text
          x={Math.min(frame.x(selected.lng) + 24, SIZE - 20)}
          y={frame.y(selected.lat) - 22}
          className="gym-map__label"
          textAnchor={frame.x(selected.lng) > SIZE * 0.6 ? "end" : "start"}
          dx={frame.x(selected.lng) > SIZE * 0.6 ? -48 : 0}
        >
          {selected.name}
        </text>
      )}

      <g className="gym-map__scale" transform={`translate(36 ${SIZE - 44})`}>
        <line x1="0" y1="0" x2={barLen} y2="0" />
        <line x1="0" y1="-10" x2="0" y2="10" />
        <line x1={barLen} y1="-10" x2={barLen} y2="10" />
        <text x={barLen + 14} y="9">
          {barKm} km
        </text>
      </g>
    </svg>
  );
}
