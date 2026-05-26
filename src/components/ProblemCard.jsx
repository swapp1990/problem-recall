// Generic shell. The Problem viz IS problem-specific, so each problem provides
// its own ProblemViz component (built on the viz engine or raw SVG).
export default function ProblemCard({ problem }) {
  const { title, difficulty, tagline, ProblemViz } = problem;
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
      </div>
    </>
  );
}
