// Per-problem card. The Problem viz IS problem-specific (the palindrome mirror),
// unlike the shared Pattern card.
export default function ProblemCard({ problem }) {
  const { title, difficulty, tagline } = problem;
  const cells = problem.problem.normalized.split("");
  const pivotIndex = problem.problem.pivotIndex;

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
          <svg viewBox="0 0 800 380" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <text x="60" y="50" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e" letterSpacing="2">INPUT  s =</text>

            <g fontFamily="JetBrains Mono, monospace" fontSize="24" fill="#1a1814">
              <text x="180" y="55" fontWeight="600">"A man, a plan, a canal: Panama"</text>
            </g>

            <g stroke="#a8a29e" strokeWidth="1.5" fill="none" strokeDasharray="3,4">
              <path d="M 400 80 L 400 130" markerEnd="url(#arrowGray)" />
            </g>
            <text x="420" y="110" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#57534e">strip non-alphanumeric, lowercase</text>

            <g fontFamily="JetBrains Mono, monospace" fontSize="20" fill="#1a1814">
              <g transform="translate(80, 160)">
                {cells.map((ch, i) => {
                  const x = i * 30;
                  const pivot = i === pivotIndex;
                  return (
                    <g key={i}>
                      <rect
                        x={x}
                        y="0"
                        width="30"
                        height="40"
                        fill={pivot ? "#fef3e9" : "none"}
                        stroke={pivot ? "#c2410c" : "#1a1814"}
                        strokeWidth={pivot ? "2" : "1.5"}
                      />
                      <text
                        x={x + 15}
                        y="27"
                        textAnchor="middle"
                        fill={pivot ? "#c2410c" : undefined}
                        fontWeight={pivot ? "700" : undefined}
                      >
                        {ch}
                      </text>
                    </g>
                  );
                })}
              </g>
            </g>

            <g stroke="#c2410c" strokeWidth="2" fill="none">
              <path d="M 80 215 L 80 230 L 380 230 L 380 215" />
              <path d="M 410 215 L 410 230 L 710 230 L 710 215" />
            </g>
            <g fontFamily="Fraunces, serif" fontSize="14" fontStyle="italic" fill="#c2410c">
              <text x="230" y="252" textAnchor="middle">left half</text>
              <text x="560" y="252" textAnchor="middle">right half (reversed)</text>
            </g>
            <text x="395" y="225" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#a8a29e">pivot</text>

            <g stroke="#15803d" strokeWidth="1.5" fill="none">
              <path d="M 95 280 Q 395 320 695 280" markerEnd="url(#arrowGreen)" markerStart="url(#arrowGreenStart)" />
            </g>
            <text x="395" y="335" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="14" fill="#15803d">mirror match</text>

            <g transform="translate(80, 350)">
              <text x="0" y="0" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#57534e" letterSpacing="2">RETURN</text>
              <rect x="100" y="-18" width="80" height="26" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" rx="3" />
              <text x="140" y="1" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" fontWeight="700" fill="#15803d">true</text>
            </g>

            <defs>
              <marker id="arrowGray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#a8a29e" />
              </marker>
              <marker id="arrowGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#15803d" />
              </marker>
              <marker id="arrowGreenStart" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 10 0 L 0 5 L 10 10 z" fill="#15803d" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
    </>
  );
}
