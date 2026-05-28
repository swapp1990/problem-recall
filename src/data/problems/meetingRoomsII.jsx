import { VizStage, Interval, Caption } from "../../viz";

const W = 760;
const H = 320;
const LO = 0, HI = 14;
const AX0 = 64, AX1 = 712;
const sx = (v) => AX0 + ((v - LO) / (HI - LO)) * (AX1 - AX0);

// 4 meetings · max concurrent = 3 at time 5 → answer 3.
// Picked so the peak is clearly visible (three bars stacked at t=5..6).
const MEETINGS = [
  { key: "A", iv: [0, 8] },
  { key: "B", iv: [2, 6] },
  { key: "C", iv: [5, 10] },
  { key: "D", iv: [9, 12] },
];

// Events: each meeting contributes a (+1) at start and a (−1) at end.
// On a tie the (−1) sorts first so a meeting ending at t and another starting
// at t share a room (half-open intervals). Pre-sorted here for clarity.
const EVENTS = [
  { t: 0, d: +1, key: "A", role: "start" },
  { t: 2, d: +1, key: "B", role: "start" },
  { t: 5, d: +1, key: "C", role: "start" },
  { t: 6, d: -1, key: "B", role: "end" },
  { t: 8, d: -1, key: "A", role: "end" },
  { t: 9, d: +1, key: "D", role: "start" },
  { t: 10, d: -1, key: "C", role: "end" },
  { t: 12, d: -1, key: "D", role: "end" },
];

// Walk the sweep: rolling count `rooms`, running max `best`. Each step
// highlights one event and the meeting it touches.
const STEPS = [(() => ({ phase: "given", evIdx: -1, rooms: 0, best: 0, status: "given: 4 meetings · how many rooms do we need so every meeting has one?" }))()];

// Add an "events" phase before the sweep so the audience sees the conversion.
STEPS.push({ phase: "events", evIdx: -1, rooms: 0, best: 0, status: "split each meeting into two events on a timeline · start = +1 room, end = −1 room" });

// One step per event, accumulating rooms + best.
let rooms = 0, best = 0;
EVENTS.forEach((ev, i) => {
  rooms += ev.d;
  best = Math.max(best, rooms);
  const sign = ev.d > 0 ? "+1" : "−1";
  const peak = rooms === best && ev.d > 0 ? " · NEW peak" : "";
  STEPS.push({
    phase: "sweep",
    evIdx: i,
    rooms,
    best,
    status: `t=${ev.t} · ${ev.key} ${ev.role} (${sign}) · in-use ${rooms} · max so far ${best}${peak}`,
  });
});

STEPS.push({ phase: "done", evIdx: EVENTS.length - 1, rooms: 0, best, done: true, status: `done — the peak was ${best} concurrent meetings · need ${best} rooms` });

const lbl = (key, iv) => `${key} [${iv[0]},${iv[1]})`;

