import { Z } from "@/lib/z";

/** Brushed-metal grain. Fixed and pointer-events-none so it never repaints on scroll. */
export function Grain() {
  return (
    <div
      aria-hidden
      className="grain pointer-events-none fixed inset-0"
      style={{ zIndex: Z.grain }}
    />
  );
}
