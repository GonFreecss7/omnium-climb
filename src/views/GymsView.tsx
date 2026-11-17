import { useMemo, useState } from "react";
import { useAppState } from "../state/AppState";
import GymMap from "../components/GymMap";
import CircuitEditor from "../components/CircuitEditor";
import { DIRECTORY, REGIONS, distanceKm, formatKm, mapsUrl, searchGyms } from "../domain/gymDirectory";
import type { DirectoryGym } from "../domain/gymDirectory";
import { newId } from "../domain/circuits";
import type { GymCircuit } from "../domain/circuits";

type LocState = { status: "idle" } | { status: "locating" } | { status: "error" } | { status: "ok"; lat: number; lng: number };

export default function GymsView() {
  const { t, circuits, setCircuits, profile, theme } = useAppState();
  const v = t.gymsView;

  const [region, setRegion] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loc, setLoc] = useState<LocState>({ status: "idle" });
  const [editingGymId, setEditingGymId] = useState<string | null>(null);

  const me = loc.status === "ok" ? { lat: loc.lat, lng: loc.lng } : null;

  const savedByDirectory = useMemo(() => {
    const m = new Map<string, GymCircuit>();
    for (const g of circuits.gyms) if (g.directoryId) m.set(g.directoryId, g);
    return m;
  }, [circuits]);
  const homeDirectoryId = circuits.gyms.find((g) => g.id === circuits.homeId)?.directoryId ?? null;

  const visible = useMemo(() => {
    const inRegion = region ? DIRECTORY.filter((g) => g.region === region) : DIRECTORY;
    const found = searchGyms(inRegion, query);
    if (me) return [...found].sort((a, b) => distanceKm(me, a) - distanceKm(me, b));
    return found;
  }, [region, query, me]);

  const selected = DIRECTORY.find((g) => g.id === selectedId) ?? null;
  const selectedSaved = selected ? savedByDirectory.get(selected.id) ?? null : null;

  const regionCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of DIRECTORY) m.set(g.region, (m.get(g.region) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  function locate() {
    if (!("geolocation" in navigator)) {
      setLoc({ status: "error" });
      return;
    }
    setLoc({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ status: "ok", lat: pos.coords.latitude, lng: pos.coords.longitude });
        setRegion(null);
      },
      () => setLoc({ status: "error" }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  function saveGym(g: DirectoryGym, makeHome: boolean) {
    const existing = savedByDirectory.get(g.id);
    if (existing) {
      if (makeHome) setCircuits({ ...circuits, homeId: existing.id });
      return;
    }
    const gym: GymCircuit = { id: newId(), name: g.name, scale: profile?.boulderScale ?? "V", colors: [], directoryId: g.id };
    setCircuits({
      homeId: makeHome || circuits.homeId === null ? gym.id : circuits.homeId,
      gyms: [...circuits.gyms, gym],
    });
  }

  function select(id: string) {
    setSelectedId(id);
    document.getElementById("gym-map")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const savedIds = useMemo(() => new Set(savedByDirectory.keys()), [savedByDirectory]);

  // Group by commune unless sorted by distance.
  const groups = useMemo(() => {
    if (me) return [{ commune: null as string | null, gyms: visible }];
    const m = new Map<string, DirectoryGym[]>();
    for (const g of visible) {
      const key = `${REGIONS[g.region] ?? g.region} · ${g.commune}`;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(g);
    }
    return [...m.entries()].map(([commune, gyms]) => ({ commune, gyms }));
  }, [visible, me]);

  return (
    <div className="view gyms">
      <h1 className="view__heading">{v.heading}</h1>
      <p className="view__subheading">{v.subheading(DIRECTORY.length)}</p>

      <div className="filters__group gyms__regions">
        <button
          type="button"
          className={`chip chip--filterable${region === null ? " chip--active" : ""}`}
          aria-pressed={region === null}
          onClick={() => setRegion(null)}
        >
          {v.all}
        </button>
        {regionCounts.map(([id, n]) => (
          <button
            key={id}
            type="button"
            className={`chip chip--filterable${region === id ? " chip--active" : ""}`}
            aria-pressed={region === id}
            onClick={() => {
              setRegion(region === id ? null : id);
              setSelectedId(null);
            }}
          >
            {REGIONS[id] ?? id}
            <span className="gyms__count">{n}</span>
          </button>
        ))}
      </div>

      <div id="gym-map" className="gyms__map-card">
        <GymMap
          gyms={visible}
          fit={me ? [...visible.slice(0, 8), ...(selected && !visible.slice(0, 8).includes(selected) ? [selected] : [])] : undefined}
          selectedId={selectedId}
          homeId={homeDirectoryId}
          savedIds={savedIds}
          me={me}
          onSelect={setSelectedId}
          ariaLabel={v.mapAria}
          meLabel={v.you}
          theme={theme}
        />
        <button type="button" className="gyms__locate" onClick={locate} disabled={loc.status === "locating"}>
          {loc.status === "locating" ? v.locating : v.nearMe}
        </button>
      </div>
      {loc.status === "error" && <p className="onboarding__error">{v.locationError}</p>}

      {selected && (
        <div className="gym-card" aria-live="polite">
          <div className="gym-card__head">
            <div>
              <h2 className="gym-card__name">{selected.name}</h2>
              <p className="gym-card__meta">
                {selected.commune}, {REGIONS[selected.region] ?? selected.region}
                {me && <> · {formatKm(distanceKm(me, selected))} km</>}
              </p>
            </div>
            {selected.kind === "outdoor" && <span className="chip">{v.outdoor}</span>}
          </div>
          {selected.address && <p className="gym-card__address">{selected.address}</p>}
          <div className="gym-card__status">
            {homeDirectoryId === selected.id ? (
              <span className="home-mark">{t.circuits.homeShort}</span>
            ) : selectedSaved ? (
              <span className="gym-card__saved">{v.saved}</span>
            ) : null}
          </div>
          <div className="gym-card__actions">
            <a className="button-primary gym-card__maps" href={mapsUrl(selected)} target="_blank" rel="noopener noreferrer">
              {v.openMaps}
            </a>
            {homeDirectoryId !== selected.id && (
              <button type="button" className="secondary-button" onClick={() => saveGym(selected, true)}>
                {v.makeHome}
              </button>
            )}
            {!selectedSaved && (
              <button type="button" className="secondary-button" onClick={() => saveGym(selected, false)}>
                {v.save}
              </button>
            )}
            {selectedSaved && (
              <button type="button" className="secondary-button" onClick={() => setEditingGymId(selectedSaved.id)}>
                {v.editCircuits}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="search-bar gyms__search">
        <input
          type="search"
          className="search-bar__input"
          placeholder={v.searchPlaceholder}
          aria-label={v.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {visible.length === 0 ? (
        <p className="search-bar__no-results">{v.noResults}</p>
      ) : (
        groups.map((group) => (
          <section key={group.commune ?? "near"} className="gyms__group">
            {group.commune && <h2 className="gyms__commune">{group.commune}</h2>}
            <ul className="gym-list">
              {group.gyms.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    className={`gym-list__item${g.id === selectedId ? " gym-list__item--selected" : ""}`}
                    onClick={() => select(g.id)}
                  >
                    <span className="gym-list__text">
                      <span className="gym-list__name">
                        {g.id === homeDirectoryId && <span className="home-mark">{t.circuits.homeShort}</span>}
                        {g.name}
                      </span>
                      <span className="gym-list__meta">
                        {me ? `${g.commune} · ${formatKm(distanceKm(me, g))} km` : g.address || g.commune}
                        {g.kind === "outdoor" && ` · ${v.outdoor}`}
                      </span>
                    </span>
                    {savedByDirectory.has(g.id) && g.id !== homeDirectoryId && (
                      <span className="gym-list__saved" aria-label={v.saved} />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {editingGymId && <CircuitEditor initialId={editingGymId} onClose={() => setEditingGymId(null)} />}
    </div>
  );
}
