import { createPortal } from "react-dom";
import type { ReactNode } from "react";

/**
 * Portals to `document.body` rather than rendering in place. A plain
 * `position: fixed` overlay nested inside `.app__main` (which has
 * `-webkit-overflow-scrolling: touch`) doesn't reliably fix to the true
 * viewport on iOS Safari — on-device it painted behind `.tabbar` instead of
 * above it. Escaping that scrolling ancestor entirely sidesteps the bug.
 */
export default function Modal({ children, ariaLabel }: { children: ReactNode; ariaLabel: string }) {
  return createPortal(
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      {children}
    </div>,
    document.body,
  );
}
