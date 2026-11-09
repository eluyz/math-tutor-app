# G07 — source-shaped complete asymptote analysis (standalone Draft)

2026-11-09. An isolated, synthetic hard-level task family with 24 cases is provided in analysisCombinedAsymptotes.ts and its standalone Vitest audit.

This is NOT yet registered in the student UI catalog. It deliberately avoids concurrent shared files (schema.ts, catalog.ts, competencyIndex.ts, global counts/tests/README). A separate serialized integration PR is needed after exact-head CI and owner permission.

The private original material contained **nine** rational asymptote questions spanning: quadratic-over-linear, equal-degree quadratic rational, linear-over-linear, cubic over strictly positive quadratic, and linear-plus-reciprocal functions. The corresponding answer sheet supplies answers to **eight** of nine, so the ninth is independently derived, not marked official-answer PASS. This repository records no worksheet coefficients, scans, transcribed tasks or answer-key values.

This module adds one task requiring BOTH vertical and horizontal/oblique asymptotes with two separately graded fields, independently of whether one type is absent. Includes poles, no-real-denominator-root cases, and a removable-hole boundary test (extra synthetic regression, not claimed as an exact worksheet item).

Math proof: polynomial division produces f(x)=ax+b+R(x)/Q(x), with R(x)/Q(x)→0 at both infinities, and vertical asymptotes exist precisely at genuine noncancelled real denominator poles. Equal-degree limits give horizontal asymptotes. A cancelled denominator zero is a hole, not an asymptote.

G07 source method coverage and source→student-UI acceptance remain partial. Do not mark SOURCE_PASS. Before the separate integration, review 24-case independent math tests and bilingual grading, then obtain CI and mobile/desktop browser evidence. Merge only with explicit owner authorization.
