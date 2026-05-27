import { useEffect, useRef, useState } from "react";
import CodePanel from "./CodePanel.jsx";

// Generic shell: owns case selection + step state + playback controls, and
// delegates drawing to the problem-provided solution.Viz scene ({ data, step }).
// Each problem supplies multiple cases (e.g. a passing and a failing run) and,
// optionally, the full source with the pattern lines highlighted.
export default function SolutionCard({ solution, active }) {
  const { cases, Viz, code, codeHighlight, codeNote } = solution;

  const [caseIdx, setCaseIdx] = useState(0);
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

  const reset = () => {
    setIdx(0);
    stop();
  };

  // Reset when the card becomes active, and when the problem (solution) changes.
  useEffect(() => {
    if (active) {
      setCaseIdx(0);
      reset();
    }
  }, [active]);

  useEffect(() => {
    setCaseIdx(0);
    reset();
  }, [solution]);

  useEffect(() => () => stop(), []);

  const current = cases[caseIdx];
  const steps = current.steps;

  const selectCase = (i) => {
    setCaseIdx(i);
    reset();
  };

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
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: current.ok ? "#15803d" : "#b91c1c", fontWeight: 600 }}>
          RESULT → {current.result}
        </span>
      </div>
      <div className={"card-body" + (code ? " solution-body" : "")}>
        <div className="solution-main">
          <h2 className="card-title">Step through it</h2>
          <div className="case-toggle">
            {cases.map((c, i) => (
              <button key={c.id} className={"case-pill" + (i === caseIdx ? " active" : "")} onClick={() => selectCase(i)}>
                <span className="dot" style={{ background: c.ok ? "#15803d" : "#b91c1c" }} />
                {c.label}
                <span className="res">{c.ok ? "✓" : "✗"}</span>
              </button>
            ))}
          </div>
          <div className="viz">
            <Viz data={current} step={state} />
          </div>
          <div className="anim-status">{state.status}</div>
          <div className="anim-controls">
            <button className="anim-btn" onClick={() => step(-1)} disabled={idx === 0} title="Previous step">‹</button>
            <span className="anim-step-label">
              Step <span className="current">{idx + 1}</span> / {steps.length}
            </span>
            <button className="anim-btn play" onClick={togglePlay}>
              {playing ? "❚❚ Pause" : "▶ Play"}
            </button>
            <button className="anim-btn" onClick={() => step(1)} disabled={idx === steps.length - 1} title="Next step">›</button>
          </div>
        </div>
        {code && <CodePanel code={code} highlight={codeHighlight} note={codeNote} />}
      </div>
    </>
  );
}
