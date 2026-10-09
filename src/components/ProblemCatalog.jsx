export default function ProblemCatalog({ groups, currentProblemId, onSelectProblem }) {
  return (
    <section className="catalog">
      <h2>All problems by pattern</h2>
      {groups.map((g) => (
        <div key={g.patternId} className="catalog-pattern">
          <h3>{g.patternName}</h3>
          <ul>
            {g.problems.map((p) => (
              <li key={p.id}>
                <a
                  href={`/p/${p.id}`}
                  aria-current={p.id === currentProblemId ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectProblem(p.id);
                  }}
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
