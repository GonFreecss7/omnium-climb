import { useRef, useState } from "react";
import { checkForUpdate } from "../pwa";
import type { UpdateCheck } from "../pwa";
import { useAppState } from "../state/AppState";
import { buildBackup, downloadJson, restoreBackup } from "../domain/backup";
import { todayLocalISO } from "../utils/sessionStats";
import { APP_VERSION } from "../version";

/** Settings rows: export everything to a file, or replace everything from one. */
export default function BackupSection() {
  const { t, log } = useAppState();
  const b = t.backup;
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ name: string; text: string } | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [update, setUpdate] = useState<UpdateCheck | "checking" | null>(null);

  async function runUpdateCheck() {
    setUpdate("checking");
    setUpdate(await checkForUpdate());
  }

  function exportAll() {
    downloadJson(`omnium-climb-respaldo-${todayLocalISO()}.json`, buildBackup(APP_VERSION));
    setMessage({ kind: "ok", text: b.exported });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPending({ name: file.name, text: await file.text() });
    setMessage(null);
  }

  function confirmRestore() {
    if (!pending) return;
    const res = restoreBackup(pending.text);
    if (!res.ok) {
      setMessage({ kind: "error", text: res.reason === "newer" ? b.errorNewer : res.reason === "storage" ? b.errorStorage : b.errorInvalid });
      setPending(null);
      return;
    }
    // State is initialised from storage; a reload is the simplest exact restore.
    window.location.reload();
  }

  return (
    <>
    <div className="settings__row">
      <span className="settings__label">{b.updates.title}</span>
      <p className="settings__hint">{b.updates.hint(APP_VERSION)}</p>
      <div className="backup__actions">
        <button type="button" className="secondary-button" onClick={runUpdateCheck} disabled={update === "checking"}>
          {update === "checking" ? b.updates.checking : b.updates.check}
        </button>
      </div>
      {update && update !== "checking" && <p className="settings__hint" role="status">{b.updates.result[update]}</p>}
    </div>
    <div className="settings__row">
      <span className="settings__label">{b.title}</span>
      <p className="settings__hint">{b.hint(log.length)}</p>
      <div className="backup__actions">
        <button type="button" className="secondary-button" onClick={exportAll}>
          {b.export}
        </button>
        <button type="button" className="secondary-button" onClick={() => fileRef.current?.click()}>
          {b.restore}
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
      </div>
      {pending && (
        <div className="backup__confirm" role="alertdialog" aria-label={b.confirmTitle}>
          <p className="backup__confirm-title">{b.confirmTitle}</p>
          <p className="settings__hint">{b.confirmBody(pending.name)}</p>
          <div className="backup__actions">
            <button type="button" className="button-primary" onClick={confirmRestore}>
              {b.confirm}
            </button>
            <button type="button" className="secondary-button" onClick={() => setPending(null)}>
              {b.cancel}
            </button>
          </div>
        </div>
      )}
      {message && <p className={message.kind === "ok" ? "settings__hint" : "onboarding__error"}>{message.text}</p>}
    </div>
    </>
  );
}
