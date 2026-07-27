import { useEffect } from "react";

export function useScrollToTarget(scrollTarget: string | null, clear: () => void) {
  useEffect(() => {
    if (!scrollTarget) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
      clear();
    });
    return () => cancelAnimationFrame(frame);
  }, [scrollTarget, clear]);
}
