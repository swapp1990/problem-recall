import { VizStage, Heap, Caption, Cell } from "../../viz";

const W = 760;

// nums = [3, 2, 1, 5, 6, 4], k = 2 → 2nd largest = 5
// Strategy: min-heap of size k. Walk the array left→right.
//   - if heap.size < k → push
//   - else if x > heap.top → pop top, push x (the smallest survivor leaves)
//   - else → discard
// At end, heap.top is the kth largest. O(n log k) time, O(k) space.
const NUMS = [3, 2, 1, 5, 6, 4];
const K = 2;

// Build per-step heap state by simulation. Each step processes one input num
// and produces a heap snapshot (after the operation). The first 0..k-1 steps
// just push; later steps compare with top.
function buildSteps() {
  const steps = [];
  steps.push({
    phase: "given",
    cur: -1,
    heap: [],
    action: "init",
    status: `given nums of length ${NUMS.length}, k = ${K} · find the ${K}${K === 1 ? "st" : K === 2 ? "nd" : K === 3 ? "rd" : "th"} largest`,
  });
  const heap = [];
  const heapPush = (x) => { heap.push(x); heap.sort((a, b) => a - b); };       // min-heap simulation
  const heapPop = () => heap.shift();
  const heapTop = () => heap[0];

  NUMS.forEach((x, idx) => {
    if (heap.length < K) {
      heapPush(x);
      steps.push({
        phase: "fill",
        cur: idx,
        heap: [...heap],
        action: "push",
        x,
        status: `nums[${idx}]=${x} · heap has space (${heap.length - 1}<${K}) → push`,
      });
    } else if (x > heapTop()) {
      // compare frame
      steps.push({
        phase: "compare",
        cur: idx,
        heap: [...heap],
        action: "compare-gt",
        x,
        cmpTop: heapTop(),
        status: `nums[${idx}]=${x} > heap.top=${heapTop()} → evict top, push ${x}`,
      });
      const evicted = heapPop();
      heapPush(x);
      steps.push({
        phase: "swap",
        cur: idx,
        heap: [...heap],
        action: "evict-push",
        x,
        evicted,
        status: `${evicted} (smallest survivor) leaves · ${x} settles into place · heap.top is now ${heapTop()}`,
      });
    } else {
      steps.push({
        phase: "compare",
        cur: idx,
        heap: [...heap],
        action: "compare-le",
        x,
        cmpTop: heapTop(),
        status: `nums[${idx}]=${x} ≤ heap.top=${heapTop()} → discard (can't be in top ${K})`,
      });
    }
  });
  steps.push({
    phase: "done",
    cur: -1,
    heap: [...heap],
    done: true,
    answer: heapTop(),
    status: `done — heap holds the ${K} largest values · heap.top = ${heapTop()} is the answer`,
  });
  return steps;
}

const STEPS = buildSteps();

