# G04 — exponential function ratios at positive infinity: bounded method stage

Date: 2026-11-09. Source-method gap: a private G04 worksheet includes a ratio of exponential functions with x→+∞, not just a sequence with n→+∞. Only this mathematical form is used; original coefficients, instructions and answers are not copied to the public repository. This is **synthetic METHOD_CANDIDATE**, not original-source SOURCE_PASS.

## Isolated implementation

- `src/university/functionLimitsExponentialRatio.ts` exports a **stage-only** 24-variant hard-level family, discriminator `limit-exponential-function-ratio`.
- Compare dominant bases after rewriting shifted powers A^(x+k)=A^k·A^x and collecting equal-base coefficients. One source-shaped mode has a positive dominant denominator term minus a smaller-base term; the denominator is then **eventually positive** for x→+∞, not necessarily positive for all real x. The remaining modes use strictly positive denominator coefficients. Six modes include smaller leading numerator base (0), equal bases (nonzero rational), greater leading base (+∞ or −∞), and exact cancellation of two identical leading bases (0 or nonzero rational). Four coefficient families × six modes = **24 unique problems**.
- Outputs: 8 zero, 8 nonzero rational, 4 positive infinity, 4 negative infinity. PL/EN worked steps, two hints, exact rational grading-ready answer type.
- `src/university/functionLimitsExponentialRatio.test.ts`: independent formula/oracle and large-x numerical checks for all 24; PL/EN, both hints, all steps, correct/wrong/blank grading, cancellation, malformed base/denominator checks.

## Release rules and limitations

**Not in catalog / schema / competency index.** This stage **does not** make tasks available in the app; an independent G04 integration PR must later add a discriminator to `schema.ts`, one family registration and presenter dispatch to `catalog.ts`, G04 search mapping, and PL/EN 375/1280 browser acceptance. First confirm this stage's exact-head CI PASS (unit/build/Chromium/Batch B–G), then seek owner authorization. Do not modify historical frozen fixtures, do not merge automatically, and do not count this as full G04 syllabus acceptance.

G04 fractional-root integration is separate PR #270. This stage must not change that PR's scope or represent its test status.
