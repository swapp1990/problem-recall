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

// Build per-step heap state by simulating a REAL binary min-heap (array-backed,
// children of i at 2i+1/2i+2). Crucially, heappush and heapreplace are each
// DECOMPOSED into their internal mechanics so the viewer sees what those ops
// actually do to the tree:
//   • heappush  → drop value at the next leaf, then SIFT UP: compare with parent,
//                 swap if smaller, repeat until the parent is ≤ it (or it's root).
//   • heapreplace → EVICT the root (flash red), drop the new value onto the root
//                 slot, then SIFT DOWN: compare with the smaller child, swap,
//                 repeat until both children are ≥ it (or it's a leaf).
// Each comparison and each swap is its own frame, marked via `cmp` / `swap` /
// `pop` / `active` (indices into the heap array) + an optional `pointer`.
function buildSteps() {
  const steps = [];
  const ord = (k) => `${k}${k === 1 ? "st" : k === 2 ? "nd" : k === 3 ? "rd" : "th"}`;
  steps.push({
    phase: "given",
    cur: -1,
    heap: [],
    status: `given nums of length ${NUMS.length}, k = ${K} · find the ${ord(K)} largest`,
  });

  const heap = [];                       // real min-heap: heap[0] is the smallest
  const snap = (cur, x, extra) => ({ cur, x, heap: [...heap], ...extra });
  const parent = (i) => Math.floor((i - 1) / 2);

  // SIFT UP from index i — used after a push lands a value at a leaf.
  const siftUp = (cur, x, i) => {
    while (i > 0) {
      const p = parent(i);
      steps.push(snap(cur, x, {
        phase: "sift", cmp: [p, i], pointer: i,
        status: `sift-up · is child ${heap[i]} < parent ${heap[p]}?`,
      }));
      if (heap[p] <= heap[i]) {
        steps.push(snap(cur, x, {
          phase: "settle", active: i,
          status: `${heap[i]} ≥ parent ${heap[p]} → heap order holds · ${x} settles here`,
        }));
        return;
      }
      [heap[p], heap[i]] = [heap[i], heap[p]];
      steps.push(snap(cur, x, {
        phase: "sift", swap: [p, i], pointer: p,
        status: `child < parent → swap · ${heap[p]} bubbles up toward the root`,
      }));
      i = p;
    }
    steps.push(snap(cur, x, {
      phase: "settle", active: 0,
      status: `reached the root · ${heap[0]} is now the smallest of the ${heap.length}`,
    }));
  };

  // SIFT DOWN from index i — used after a value is dropped onto the root.
  const siftDown = (cur, x, i) => {
    const n = heap.length;
    for (;;) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let small = i;
      if (l < n && heap[l] < heap[small]) small = l;
      if (r < n && heap[r] < heap[small]) small = r;
      if (small === i) {
        steps.push(snap(cur, x, {
          phase: "settle", active: i,
          status: i === 0
            ? `no child is smaller · ${heap[0]} stays the root → heap.top = ${heap[0]}`
            : `no child is smaller · ${heap[i]} settles · heap.top = ${heap[0]}`,
        }));
        return;
      }
      steps.push(snap(cur, x, {
        phase: "sift", cmp: [i, small], pointer: i,
        status: `sift-down · smaller child ${heap[small]} < ${heap[i]} → must swap down`,
      }));
      [heap[i], heap[small]] = [heap[small], heap[i]];
      steps.push(snap(cur, x, {
        phase: "sift", swap: [i, small], pointer: small,
        status: `swap · the smaller value rises so the root holds the minimum`,
      }));
      i = small;
    }
  };

  NUMS.forEach((x, idx) => {
    if (heap.length < K) {
      // ---- heappush: land at next leaf, then sift up ----
      heap.push(x);
      const leaf = heap.length - 1;
      steps.push(snap(idx, x, {
        phase: "place", active: leaf, pointer: leaf,
        status: `nums[${idx}]=${x} · heap not full (${heap.length - 1}<${K}) → push: drop ${x} at the next slot`,
      }));
      if (leaf > 0) siftUp(idx, x, leaf);
    } else if (x > heap[0]) {
      // ---- heapreplace: compare, evict root, drop new at root, sift down ----
      steps.push(snap(idx, x, {
        phase: "compare", cmp: [0], pointer: 0,
        status: `nums[${idx}]=${x} > heap.top=${heap[0]} → ${x} beats the weakest survivor`,
      }));
      steps.push(snap(idx, x, {
        phase: "evict", pop: 0, pointer: 0,
        status: `heapreplace · evict the root ${heap[0]} (smallest of the top ${K}) — it can't be in the answer`,
      }));
      heap[0] = x;
      steps.push(snap(idx, x, {
        phase: "place", active: 0, pointer: 0,
        status: `drop ${x} onto the root slot — now restore the heap by sifting down`,
      }));
      siftDown(idx, x, 0);
    } else {
      // ---- discard ----
      steps.push(snap(idx, x, {
        phase: "discard", cmp: [0], pointer: 0,
        status: `nums[${idx}]=${x} ≤ heap.top=${heap[0]} → discard (can't be in the top ${K})`,
      }));
    }
  });

  steps.push(snap(-1, undefined, {
    phase: "done", done: true, answer: heap[0],
    status: `done — heap holds the ${K} largest values · heap.top = ${heap[0]} is the ${ord(K)} largest`,
  }));
  return steps;
}

