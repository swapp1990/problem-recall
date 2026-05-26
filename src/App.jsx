import { useEffect, useState } from "react";
import { steps } from "./data.js";
import Header from "./components/Header.jsx";
import ProblemCard from "./components/ProblemCard.jsx";
import PatternCard from "./components/PatternCard.jsx";
import SolutionCard from "./components/SolutionCard.jsx";
import Controls from "./components/Controls.jsx";

const LAST = steps.length - 1;

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);

  const goToStep = (n) => setCurrentStep(Math.min(Math.max(n, 0), LAST));

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "ArrowRight") goToStep(currentStep + 1);
      else if (e.code === "ArrowLeft") goToStep(currentStep - 1);
      else if (e.code === "Escape") goToStep(0);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [currentStep]);

  const cardContent = [
    <ProblemCard key="problem" />,
    <PatternCard key="pattern" />,
    <SolutionCard key="solution" active={currentStep === 2} />,
  ];

  return (
    <>
      <Header currentStep={currentStep} onJump={goToStep} />
      <main>
        <div className="caption">
          <span className="caption-label">FAANG · LeetCode #125</span>
          <h1>
            Valid Palindrome <span className="em">— three-stage drill</span>
          </h1>
        </div>

        <div className="stage">
          <div className="card-deck">
            {cardContent.map((card, i) => {
              const cls =
                "card" +
                (i === currentStep ? " active" : "") +
                (i < currentStep ? " previous" : "");
              return (
                <div key={i} className={cls}>
                  {card}
                </div>
              );
            })}
          </div>

          <Controls
            currentStep={currentStep}
            onPrev={() => goToStep(currentStep - 1)}
            onNext={() => goToStep(currentStep + 1)}
          />
        </div>
      </main>
    </>
  );
}
