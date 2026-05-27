# problem-recall — repo guidelines

## Verifying visual changes
- For any change that affects rendered output (positions, sizes, animations, layout), pull a **real screenshot from a foreground browser tab** rather than trusting DOM attribute probes. Attribute/text checks pass while the actual render is wrong — that's exactly how the pointer-positioning bug slipped through (framer wrote `x` as an SVG attribute a `<g>` ignored, so pointers never moved, yet DOM checks looked fine).
- Note: browser timers (`setInterval`) are throttled in background tabs, so auto-animations look "frozen" unless the tab is foregrounded before sampling.
