import { VizStage, Interval, Caption } from "../../viz";

const W = 760;
const H = 320;
const LO = 0, HI = 14;
const AX0 = 80, AX1 = 712;
const sx = (v) => AX0 + ((v - LO) / (HI - LO)) * (AX1 - AX0);

// 3 employees, each with their own (already-sorted, non-overlapping) schedule.
// The free time is when NOBODY is working — gaps in the union of all schedules.
//
// E1: [1,3], [6,8]
// E2: [2,4], [7,11]
// E3: [9,12]
//
// Flatten + sort by start: [1,3],[2,4],[6,8],[7,11],[9,12]
// Merge:                   [1,4], [6,12]
// Free time (gaps between merged blocks): [4,6]
const SCHEDULES = [
  { who: "E1", blocks: [[1, 3], [6, 8]] },
  { who: "E2", blocks: [[2, 4], [7, 11]] },
  { who: "E3", blocks: [[9, 12]] },
];

// Flattened sequence with provenance — so we can colour bars by employee.
const FLAT = [
  { iv: [1, 3], who: "E1" },
  { iv: [2, 4], who: "E2" },
  { iv: [6, 8], who: "E1" },
  { iv: [7, 11], who: "E2" },
  { iv: [9, 12], who: "E3" },
];

const MERGED = [[1, 4], [6, 12]];
const FREE = [[4, 6]];

const lbl = (iv) => `[${iv[0]},${iv[1]}]`;

// cur = index into FLAT being absorbed · running = the open block currently
// being grown · merged = blocks already finalized · free = gaps emitted so far.
// `emit` flags the step that drops a new free interval.
const STEPS = [
  { phase: "given", cur: -1, running: null, merged: [], free: [], status: "given: 3 employees' schedules · find times when EVERYONE is free" },
  { phase: "flatten", cur: -1, running: null, merged: [], free: [], status: "flatten all blocks into one list, sort by start — now overlap = neighbour" },
  { phase: "merge", cur: 0, running: [1, 3], merged: [], free: [], status: "open the running block with [1,3] (E1)" },
  { phase: "merge", cur: 1, running: [1, 4], merged: [], free: [], status: "[2,4] (E2) overlaps · extend running end to max(3,4)=4" },
  { phase: "gap", cur: 2, running: [6, 8], merged: [[1, 4]], free: [[4, 6]], emit: true, status: "[6,8] (E1) starts at 6 > running.end 4 → close [1,4], emit FREE [4,6] · open [6,8]" },
  { phase: "merge", cur: 3, running: [6, 11], merged: [[1, 4]], free: [[4, 6]], status: "[7,11] (E2) overlaps · extend running end to max(8,11)=11" },
  { phase: "merge", cur: 4, running: [6, 12], merged: [[1, 4]], free: [[4, 6]], status: "[9,12] (E3) overlaps · extend running end to max(11,12)=12" },
  { phase: "done", cur: -1, running: null, merged: MERGED, free: FREE, done: true, status: "done — busy windows [1,4] and [6,12] · only common free interval is [4,6]" },
];

function Axis({ y }) {
  return (
    <>
      <line x1={AX0} y1={y} x2={AX1} y2={y} stroke="#d6d3d1" strokeWidth={1.5} />
      {Array.from({ length: 8 }, (_, t) => {
        const v = t * 2;
        return (
          <g key={v}>
            <line x1={sx(v)} y1={y - 3} x2={sx(v)} y2={y + 3} stroke="#d6d3d1" strokeWidth={1} />
            <text x={sx(v)} y={y + 16} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#a8a29e">{v}</text>
          </g>
        );
      })}
    </>
  );
}

// Per-employee colour key — small dot in the bar's label so the lanes read
// across the merged view too.
const EMP_COLOR = { E1: "#c2410c", E2: "#0369a1", E3: "#7c3aed" };

