// Renders a SHARED pattern. Content comes entirely from the pattern object, so
// any problem linked to this pattern shows the identical card. The footer
// surfaces every problem that uses this pattern, letting the user jump between
// them — the pattern becomes a hub.
export default function PatternCard({ pattern, problems = [], currentProblemId, onSelectProblem }) {
  const { name, subtitle, complexity, Viz } = pattern;
  return (
    <>
      <div className="card-strip">
        <span className="step">
          <span className="step-num">2</span>The Pattern
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#c2410c", fontWeight: 600 }}>
          TIME {complexity.time} · SPACE {complexity.space}
        </span>
      </div>
      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <p className="card-subtitle">{subtitle}</p>
        <div className="viz">
          <Viz />
        </div>
        {problems.length > 0 && (
          <div className="pattern-problems">
            <span className="pp-label">Problems using this pattern</span>
            <div className="pp-chips">
              {problems.map((p) => {
                const current = p.id === currentProblemId;
                return (
                  <button
                    key={p.id}
                    className={"pp-chip" + (current ? " current" : "")}
                    onClick={() => !current && onSelectProblem?.(p.id)}
                    disabled={current}
                    title={current ? "Current problem" : `Switch to ${p.title}`}
                  >
                    <span className="lc">#{p.leetcode}</span>
                    {p.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
