import { VizStage, Deque, useDemoLoop } from "../../viz";

// Generic illustration — NOT tied to a problem. Auto-loops the signature move:
// a new value arrives; pop from the back while the back is ≥ it (so the deque
// stays increasing), then push. The front is always the best candidate.
const W = 760;
const H = 280;
const DECK_Y = 110;

const DEMO = [
  { items: [{ value: 1 }, { value: 3 }, { value: 5 }, { value: 8, variant: "pop" }], status: "incoming 4 · back 8 ≥ 4 → pop back" },
  { items: [{ value: 1 }, { value: 3 }, { value: 5, variant: "pop" }], status: "back 5 ≥ 4 → pop back" },
  { items: [{ value: 1 }, { value: 3 }, { value: 4, variant: "new" }], status: "push 4 → deque stays increasing" },
];

export default function MonotonicDequeViz({ active = true }) {
  const i = useDemoLoop(DEMO.length, { interval: 1200, enabled: active });
  const s = DEMO[i];
  const x = (W - s.items.length * 64 + 8) / 2; // roughly center (cellW 56 + gap 8)

  return (
    <VizStage width={W} height={H}>
      <text x={W / 2} y={44} textAnchor="middle" fontFamily="'Fraunces', serif" fontStyle="italic" fontSize="15" fill="#57534e">
        keep the deque monotonic — pop the back before pushing a smaller value
      </text>
      <Deque x={x} y={DECK_Y} items={s.items} />
      <text x={W / 2} y={H - 26} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="13" fill="#c2410c">
        {s.status}
      </text>
    </VizStage>
  );
}
