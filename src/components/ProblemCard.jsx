// Generic shell. The Problem viz IS problem-specific, so each problem provides
// its own ProblemViz component. The examples footer shows representative
// outcomes — including a failing case — so both pass and fail are visible here.
export default function ProblemCard({ problem }) {
  const { title, difficulty, tagline, ProblemViz, examples = [] } = problem;
  return (
    <>
      <div className="card-strip">
        <span className="step">
          <span className="step-num">1</span>The Problem
        </span>
        <span className="difficulty">{difficulty}</span>
      </div>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p className="card-subtitle">{tagline}</p>
        <div className="viz">
          <ProblemViz />
        </div>
        {examples.length > 0 && (
          <div className="examples">
            <span className="ex-label">Examples</span>
            <div className="ex-chips">
              {examples.map((e, i) => (
                <span key={i} className={"ex-chip " + (e.ok ? "ok" : "bad")}>
                  <span className="in">{e.input}</span>
                  <span className="res">→ {e.result}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
