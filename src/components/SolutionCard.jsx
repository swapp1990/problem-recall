import { useEffect, useRef, useState } from "react";

// Generic shell: owns step state + playback controls, delegates the actual
// drawing to the problem-provided solution.Viz scene ({ step }).
export default function SolutionCard({ solution, active }) {
  const { steps, result, subtitle, Viz } = solution;

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  const stop = () => {
    setPlaying(false);
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  // Reset when the card becomes active, and when the problem (solution) changes.
  useEffect(() => {
    if (active) {
      setIdx(0);
      stop();
    }
  }, [active]);

  useEffect(() => {
    setIdx(0);
    stop();
  }, [solution]);

  useEffect(() => () => stop(), []);

  const togglePlay = () => {
    if (playing) {
      stop();
      return;
    }
    setIdx((cur) => (cur === steps.length - 1 ? 0 : cur));
    setPlaying(true);
    timer.current = setInterval(() => {
      setIdx((cur) => {
        if (cur < steps.length - 1) return cur + 1;
        stop();
        return cur;
      });
    }, 1100);
  };

  const step = (delta) => {
    stop();
    setIdx((cur) => Math.min(Math.max(cur + delta, 0), steps.length - 1));
  };

  const state = steps[idx];

  return (
    <>
      <div className="card-strip">
        <span className="step">
          <span className="step-num">3</span>The Solution
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#15803d", fontWeight: 600 }}>
          RESULT → {result}
        </span>
      </div>
      <div className="card-body">
        <h2 className="card-title">Step through it</h2>
        <p className="card-subtitle">{subtitle}</p>
        <div className="viz">
          <Viz step={state} />
        </div>
        <div className="anim-controls">
          <button className="anim-btn" onClick={() => step(-1)} disabled={idx === 0} title="Previous step">‹</button>
          <span className="anim-step-label">
            Step <span className="current">{idx + 1}</span> / {steps.length}
          </span>
          <div className="anim-status">{state.status}</div>
          <button className="anim-btn play" onClick={togglePlay}>
            {playing ? "❚❚ Pause" : "▶ Play"}
          </button>
          <button className="anim-btn" onClick={() => step(1)} disabled={idx === steps.length - 1} title="Next step">›</button>
        </div>
      </div>
    </>
  );
}
