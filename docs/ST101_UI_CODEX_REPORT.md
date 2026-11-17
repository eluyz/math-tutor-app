# ST-101 mean UI pilot — implementation and QA report

Spec: [Issue #333](https://github.com/eluyz/math-tutor-app/issues/333).
This new owner-authorized package supersedes NIGHT-STAT-01's historical UI
prohibition; that completed package and its evidence are not rewritten.
Baseline main: `3a1f6e7a4f76a0c655f82d04b6647d6ee36023db`, verified
[CI SUCCESS](https://github.com/eluyz/math-tutor-app/actions/runs/44062028850) and
[same-SHA Pages SUCCESS](https://github.com/eluyz/math-tutor-app/actions/runs/44067019307).

## Design / execution plan

Use one isolated `StatisticsPractice({locale})` component, mounted only for the
existing Statistics subject branch. Keep Math state and its learn/progress/exam
implementation untouched. Reuse existing generator, mean teaching, parser,
Rational equality and formatter; no new arithmetic/answer-grading engine.
Alternative of integrating Statistics into the Mathematics catalog/session model
is rejected because it would broaden persistence and exam scope. Existing CSS
classes suffice; scoped styling will only be added if a demonstrated layout issue
requires it. No dependencies, workflows, telemetry, accounts or storage changes.

- [x] Specify pinned PL/EN desktop/mobile browser acceptance before implementation;
      demonstrate a missing-feature failure on current main.
- [x] Implement ephemeral seed/difficulty/input/assessment/hint/solution state;
      default easy/0, uint32 wrap, difficulty resets seed, locale retains state.
- [x] Integrate only the Statistics branch and truthful WIP/mean-only copy; retain
      accurate Econometrics/Financial Mathematics roadmaps.
- [x] Run isolated tests, production build, targeted production Playwright and
      relevant Mathematics session/progress/exam regressions. Fix real failures.
- [ ] Run full Vitest/build, read-only review, then one main-targeted Draft PR;
      confirm full CI on the exact final HEAD. No merge or deployment.

## Acceptance witnesses and boundaries

Easy/0: [3,2,2,1,2], sum10/n5=2; wrong3. Medium/0:
[3,3,1,16,7,13], sum43/n6=43/6; equivalent86/12 accepted, wrong43/5 and rounded
7.1666666667 rejected. Hard/0: [−16,−13,8,17,−1,14,−9], sum0/n7=0.
Medium/1: [2,2,3,10,1,7], sum25/n6=25/6. These are fixed independent expectations,
not answers queried from the production generator by the browser oracle.

Check blank/space, zero denominator, >100 trimmed characters, unsupported
expressions and exact finite decimals. Both incremental hints and all original
PL/EN solution steps must match. Check locale/task transitions, keyboard/focus,
375×812 / 1280×800, overflow/pageerror/console/HTTP, preserved Math inputs and
session position, unchanged existing storage/progress and exam subject locks.
Median/variance have no playable controls; Statistics remains in progress.

Results and exact delivery/CI evidence will be recorded after execution. The PR
will carry final HEAD/run URLs to avoid changing a tested commit merely to insert
its own SHA. This is a Draft pilot, not a production release or external human
mathematical/pedagogical acceptance.


## Executed local verification

- Test-first witness: the initial pinned PL/375px test failed on the baseline
  because the ST-101 heading/interface did not exist. This intentional RED is
  distinct from the resource-related regression timeout below.
- Seed transition utility: **9/9 PASS**, including upper-bound wrap and malformed
  internal seeds; actual click handler uses the tested function.
- Development Chromium: **20/20 PASS** (16 new scenarios plus 4 subject-roadmap
  checks), PL/EN × 375×812 and 1280×800.
- Production-bundle Chromium: **68/68 PASS** across ST-101, subject roadmap and
  existing exam/session-feedback/local-progress regression suites. Includes real
  populated Math history, retained active question/answer/session position, no
  Statistics history writes, keyboard submission, active-exam subject/brand lock,
  no pageerror/console/HTTP failure and no horizontal overflow.
- Full Vitest: **2603/2603 PASS**, 202 files, with `npm test -- --maxWorkers=1`.
- `npm run build`: **PASS** (TypeScript + Vite); existing bundle-size warning.
- Visual inspection: production medium/0 full solution at PL/375px and EN/1280px
  is readable and wraps without overflow, using existing CSS only.

### Local resource diagnosis, with failure evidence retained

The first default full Vitest run overlapped 2 browser workers: **2602 PASS /
1 FAIL**, `history-regression.test.ts` exceeded its existing 5000ms limit while
checking 5229 published Math tasks. A second full run without browsers but with
2 Vitest workers still timed out (5331ms; same 2602/1 result). This workspace has
a 2-CPU cgroup quota. The unchanged history suite alone passed **2/2** (4.60s
module duration). A full single-worker run then passed **2603/2603**, 116.67s.
No test assertion, published-task fixture, Mathematics code, timeout, config,
workflow or dependency was edited to obtain that result. Limiting local worker
competition resolves this workspace's timing failure; final CI must still run
its unchanged normal `npm test` command on the final HEAD.

## Implementation boundary / remaining gates

App integration is one import and one Statistics-only conditional render. All
Mathematics state/handlers, session/progress/exam modules and storage are unchanged.
Only Statistics description/next-step copy changes; shared WIP status remains
in-progress, and Econometrics/Financial Mathematics text is retained. There are
no median/variance controls. Data/teaching/parser/Rational/formatter modules are
reused read-only. No new CSS, public data catalogue, APIs, telemetry or persistence.

The new browser suite uses literal independent sums/results, never querying a
production answer as its oracle. The mean's existing complete PL/EN teaching is
checked line by line on visible UI; both hints remain generic and solution content
is not rendered before explicit reveal. Locale changes retain typed input, seed,
assessment and revealed state; Next/difficulty changes clear them and focus input.

Final internal review, exact commit/PR and full CI outcome are recorded in the
Draft PR description after execution. Independent human mathematical/pedagogical
and owner review remain release gates. The preview has one playable mean pilot;
production still has **0 published Statistics lessons** until separately approved
merge and same-SHA Pages verification. This task performs neither merge nor deploy.
