/**
 * Service worker registration with in-place updates.
 *
 * An installed iOS web app is rarely relaunched — it resumes from the
 * background — so the browser's own "check on navigation" almost never runs
 * and new builds never arrive. Here the app checks for a new service worker
 * whenever it comes back to the foreground (and every 30 min while open).
 * With `registerType: "autoUpdate"` the new worker takes over and the page
 * reloads into the new build. localStorage is untouched by an update: only
 * deleting the home-screen app (or clearing website data) erases it.
 */
import { registerSW } from "virtual:pwa-register";

let registration: ServiceWorkerRegistration | undefined;
let reloading = false;

function reloadOnce(): void {
  if (reloading) return;
  reloading = true;
  window.location.reload();
}

export function installPwa(): void {
  // A page that was already controlled and gets a new controller is running
  // an old build: reload into the new one. Not on the very first install.
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener("controllerchange", reloadOnce);
  }
  registerSW({
    immediate: true,
    onNeedReload: reloadOnce,
    onRegisteredSW(_url, r) {
      registration = r;
      if (!r) return;
      const check = () => {
        if (navigator.onLine) r.update().catch(() => undefined);
      };
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") check();
      });
      window.setInterval(check, 30 * 60 * 1000);
    },
  });
  // Ask the browser not to evict this origin's storage under pressure.
  navigator.storage?.persist?.().catch(() => undefined);
}

export type UpdateCheck = "updating" | "latest" | "offline" | "unavailable";

/** Manual check from Settings. "updating" means a reload into the new build follows. */
export async function checkForUpdate(): Promise<UpdateCheck> {
  if (!navigator.onLine) return "offline";
  if (!registration) return "unavailable";
  try {
    await registration.update();
  } catch {
    return "offline";
  }
  return registration.installing || registration.waiting ? "updating" : "latest";
}
