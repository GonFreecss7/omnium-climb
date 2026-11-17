// Directory of Chilean climbing gyms, sourced from content/gyms-cl.json
// (hand-maintained; ids are stable and referenced from saved gyms).

import raw from "../../content/gyms-cl.json";
import { normalize } from "../utils/text";

export interface DirectoryGym {
  id: string;
  name: string;
  address: string;
  commune: string;
  region: string;
  lat: number;
  lng: number;
  kind: "gym" | "outdoor";
}

export const DIRECTORY: DirectoryGym[] = raw.gyms as DirectoryGym[];
export const REGIONS: Record<string, string> = raw.regions;

export function findDirectoryGym(id: string | undefined): DirectoryGym | null {
  return id ? (DIRECTORY.find((g) => g.id === id) ?? null) : null;
}

export function findByName(name: string): DirectoryGym | null {
  const n = normalize(name.trim());
  return n ? (DIRECTORY.find((g) => normalize(g.name) === n) ?? null) : null;
}

export function searchGyms(gyms: DirectoryGym[], query: string): DirectoryGym[] {
  const q = normalize(query.trim());
  if (!q) return gyms;
  return gyms.filter((g) => normalize(`${g.name} ${g.commune} ${g.address}`).includes(q));
}

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatKm(km: number): string {
  return km < 10 ? km.toFixed(1) : Math.round(km).toString();
}

export function mapsUrl(g: DirectoryGym): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${g.name}, ${g.address || g.commune}`)}`;
}
