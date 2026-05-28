import { useEffect, useState } from "react";

// Auto-cycles an index 0..length-1 on an interval — drives a looping "demo" of
// a technique's signature motion (window expand/shrink, pointers converging),
// so a pattern's explanatory phrase ("expand right · shrink left") is SHOWN as
// motion, not just stated. Part of the design language for pattern cards.
//
// - `enabled` lets the host pause the loop when the card isn't on screen.
// - Pauses while the tab is hidden, and respects prefers-reduced-motion
//   (returns a static frame) for accessibility.
// - HOLD TO PAUSE (general rule): pressing — mouse or touch — freezes the loop
//   so a frame can be studied; releasing resumes it.
// - Runs a touch slower than the requested interval (global SPEED factor) so
//   the motion is easier to follow.
const SPEED = 1.3; // >1 = slower; applied to every demo's interval

export function useDemoLoop(length, { interval = 1300, enabled = true } = {}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!enabled || length <= 1) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const tick = Math.round(interval * SPEED);
    let id = null;
    let held = false;
    const start = () => {
      if (id == null && !held && !document.hidden) {
        id = setInterval(() => setI((p) => (p + 1) % length), tick);
      }
    };
    const stop = () => {
      if (id != null) {
        clearInterval(id);
        id = null;
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onHoldStart = () => {
      held = true;
      stop();
    };
    const onHoldEnd = () => {
      held = false;
      start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    // Pointer events cover mouse + touch + pen with one set of listeners.
    window.addEventListener("pointerdown", onHoldStart);
    window.addEventListener("pointerup", onHoldEnd);
    window.addEventListener("pointercancel", onHoldEnd);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointerdown", onHoldStart);
      window.removeEventListener("pointerup", onHoldEnd);
      window.removeEventListener("pointercancel", onHoldEnd);
    };
  }, [length, interval, enabled]);

  return i;
}