// Row of input cells with a pointer at the current index.
function NumsRow({ x0, y, cellSize = 40, cur, popped }) {
  return (
    <g>
      <text x={x0 - 12} y={y + cellSize / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">nums</text>
      {NUMS.map((v, idx) => {
        const used = idx < cur || (idx === cur && popped !== "discard");
        const active = idx === cur;
        return (
          <g key={idx}>
            <Cell x={x0 + idx * (cellSize + 8)} y={y} size={cellSize} value={v} variant={active ? "active" : used ? "matched" : "default"} index={idx} showIndex />
          </g>
        );
      })}
    </g>
  );
}

function ProblemViz() {
  // The problem is a question, not a method — render the input, show what the
  // 'kth largest' label means by sorting visually and marking the kth position.
  // No heap (that's the solution's job).
  const sorted = [...NUMS].sort((a, b) => b - a);             // descending: [6,5,4,3,2,2,1]-ish
  const cellSize = 48;
  const gap = 10;
  const rowWidth = NUMS.length * cellSize + (NUMS.length - 1) * gap;
  const rowX = (W - rowWidth) / 2;

  return (
    <VizStage width={W} height={310}>
      <text x={W / 2} y={28} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fill="#1a1814">
        given an array and a k, what's the kᵗʰ largest value?
      </text>

      {/* the input · plain row, no algorithm hints */}
      <text x={rowX - 12} y={68 + cellSize / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">nums</text>
      {NUMS.map((v, idx) => (
        <Cell key={idx} x={rowX + idx * (cellSize + gap)} y={68} size={cellSize} value={v} variant="default" index={idx} showIndex />
      ))}

      {/* k as a small badge — the second parameter to the question */}
      <g>
        <rect x={W / 2 - 30} y={146} width={60} height={26} rx={6} fill="#fef3e9" stroke="#c2410c" strokeWidth={1.5} />
        <text x={W / 2} y={163} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight={700} fill="#c2410c">k = {K}</text>
      </g>

      {/* sorted descending — visualize what 'kth largest' MEANS by lining the
          values up biggest-first and ringing the kth slot in green. */}
      <text x={rowX - 12} y={202 + cellSize / 2 + 4} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#57534e">sorted ↓</text>
      {sorted.map((v, idx) => {
        const isK = idx === K - 1;
        return (
          <Cell
            key={idx}
            x={rowX + idx * (cellSize + gap)}
            y={202}
            size={cellSize}
            value={v}
            variant={isK ? "active" : idx < K - 1 ? "muted" : "default"}
          />
        );
      })}
      {/* arrow pointing at the kth slot */}
      <g>
        <line
          x1={rowX + (K - 1) * (cellSize + gap) + cellSize / 2}
          y1={258}
          x2={rowX + (K - 1) * (cellSize + gap) + cellSize / 2}
          y2={272}
          stroke="#15803d"
          strokeWidth={2}
        />
        <text
          x={rowX + (K - 1) * (cellSize + gap) + cellSize / 2}
          y={284}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="10"
          fontWeight={700}
          fill="#15803d"
        >
          {K}{K === 2 ? "nd" : K === 3 ? "rd" : "th"} largest
        </text>
      </g>

      <Caption joinX={W / 2 + 180} cy={278} label="return" value="5" fill="#dcfce7" stroke="#15803d" color="#15803d" labelSize={20} height={34} />
    </VizStage>
  );
}

function SolutionViz({ step }) {
  const titleByPhase = {
    given: "given · sweep nums left→right, hold a min-heap of size k",
    fill: "heap has room — just push",
    compare: step.action === "compare-gt"
      ? "new value beats heap.top — evict the top, push the new"
      : "new value can't beat heap.top — discard, it's smaller than all k current survivors",
    swap: "swap done — heap.top updates to the new minimum of the current top-k",
    done: `heap.top = ${step.answer} is the ${K}${K === 2 ? "nd" : "th"} largest`,
  };

  // Render the heap items with variant decoration based on step.
  const heapItems = step.heap.map((v) => ({ value: v }));
  // Mark the top of the heap during compare/swap so the comparison is visible
  // on the diagram, not just the prose.
  if ((step.phase === "compare" || step.phase === "swap") && heapItems.length) {
    heapItems[0] = { ...heapItems[0], variant: step.phase === "compare" ? "compare" : "active" };
  }
  if (step.phase === "done" && heapItems.length) {
    heapItems[0] = { ...heapItems[0], variant: "result" };
  }

  return (
    <VizStage width={W} height={296}>
      <text x={W / 2} y={20} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="13" fill="#1a1814">
        {titleByPhase[step.phase]}
      </text>

      <NumsRow x0={120} y={40} cellSize={40} cur={step.cur} popped={step.action === "compare-le" ? "discard" : null} />

      {/* The current x being processed — a floating cell connected to nums by
          implication. When it's about to merge into the heap (compare/swap)
          we show an arrow from nums[cur] down toward the heap. */}
      {step.cur >= 0 && step.phase !== "given" && step.phase !== "done" && (
        <g>
          {/* the candidate value, isolated, with action label below */}
          <text x={W / 2} y={120} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight={700} fill="#c2410c">
            candidate · x = {step.x}
          </text>
          {step.action === "compare-le" && (
            <text x={W / 2} y={138} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#b91c1c">
              {step.x} ≤ {step.cmpTop} → DISCARD
            </text>
          )}
          {step.action === "compare-gt" && (
            <text x={W / 2} y={138} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">
              {step.x} &gt; {step.cmpTop} → EVICT top, then push
            </text>
          )}
          {step.action === "evict-push" && (
            <text x={W / 2} y={138} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#a16207">
              evicted {step.evicted} · pushed {step.x}
            </text>
          )}
          {step.action === "push" && (
            <text x={W / 2} y={138} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#15803d">
              push (heap not yet full)
            </text>
          )}
        </g>
      )}

      <Heap
        items={heapItems}
        x0={W / 2 - 120}
        y0={150}
        width={240}
        height={100}
        cellSize={36}
        kind="min"
        showIndices
        label={`min-heap (cap ${K})`}
      />

      {step.phase === "done" && (
        <Caption
          joinX={W / 2}
          cy={278}
          label="return"
          value={String(step.answer)}
          fill="#dcfce7"
          stroke="#15803d"
          color="#15803d"
          labelSize={16}
          height={28}
        />
      )}
    </VizStage>
  );
}

export default {
  id: "kth-largest",
  leetcode: 215,
  title: "Kth Largest Element in an Array",
  difficulty: "Medium",
  tagline: "Given an unsorted array, find the value that would sit at position k if it were sorted descending.",
  patternId: "heap-topk",
  constraint: "1 ≤ k ≤ nums.length. Solution uses O(n log k) time, O(k) space — better than the naïve sort's O(n log n) when k is small.",
  ProblemViz,
  examples: [
    { input: "nums=[3,2,1,5,6,4], k=2", result: "5", ok: true },
    { input: "nums=[3,2,3,1,2,4,5,5,6], k=4", result: "4", ok: true },
  ],
  solution: {
    Viz: SolutionViz,
    note: "Sweep nums once with a MIN-heap of capacity k. While the heap isn't yet full, just push. Once full, compare each new x against heap.top (the smallest of the current top-k): if x is bigger it deserves a slot — pop the top and push x. If x ≤ heap.top, discard it — it can't be in the top k. At the end heap.top is the kth largest, since the heap holds exactly the k biggest values seen and the root of a min-heap is the smallest of them. O(n log k) time, O(k) space — beats sort when k is small.",
    code: `import heapq

def findKthLargest(nums, k):
    heap = []
    for x in nums:
        if len(heap) < k:
            heapq.heappush(heap, x)            # heap not yet full
        elif x > heap[0]:                      # x beats current weakest survivor
            heapq.heapreplace(heap, x)         # pop top + push x in one log-k op
        # else: discard — can't be in top k
    return heap[0]                             # smallest of the k survivors`,
    codeHighlight: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    codeNote: "min-heap of size k · heapreplace on beat · top is answer",
    cases: [
      { id: "main", label: "nums=[3,2,1,5,6,4], k=2 → 5", result: "5", ok: true, steps: STEPS },
    ],
  },
};
