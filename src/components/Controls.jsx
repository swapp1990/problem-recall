import { steps } from "../data/deck.js";

export default function Controls({ currentStep, onPrev, onNext }) {
  const last = steps.length - 1;
  return (
    <>
      <div className="controls">
        <button className="btn" onClick={onPrev} disabled={currentStep === 0}>
          <span>←</span> Back <span className="kbd">←</span>
        </button>
        <button className="btn btn-primary" onClick={onNext} disabled={currentStep === last}>
          {currentStep < last ? (
            <>
              {steps[currentStep].nextLabel} <span className="kbd">→</span>
            </>
          ) : (
            <span style={{ opacity: 0.6 }}>Drill complete</span>
          )}
        </button>
      </div>
      <div className="hint">Arrow keys to navigate · escape to reset</div>
    </>
  );
}
