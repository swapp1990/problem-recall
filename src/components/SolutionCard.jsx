import { useEffect, useRef, useState } from "react";
import { word, animSteps } from "../data.js";

const CELL_W = 70;
const CELL_H = 70;
const START_X = (800 - word.length * CELL_W) / 2;
const CELL_Y = 90;

export default function SolutionCard({ active }) {
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

  // Reset to the first step whenever the card becomes active.
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
    setIdx((cur) => (cur === animSteps.length - 1 ? 0 : cur));
    setPlaying(true);
    timer.current = setInterval(() => {
      setIdx((cur) => {
        if (cur < animSteps.length - 1) return cur + 1;
        stop();
        return cur;
      });
    }, 1100);
  };

  const step = (delta) => {
    stop();
    setIdx((cur) => Math.min(Math.max(cur + delta, 0), animSteps.length - 1));
  };

  const state = animSteps[idx];
  const leftX = START_X + state.left * CELL_W + CELL_W / 2;
  const rightX = START_X + state.right * CELL_W + CELL_W / 2;
  const merged = state.left === state.right;
  const arcMidX = (leftX + rightX) / 2;
  const arcColor = "#15803d"; // every step in this drill matches

  return (
    <>
      <div className="card-strip">
        <span className="step">
          <span className="step-num">3</span>The Solution
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#15803d", fontWeight: 600 }}>
          RESULT → true
        </span>
      </div>
      <div className="card-body">
        <h2 className="card-title">Step through it</h2>
        <p className="card-subtitle">
          Watch left and right converge across{" "}
          <code style={{ fontFamily: "'JetBrains Mono', monospace", background: "#f5f5f4", padding: "1px 5px", borderRadius: "2px", fontSize: "14px" }}>
            "racecar"
          </code>
        </p>
        <div className="viz">
          <svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <g>
              {word.map((ch, i) => {
                const x = START_X + i * CELL_W;
                const isPointer = i === state.left || i === state.right;
                const isMatched = i < state.left || i > state.right;
                const fill = isPointer ? "#fef3e9" : isMatched ? "#f5f5f4" : "none";
                const stroke = isPointer ? "#c2410c" : isMatched ? "#a8a29e" : "#1a1814";
                const strokeW = isPointer ? 2.5 : 1.5;
                const textFill = isPointer ? "#c2410c" : isMatched ? "#a8a29e" : "#1a1814";
                const fontW = isPointer ? 700 : isMatched ? 400 : 500;
                return (
                  <g key={i}>
                    <rect x={x} y={CELL_Y} width={CELL_W} height={CELL_H} fill={fill} stroke={stroke} strokeWidth={strokeW} />
                    <text x={x + CELL_W / 2} y={CELL_Y + 46} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="24" fill={textFill} fontWeight={fontW}>
                      {ch}
                    </text>
                    <text x={x + CELL_W / 2} y={CELL_Y + CELL_H + 16} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#a8a29e">
                      {i}
                    </text>
                  </g>
                );
              })}
            </g>

            <g>
              <text x={leftX} y="50" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill="#c2410c">
                {merged ? "left = right" : "left"}
              </text>
              <path d={`M ${leftX} 60 L ${leftX} ${CELL_Y - 5}`} stroke="#c2410c" strokeWidth="2.5" fill="none" markerEnd="url(#arrDownSol)" />
            </g>

            {!merged && (
              <g>
                <text x={rightX} y="50" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill="#c2410c">
                  right
                </text>
                <path d={`M ${rightX} 60 L ${rightX} ${CELL_Y - 5}`} stroke="#c2410c" strokeWidth="2.5" fill="none" markerEnd="url(#arrDownSol)" />
              </g>
            )}

            {state.compare && (
              <path
                d={`M ${leftX} ${CELL_Y + CELL_H + 4} Q ${arcMidX} ${CELL_Y + CELL_H + 65} ${rightX} ${CELL_Y + CELL_H + 4}`}
                stroke={arcColor}
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="4,4"
              />
            )}

            <defs>
              <marker id="arrDownSol" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#c2410c" transform="rotate(90 5 5)" />
              </marker>
            </defs>
          </svg>
        </div>
        <div className="anim-controls">
          <button className="anim-btn" onClick={() => step(-1)} disabled={idx === 0} title="Previous step">‹</button>
          <span className="anim-step-label">
            Step <span className="current">{idx + 1}</span> / {animSteps.length}
          </span>
          <div className="anim-status">{state.status}</div>
          <button className="anim-btn play" onClick={togglePlay}>
            {playing ? "❚❚ Pause" : "▶ Play"}
          </button>
          <button className="anim-btn" onClick={() => step(1)} disabled={idx === animSteps.length - 1} title="Next step">›</button>
        </div>
      </div>
    </>
  );
}
