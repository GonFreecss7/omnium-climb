import { useAppState } from "../state/AppState";
import Modal from "./Modal";
import Icon from "./Icon";
import ColorPicker from "./ColorPicker";
import { LEVELS } from "../domain/levels";

const DEFAULTS: Record<string, string> = {
  beginner: "#34b27b",
  intermediate: "#4a82f5",
  advanced: "#e5484d",
  elite: "#0a0b0c",
};

export default function LevelColorsEditor({ onClose }: { onClose: () => void }) {
  const { t, levelColors, setLevelColors } = useAppState();
  const e = t.levelColorsEditor;

  return (
    <Modal ariaLabel={e.title}>
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">{e.title}</h2>
          <button type="button" className="modal__close" aria-label={e.done} onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="modal__body">
          <p className="circuits__intro">{e.intro}</p>
          <ul className="level-colors">
            {LEVELS.map((l) => (
              <li key={l} className="level-colors__row">
                <span className={`tape tape--${l}`}>{t.levels[l]}</span>
                <ColorPicker
                  value={levelColors[l] ?? DEFAULTS[l]!}
                  onChange={(hex) => setLevelColors({ ...levelColors, [l]: hex })}
                />
              </li>
            ))}
          </ul>
          <div className="onboarding__actions">
            <button type="button" className="button-primary" onClick={onClose}>
              {e.done}
            </button>
            {Object.keys(levelColors).length > 0 && (
              <button type="button" className="filters__clear" onClick={() => setLevelColors({})}>
                {e.reset}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
