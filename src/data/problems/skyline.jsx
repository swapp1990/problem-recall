import { VizStage, Caption } from "../../viz";

const W = 760;
const AX0 = 64, AX1 = 712;
const X_LO = 0, X_HI = 14;
const sx = (v) => AX0 + ((v - X_LO) / (X_HI - X_LO)) * (AX1 - AX0);

// Pixel-to-height mapping: ground y = GROUND, max building height fills GROUND..GROUND-MAX_H_PX.
const GROUND = 200;
const MAX_H = 16;
const MAX_H_PX = 140;
const sy = (h) => GROUND - (h / MAX_H) * MAX_H_PX;

// 3 buildings — picks the simpler half of the LC classic example so the
// sweep stays short. Each building = [L, R, H]. Order doesn't matter to the
// algorithm — events are sorted independently.
const BUILDINGS = [
  { key: "A", L: 2, R: 9, H: 10 },
  { key: "B", L: 3, R: 7, H: 15 },
  { key: "C", L: 5, R: 12, H: 12 },
];

// Events: each building emits an enter (left edge) and a leave (right edge).
// Sorted by x ASC, with enters before leaves on ties (so a same-x enter/leave
// pair doesn't drop the skyline to zero between them).
const EVENTS = [
  { t: 2, role: "enter", key: "A", h: 10 },
  { t: 3, role: "enter", key: "B", h: 15 },
  { t: 5, role: "enter", key: "C", h: 12 },
  { t: 7, role: "leave", key: "B", h: 15 },
  { t: 9, role: "leave", key: "A", h: 10 },
  { t: 12, role: "leave", key: "C", h: 12 },
];

// Walk the sweep: active = sorted list of heights currently in the air.
// On each event, update active, recompute max, and emit a key point iff
// the max changed.
const STEPS = [{ phase: "given", evIdx: -1, active: [], max: 0, prevMax: 0, keypoints: [], status: "given: 3 buildings · trace the silhouette (skyline)" }];

let active = [];
let prevMax = 0;
let kp = [];
EVENTS.forEach((ev, i) => {
  if (ev.role === "enter") {
    active = [...active, ev.h];
  } else {
    const j = active.indexOf(ev.h);
    if (j >= 0) {
      const next = [...active];
      next.splice(j, 1);
      active = next;
    }
  }
  active = [...active].sort((a, b) => b - a);
  const curMax = active.length ? active[0] : 0;
  const changed = curMax !== prevMax;
  const newKp = changed ? [...kp, [ev.t, curMax]] : kp;
  STEPS.push({
    phase: changed ? "emit" : "scan",
    evIdx: i,
    active: [...active],
    max: curMax,
    prevMax,
    keypoints: newKp,
    status: changed
      ? `t=${ev.t} · ${ev.role} ${ev.key} (h=${ev.h}) · max ${prevMax}→${curMax} CHANGED · emit [${ev.t},${curMax}]`
      : `t=${ev.t} · ${ev.role} ${ev.key} (h=${ev.h}) · max stays ${curMax} · no key point`,
  });
  prevMax = curMax;
  kp = newKp;
});

STEPS.push({ phase: "done", evIdx: EVENTS.length - 1, active: [], max: 0, prevMax: 0, keypoints: kp, done: true, status: `done — ${kp.length} key points trace the silhouette` });

const BLD_COLOR = { A: "#fb923c", B: "#a78bfa", C: "#34d399" };
const BLD_STROKE = { A: "#c2410c", B: "#7c3aed", C: "#059669" };

function Axis({ y, ticks = 8 }) {
  return (
    <>
      <line x1={AX0} y1={y} x2={AX1} y2={y} stroke="#1a1814" strokeWidth={1.5} />
      {Array.from({ length: ticks }, (_, t) => {
        const v = t * 2;
        return (
          <g key={v}>
            <line x1={sx(v)} y1={y - 3} x2={sx(v)} y2={y + 3} stroke="#1a1814" strokeWidth={1} />
            <text x={sx(v)} y={y + 16} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#57534e">{v}</text>
          </g>
        );
      })}
    </>
  );
}

