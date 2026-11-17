import { useState } from "react";
import { useAppState } from "../state/AppState";
import Modal from "./Modal";
import Icon from "./Icon";
import GymEditor from "./GymEditor";
import { emptyGym, sortColors } from "../domain/circuits";
import type { CircuitsState, GymCircuit } from "../domain/circuits";

/** Settings sheet: all saved gyms, which one is home, and each gym's circuits. */
export default function CircuitEditor({ onClose, initialId }: { onClose: () => void; initialId?: string }) {
  const { t, circuits, setCircuits, profile } = useAppState();
  const c = t.circuits;

  const [draft, setDraft] = useState<CircuitsState>(() => structuredClone(circuits));
  const [selectedId, setSelectedId] = useState<string | null>(
    initialId ?? circuits.homeId ?? circuits.gyms[0]?.id ?? null,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gym = draft.gyms.find((g) => g.id === selectedId) ?? null;

  function replaceGym(next: GymCircuit) {
    setDraft((d) => ({ ...d, gyms: d.gyms.map((g) => (g.id === next.id ? next : g)) }));
    setError(null);
  }

  function addGym() {
    const g = emptyGym(profile?.boulderScale ?? "V");
    setDraft((d) => ({ homeId: d.homeId ?? g.id, gyms: [...d.gyms, g] }));
    setSelectedId(g.id);
    setConfirmDelete(false);
  }

  function deleteGym() {
    if (!gym) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const gyms = draft.gyms.filter((g) => g.id !== gym.id);
    const homeId = draft.homeId === gym.id ? (gyms[0]?.id ?? null) : draft.homeId;
    setDraft({ homeId, gyms });
    setSelectedId(gyms[0]?.id ?? null);
    setConfirmDelete(false);
  }

  function save() {
    for (const g of draft.gyms) {
      if (g.colors.some((col) => col.name.trim() === "")) return setError(c.nameMissing);
      if (g.colors.some((col) => col.min > col.max)) return setError(c.rangeInvalid);
    }
    setCircuits({
      homeId: draft.homeId,
      gyms: draft.gyms.map((g) => ({
        ...g,
        name: g.name.trim() || c.gymPlaceholder,
        colors: sortColors(g.colors.map((col) => ({ ...col, name: col.name.trim() }))),
      })),
    });
    onClose();
  }

  return (
    <Modal ariaLabel={c.title}>
      <div className="modal circuits">
        <div className="modal__header">
          <h2 className="modal__title">{c.title}</h2>
          <button type="button" className="modal__close" aria-label={c.cancel} onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="modal__body">
          <p className="circuits__intro">{c.intro}</p>

          <div className="chip-row circuits__gyms">
            {draft.gyms.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`chip chip--filterable${g.id === selectedId ? " chip--active" : ""}`}
                aria-pressed={g.id === selectedId}
                onClick={() => {
                  setSelectedId(g.id);
                  setConfirmDelete(false);
                }}
              >
                {g.id === draft.homeId && <span className="home-mark">{c.homeShort}</span>}
                {g.name.trim() || c.gymPlaceholder}
              </button>
            ))}
            <button type="button" className="chip chip--filterable" onClick={addGym}>
              + {c.newGym}
            </button>
          </div>

          {gym && (
            <>
              {gym.id === draft.homeId ? (
                <p className="circuits__home-note">{c.isHome}</p>
              ) : (
                <button
                  type="button"
                  className="filters__clear"
                  onClick={() => setDraft((d) => ({ ...d, homeId: gym.id }))}
                >
                  {c.makeHome}
                </button>
              )}
              <GymEditor gym={gym} onChange={replaceGym} />
              <button type="button" className="filters__clear circuits__delete" onClick={deleteGym}>
                {confirmDelete ? c.deleteConfirm : c.deleteGym}
              </button>
            </>
          )}

          {error && <p className="onboarding__error">{error}</p>}

          <div className="onboarding__actions">
            <button type="button" className="button-primary" onClick={save}>
              {c.save}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
