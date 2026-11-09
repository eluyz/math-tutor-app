# C05 — Euler limit at quadratic scale (isolated candidate)

- Source-method motivation: separately witnessed a square-scale Euler type on private worksheet P15/2a, not covered by registered linear n-scale `sequence-euler-product`. Do not reproduce source task or answer in this repository.
- Added separate `src/university/sequenceQuadraticEuler.ts` module with 96 original synthetic variants: medium/hard/advanced/expert × 24, PL/EN explanations and exact choice answer `e^(a*c)`.
- Bounded form: `(1+a/(n²+b))^(c*n²+d)` for n≥1, b≥0, a≠0, 1+b+a>0. Exponentiate the logarithmic limit `a*c`; do not approximate e for grading.
- Independent tests evaluate rational `a*c` without using production oracle, a stable `log1p` numerical convergence check, 96 distinct task texts, both locales, valid/invalid feedback and boundary domain rejections.
- This PR is **standalone only**: no registration in schema/catalog; no counters changed and no deployed tasks. Does not establish full C05 SOURCE_PASS. Integration requires its own serial PR, CI, and explicit owner approval after C02 #242 is released.
