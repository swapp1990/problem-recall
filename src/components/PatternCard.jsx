export default function PatternCard() {
  return (
    <>
      <div className="card-strip">
        <span className="step">
          <span className="step-num">2</span>The Pattern
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#c2410c", fontWeight: 600 }}>
          TIME O(n) · SPACE O(1)
        </span>
      </div>
      <div className="card-body">
        <h2 className="card-title">Two Pointers</h2>
        <p className="card-subtitle">Converging from both ends, comparing as they meet.</p>
        <div className="viz">
          <svg viewBox="0 0 800 380" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <g fontFamily="JetBrains Mono, monospace" fontSize="22" fill="#1a1814">
              <g transform="translate(90, 140)">
                <rect x="0" y="0" width="70" height="70" fill="#fef3e9" stroke="#c2410c" strokeWidth="2.5" />
                <text x="35" y="46" textAnchor="middle" fill="#c2410c" fontWeight="700">a</text>

                <rect x="70" y="0" width="70" height="70" fill="none" stroke="#1a1814" strokeWidth="1.5" />
                <text x="105" y="46" textAnchor="middle">b</text>

                <rect x="140" y="0" width="70" height="70" fill="none" stroke="#1a1814" strokeWidth="1.5" />
                <text x="175" y="46" textAnchor="middle">c</text>

                <rect x="210" y="0" width="70" height="70" fill="none" stroke="#1a1814" strokeWidth="1.5" strokeDasharray="3,3" />
                <text x="245" y="46" textAnchor="middle" fill="#a8a29e">…</text>

                <rect x="280" y="0" width="70" height="70" fill="none" stroke="#1a1814" strokeWidth="1.5" />
                <text x="315" y="46" textAnchor="middle">c</text>

                <rect x="350" y="0" width="70" height="70" fill="none" stroke="#1a1814" strokeWidth="1.5" />
                <text x="385" y="46" textAnchor="middle">b</text>

                <rect x="420" y="0" width="70" height="70" fill="#fef3e9" stroke="#c2410c" strokeWidth="2.5" />
                <text x="455" y="46" textAnchor="middle" fill="#c2410c" fontWeight="700">a</text>
              </g>
            </g>

            <g>
              <text x="125" y="80" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="700" fill="#c2410c">left</text>
              <path d="M 125 90 L 125 130" stroke="#c2410c" strokeWidth="2.5" fill="none" markerEnd="url(#arrDown2)" />
            </g>
            <g>
              <text x="545" y="80" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight="700" fill="#c2410c">right</text>
              <path d="M 545 90 L 545 130" stroke="#c2410c" strokeWidth="2.5" fill="none" markerEnd="url(#arrDown2)" />
            </g>

            <g stroke="#c2410c" strokeWidth="2" fill="none" strokeDasharray="5,4">
              <path d="M 165 245 L 230 245" markerEnd="url(#arrRight2)" />
              <path d="M 505 245 L 440 245" markerEnd="url(#arrLeft2)" />
            </g>

            <g>
              <path d="M 125 220 Q 335 320 545 220" stroke="#15803d" strokeWidth="1.5" fill="none" strokeDasharray="4,4" />
              <text x="335" y="335" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="16" fill="#15803d">compare → if equal, move both inward</text>
            </g>

            <text x="400" y="60" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#57534e">loop while left &lt; right</text>

            <defs>
              <marker id="arrDown2" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#c2410c" transform="rotate(90 5 5)" />
              </marker>
              <marker id="arrRight2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#c2410c" />
              </marker>
              <marker id="arrLeft2" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 10 0 L 0 5 L 10 10 z" fill="#c2410c" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>
    </>
  );
}