function ProblemViz() {
  const laneY = [54, 80, 106];
  return (
    <VizStage width={W} height={310}>
      <text x={W / 2} y={28} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        find time windows when EVERY employee is free (gaps in the union of busy blocks)
      </text>
      {SCHEDULES.map((emp, idx) => (
        <g key={emp.who}>
          <text x={AX0 - 12} y={laneY[idx] + 14} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill={EMP_COLOR[emp.who]}>{emp.who}</text>
          {emp.blocks.map((iv, j) => (
            <Interval key={j} x1={sx(iv[0])} x2={sx(iv[1])} y={laneY[idx]} height={16} label={lbl(iv)} variant="default" />
          ))}
        </g>
      ))}
      <Axis y={146} />
      {/* The free gap, highlighted on the problem card. */}
      <rect x={sx(4)} y={170} width={sx(6) - sx(4)} height={26} rx={4} fill="#dcfce7" stroke="#15803d" strokeWidth={1.5} />
      <text x={(sx(4) + sx(6)) / 2} y={188} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#15803d">free [4,6]</text>
      <Caption joinX={W / 2} cy={252} label="return" value="[[4,6]]" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

function SolutionViz({ step }) {
  const laneY = [40, 60, 80];                        // per-employee rows (given)
  const FLAT_Y = 110;                                // flattened+sorted row
  const AXIS_Y = 152;
  const MERGE_Y = 174;                               // running + finalized merged
  const FREE_Y = 208;                                // emitted free intervals

  const titleByPhase = {
    given: "given — three separate schedules",
    flatten: "flatten + sort all blocks by start so overlap becomes adjacency",
    merge: "extend the running busy block whenever the next block overlaps",
    gap: "next block starts AFTER the running end → emit a FREE interval, open a new running block",
    done: "every gap between merged busy blocks is free time for everyone",
  };

  const showFlat = step.phase !== "given";
  const showMerge = step.phase === "merge" || step.phase === "gap" || step.phase === "done";

  return (
    <VizStage width={W} height={260}>
      <text x={W / 2} y={22} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#1a1814">
        {titleByPhase[step.phase]}
      </text>

      {/* Per-employee rows (fade after the flatten stage so the flattened row
          becomes the centre of attention). */}
      <g opacity={showFlat ? 0.35 : 1}>
        {SCHEDULES.map((emp, idx) => (
          <g key={emp.who}>
            <text x={AX0 - 12} y={laneY[idx] + 12} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={EMP_COLOR[emp.who]}>{emp.who}</text>
            {emp.blocks.map((iv, j) => (
              <Interval key={j} x1={sx(iv[0])} x2={sx(iv[1])} y={laneY[idx]} height={12} label={lbl(iv)} variant="default" />
            ))}
          </g>
        ))}
      </g>

      {/* Flattened + sorted row · active item glows orange, absorbed items dim. */}
      {showFlat && (
        <>
          <text x={AX0 - 12} y={FLAT_Y + 12} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#57534e">flat</text>
          {FLAT.map(({ iv, who }, i) => {
            let variant = "default";
            if (i === step.cur) variant = "active";
            else if (i < step.cur) variant = "done";
            return (
              <g key={i}>
                <Interval x1={sx(iv[0])} x2={sx(iv[1])} y={FLAT_Y} height={14} label={lbl(iv)} variant={variant} />
                {/* tiny employee dot above each flat block */}
                <circle cx={(sx(iv[0]) + sx(iv[1])) / 2} cy={FLAT_Y - 4} r={3} fill={EMP_COLOR[who]} />
              </g>
            );
          })}
        </>
      )}

      <Axis y={AXIS_Y} />

      {/* Merge row: finalized merged blocks (slate solid) + the running block
          (orange dashed border = still open). */}
      {showMerge && (
        <>
          <text x={AX0 - 12} y={MERGE_Y + 12} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#57534e">busy</text>
          {step.merged.map((iv, i) => (
            <Interval key={`m${i}`} x1={sx(iv[0])} x2={sx(iv[1])} y={MERGE_Y} height={14} label={lbl(iv)} variant="done" />
          ))}
          {step.running && (
            <Interval x1={sx(step.running[0])} x2={sx(step.running[1])} y={MERGE_Y} height={14} label={lbl(step.running)} variant="merged" />
          )}
        </>
      )}

      {/* Free intervals: green capsules emitted as the sweep finds gaps. */}
      {(step.phase === "gap" || step.phase === "done") && step.free.length > 0 && (
        <>
          <text x={AX0 - 12} y={FREE_Y + 12} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#15803d">free</text>
          {step.free.map((iv, i) => (
            <Interval key={`f${i}`} x1={sx(iv[0])} x2={sx(iv[1])} y={FREE_Y} height={14} label={lbl(iv)} variant="result" />
          ))}
        </>
      )}

      {step.phase === "done" && (
        <Caption joinX={W / 2} cy={244} label="return" value="[[4,6]]" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={14} height={26} />
      )}
    </VizStage>
  );
}

export default {
  id: "employee-free-time",
  leetcode: 759,
  title: "Employee Free Time",
  difficulty: "Hard",
  tagline: "Common free time across all employees — flatten everyone's schedule, merge, return the gaps.",
  patternId: "intervals",
  constraint: "Each employee's blocks are already sorted and non-overlapping; output free intervals must have positive length.",
  ProblemViz,
  examples: [
    { input: "[[[1,3],[6,8]],[[2,4],[7,11]],[[9,12]]]", result: "[[4,6]]", ok: true },
    { input: "[[[1,2],[5,6]],[[1,3]],[[4,10]]]", result: "[[3,4]]", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Three employees, one number line. Flatten every employee's blocks into one list, sort by start. Sweep left→right, extending one running 'busy' block whenever the next block overlaps; when the next block starts strictly AFTER the running end, the difference between them is free time — emit it and start a new running block. The 'common free' question reduces to 'gaps in the union' once you stop caring who is busy. O(N log N) where N is the total block count.",
    code: `import heapq

def employeeFreeTime(schedule):
    flat = sorted([iv for emp in schedule for iv in emp],
                  key=lambda iv: iv[0])
    free = []
    cur_s, cur_e = flat[0]
    for s, e in flat[1:]:
        if s > cur_e:                # gap — emit, then open new block
            free.append([cur_e, s])
            cur_s, cur_e = s, e
        else:                        # overlap — extend running block
            cur_e = max(cur_e, e)
    return free`,
    codeHighlight: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    codeNote: "flatten · sort · sweep · gaps are free time",
    cases: [
      { id: "main", label: "3 employees → [[4,6]] free", result: "[[4,6]]", ok: true, steps: STEPS },
    ],
  },
};
