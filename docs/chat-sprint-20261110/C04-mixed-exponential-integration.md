# C04 mixed polynomial and exponential quotient — bounded integration

- Input: two isolated files from Draft PR #295. The original P15 worksheet is private; no values, scans or answer key are reproduced in the repository.
- New public family: `sequence-mixed-exponential-source-shape`, medium/hard/advanced/expert; 24 synthetic variants per level = 96 total.
- Controlled shape: a positive linear factor times an exponential quotient, with denominator `n·(Bⁿ+c)`, B>1 and nonnegative c. Three strictly positive-base cases A<B, A=B, A>B yield 0, exact positive rational a, +∞ (32 examples per case).
- App source: validated formula, exact result, PL/EN question and both hints, worked steps, correct/incorrect/empty grading, independent exact limit oracle, invalid domain and variant tests.
- Mobile/desktop 375/1280px PL/EN Playwright catalog feedback and solution journeys.
- Base branch at integration creation: main `d942b0f1ec77feb7b83a228502b562df005cde14` (263 families, 19,989 variants). Candidate adds one family and 96 exercises: **264 families / 20,085 variants**; L4 200/L5 181.
- Distinction: the mathematical technique addresses one *part* of the P15/1w mixed-shape gap. The exact original numerator and denominator terms, sign-cancellation cases and original grading have **NOT** received `SOURCE_PASS`. No new original-source acceptance is implied.
- Release gate: isolated Draft #295 full exact-HEAD CI SUCCESS, then integration Draft full CI SUCCESS (including unit/build/Playwright/B–G), then owner-approved squash merge with SHA guard, then main CI and Pages SUCCESS. Close #295 without merge after integrated release verification, if its method is fully superseded.

## FINAL FREEZE 2026-11-10

Existing PR #297 was synchronized without creating new generators or issues. Both earlier exact-HEAD CI runs succeeded; new HEAD requires fresh CI. Candidate not merged. PR #295 is isolated/superseded but remains unmerged for PM review. University source 32/32 independent answer-key oracle does not establish app 1:1 acceptance. P15/1w bounded method is represented, but exact parameter/feedback witness remains NOT_VERIFIED. C06 lecture-only theory scope remains uncertain.
