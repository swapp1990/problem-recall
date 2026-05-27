// Renders a code listing with line numbers. Lines in `highlight` (1-based) are
// emphasized as the "main pattern" — an accent background + left border — so
// the viewer can map the animated technique to the lines that implement it.
// `explain` is an optional "why it works" note shown below the code (it's about
// the algorithm, so it lives with the code, not on the Problem card).
export default function CodePanel({ code, highlight = [], note, explain, lang = "Python" }) {
  const lines = code.replace(/\n$/, "").split("\n");
  const hl = new Set(highlight);
  return (
    <aside className="solution-code">
      <div className="code-head">
        <span>{lang}</span>
        {note && <span className="code-note">▎{note}</span>}
      </div>
      <pre className="code-block">
        {lines.map((ln, i) => (
          <div key={i} className={"code-line" + (hl.has(i + 1) ? " hl" : "")}>
            <span className="code-ln">{i + 1}</span>
            <code>{ln || " "}</code>
          </div>
        ))}
      </pre>
      {explain && (
        <p className="code-explain">
          <span className="note-tag">why it works</span>
          {explain}
        </p>
      )}
    </aside>
  );
}
