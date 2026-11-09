# C01 bounded missing source forms — standalone synthetic method

- Source-shaped deficiencies identified in the private worksheet-to-app static audit: plain polynomial limit with positive/negative leading sign, ratios displayed in factored product form, and numerator/denominator sextics. These are different *forms*, not new mathematical theorems.
- Reuse the degree/sign logic concept already present in `polynomialRatioLimit` without editing the original generator. 96 original synthetic tasks: 4 levels x 24 variants, 32 per shape; exact results (positive/negative infinity or reduced rational leading ratio), PL/EN worked steps and grading.
- Independent unit tests cover sign, exact rational cross-product comparison, numerical high-n stability, all tasks, wrong/blank answers, and domain guards.
- **Isolated method only. NO schema, catalog or variant-counter edit; do not merge before independent CI and separate owner approval.** Later integration should be serial with C03 #263 and require UI/Playwright acceptance.
- Private source exercise coefficients, worksheets, key and exact original text are not included. C01 SOURCE_PASS remains pending 1:1 original-source witness testing.