function Axis({ y, ticks = 8 }) {
  return (
    <>
      <line x1={AX0} y1={y} x2={AX1} y2={y} stroke="#d6d3d1" strokeWidth={1.5} />
      {Array.from({ length: ticks }, (_, t) => {
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

// Vertical event marker on the axis: an up-tick for +1 (room taken), down-tick
// for −1 (room freed). Active event is drawn solid + labelled; others sit
// faded in the background so the eye can place the current event in context.
function EventMark({ ev, active, used, y }) {
  const x = sx(ev.t);
  const up = ev.d > 0;
  const color = active ? (up ? "#c2410c" : "#15803d") : used ? "#d6d3d1" : "#e7e5e4";
  const len = active ? 18 : 10;
  const y1 = up ? y - len : y;
  const y2 = up ? y : y + len;
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={active ? 3 : 2} />
      {active && (
        <text
          x={x}
          y={up ? y - len - 6 : y + len + 12}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="10"
          fontWeight="700"
          fill={color}
        >
          {up ? "+1" : "−1"} {ev.key}
        </text>
      )}
    </g>
  );
}

function ProblemViz() {
  const laneY = [56, 78, 100, 122];
  return (
    <VizStage width={W} height={310}>
      <text x={W / 2} y={28} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        meetings can overlap — what's the fewest rooms that fits all of them?
      </text>
      <text x={AX0 - 12} y={laneY[1] + 14} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">meetings</text>
      {MEETINGS.map(({ key, iv }, idx) => (
        <Interval key={key} x1={sx(iv[0])} x2={sx(iv[1])} y={laneY[idx]} height={16} label={lbl(key, iv)} variant={idx < 3 ? "active" : "default"} />
      ))}
      <Axis y={158} />
      {/* Highlight the t=5..6 slice where A, B, C all overlap — the peak. */}
      <rect x={sx(5)} y={48} width={sx(6) - sx(5)} height={120} fill="#fed7aa" opacity="0.35" />
      <text x={(sx(5) + sx(6)) / 2} y={196} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#c2410c">
        at t=5 → 3 meetings are in progress at once
      </text>
      <Caption joinX={W / 2} cy={252} label="return" value="3" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

// Sorted starts/ends — the two arrays the code's `i` and `j` walk over.
// Derived from MEETINGS at module load. Kept here (not on STEPS) so the
// SolutionViz can show the static arrays once and animate the pointers.
const STARTS_VALS = MEETINGS.map((m) => m.iv[0]).sort((a, b) => a - b);  // [0, 2, 5, 9]
const ENDS_VALS = MEETINGS.map((m) => m.iv[1]).sort((a, b) => a - b);    // [6, 8, 10, 12]

// Derive (i, j) and the comparison that drove THIS step from the event index.
// In the two-pointer code, each iteration consumes one start (i++) OR one
// end (j++); the events list already orders them the same way the code walks.
// `exited` flips true once preI hits len(STARTS) — the code's while loop has
// terminated, but the events sweep keeps draining for visual completeness.
function ijForStep(step) {
  if (step.evIdx < 0) return { i: 0, j: 0, preI: 0, preJ: 0, ev: null, exited: false };
  let preI = 0, preJ = 0;
  for (let k = 0; k < step.evIdx; k++) {
    if (EVENTS[k].role === "start") preI++; else preJ++;
  }
  const ev = EVENTS[step.evIdx];
  if (preI >= STARTS_VALS.length) {
    return { i: preI, j: preJ, preI, preJ, ev, exited: true };
  }
  const i = ev.role === "start" ? preI + 1 : preI;
  const j = ev.role === "end" ? preJ + 1 : preJ;
  return { i, j, preI, preJ, ev, exited: false };
}

function SolutionViz({ step }) {
  const laneY = [42, 62, 82, 102];
  const AXIS_Y = 146;
  // Compact rooms counter (top-right) so the lower half is free for the
  // sorted-starts and sorted-ends arrays that the code's i/j walk over.
  const COUNTER_X = 470;
  const COUNTER_Y = 188;
  const ROOM_W = 24;
  const ROOM_H = 16;

  // Two sorted arrays mirroring the code · `i` points at the next unconsumed
  // start, `j` at the next unconsumed end. Each step advances ONE of them.
  const ARR_X0 = AX0;
  const CELL_W = 46;
  const CELL_H = 24;
  const STARTS_Y = 196;
  const ENDS_Y = 240;

  const titleByPhase = {
    given: "given — meetings as bars on a timeline",
    events: "convert each meeting to two events — a +1 at the start, a −1 at the end",
    sweep: "compare starts[i] vs ends[j] · the smaller one is the next event · advance that pointer",
    done: `peak was ${step.best} concurrent meetings — that's the answer`,
  };

  const activeEv = step.evIdx >= 0 ? EVENTS[step.evIdx] : null;
  const { i, j, preI, preJ, ev } = ijForStep(step);
  const showIJ = step.phase === "sweep" || step.phase === "done";
  const cmp = ev && (step.phase === "sweep")
    ? { a: STARTS_VALS[preI], b: ENDS_VALS[preJ], aLabel: `starts[${preI}]`, bLabel: `ends[${preJ}]`, startWon: ev.role === "start" }
    : null;

  return (
    <VizStage width={W} height={344}>
      <text x={W / 2} y={22} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#1a1814">
        {titleByPhase[step.phase]}
      </text>

      {/* Meetings sit above the axis · the active meeting (the one whose event
          we're processing this step) lights up orange or green depending on
          start vs end. */}
      <text x={AX0 - 12} y={laneY[1] + 12} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">meetings</text>
      {MEETINGS.map(({ key, iv }, idx) => {
        let variant = "default";
        if (activeEv && activeEv.key === key) {
          variant = activeEv.role === "start" ? "active" : "merged";
        } else if (step.phase === "done") {
          variant = "done";
        }
        return <Interval key={key} x1={sx(iv[0])} x2={sx(iv[1])} y={laneY[idx]} height={16} label={lbl(key, iv)} variant={variant} />;
      })}

      <Axis y={AXIS_Y} />

      {/* Event tick marks below the axis. Once we're past the events stage,
          render every event faintly; the active one solid. */}
      {(step.phase === "events" || step.phase === "sweep" || step.phase === "done") &&
        EVENTS.map((ev, i) => (
          <EventMark
            key={i}
            ev={ev}
            active={i === step.evIdx}
            used={i < step.evIdx}
            y={AXIS_Y}
          />
        ))}

      {/* Sorted starts and sorted ends — the two arrays the code's i and j
          walk over. Each step advances exactly one pointer. `preI`/`preJ` is
          the position BEFORE this step's comparison; the cell at that index
          glows orange (active = about to be consumed). Earlier cells fade out
          (already consumed). */}
      {showIJ && (
        <>
          <text x={ARR_X0 - 12} y={STARTS_Y + 16} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">starts</text>
          {STARTS_VALS.map((v, idx) => {
            const consumed = idx < (step.exited ? preI : preI);
            const active = !step.exited && idx === preI && cmp;
            return (
              <g key={`s${idx}`}>
                <rect
                  x={ARR_X0 + idx * CELL_W}
                  y={STARTS_Y}
                  width={CELL_W - 6}
                  height={CELL_H}
                  rx={4}
                  fill={consumed ? "#e7e5e4" : active ? "#fed7aa" : "#fff"}
                  stroke={active ? "#c2410c" : "#d6d3d1"}
                  strokeWidth={active ? 2 : 1}
                />
                <text x={ARR_X0 + idx * CELL_W + (CELL_W - 6) / 2} y={STARTS_Y + 16} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight={active ? 700 : 500} fill={consumed ? "#a8a29e" : active ? "#c2410c" : "#1a1814"}>{v}</text>
              </g>
            );
          })}
          {/* i pointer — sits at preI's slot. When preI == len, it's parked
              past the right edge with "i = n → loop exits". */}
          {preI < STARTS_VALS.length ? (
            <text x={ARR_X0 + preI * CELL_W + (CELL_W - 6) / 2} y={STARTS_Y - 4} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight={700} fill="#c2410c">i={preI} ↓</text>
          ) : (
            <text x={ARR_X0 + STARTS_VALS.length * CELL_W + 4} y={STARTS_Y + 16} fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight={700} fill="#b91c1c">i={preI} → loop exits</text>
          )}

          <text x={ARR_X0 - 12} y={ENDS_Y + 16} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">ends</text>
          {ENDS_VALS.map((v, idx) => {
            const consumed = idx < preJ;
            const active = !step.exited && idx === preJ && cmp;
            return (
              <g key={`e${idx}`}>
                <rect
                  x={ARR_X0 + idx * CELL_W}
                  y={ENDS_Y}
                  width={CELL_W - 6}
                  height={CELL_H}
                  rx={4}
                  fill={consumed ? "#e7e5e4" : active ? "#dbeafe" : "#fff"}
                  stroke={active ? "#1d4ed8" : "#d6d3d1"}
                  strokeWidth={active ? 2 : 1}
                />
                <text x={ARR_X0 + idx * CELL_W + (CELL_W - 6) / 2} y={ENDS_Y + 16} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight={active ? 700 : 500} fill={consumed ? "#a8a29e" : active ? "#1d4ed8" : "#1a1814"}>{v}</text>
              </g>
            );
          })}
          {preJ < ENDS_VALS.length && (
            <text x={ARR_X0 + preJ * CELL_W + (CELL_W - 6) / 2} y={ENDS_Y - 4} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight={700} fill="#1d4ed8">j={preJ} ↓</text>
          )}

          {/* Comparison line — exactly what the code's `if` evaluates this
              iteration. Reads the current i/j cells and shows the result
              and the pointer that just advanced. */}
          {cmp && (
            <text x={ARR_X0} y={ENDS_Y + 44} fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#1a1814">
              <tspan fontWeight={700} fill="#c2410c">starts[{preI}]={cmp.a}</tspan>
              <tspan> &lt; </tspan>
              <tspan fontWeight={700} fill="#1d4ed8">ends[{preJ}]={cmp.b}</tspan>
              <tspan> ? → </tspan>
              <tspan fontWeight={700} fill={cmp.startWon ? "#15803d" : "#b91c1c"}>{cmp.startWon ? "TRUE" : "FALSE"}</tspan>
              <tspan> → </tspan>
              <tspan fontWeight={700} fill={cmp.startWon ? "#c2410c" : "#1d4ed8"}>{cmp.startWon ? "rooms +1, i++" : "rooms −1, j++"}</tspan>
            </text>
          )}
          {step.exited && step.phase === "sweep" && (
            <text x={ARR_X0} y={ENDS_Y + 44} fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#a8a29e">
              loop already exited (i = {STARTS_VALS.length}) · this event is implicit drain
            </text>
          )}
        </>
      )}

      {/* Compact rooms counter — top-right, leaves the lower half for the i/j
          arrays. A small column of orange "rooms" tiles + a dashed green peak
          marker. */}
      {(step.phase === "sweep" || step.phase === "done") && (
        <g>
          <text x={COUNTER_X} y={COUNTER_Y - 32} fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight={700} fill="#57534e">rooms</text>
          {Array.from({ length: step.rooms }, (_, k) => (
            <rect
              key={k}
              x={COUNTER_X + k * (ROOM_W + 4)}
              y={COUNTER_Y - 18}
              width={ROOM_W}
              height={ROOM_H}
              rx={3}
              fill="#fed7aa"
              stroke="#c2410c"
              strokeWidth={1.5}
            />
          ))}
          <text x={COUNTER_X + Math.max(step.rooms, 1) * (ROOM_W + 4) + 8} y={COUNTER_Y - 4} fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight={700} fill="#c2410c">= {step.rooms}</text>

          {/* peak marker — dashed green slots showing the best so far. */}
          <text x={COUNTER_X} y={COUNTER_Y + 14} fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight={700} fill="#15803d">peak</text>
          {Array.from({ length: step.best }, (_, k) => (
            <rect
              key={k}
              x={COUNTER_X + k * (ROOM_W + 4)}
              y={COUNTER_Y + 22}
              width={ROOM_W}
              height={ROOM_H}
              rx={3}
              fill="none"
              stroke="#15803d"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          ))}
          <text x={COUNTER_X + Math.max(step.best, 1) * (ROOM_W + 4) + 8} y={COUNTER_Y + 36} fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight={700} fill="#15803d">= {step.best}</text>
        </g>
      )}

      {step.phase === "done" && (
        <Caption joinX={W / 2} cy={324} label="return" value={String(step.best)} fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={16} height={28} />
      )}
    </VizStage>
  );
}

export default {
  id: "meeting-rooms-ii",
  leetcode: 253,
  title: "Meeting Rooms II",
  difficulty: "Medium",
  tagline: "Fewest rooms to fit every meeting — the peak number of concurrent meetings.",
  patternId: "intervals",
  constraint: "Half-open intervals — a meeting ending at t and another starting at t share a room (end event processed before start at equal t).",
  ProblemViz,
  examples: [
    { input: "[[0,30],[5,10],[15,20]]", result: "2", ok: true },
    { input: "[[7,10],[2,4]]", result: "1", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Split each meeting into two events on a timeline: +1 at its start, −1 at its end. Sort the events (ends before starts on ties). Sweep left→right, keep a running count of rooms in use, and remember the running max — that max is the answer. The geometry is exact: the peak height of the bar-stack at any moment is the number of meetings happening simultaneously. O(n log n) for the sort, O(n) for the sweep.",
    code: `def minMeetingRooms(intervals):
    starts = sorted(iv[0] for iv in intervals)
    ends   = sorted(iv[1] for iv in intervals)
    rooms = best = i = j = 0
    while i < len(starts):
        if starts[i] < ends[j]:
            rooms += 1; i += 1          # a meeting begins
            best = max(best, rooms)
        else:
            rooms -= 1; j += 1          # a meeting ends, free a room
    return best`,
    codeHighlight: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    codeNote: "split into events · sweep · track the peak",
    cases: [
      { id: "peak3", label: "4 meetings, peak = 3 rooms", result: "3", ok: true, steps: STEPS },
    ],
  },
};
