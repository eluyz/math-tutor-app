# I02 table-method staging — 2026-11-09

**Scope:** Owner-authorized bounded response to an exam-source method gap. This is synthetic code staging, **not** a student-facing release. No university task text, source numbers, answer key or source→variant mapping are included.

## What is staged
One deterministic constructor and bilingual presenter, 24 synthetic variants (six per method), in `src/university/integralTableI02Stage.ts`:
- `tan-square`: antiderivative `(k/a)tan(ax+b)−kx+C`, on a connected pole-free domain interval.
- `cot-square`: antiderivative `−(k/a)cot(ax+b)−kx+C`, on a connected pole-free domain interval.
- `arcsin`: antiderivative `(k/a)arcsin(ax+b)+C`, for `|ax+b|<1`.
- `radical-x`: antiderivative `−(k/a²)√(1−a²x²)+C`, for `|ax|<1`.
The fourth is a separate substitution method rather than a misapplication of arcsin.

## Evidence
- Synthetic independent symbolic differentiation: **24/24 PASS**, including negative slopes and signs.
- `src/university/integralTableI02Stage.test.ts`: 24 variants, all modes, PL/EN, numerical independent derivative, correct/incorrect/invalid/empty, missing +C, domain and invalid-index guards.
- The full exact-head GitHub CI is evaluated on the Draft PR. Do not infer success from earlier main runs.

## Deliberate safety boundaries
- No changes to `src/university/schema.ts`, `src/university/catalog.ts`, `src/competencyIndex.ts`, application UI, global family counters, CI, or other lanes.
- This is a **standalone stage**; no new I02 task is selectable in the deployed app yet. Original I02 SOURCE_PASS remains ungranted.
- Existing `docs/chat-sprint-20261108/I-closure.md` belongs to earlier I04 work and is preserved.

## Follow-up integration gate (separate PR)
After coordinating shared-file ownership, register one hard-level I02 family (24 variants) through schema/catalog/index, adjust relevant counts, add 375/1280px PL/EN Playwright covering hints, +C, grading and domain, require exact-head full CI, owner merge approval, and postmerge exact-SHA CI+Pages. Keep source→live-UI acceptance separate from pure mathematical QA.

**Base:** `main@dfdb8cca1d962fc9838a7d1c201d8da9faf84f44`; historical formal SOURCE_PASS total remains 16/64.
