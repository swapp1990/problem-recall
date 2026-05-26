import { steps } from "../data.js";

export default function Header({ currentStep, onJump }) {
  return (
    <header>
      <div className="header-inner">
        <div className="logo">
          Problem<span className="dot">.</span>Recall
        </div>
        <div className="header-meta">
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
