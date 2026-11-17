import { useState } from "react";
import { useAppState } from "../state/AppState";
import Icon from "./Icon";
import ColorPicker from "./ColorPicker";
import { BOULDER_LADDER, BOULDER_SCALES, SCALE_LABELS, gradeOptions, labelSpan } from "../domain/grades";
import { PALETTE, newId, templateColors } from "../domain/circuits";
import type { CircuitColor, GymCircuit } from "../domain/circuits";
import { DIRECTORY, findByName } from "../domain/gymDirectory";

const LAST = BOULDER_LADDER.length - 1;

/** Edits one gym: name, the boulder scale it grades in, and its colour circuits. */
export default function GymEditor({ gym, onChange }: { gym: GymCircuit; onChange: (g: GymCircuit) => void }) {
  const { t, lang } = useAppState();
  const c = t.circuits;
  const options = gradeOptions(gym.scale);
  const [openPicker, setOpenPicker] = useState<string | null>(null);

  const update = (patch: Partial<GymCircuit>) => onChange({ ...gym, ...patch });
  const updateColor = (id: string, patch: Partial<CircuitColor>) =>
    update({ colors: gym.colors.map((col) => (col.id === id ? { ...col, ...patch } : col)) });

  function addColor() {
    const lastMax = gym.colors.reduce((m, col) => Math.max(m, col.max), -1);
    const start = Math.min(LAST, lastMax + 1);
    const [, end] = labelSpan(start, gym.scale);
    const used = new Set(gym.colors.map((col) => col.hex));
    const p = PALETTE.find((x) => !used.has(x.hex)) ?? PALETTE[0]!;
    const col: CircuitColor = { id: newId(), name: p.name[lang], hex: p.hex, min: start, max: end };
    update({ colors: [...gym.colors, col] });
    setOpenPicker(col.id);
  }

  return (
    <div className="gym-editor">
      <label className="session-log__field">
        <span className="mono-label">{c.gymName}</span>
        <input
          type="text"
          list="gym-directory-editor"
          value={gym.name}
          placeholder={c.gymPlaceholder}
          onChange={(e) => {
            const dir = findByName(e.target.value);
            update({ name: e.target.value, directoryId: dir?.id });
          }}
        />
        <datalist id="gym-directory-editor">
          {DIRECTORY.map((d) => (
            <option key={d.id} value={d.name}>
              {d.commune}
            </option>
          ))}
        </datalist>
      </label>

      <div className="session-log__field">
        <span className="mono-label">{c.gymScale}</span>
        <div className="segmented">
          {BOULDER_SCALES.map((s) => (
            <button
              key={s}
              type="button"
              className={`segmented__option${gym.scale === s ? " segmented__option--active" : ""}`}
              aria-pressed={gym.scale === s}
              onClick={() => update({ scale: s })}
            >
              {SCALE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="session-log__field">
        <span className="mono-label">{c.colorsHeading}</span>
        {gym.colors.length === 0 ? (
          <div className="gym-editor__empty">
            <p className="circuits__empty">{c.empty}</p>
            <button type="button" className="secondary-button" onClick={() => update({ colors: templateColors(lang) })}>
              {c.useTemplate}
            </button>
          </div>
        ) : (
          <ul className="circuit-list">
            {gym.colors.map((col) => (
              <li key={col.id} className="circuit-row">
                <div className="circuit-row__top">
                  <button
                    type="button"
                    className="circuit-row__swatch"
                    style={{ background: col.hex }}
                    aria-label={c.pickColor}
                    aria-expanded={openPicker === col.id}
                    onClick={() => setOpenPicker(openPicker === col.id ? null : col.id)}
                  />
                  <input
                    type="text"
                    className="circuit-row__name"
                    aria-label={c.colorName}
                    value={col.name}
                    onChange={(e) => updateColor(col.id, { name: e.target.value })}
                  />
                  <button
                    type="button"
                    className="circuit-row__remove"
                    aria-label={c.removeColor}
                    onClick={() => update({ colors: gym.colors.filter((x) => x.id !== col.id) })}
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>
                {openPicker === col.id && (
                  <ColorPicker
                    value={col.hex}
                    onChange={(hex, paletteName) => {
                      const nameIsPalette = col.name.trim() === "" || PALETTE.some((p) => p.name[lang] === col.name);
                      updateColor(col.id, { hex, ...(paletteName && nameIsPalette ? { name: paletteName } : {}) });
                    }}
                  />
                )}
                <div className="circuit-row__range">
                  <label>
                    <span className="mono-label">{c.from}</span>
                    <select
                      value={labelSpan(col.min, gym.scale)[0]}
                      onChange={(e) => updateColor(col.id, { min: labelSpan(Number(e.target.value), gym.scale)[0] })}
                    >
                      {options.map((o) => (
                        <option key={o.index} value={o.index}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="mono-label">{c.to}</span>
                    <select
                      value={col.max >= LAST ? LAST : labelSpan(col.max, gym.scale)[0]}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        updateColor(col.id, { max: v >= LAST ? LAST : labelSpan(v, gym.scale)[1] });
                      }}
                    >
                      {options
                        .filter((o) => o.index < LAST)
                        .map((o) => (
                          <option key={o.index} value={o.index}>
                            {o.label}
                          </option>
                        ))}
                      <option value={LAST}>{c.andUp}</option>
                    </select>
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}
        {gym.colors.length > 0 && (
          <button type="button" className="secondary-button" onClick={addColor}>
            + {c.addColor}
          </button>
        )}
      </div>
    </div>
  );
}
