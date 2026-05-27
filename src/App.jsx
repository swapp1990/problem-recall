import { useEffect, useMemo, useState } from "react";
import { steps } from "./data/deck.js";
import { getProblem, defaultProblemId, problemsByPattern, allProblems } from "./data/problems.js";
import { getPattern } from "./data/patterns.js";
import Header from "./components/Header.jsx";
import ProblemCard from "./components/ProblemCard.jsx";
import PatternCard from "./components/PatternCard.jsx";
import SolutionCard from "./components/SolutionCard.jsx";
import Controls from "./components/Controls.jsx";

const LAST = steps.length - 1;

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [problemId, setProblemId] = useState(defaultProblemId);

  const problem = getProblem(problemId);
  const pattern = getPattern(problem.patternId);
  const related = problemsByPattern(problem.patternId);

  // All problems grouped by pattern, for the header picker (optgroups).
  const groups = useMemo(() => {
    const byPattern = new Map();
    for (const p of allProblems) {
      if (!byPattern.has(p.patternId)) byPattern.set(p.patternId, []);
      byPattern.get(p.patternId).push(p);
    }
    return [...byPattern.entries()].map(([patternId, problems]) => ({
      patternId,
      patternName: getPattern(patternId)?.name ?? patternId,
      problems,
    }));
  }, []);

  const goToStep = (n) => setCurrentStep(Math.min(Math.max(n, 0), LAST));

  const selectProblem = (id) => {
    setProblemId(id);
    setCurrentStep(0);
  };

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
    <ProblemCard key="problem" problem={problem} />,
    <PatternCard
      key="pattern"
      pattern={pattern}
      problems={related}
      currentProblemId={problemId}
      onSelectProblem={selectProblem}
    />,
    <SolutionCard key="solution" solution={problem.solution} active={currentStep === 2} />,
  ];

  return (
    <>
      <Header
        currentStep={currentStep}
        onJump={goToStep}
        groups={groups}
        currentProblemId={problemId}
        onSelectProblem={selectProblem}
      />
      <main>
        <div className="caption">
          <span className="caption-label">FAANG · LeetCode #{problem.leetcode}</span>
          <h1>
            {problem.title} <span className="em">— three-stage drill</span>
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
