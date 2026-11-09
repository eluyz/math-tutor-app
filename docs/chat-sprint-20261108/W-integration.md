# W02 integration gate — source-shaped 3-/4-stationary-point methods
Date: 2026-11-09. Owner-controlled Draft PR #248; no automatic merge.

## Dependency
Prerequisite PR #241 was owner-approved and squash-merged at reviewed HEAD
`fcb6a116d9e44790e93d13c5b025661b37ad63ab` into main
`e3a31bba5d61b3d6743330620a0c337748a869a0`. This integration is rebased
onto newer main containing other independently merged D/I/C work and must pass
CI again at the new exact head. The integration must receive separate owner approval.

## Student-visible changes
- Existing `multivar-quadratic-cubic-extrema` registers `advanced` in addition
  to unchanged `hard`. 24 new authored variants: 12 with 3 stationary points
  and 12 with 4. No copied original university problem text or coefficients.
- One family, no new catalog family IDs or schema cases.
- `taskPool('derivatives','advanced')` contains the new problems; search by W02
  or family name, then choose Zaawansowany/Advanced in university practice.
- Each point: x, y, f(x,y), f_xx, Hessian determinant and classification. All
  critical points are shown and graded; in particular, retain the y=0 branch
  and all saddle points.
- Synthetic independent polynomial oracle is separate from the production
  generator and is used for unit and browser acceptance.
- Mobile 375px and desktop 1280px, PL and EN, correct/wrong/empty answers,
  hints, solutions and point classifications are checked by the pinned E2E suite.

## Inventory, invariant checks
- Family count: **241** unchanged.
- Catalog instances: **18,405 → 18,429** (+24).
- Outside integral families: **16,821 → 16,845**.
- Families with L4/advanced: **180 → 181**.
- Families with L5/expert: **164**, unchanged.
- The 64 competence map stays 64/64 mapped and W02 stays PARTIAL pending
  private-source acceptance; do not claim SOURCE_PASS from these counts.

## Required release evidence
1. PR #241 owner-approved merge and full exact-HEAD premerge CI PASS — complete; postmerge main CI and Pages must still be checked on the merged SHA.
2. Integration PR final SHA: unit + build + Chromium + Batch B–G + pinned
   advanced W02 browser tests succeed (on the exact final SHA).
3. Inspect visual/mobile answer form for 18-field and 24-field versions,
   including labels and scroll overflow, and verify no private materials.
4. Owner approval for this integration merge, then main CI + Pages PASS.
5. Independent source-to-app acceptance of P43/2c–d before updating W02
   formal SOURCE_PASS. Earlier W01/W03 statuses do not change automatically.

This is **METHOD_INTEGRATION_CANDIDATE**, not deployed or source-accepted.
