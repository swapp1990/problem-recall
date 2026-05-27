import { useEffect, useState } from "react";

// Auto-cycles an index 0..length-1 on an interval — drives a looping "demo" of
// a technique's signature motion (window expand/shrink, pointers converging),
// so a pattern's explanatory phrase ("expand right · shrink left") is SHOWN as
// motion, not just stated. Part of the design language for pattern cards.
//
// - `enabled` lets the host pause the loop when the card isn't on screen.
// - Pauses while the tab is hidden, and respects prefers-reduced-motion
//   (returns a static frame) for accessibility.
export function useDemoLoop(length, { interval = 1300, enabled = true } = {}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!enabled || length <= 1) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let id = null;
    const start = () => {
      if (id == null) id = setInterval(() => setI((p) => (p + 1) % length), interval);
    };
    const stop = () => {
      if (id != null) {
        clearInterval(id);
        id = null;
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [length, interval, enabled]);

  return i;
}
