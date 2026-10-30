# F05 — next source-confirmed implementation scope (30 October 2026)

**Status: planning / method gap confirmed, NO implementation or merge approval.**
Parent evidence: [F05 original-source witness #122](https://github.com/eluyz/math-tutor-app/issues/122#issuecomment-6494351248) and [syllabus #108](https://github.com/eluyz/math-tutor-app/issues/108). All original scans, keys, exact source coordinates and identifying material remain private.

## 1. Verified baseline, not a complete F05 acceptance

- Current merged source commit: `eae427026f849ba5b27a43ff82a5ef63df93d94c` (owner-approved PR #144), **221 families / 17,805 variants**. The PR CI at approved HEAD `127a2f7` is PASS, but **same-SHA push CI and Pages for merge SHA are NOT_VERIFIED**.
- Existing `function-asymptote-range` is a **single-property range** family with two vertical asymptotes, a synthetic rational middle branch and **flat offset outer segments**. It is not a complete source-style graph.
- `function-integrated-properties` assesses six fields on a **bounded three-knot** plot; `function-integrated-jump` on two bounded segments with a shared x; `function-integrated-punctures` on a **bounded five-knot** plot with holes. None models the specific full P21/d profile.
- Original source/key inspection: **6/6 images inspected, 30/30 grouped source answers examined, 0/6 exact complete source-to-app witnesses accepted**. A synthetic-family PASS is not acceptance of a private source image.
- External bulk correctness/teaching audit #106 stays paused; regression tests needed for a *new feature* are separate from that audit and its counts.

## 2. Priority: P21/d-inspired asymptote + sloping outer-fragment graph

**Confirmed gap:** P21/d has a middle branch between two vertical asymptotes with whole-real y-image **plus two nonhorizontal outer fragments whose slopes matter**. The student must evaluate **all five original property groups in one display**: domain; image/range; strictly increasing and decreasing intervals; global injectivity; even/odd/neither. Increase and decrease are **separate UI answer fields**, giving six graded fields.

**Preferred smallest safe build:** extend the existing asymptote geometry and use the established `multi-choice` six-field answer schema and accessible graph visual pattern. Add a new family **only if** the existing family cannot express and grade the new topology without breaking existing single-property tasks; otherwise reuse/extend it. **Do not choose an arbitrary variant target** before confirming distinct, meaningful geometries.

Required cases to cover by method, not by volume:

1. Two distinct excluded pole arguments `a < b`; the middle domain is `(a,b)`, with appropriate outer piece domains and open/closed endpoints. A finite exterior branch must **not** fill in an excluded pole argument.
2. A middle branch that genuinely has range `ℝ` (opposite infinite limiting behavior), plus **sloping** outer branches. The union of images must be read from the entire graph; do not infer range just from visible sampling.
3. Each strictly increasing/decreasing component identified **exactly**, including open/closed endpoint semantics and internal turning points where they exist. Never join intervals across an excluded pole.
4. Global injectivity checked across **all** components by the horizontal-line criterion. Even strictly increasing individual branches can repeat y-values in different components.
5. Even/odd/neither from **both the domain and function values**, including reflection of pole locations and outer fragments. Do not classify symmetry from visual similarity alone.
6. At least one plausible incorrect alternative per field, valid PL/EN explanations that justify all six values, and readable accessible chart/text on 375px and desktop viewports.

## 3. Acceptance before a feature PR can merge

- Record a **public synthetic non-identifying geometry** and its exact mathematical oracle for each bounded topology; never copy or trace the original private coordinates.
- Verify symbolic/asymptotic limits and range; all interval boundaries; strict monotonicity with derivative or slope sign; cross-branch one-to-one; symmetry including domain.
- Exercise **correct, incorrect, incomplete/invalid** forms for all six fields; PL/EN hints and full reasoning; responsive browser tests.
- Independent reviewer for code/math should assess exact PR HEAD where feasible. No new PR can merge without separate owner authorization and CI PASS.
- Post-merge CI on `main` and deployment via GitHub Pages must each be confirmed on **the identical merge SHA** before claiming it live.
- Finally, compare **each original witness a–f**, privately, to the *exact* app fixtures. An implementation of P21/d method does not automatically move 0/6 to 1/6.

## 4. Post-merge release evidence still needed for #144

The PR #144 merge was confirmed as `eae427026f849ba5b27a43ff82a5ef63df93d94c`; exact-head PR CI [#41050245110](https://github.com/eluyz/math-tutor-app/actions/runs/41050245110) succeeded.

The available connected GitHub run lookup lists **pull-request runs only**, not main push/deploy runs; attempts to read public Actions/Pages in this session did not yield authoritative results. Therefore leave:

| Gate | Evidence | Status |
| --- | --- | --- |
| Owner authorization and Squash merge | PR #144 closed/merged and merge commit fetched | PASS |
| Source on `main` | Generator file read directly from `main` | PASS |
| PR CI, same approved HEAD | Run #41050245110 | PASS |
| `main` CI, merge SHA `eae4270` | Exact matching push run still required | NOT_VERIFIED |
| Deploy Pages, merge SHA `eae4270` | Exact matching successful deploy still required | NOT_VERIFIED |

To close the last two gates, examine [CI workflow history](https://github.com/eluyz/math-tutor-app/actions/workflows/ci.yml) and [Deploy Pages history](https://github.com/eluyz/math-tutor-app/actions/workflows/pages.yml), verify the run event/branch/head SHA and conclusion. Do not use the mere existence of a website or passing PR tests as proof of deployment of this particular commit.
