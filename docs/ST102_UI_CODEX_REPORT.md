# Issue #335 — median UI, Statistics curriculum navigation and gutter alignment

Spec: https://github.com/eluyz/math-tutor-app/issues/335 (owner taxonomy update).
Base: `d62424a9b9693c6e78d459085f85dc81974433f5`, verified current main with
[CI44088349286 SUCCESS](https://github.com/eluyz/math-tutor-app/actions/runs/44088349286)
and [same-SHA Pages44093776713 SUCCESS](https://github.com/eluyz/math-tutor-app/actions/runs/44093776713).
No claim of an independently observed human production smoke check.

## Bounded design and execution plan

Keep the isolated Statistics component and original Math state/handlers. Add a
small read-only lesson adapter reusing the mean and median generators and their
own values/exact answers; median's existing easy permutation is preserved. The
adapter rejects unsupported lessons/levels, never mapping advanced/expert to hard.
Use existing parser, Rational equality and teaching, not a new grading engine.

Canonical taxonomy metadata has two tracks and 15 stable topic IDs. Labels and
availability explanations have one PL/EN source in the language catalog. Only
mean/median in fundamentals are playable. University categories are visibly
planned/disabled, with no fake task or silent fallback. The clickable university
track is a roadmap view, not an exercise. Track/topic changes select a deterministic
fresh easy/0 task (or no task in the planned track); difficulty resets seed0.
Locale retains active lesson, values, input and reveal/assessment state.

Render Math's existing study-groups → category-picker → difficulty-picker visual
patterns; reuse all five canonical difficulties, enabling only real three levels.
Add a shared navigation-gutter CSS variable for subject, Math view navigation and
Statistics rows, retaining existing colors, controls and exam disabled behavior.
Scoped wrapping supports 320/375/1280px without whole-document overflow. No global
navigation redesign, Math code migration, extra generators, dependencies or storage.

1. Specify independent model/math, availability and pinned UI/geometry tests first;
   show a missing-median failure on the baseline.
2. Implement median priority, canonical navigation, then additive gutter fix.
3. Run full single-worker Vitest/build separately from browser workloads (prior
   workspace resource timeout is known); production Chromium targets and existing
   Math session/progress/exam regression; independent Python fraction/rank checks.
4. Review read-only, create one main-based Draft PR, observe full unchanged normal
   CI (standard Chromium and production B–G) at exact final HEAD. No merge/deploy.

## Independent pinned witnesses

- Easy median/1: displayed [1,6,9,4,5], ordered [1,4,5,6,9], median5; third value9
  is wrong. The existing generator's permutation is used, not raw mean values.
- Medium/0: [3,3,1,16,7,13], middle3,7 => median5, whereas mean43/6 must be rejected.
- Medium/1: [2,2,3,10,1,7], middle2,3 =>5/2; 10/4 and decimal2.5 are equivalent.
- Hard/0: [−16,−13,8,17,−1,14,−9], ordered [−16,−13,−9,−1,8,14,17], median−1.

These are literal source-independent expectations; sampled rank counting and
Python Fraction checks add internal mathematical QA, not external human acceptance
or a catalogue/variant count. ST-103 UI remains unavailable, Statistics WIP.

## Completion percentage rubric

Ten equally weighted acceptance groups (10% each), marked complete only with evidence:
1. Existing median data/permutation integration.
2. Deterministic replay/three real difficulties and exact results.
3. Correct/wrong/empty/invalid answer handling.
4. Both original hints and every PL/EN solution step.
5. Topic/track/difficulty resets and Math session/progress/exam/storage preservation.
6. Canonical bilingual two-track/category hierarchy and truthful availability.
7. Five canonical level buttons with disabled higher levels and explanations.
8. Locale persistence, keyboard/focus/ARIA behavior.
9. ≤2px gutter alignment and no overflow at320/375/1280 PL/EN.
10. Full tests/build/production browser acceptance/exact-HEAD CI and one Draft PR.

Final completion is the count of verified groups /10. It measures this bounded
issue, not implementation of every future Statistics topic or production release.
Actual results/SHA/CI links will be recorded after execution, with final evidence
in the PR body so inserting a commit's own hash does not reset the tested HEAD.

## Executed local evidence (2026-11-17)

- Full Vitest: **2,615/2,615 PASS**, 204 files, 117.45s, via
  `npm test -- --maxWorkers=1`. Browser work was not run concurrently with this
  resource-bounded local unit run. Normal CI configuration is unchanged.
- Focused adapter/curriculum tests: **12 PASS**. Independent TypeScript median
  oracle counts ranks (including ties), instead of calling the production sort/
  median helpers; mean checks use integer sums and BigInt cross-products.
- TypeScript and production `npm run build`: **PASS**. Only the existing bundle
  chunk-size advisory remains; no dependency, workflow or timeout change.
- Production Chromium: **90/90 PASS** (2.0m), two workers, covering the new
  median16 and navigation6 tests, existing mean16/roadmap4 and Math exam/progress/
  session-feedback regressions. Command:
  `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npx playwright test e2e/statistics-median.spec.ts e2e/statistics-navigation.spec.ts e2e/statistics-practice.spec.ts e2e/subject-roadmap.spec.ts e2e/exam.spec.ts e2e/local-progress.spec.ts e2e/session-feedback.spec.ts --workers=2 --reporter=line`.
- Navigation assertions were then strengthened to require the exact selected
  difficulty states (easy selected initially; none in the planned track): final
  production geometry/navigation recheck **6/6 PASS** (8.0s).
- Exact independent Python `fractions.Fraction` recalculation of exported adapter
  requests: **390 PASS / 0 FAIL** (mean195 + median195; three levels, seeds0–63
  and4294967295 per lesson). Mean is recomputed from sum/count; median from ordered
  central observations, comparing normalized fractions only afterwards. These are
  sampled replay requests, not390 unique catalogue variants, external review or
  an increase in historical audit coverage. The permanent TS tests reproduce the
  same request matrix using the distinct rank-counting oracle.
- PL/EN, 375/1280px: correct, wrong, empty, malformed and too-long input; decimal
  separators and equivalent fractions; both hints; every sorted-data/rank/result
  calculation; locale retention; topic/track/difficulty resets; keyboard/focus;
  Math input/session/history and active-exam lock preservation. Median tests
  monitor console errors, pageerror, failed requests and HTTP errors.
- Navigation: PL/EN at320/375/1280px, first-button inset differences **≤2px**, all
  navigation controls within viewport, no document overflow, planned topics and
  higher levels disabled with descriptions. Production screenshots were also
  visually inspected: Math320, median375PL and1280EN (full solutions).

### Failed evidence and correction

The initial TDD witness failed because baseline had no Median control, as expected.
An early development-browser run then reported36 PASS/6 FAIL: navigation tests
reused a localized role-group name after switching language. The UI snapshot
showed correct translated labels. Tests now locate the translated groups after
switching language; all existing assertions remain, followed by the production
runs above. No application exception, weakened assertion, skipped test or changed
mathematical result was used to obtain PASS.

## Scope and final handoff gate

No generator, parser, answer rule, Math catalog, Math component/state, storage,
exam/progress code, package, CI or deployment configuration changed. Existing
mean UI tests retain grading/teaching/state assertions while reflecting the
explicitly requested five difficulty controls and newly enabled median topic.

Groups1–9 of the rubric have local evidence. Group10 is complete only after the
single Draft PR's full CI succeeds at its exact final HEAD, including the standard
browser suite and production Batch B–G. The final SHA, run URL, CI totals and final
percentage belong to the PR evidence/handoff; this committed report does not
pretend an as-yet-unobserved run passed. No release or production deployment is
part of this task. Planned categories and advanced/expert remain unavailable;
this is a mean/median pilot, not complete Statistics course coverage. Human owner
review remains necessary before any separately authorized merge or deployment.
