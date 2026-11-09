# I02 catalog integration — candidate QA and release checklist

**Staging parent:** PR #267 squash-merged as `03745d5e59cb196bc3724564c860695a35ac01b4` with full exact-head CI SUCCESS #42658790497. This candidate builds on that staging merge.

## Changes and strict boundaries
- Register exactly **one existing synthetic I02 stage family** `integral-table-i02-stage` as **hard-only ×24 variants**, covering 6 per method: tan², cot², arcsin, x-over-radical. No original source coefficients/tasks/answers or private mapping in the repo.
- Integrate through `schema.ts`, `catalog.ts`, `competencyIndex.ts`; retain `I02.coverage=partial`.
- Update precisely two existing integral inventory regression assertions from **1584 to 1608**; no unrelated counts.
- Independently checked answer coefficients and PL/EN input validation on all 24 variants; add pinned Playwright against production app with 375/1280 widths, PL/EN, 8 public synthetic variants including negative slopes, blank/wrong/correct grading, +C omit/recover, hints/solutions, browser errors and responsive layout.
- No edits to nonintegral generators, UI components, business rules or CSS.

## Exact math (general synthetic methods)
For nonzero a,k and u=ax+b:
- ∫ k tan²(u) dx = (k/a)tan(u)−kx+C;
- ∫ k cot²(u) dx = −(k/a)cot(u)−kx+C;
- ∫ k/√(1−u²) dx = (k/a)arcsin(u)+C for |u|<1;
- ∫ kx/√(1−a²x²) dx = −(k/a²)√(1−a²x²)+C for |ax|<1.

## Release gates
- **DO NOT MERGE** without full exact-head CI (unit/build/Playwright and Batch B–G) SUCCESS and main conflict/rebase check, followed by owner approval.
- After merge, require full postmerge main push CI + Pages SUCCESS on exact SHA, and separately perform public live-host interaction if possible.
- This **does not** certify original P36 full source-to-deployed UI acceptance. The global formal SOURCE_PASS total remains 16/64, and I02 is still partial.
