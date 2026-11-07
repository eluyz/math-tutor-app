# QA-003 — anisotropic two-variable limits (W03), bounded independent audit

Date: 2026-11-07 (Europe/Warsaw). Issue: #106.

## Scope / baseline

- Pinned baseline \`main\`: \`b1b6d4731671df60d0b4835a5b02fd75e642c81d\` (post-merge #191, main CI and Pages successful).
- Family: \`multivar-anisotropic-limit\`, supported difficulties \`hard\`, \`advanced\`, \`expert\`; all \`v=0..23\`, total **72 distinct (family, difficulty, variant) tuples** and **144 PL/EN presentations**.
- Existing old \`rectangularPaths.test.ts\` tests are **not counted** as new independent QA-003 evidence.
- New production tasks / changed answer keys / changed generator / changed UI: **none**.
- No source-text comparison to private worksheets: **BLOCKED_SOURCE**.
- This audit explicitly avoids the four families audited by PR #191.

## Independent mathematical check — 72 reconstructed parameter cases

I independently enumerated the documented generator parameter recipe using Python \`fractions.Fraction\` and proved the identities using SymPy (independent from production answer helpers and \`anisotropicClass\`). Across all 72 cases: 24 nonremovable, 24 continuous, 24 removable, with 0 mathematical discrepancies in the independently reproduced cases.

For the visible model (with \`u=x-a\`, \`v=y-b\` and \`k≠0\`):

\`g(x,y)=B+k u^p v²/(u⁶+v⁴)\` for \`(u,v)≠(0,0)\`, with \`g(a,b)=V\`.

- **p=3**: Along \`v=0\`, the limiting value is \`B\`. Along \`u=t²,v=t³\`, the fractional term is exactly \`1/2\` for \`t≠0\`, so the limiting value is \`B+k/2≠B\`. The limit does not exist, and any assigned center value gives **nonremovable** discontinuity.
- **p=4**: \`u⁶+v⁴≥2|u³|v²\` since \`(|u|³-v²)²≥0\`. Thus \`|u⁴v²/(u⁶+v⁴)|≤|u|/2→0\` for **every path**, yielding \`lim g=B\`. If \`V=B\`: continuous; otherwise: removable.
- **The denominator** is strictly positive away from \`u=v=0\`, and center assignment is explicit.

For the chosen 72 parameter instances, \`k≠0\` and every inequality/path identity was checked exactly; coefficients and translated points include negative and fractional values. **This independent Python run reconstructed the parameters from the published source; it did not execute the TypeScript generator.** Its 72 checks must not be presented as 72 independently rendered task certificates until the new repository regression passes.

## New in-repository visible-question regression

File: \`src/qa/qa003AnisotropicVisible.test.ts\`.

Unlike the old W03 tests, the expected classification is derived **from the actual localized question**: translated target, displayed \`B\` and \`k\`, exponent \`p\`, punctured-domain condition, and assigned center value. The audit uses its own BigInt fraction arithmetic rather than production limit solvers, modes or keys. It then compares this certificate to the task answer and displayed working.

The regression covers:

- Every one of the 72 tasks in **both** PL and EN (144 localized presentations).
- Three nonzero values of the nonlinear path parameter and an independent horizontal-axis evaluation per localized task.
- For \`p=4\`, additional exact numeric samples of the uniform bound.
- Two wrong choices per task, correct, empty, invalid choice, and wrong-structure response: **6 × 144 = 864 grading scenarios**.
- Matching target coordinates, off-point domain, assigned central value and displayed steps.
- Negative question mutations: remove the assigned value, move it to a different point, change the puncture, or change the coordinate translation. All must be rejected.
- Both the final answer and normal user answer assessment.

**Execution status:** The newly added Vitest suite and overall CI are to be assessed by GitHub Actions on the Draft PR head. Until they complete, mark live-app regression results as **NOT_VERIFIED**.

## Pedagogical boundary

I inspected the templates, prompt structure, both hint strings, the final classification and proof steps in source. The two proof patterns are mathematically valid. However, **no separate full, per-task human-style review of 72 × PL/EN explanations has been completed**, and no new original-source acceptance is claimed. Difficulty calibration across hard/advanced/expert is likewise **NOT_VERIFIED**: levels mainly vary coefficients and point fractions, not proof method. This remains a distinct educational follow-up rather than a fabricated failure.

## Progress accounting

If the new regression passes on exact PR head, label its results a **new automated question-derived 72-task tier**, *not* 72 extra historical external QA-003 cases and *not* 72 complete PL/EN semantic reviews. Existing historical 1,434 independent tuples, 75 complete reviews and the four-family 288-task PR #191 tier remain distinct and unchanged. No aggregate union of these classes is claimed.

No merge, auto-merge, SOURCE_PASS or issue closure is authorized by this report.
