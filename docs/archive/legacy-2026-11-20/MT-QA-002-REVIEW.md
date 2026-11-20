# MT-QA-002 — scoped pedagogical correction and snapshot reconciliation

Audited: 2026-10-27. Issue #103 / PR #105. This is a *maintainer* review, not an independent external Work reviewer assessment.

## Root cause

The legacy `signed-product` task generator uses a hidden parameter `c=1` only to express a question with **two displayed factors**, `(−a)×b`. The old legacy `solutionFor` implementation always added an invisible multiplication by one as a second step, incorrectly explaining the product as involving two negative factors. The English lesson mirrored the same unconditional error.

## Bounded remediation

- `c=1`: one working step, multiply the negative and positive displayed factors; result is negative. No invented third factor and no claim of two negative factors.
- `c<0`: first multiply negative and positive to get negative, then multiply by the **visible** third negative factor to get positive; both steps are explicit.
- Match English step count/logic exactly to Polish. Check every supported **original generator** variant on easy/medium/hard with exact sign and step-count assertions in `src/solutions/model.test.ts`. The separate advanced/expert `math` family uses its own typed expression renderer and is not changed.
- **Do not alter** the generator, its task IDs/content keys, question text, numeric answers, difficulty availability, or choice/input types. No new exercise variants.

## Historical snapshot hash change — deliberate and strictly scoped

Five independent historical published snapshots each record the exact same *78-task legacy signed-product family*, including full PL/EN teaching steps. The changed explanatory text correctly triggers a snapshot mismatch (first PR CI run 40520436916); we did **not** disable these checks.

| Fixture | Source commit retained | Old `signed-product` SHA-256 | New `signed-product` SHA-256 | Other family entries |
| --- | --- | --- | --- | --- |
| `mtedu004-baseline.json` | unchanged | `0540a0904154d890bd712b7bb0100e39884e693b71768b9b19213c1833be89f8` | `0549869619fedaeaa374725917a31fd37e9bc2b85db919669ca52e50a8be2732` | unchanged |
| `mtedu005-baseline.json` | unchanged | same | same | unchanged |
| `mtedu006a-baseline.json` | unchanged | same | same | unchanged |
| `mtedu007-baseline.json` | unchanged | same | same | unchanged |
| `mtedu014p1-baseline.json` | unchanged | same | same | unchanged |

**Important historical nuance:** these fixtures now represent a conscious *corrected-explanation expectation* for the `signed-product` family rather than the literal original published teaching text. Their `source` markers continue to identify the original archived baseline. The old fingerprint is preserved in this review document for auditability. Numeric responses, task identities, all other family snapshots and total exercise counts must still match strictly; further changes should fail the same tests.

## Validation

- CI Vitest, TypeScript/Vite production build, Chromium Playwright required on the **final** PR HEAD.
- Manual mathematical/technical review by maintainer; no independent Work reviewer is active.
- Squash merge only after **separate, explicit owner approval**. Verify main CI and Pages on merge SHA before Issue #103 is closed.

This patch intentionally fixes a confirmed pedagogical issue, not a general guarantee that all 16,581 exercise explanations are sound. Broader quality work remains in Issue #102.
