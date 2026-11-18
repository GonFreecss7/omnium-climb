/**
 * Bottom safe-area handling for installed iOS web apps.
 *
 * In iOS's standalone mode the layout viewport can stop above the home
 * indicator (screen.height − innerHeight ≈ 62 pt on a 6.1" iPhone, a WebKit
 * bug Apple lists as fixed in Safari 26.1). The strip below is not paintable,
 * so adding env(safe-area-inset-bottom) there just lifts the tab bar and the
 * sheet buttons another 34 pt. When the viewport already ends short, the
 * inset is dropped; when it reaches the bottom (a fixed iOS, or Safari in the
 * browser), the real inset applies.
 */
export function syncSafeBottom(): void {
  const nav = navigator as Navigator & { standalone?: boolean };
  const standalone = nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  const root = document.documentElement;
  if (!standalone) {
    root.style.removeProperty("--safe-bottom");
    return;
  }
  const portrait = window.matchMedia("(orientation: portrait)").matches;
  const screenH = portrait ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
  const shortBy = screenH - window.innerHeight;
  // > 20 px short: the system already keeps us clear of the home indicator.
  // A keyboard (hundreds of px) also lands here, and there no inset is wanted either.
  if (shortBy > 20) root.style.setProperty("--safe-bottom", "0px");
  else root.style.removeProperty("--safe-bottom");
}

export function installSafeBottom(): void {
  syncSafeBottom();
  window.addEventListener("resize", syncSafeBottom);
  window.addEventListener("orientationchange", () => setTimeout(syncSafeBottom, 250));
}
