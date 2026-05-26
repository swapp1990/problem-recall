import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { VizStage, VizArray, Pointer, Arc, rowLayout } from "../viz";

const WIDTH = 800;
const HEIGHT = 280;
const CELL = 70;
const GAP = 8;
const CELL_Y = 90;

function variantFor(i, state) {
  if (i === state.left || i === state.right) return "active";
  if (i < state.left || i > state.right) return "matched";
  return "default";
}

export default function SolutionCard({ solution, active }) {
  const { word, steps, result } = solution;
  const layout = useMemo(
    () => rowLayout({ count: word.length, cellSize: CELL, gap: GAP, width: WIDTH }),
    [word.length]
  );

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

  useEffect(() => {
    if (active) {
      setIdx(0);
      stop();
    }
  }, [active]);

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
  const merged = state.left === state.right;
  const items = word.map((ch, i) => ({ value: ch, variant: variantFor(i, state) }));

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
        <p className="card-subtitle">
          Watch left and right converge across{" "}
          <code style={{ fontFamily: "'JetBrains Mono', monospace", background: "#f5f5f4", padding: "1px 5px", borderRadius: "2px", fontSize: "14px" }}>
            "{word.join("")}"
          </code>
        </p>
        <div className="viz">
          <VizStage width={WIDTH} height={HEIGHT}>
            <VizArray items={items} layout={layout} y={CELL_Y} cellSize={CELL} showIndices />

            <Pointer
              centerX={layout.centerX(state.left)}
              labelY={48}
              tipY={CELL_Y - 5}
              label={merged ? "left = right" : "left"}
            />
            {!merged && <Pointer centerX={layout.centerX(state.right)} labelY={48} tipY={CELL_Y - 5} label="right" />}

            <AnimatePresence>
              {state.compare && (
                <Arc
                  key={`${state.left}-${state.right}`}
                  x1={layout.centerX(state.left)}
                  x2={layout.centerX(state.right)}
                  y={CELL_Y + CELL + 4}
                  depth={55}
                />
              )}
            </AnimatePresence>
          </VizStage>
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
