import { useAppState } from "../state/AppState";
import { PALETTE } from "../domain/circuits";

interface Props {
  value: string;
  onChange: (hex: string, paletteName?: string) => void;
}

/** One-tap hold colours plus the native picker for anything else. */
export default function ColorPicker({ value, onChange }: Props) {
  const { t, lang } = useAppState();
  const isCustom = !PALETTE.some((p) => p.hex.toLowerCase() === value.toLowerCase());
  return (
    <div className="color-picker" role="group" aria-label={t.circuits.pickColor}>
      {PALETTE.map((p) => {
        const selected = p.hex.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={p.hex}
            type="button"
            className={`swatch${selected ? " swatch--selected" : ""}`}
            style={{ background: p.hex }}
            aria-label={p.name[lang]}
            aria-pressed={selected}
            onClick={() => onChange(p.hex, p.name[lang])}
          />
        );
      })}
      <label
        className={`swatch swatch--custom${isCustom ? " swatch--selected" : ""}`}
        style={isCustom ? { background: value } : undefined}
        title={t.circuits.customColor}
      >
        <span className="visually-hidden">{t.circuits.customColor}</span>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}