function Building({ L, R, H, color, stroke, opacity = 0.7, label }) {
  const x = sx(L);
  const w = sx(R) - sx(L);
  const y = sy(H);
  const h = GROUND - y;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={color} stroke={stroke} strokeWidth={1.5} opacity={opacity} />
      {label && <text x={x + w / 2} y={y + 14} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill={stroke}>{label}</text>}
    </g>
  );
}

// Skyline path: from the list of [x, h] key points, build the staircase
// polyline. A vertical step happens at every key point: go horizontally to x,
// then jump vertically to h.
function skylinePath(points, y0 = GROUND) {
  if (!points.length) return "";
  let d = `M ${AX0} ${y0}`;
  let prevH = 0;
  for (const [x, h] of points) {
    const px = sx(x);
    d += ` L ${px} ${sy(prevH)} L ${px} ${sy(h)}`;
    prevH = h;
  }
  d += ` L ${AX1} ${sy(prevH)}`;
  return d;
}

function ProblemViz() {
  return (
    <VizStage width={W} height={310}>
      <text x={W / 2} y={24} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        a city outline — trace the silhouette (skyline) of overlapping buildings
      </text>
      {BUILDINGS.map((b) => (
        <Building key={b.key} L={b.L} R={b.R} H={b.H} color={BLD_COLOR[b.key]} stroke={BLD_STROKE[b.key]} opacity={0.4} label={`${b.key} h=${b.H}`} />
      ))}
      {/* Final skyline overlaid as bold black staircase. */}
      <path d={skylinePath(STEPS[STEPS.length - 1].keypoints)} fill="none" stroke="#1a1814" strokeWidth={3} strokeLinejoin="miter" />
      <Axis y={GROUND} />
      <Caption joinX={W / 2} cy={262} label="return" value="[[2,10],[3,15],[7,12],[12,0]]" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={16} height={30} />
    </VizStage>
  );
}

function SolutionViz({ step }) {
  const titleByPhase = {
    given: "given — 3 overlapping rectangles. the outline is the union's upper boundary.",
    scan: "next event · update active heights · max didn't change → no key point",
    emit: "next event · max height changed → emit a (x, max) key point",
    done: "skyline traced",
  };

  const ev = step.evIdx >= 0 ? EVENTS[step.evIdx] : null;
  const activeKeys = ev ? new Set() : new Set();
  // Compute which buildings are active right after this step (entered and not yet left).
  if (step.evIdx >= 0) {
    for (let i = 0; i <= step.evIdx; i++) {
      const e = EVENTS[i];
      if (e.role === "enter") activeKeys.add(e.key);
      if (e.role === "leave") activeKeys.delete(e.key);
    }
  }

  return (
    <VizStage width={W} height={304}>
      <text x={W / 2} y={20} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#1a1814">
        {titleByPhase[step.phase]}
      </text>

      {/* All buildings rendered translucent · active ones get full opacity. */}
      {BUILDINGS.map((b) => {
        const isActive = activeKeys.has(b.key);
        const isEvent = ev && ev.key === b.key;
        return (
          <Building
            key={b.key}
            L={b.L}
            R={b.R}
            H={b.H}
            color={BLD_COLOR[b.key]}
            stroke={isEvent ? "#b91c1c" : BLD_STROKE[b.key]}
            opacity={step.phase === "done" ? 0.25 : isActive ? 0.55 : 0.18}
            label={`${b.key} h=${b.H}`}
          />
        );
      })}

      {/* Skyline-in-progress: bold black staircase showing the key points emitted so far. */}
      {step.keypoints.length > 0 && (
        <path
          d={skylinePath(step.keypoints)}
          fill="none"
          stroke="#1a1814"
          strokeWidth={3}
          strokeLinejoin="miter"
        />
      )}
      {/* Dots at each key point so the emitted points are countable. */}
      {step.keypoints.map(([x, h], i) => (
        <circle key={i} cx={sx(x)} cy={sy(h)} r={4} fill="#15803d" stroke="#fff" strokeWidth={1.5} />
      ))}

      {/* Sweep line · vertical red marker at the current event's x. */}
      {ev && step.phase !== "done" && (
        <g>
          <line x1={sx(ev.t)} y1={20} x2={sx(ev.t)} y2={GROUND + 4} stroke="#b91c1c" strokeWidth={2} strokeDasharray="4 4" />
          <text x={sx(ev.t)} y={32} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" fill="#b91c1c">
            {ev.role} {ev.key} (h={ev.h})
          </text>
        </g>
      )}

      <Axis y={GROUND} />

      {/* Active-heights box · the heap is just a sorted list of heights right now. */}
      <g>
        <text x={AX0 - 12} y={GROUND + 38} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">active</text>
        {step.active.length === 0 ? (
          <text x={AX0} y={GROUND + 38} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#a8a29e">∅</text>
        ) : (
          step.active.map((h, i) => (
            <g key={i}>
              <rect x={AX0 + i * 46} y={GROUND + 26} width={40} height={20} rx={4} fill={i === 0 ? "#fed7aa" : "#f5f5f4"} stroke={i === 0 ? "#c2410c" : "#d6d3d1"} strokeWidth={1.5} />
              <text x={AX0 + i * 46 + 20} y={GROUND + 40} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight={i === 0 ? 700 : 500} fill={i === 0 ? "#c2410c" : "#57534e"}>{h}</text>
            </g>
          ))
        )}
        <text x={AX0 + step.active.length * 46 + 12} y={GROUND + 40} fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight={700} fill="#c2410c">
          max = {step.max}
        </text>
      </g>

      {/* Was the max change captured this step? */}
      {step.phase === "emit" && ev && (
        <text x={W - 16} y={GROUND + 40} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight={700} fill="#15803d">
          emit [{ev.t}, {step.max}]
        </text>
      )}
    </VizStage>
  );
}

