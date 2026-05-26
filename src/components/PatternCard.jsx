// Renders a SHARED pattern. Content comes entirely from the pattern object, so
// any problem linked to this pattern shows the identical card.
export default function PatternCard({ pattern }) {
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
      </div>
    </>
  );
}