const STEPS = buildSteps();

// Row of input cells with the current index highlighted.
// Bigger cells + bigger section labels so mobile (where the SVG scales down
// to ~50%) stays legible: cells are 56 native (28 effective), label is 16
// native (8 effective). The .anim-status line BELOW the viz carries prose.
function NumsRow({ x0, y, cellSize = 56, cur, popped }) {
  return (
    <g>
      <text x={x0 - 12} y={y + cellSize / 2 + 6} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="16" fontWeight={600} fill="#57534e">nums</text>
      {NUMS.map((v, idx) => {
        const used = idx < cur || (idx === cur && popped !== "discard");
        const active = idx === cur;
        return (
          <g key={idx}>
            <Cell x={x0 + idx * (cellSize + 10)} y={y} size={cellSize} value={v} variant={active ? "active" : used ? "matched" : "default"} />
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
  // Decorate each heap node from the per-step markers the simulation emits.
  // The simulation decomposes push → sift-up and heapreplace → evict + sift-down,
  // so these variants make the internal mechanics legible on the tree itself:
  //   pop (red)      = the node being evicted
  //   compare (blue) = the two nodes whose order is being checked
  //   swap (yellow)  = the pair that just swapped
  //   active (accent)= the node that just landed / settled
  //   result (green) = the final answer at the root
  const heapItems = step.heap.map((v, idx) => {
    let variant;
    if (step.pop === idx) variant = "pop";
    else if (step.swap && step.swap.includes(idx)) variant = "swap";
    else if (step.cmp && step.cmp.includes(idx)) variant = "compare";
    else if (step.active === idx) variant = "active";
    else if (step.done && idx === 0) variant = "result";
    return { value: v, variant };
  });

  // The candidate `x` flows visually from nums[cur] → heap. Active orange
  // cell in nums + an arrow toward the heap stand in for the prose label
  // "candidate · x = 5" we used to render in-SVG. Everything narrative now
  // lives in step.status below the SVG (where CSS controls font size, so
  // it stays readable when the SVG scales down on mobile).
  const numsX0 = 100;
  const numsCellSize = 56;
  const arrowX = step.cur >= 0 ? numsX0 + step.cur * (numsCellSize + 10) + numsCellSize / 2 : null;
  // Show the candidate→heap arrow only while the candidate is entering: the
  // compare/place frames. During sift frames the action is internal to the
  // heap, so the arrow would just be noise. Red dashed ✗ on discard.
  const isDiscard = step.phase === "discard";
  const showArrow = arrowX != null && (step.phase === "place" || step.phase === "compare" || isDiscard);

  return (
    <VizStage width={W} height={280}>
      <NumsRow x0={numsX0} y={28} cellSize={numsCellSize} cur={step.cur} popped={isDiscard ? "discard" : null} />

      {/* Candidate → heap arrow. Orange = heading INTO the heap (push/replace),
          red dashed + ✗ = rejected (discard). */}
      {showArrow && (
        <g>
          {(() => {
            const stroke = isDiscard ? "#b91c1c" : "#c2410c";
            const dash = isDiscard ? "5 4" : null;
            return (
              <>
                <line x1={arrowX} y1={28 + numsCellSize + 4} x2={arrowX} y2={132} stroke={stroke} strokeWidth={2.5} strokeDasharray={dash} markerEnd="url(#viz-arrow-down)" />
                {isDiscard && (
                  <text x={arrowX + 12} y={108} fontFamily="JetBrains Mono, monospace" fontSize="18" fontWeight={700} fill="#b91c1c">✗</text>
                )}
              </>
            );
          })()}
        </g>
      )}

      <Heap
        items={heapItems}
        x0={W / 2 - 140}
        y0={148}
        width={280}
        height={104}
        cellSize={48}
        kind="min"
        pointerIndex={step.pointer != null ? step.pointer : null}
      />

      {step.phase === "done" && (
        <Caption
          joinX={W / 2}
          cy={262}
          label="return"
          value={String(step.answer)}
          fill="#dcfce7"
          stroke="#15803d"
          color="#15803d"
          labelSize={18}
          height={32}
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
