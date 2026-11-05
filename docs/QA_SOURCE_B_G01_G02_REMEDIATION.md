# Issue #151 — remaining Batch B source-shape gates (G01, G02)

Date: 2026-11-05. Target: `main`, originating at `37617586563300787f1964932cbd38706f918865` (CI #42022441279 and Pages #42025457341 both PASS).

## Scope / original source boundary

A private, owner-provided ZIP with 43 original course PDFs was opened and its **task and answer-key pages visually inspected**. The original examples were independently calculated without relying on app answer keys. Original numerical coefficients, equations, pages and answer-key images are **not committed or reproduced in this public repository**.

Six existing Batch B source→app method pairs were accepted in #151: C01, C03, F01, G03, G05 and D01, with exact pinned Playwright witnesses and same-SHA CI/Pages. G01 and G02 remain unchecked until this PR is merged, deployed and formally source-reviewed.

- **G01 source P26/1l ↔ P25/1l:** the original is a finite, nonsingular quadratic/quadratic quotient; direct substitution is legitimate because the denominator is nonzero. The older `limit-point:easy:1` browser pin tested a polynomial (constant denominator), an insufficient form witness. New `limit-quadratic-ratio-point:easy` uses independent quadratic numerator/denominator with `D(x)=(x-a)^2+q>0`; oracle independently evaluates numerator/denominator at a.
- **G02 source P26/1a ↔ P25/1a:** the original is a removable 0/0 with a common factor that may be cancelled only on a punctured neighbourhood; the reduced function still has a nonconstant denominator. The older `limit-point:medium:1` pin left only a polynomial. New `limit-cancelled-quadratic-ratio:medium` contains a quadratic numerator and quadratic denominator, each with one common factor x−a and a residual nonzero linear denominator. The oracle uses the exact ratio of first derivatives at a as an independent check of the local factorizations, without relying on the production limit routine.

These are **synthetic source-shaped tasks**, not copies or transcriptions of the private questions. The existing `limit-point` teaching and answer implementation is reused. No general symbolic engine, new problem union kind or QA bypass is added.

## Bounded verification

Exactly two new families with one level each, 24 variants per combination = **48 tasks × 2 locales = 96 PL/EN instances**. The Batch B acceptance manifest adds exactly four browser pins (0 and 1 for each family), producing **16 new browser witnesses across 8 test scenarios** (PL/EN × 375/1280). Existing Batch B manifests/witnesses are preserved.

New targeted `src/university/sourceShapeBatchB.test.ts` verifies:
- G01: both original and synthetic classes have degree-two numerator and denominator, quadratic denominator strictly positive at a (negative discriminant), independently computed exact finite value.
- G02: both numerator and denominator vanish at a (0/0), have exactly a simple common factor; residual denominator remains nonzero, and exact N'(a)/D'(a) is finite and correct.
- 24 distinct content keys each; both locales; correct/incorrect/empty answers, two hints, final answer and every displayed working step plus calculation metadata.
- Existing independent `src/qa/batchB.ts` oracle and the production Playwright harness check the 24-variant matrix and selected real UI flows for G01/G02.

## Acceptance and safety gates

This pull request is **method repair only**. Do not automatically mark either #151 source checkbox complete on green PR CI alone. Required: full final-HEAD CI PASS (units, production build, browser, B–F and evidence uploads), independent review, explicit owner approval of exact PR head for squash merge, and matching main CI **and GitHub Pages** success after merge. Then reassess original source→deployed app witnesses and mark G01/G02 SOURCE_PASS if all gates hold. Physical Safari remains NOT_VERIFIED.

#106 remains PAUSED; #142 is not modified. Batch G is a separate parallel Codex assignment and is not modified or merged in this PR.
