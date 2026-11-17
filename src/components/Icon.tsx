// Small stroke icon set — 24px grid, inherits currentColor.

import type { ReactElement } from "react";

export type IconName = "guide" | "techniques" | "drills" | "progressions" | "session" | "settings" | "star" | "close";

const PATHS: Record<IconName, ReactElement> = {
  guide: (
    <>
      <path d="M12 6.5c-1.6-1.3-3.9-2-6.5-2H4v13h1.5c2.6 0 4.9.7 6.5 2 1.6-1.3 3.9-2 6.5-2H20v-13h-1.5c-2.6 0-4.9.7-6.5 2Z" />
      <path d="M12 6.5v13" />
    </>
  ),
  techniques: (
    <>
      <path d="M5.2 15.6c-1.6-3.3.2-7.6 4.3-9 3.9-1.3 8.6.6 9.2 4.8.5 3.6-2.6 6.9-6.9 6.9-3.2 0-5.4-.9-6.6-2.7Z" />
      <circle cx="12" cy="11.6" r="1.6" />
    </>
  ),
  drills: (
    <>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M12 13.5V10M10 3h4M18.5 6.5l1.2-1.2" />
    </>
  ),
  progressions: (
    <>
      <path d="M6 20.5 9.5 15 8 10.5 14 7l3-3.5" strokeDasharray="0" />
      <circle cx="6" cy="20.5" r="1.4" />
      <circle cx="9.5" cy="15" r="1.4" />
      <circle cx="8" cy="10.5" r="1.4" />
      <circle cx="14" cy="7" r="1.4" />
      <circle cx="17" cy="3.5" r="1.4" />
    </>
  ),
  session: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <path d="M4 9.5h16M8.5 3v4M15.5 3v4M9 14.5l2 2 4-4" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </>
  ),
  star: <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.3l-4.8 2.6.9-5.4-3.9-3.8 5.4-.8Z" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
};

export default function Icon({ name, filled = false, size = 22 }: { name: IconName; filled?: boolean; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
