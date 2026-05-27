import { steps } from "../data/deck.js";

export default function Header({ currentStep, onJump, groups = [], currentProblemId, onSelectProblem }) {
  return (
    <header>
      <div className="header-inner">
        <div className="logo">
          Problem<span className="dot">.</span>Recall
        </div>
        <div className="header-meta">
          {groups.length > 0 && (
            <select
              className="problem-select"
              value={currentProblemId}
              onChange={(e) => onSelectProblem(e.target.value)}
              aria-label="Choose a problem"
            >
              {groups.map((g) => (
                <optgroup key={g.patternId} label={g.patternName}>
                  {g.problems.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.leetcode} · {p.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
          <div className="progress">
            {steps.map((s, i) => (
              <div
                key={s.name}
                className={
                  "progress-dot" +
                  (i === currentStep ? " active" : "") +
                  (i < currentStep ? " completed" : "")
                }
                onClick={() => onJump(i)}
              />
            ))}
            <span className="progress-label">{steps[currentStep].name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
