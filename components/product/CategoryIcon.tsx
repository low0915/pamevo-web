import type { System } from "@/lib/products";

/**
 * Line drawings of the five product categories, plus "all".
 *
 * Each is an elevation of the thing itself rather than a pictogram of it: a
 * casement window with its mullion and transom, a two-panel sliding door, an
 * arched interior door with its grille, a double entrance door with its
 * medallion, a glazed gable sunroom. They are drawn on one 48-unit grid with a
 * non-scaling stroke, so the same drawing holds its line weight at 16px in the
 * sticky bar and at 44px in the category tiles.
 *
 * `currentColor` throughout, so a selected tile (ink ground, light type)
 * inverts its drawing with no extra work.
 */
const PATHS: Record<System, React.ReactNode> = {
  all: (
    <>
      <rect x="7" y="7" width="15" height="15" rx="2" />
      <rect x="26" y="7" width="15" height="15" rx="2" />
      <rect x="7" y="26" width="15" height="15" rx="2" />
      <rect x="26" y="26" width="15" height="15" rx="2" />
    </>
  ),
  window: (
    <>
      <rect x="8" y="5" width="32" height="38" rx="1.5" />
      <path d="M8 16h32M24 16v27" />
      <path d="M20 28v4M28 28v4" />
    </>
  ),
  door: (
    <>
      <path d="M3 43h42" />
      <path d="M14 5h20M30 2l4 3-4 3" />
      <rect x="5" y="11" width="38" height="32" rx="1" />
      <rect x="8" y="14" width="17" height="29" />
      <rect x="23" y="14" width="17" height="29" />
      <path d="M21 26v5M27 26v5" />
    </>
  ),
  interior: (
    <>
      <path d="M8 43h32" />
      <path d="M13 43V20a11 11 0 0 1 22 0v23" />
      <path d="M24 9v34M13 22h22M13 32h22" />
    </>
  ),
  entrance: (
    <>
      <path d="M5 43h38M7 5h34" />
      <rect x="10" y="9" width="28" height="34" rx="1" />
      <path d="M24 9v34" />
      <path d="M24 19a5 5 0 0 1 0 10a5 5 0 0 1 0-10" />
      <path d="M20.5 32v4M27.5 32v4" />
    </>
  ),
  special: (
    <>
      <path d="M5 43h38" />
      <path d="M7 43V23L24 9l17 14v20" />
      <path d="M7 29h34" />
      <path d="M17.5 43V14.4M30.5 43V14.4" />
    </>
  ),
};

export function CategoryIcon({
  system,
  size = 20,
  className = "",
}: {
  system: System;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 [&_*]:[vector-effect:non-scaling-stroke] ${className}`}
    >
      {PATHS[system]}
    </svg>
  );
}