export default {
  id: "skyline",
  leetcode: 218,
  title: "The Skyline Problem",
  difficulty: "Hard",
  tagline: "Outline of overlapping rectangles — a sweep over edge events tracking the running max height.",
  patternId: "intervals",
  constraint: "Output is a list of [x, h] key points marking where the silhouette height changes. The last point has height 0.",
  ProblemViz,
  examples: [
    { input: "[[2,9,10],[3,7,15],[5,12,12]]", result: "[[2,10],[3,15],[7,12],[12,0]]", ok: true },
    { input: "[[0,2,3],[2,5,3]]", result: "[[0,3],[5,0]]", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Convert every building into two events on the x-axis: a LEFT (height enters) and a RIGHT (height leaves). Sort events left→right (enters before leaves on ties so a back-to-back pair doesn't dip to 0). Sweep, keeping a multiset of currently-active heights. After each event, the current skyline height is just the max of that set. If the max changed compared to before, emit a key point at (event.x, newMax). The active set is usually a max-heap (with lazy deletion), but the geometric idea is the picture above — the heap is just bookkeeping. O(n log n).",
    code: `import heapq

def getSkyline(buildings):
    events = []
    for L, R, H in buildings:
        events.append((L,  -H, R))   # enter — negative H so max-heap via min-heap
        events.append((R,    0, 0))  # leave — placeholder, heights expire by R
    events.sort()

    out = []
    heap = [(0, float('inf'))]       # (−height, expiry)
    for x, negH, R in events:
        if negH:                     # enter event
            heapq.heappush(heap, (negH, R))
        # lazy-delete: pop heights whose building has ended at or before x
        while heap[0][1] <= x:
            heapq.heappop(heap)
        h = -heap[0][0]
        if not out or out[-1][1] != h:
            out.append([x, h])
    return out`,
    codeHighlight: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    codeNote: "events · sort · running max via heap · emit on change",
    cases: [
      { id: "main", label: "3 overlapping buildings → 4 key points", result: "[[2,10],[3,15],[7,12],[12,0]]", ok: true, steps: STEPS },
    ],
  },
};
