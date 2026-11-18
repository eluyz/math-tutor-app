import { useLayoutEffect, useState } from "react";

/** Preserve only a pointer-initiated track transition, including native anchoring. */
export function useTrackScroll() {
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  useLayoutEffect(() => {
    if (!position) return;
    // Flush the new layout before restoring the user's offset. A single frame
    // also catches the browser's deferred anchor adjustment, before its paint.
    const restore = () => {
      document.documentElement.getBoundingClientRect();
      window.scrollTo({ ...position, behavior: "instant" });
    };
    restore();
    const frame = requestAnimationFrame(restore);
    return () => cancelAnimationFrame(frame);
  }, [position]);
  return (pointer: boolean) => {
    setPosition(pointer ? { left: window.scrollX, top: window.scrollY } : null);
  };
}
