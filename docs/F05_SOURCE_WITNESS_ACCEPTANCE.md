# F05 — six original graph witnesses: source-to-app evidence matrix

**Checkpoint:** 31 October 2026. **Pinned released source:** `ac6eca75570dc8775e7edb55fe9b7f060c2ad727` (owner-approved PR #146), **222 exercise families / 17,877 variants**. [Main CI #41209453996](https://github.com/eluyz/math-tutor-app/actions/runs/41209453996) and [Deploy Pages #41210361618](https://github.com/eluyz/math-tutor-app/actions/runs/41210361618) both completed SUCCESS for this exact SHA.

**Purpose:** track exact P21/a–f original-source five-property-group acceptance (D, W, strict increasing/decreasing, injectivity, parity). Increase and decrease are distinct app answer fields, giving **six individually graded fields**. Historical original **P21 figures (6/6)** and **P20 key groups (30/30)** were visually compared under [Issue #122](https://github.com/eluyz/math-tutor-app/issues/122#issuecomment-6494351248). Their full numeric transcriptions and private scans **are not present in this public repo**, and are **not re-inspected at this checkpoint**. Do not reproduce the private pages or source coordinates in public test fixtures.

**Acceptance score: 0/6** original complete figures independently demonstrated end-to-end in-app. This does **not** imply an identified error in the original answer key or a failing synthetic generator. A **proxy-method regression PASS is not a source witness PASS**.

## Status vocabulary and rule

- **METHOD_PROXY:** a public, non-identifying synthetic family/variant tests the indicated method (not the exact original curve).
- **METHOD_GAP:** no demonstrated one-figure six-field graph with the original required topology; generic individual property exercises do not fill this gap.
- **SOURCE_NOT_VERIFIED:** source coordinates, endpoint semantics and exact six answers not independently matched to the displayed app fixture at the pinned commit.
- **SOURCE_PASS:** reserved for an exact, privately compared full source geometry plus all six correctly graded answer fields, PL/EN steps, desktop/mobile rendering, and independently reviewed oracle. None is SOURCE_PASS yet.

## Anonymous source-profile → testable public proxy matrix

The descriptions are **non-identifying method patterns** already recorded in #122; they are not the original figure coordinates.

| P21 | Source-profile capability required | Existing closest *public synthetic* proxy | D | W | Increase | Decrease | Injective | Parity | Complete original witness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a | Odd punctured curve; excluded input but same y-value attained elsewhere | `function-integrated-punctures`, hard / variant 1: two symmetric excluded arguments, recovered heights, odd graph | METHOD_PROXY | METHOD_PROXY | METHOD_PROXY | METHOD_PROXY | METHOD_PROXY | METHOD_PROXY | **SOURCE_NOT_VERIFIED** — source curve and precise hole topology differ or remain unproven |
| b | Even multiple-branch graph with two missing arguments and **open lower y endpoint** | `function-punctured-symmetry`, hard / variant 4: even parity on symmetric punctures; **only parity is assessed in that family** | METHOD_GAP | METHOD_GAP | METHOD_GAP | METHOD_GAP | METHOD_GAP | METHOD_PROXY | **SOURCE_NOT_VERIFIED** — no accepted one-chart full six-field proxy with source's open-range boundary |
| c | Hollow and filled point at one x, separated branches, original y-image unbounded | `function-integrated-jump`, hard / variant 1: hollow/filled shared x, overlap, six-field graded, but **bounded** | METHOD_PROXY | METHOD_GAP | METHOD_PROXY | METHOD_PROXY | METHOD_PROXY | METHOD_PROXY | **SOURCE_NOT_VERIFIED** — bounded y-image differs from original unbounded shape |
| d | Two vertical poles, middle branch with W=ℝ, **nonhorizontal exterior fragments** | `function-integrated-asymptotes`, hard / variant 0, six fields, nonhorizontal outer fragments | METHOD_PROXY | METHOD_PROXY | METHOD_PROXY | METHOD_PROXY | METHOD_PROXY | METHOD_PROXY | **SOURCE_NOT_VERIFIED** — closest method now implemented, no exact source geometry/answer comparison |
| e | **One excluded x with different hollow y-heights on separate branches**; heights recovered elsewhere; unbounded tail | `function-integrated-punctures`, hard / variant 3: removed heights can be restored, but holes occur at **two distinct x inputs** on one polyline | METHOD_GAP | METHOD_PROXY | METHOD_GAP | METHOD_GAP | METHOD_GAP | METHOD_GAP | **SOURCE_NOT_VERIFIED** — original missing-x/multiple-height topology absent |
| f | Shared x with hollow lower/filled upper point, **disjoint y-images yet globally injective**, original curved/unbounded shape | `function-integrated-jump`, hard / variant 0: separated y-images, jump, globally injective, six fields, but bounded straight segments | METHOD_PROXY | METHOD_PROXY | METHOD_PROXY | METHOD_PROXY | METHOD_PROXY | METHOD_PROXY | **SOURCE_NOT_VERIFIED** — curved/unbounded source not matched |

**Interpretation:** METHOD_PROXY in a column means only that the named synthetic exercise grades that *general property method*. It is not evidence that the correct exact source answer has been reproduced. The map prioritizes **missing topology** rather than the number of variants. The companion `src/university/f05MethodProxyEvidence.test.ts` asserts the referenced deterministic public proxies remain available and have the described bounded behaviors; that suite intentionally cannot certify private originals.

## Source-acceptance execution checklist (per graph a–f)

A reviewer with access to the **private** worksheet and answer key must, for each graph:

1. Establish an exact private figure→app fixture or identify `METHOD_GAP` without copying private PDF content into the public repository. Record the pinned source SHA, family, level and variant **privately**, and a non-identifying public test reference.
2. Independently derive **D, W, strict increasing/decreasing (separately), global injectivity and even/odd/neither**. Check all open/closed endpoints, excluded poles, unattained y-height restoration and asymptotic limits.
3. Verify six answer options and the correct/incorrect/invalid grading in **PL and EN**, all explanation steps, actual visible SVG shape, and accessibility.
4. Capture **375px and desktop Chromium evidence**. Physical Safari can be recorded as NOT_VERIFIED if not tested. Do not count generic full-suite Playwright as an exact private-source acceptance test.
5. Mark a row **SOURCE_PASS only if every gate is evidenced on the identical code commit and independently reviewed**. Otherwise retain SOURCE_NOT_VERIFIED, name the precise blocker, and file a **small missing-method issue** rather than another speculative bulk variant pack.

## Immediate nonduplicative priorities

1. **P21/d:** compare the now-released six-field sloping two-pole proxy to the original private geometry. If shape/answers differ, document exact non-identifying missing feature before coding again.
2. **P21/f and P21/c:** determine whether existing bounded six-field jump families need **unbounded or curved** branch support to match the originals.
3. **P21/e and P21/b:** determine whether a unified multi-branch graph with repeated excluded abscissa/multiple hollow heights and an open y-bound is essential; a separate parity-only or one-polyline example cannot be counted as completion.
4. **P21/a:** verify source oddness and restored heights against one-figure six-field response and actual symmetric puncture placement.

**Other work stays separate:** Issue #108 syllabus acceptance remains open. Independent bulk mathematical/teaching audit [#106](https://github.com/eluyz/math-tutor-app/issues/106) is paused (historically 1,434 checked answers / 75 fully reviewed teaching tasks); this proxy ledger does not start or increment that audit. Do not begin the custom-problem mode before agreed syllabus acceptance. No PR may be Squash-merged without explicit owner authorization at its final HEAD.
