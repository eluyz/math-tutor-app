# G07 integration — reconciliation with C02 and U06/U08 (#252)

Date: 2026-11-09. Staged source module #257 was merged; catalog integration #258 now has this exact main parent: `9324d25c1b28741824abab845c653ccd229f194e`.

## Scope
- One new hard-only G07 family `analysis-asymptotes-combined-rational` with 24 synthetic variants. From one rational function, learners determine both vertical and horizontal/oblique asymptotes.
- Six method shapes, two answer fields, bilingual PL/EN steps, source-independent mathematical tests, Playwright 375/1280 px and batch B–G.
- Preserve C02 #242 quartic-root family, I04 #255 regression, U06/U08 #252 two three-parameter Gauss families, M06, W02, G06 and all previously exposed exercises. Shared files rebuilt from current main, only G07 additions.
- Register family and explicit presenter ahead of `isElementaryAnalysis`, keep G07 coverage `partial`.

| Metric | Current main | G07 candidate |
| --- | ---: | ---: |
| Families | 246 | 247 |
| Nonintegral families | 224 | 225 |
| Variants | 18 765 | 18 789 |
| Nonintegral variants | 17 181 | 17 205 |

## Required gates
1. Full exact-head CI unit/build/Playwright and Batch B–G PASS on this reconciled candidate.
2. Check current main did not change in shared catalog files; otherwise reconcile and rerun CI.
3. Conditional owner-approved Squash merge only after PASS; postmerge main CI and same-SHA Pages PASS.
4. Nine private G07 examples, eight keyed solutions; remaining answer derived independently. No original material published, no SOURCE_PASS until source-to-deployed-UI independent verification.
