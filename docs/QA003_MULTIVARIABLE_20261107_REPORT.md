# QA-003 — multivariable audit, review 2 after Work's NEEDS_FIXES

## Review history and current scope

**The unconditional semantic PASS reported at `ace2e815b33320c60dc6e1573c9ad927000f11c2` is withdrawn.** Work correctly found that every `multivar-angular-continuity` question defined g away from a point and assigned f at that point, but never stated f=g away from it. Thus the continuity of f did not follow uniquely from the visible task. The previous TS and SymPy oracles made the same implicit assumption. Correct calculations of g alone and green tests did not establish a semantically complete f problem.

Review 1 is **NEEDS_FIXES / NOT_READY** for 72 tasks / 144 PL/EN questions. Five of the 18 full semantic sample tuples are angular tasks: that previous sample should have been **13 PASS / 5 NEEDS_FIXES**, not 18 PASS. For all 288 records, known under-definition failures supersede a lack of full review: 13 full reviewed PASS, 72 known NEEDS_FIXES, 203 NOT_VERIFIED. These layers must not be conflated with correct intermediate g calculations.

This report describes **review 2**, repeating the SAME cohort after the repair. No new family, variant or independent-coverage count is added. Work has not yet approved the revised HEAD; PR #191 remains Draft for another independent review.

Pinned main remains `11d80cc022b30e0be8381fe712392f14d0769590`, 240 families / 18,333 variants. Its matching [CI](https://github.com/eluyz/math-tutor-app/actions/runs/42367570846) and [Pages](https://github.com/eluyz/math-tutor-app/actions/runs/42369602621) completed SUCCESS. #106/#108/#122 stay OPEN, #151 stays CLOSED. Historical 1,434 external tuples, 75 full PL/EN reviews, 36,472 scenarios and formal global SOURCE_PASS 14/64 are unchanged. Existing 90 arithmetic and 144 graph automated witnesses remain separate evidence classes. No original worksheet/key was inspected: **BLOCKED_SOURCE**, no SOURCE_PASS.

| Family | Levels | All variant indices | Same cohort |
| --- | --- | --- | ---: |
| multivar-path-limit | medium/hard/advanced | 0..23 each | 72 |
| multivar-continuity-point | medium/hard/advanced | 0..23 each | 72 |
| multivar-polar-homogeneous-limit | hard/advanced/expert | 0..23 each | 72 |
| multivar-angular-continuity | hard/advanced/expert | 0..23 each | 72 |

Recent W01/W02 packs already had full independent method checks, so this QA-003 batch selected four two-variable families absent from its historical 19-family ledger and Batch H's W01/W02 matrix. Existing older unit tests were not counted as new external evidence. The current repeat is a specific defect-driven revalidation, not another 288 new cases.

## Confirmed findings and minimal changes

**QA003-MV-01:** baseline main prints English enum codes in the last Polish angular solution step. The existing PR's correction reuses the proper localized option sentence. It remains in this revision; no answer key or grading rule changes.

**QA003-MV-02 (Work):** baseline main and review-1 HEAD omit the off-point relation f=g in all angular questions. The repaired question explicitly states:

- PL: `f(x,y)=g(x,y) dla (x,y)≠(a,b), oraz f(a,b)=…`.
- EN: `f(x,y)=g(x,y) for (x,y)≠(a,b), and f(a,b)=…`.

Actual target coordinates and exact assigned value are substituted in both languages. The same complete definition appears in the definition step of the worked solution. Gradient/limit methods, hints, coefficients, numerical calculations and grading are unchanged. All subsequent limit/continuity deductions now have the required premise.

Frozen pre-edit hashes prove all 72 stable task IDs, `parameters`, full university parameter records and PL/EN answer specs are unchanged. `contentKey` is derived from the visible question, so it intentionally changes when the question is corrected; it is not the stable task ID and is not forced to retain an obsolete question hash. Source proof, six actual old questions and the hash snapshot live under `review2/`.

## Strengthened visible-definition validation

The TS oracle still reads only visible questions, not production modes/answer keys. It now checks the target in the instruction, u/v translation, punctured domain, explicit f=g relation and assigned f value. Both the off-point relation and point value must reference the same coordinates. A continuity question with a missing relation or assigned value throws; no definition is supplied implicitly.

The independent SymPy parser enforces the same logical requirements separately, before constructing the mathematical expression. It does not infer f=g from the answer, solution text or mere existence of g and f(a,b). Negative checks remove the relation, alter its target, alter the assigned-value target and remove the point assignment. All incomplete/inconsistent forms must fail. This includes the actual prior dataset, which now fails as expected; the TS regression likewise rejects six captured old questions.

Regression coverage: all 72 angular variants × PL/EN, invariant hashes, 576 valid definitions across all four families, and deletion of f=g in every continuity task. SymPy additionally rejects **1,152 definition mutations** across the 288 localized continuity views. These are semantic robustness checks, not new independent task coverage or extra grading-scenario totals.

## Other three families and mathematics

`multivar-continuity-point` already explicitly states f(x,y)=g(x,y) off the point, followed by f(a,b). All 72 PL/EN variants pass the strengthened check, and deleting the relation correctly fails. The two limit families ask about the only displayed function g, without assigning a separate f value; no missing f extension is involved. Their 144 tasks / 288 localized questions pass the complete-domain/target checks.

Only after those semantic checks does independent exact mathematics establish:

- `u²v²/(u²+v²)`: `(u²+v²)²−4u²v²=(u²−v²)²≥0`, hence the uniform all-path bound `|g−base|≤|k|ρ²/4→0`.
- `u²v/(u⁴+v²)`: axis versus independently chosen v=u² gives base and base+k/2, distinct for k≠0. Displayed production curves v=c u² are also checked numerically/symbolically.
- `u²v²/(u²+v²)²`: axis versus diagonal gives base and base+k/4. Nonexistence is proved by distinct limits, not merely by seeing an angular expression.
- Angular quotient: unequal axis limits exclude a limit; equal coefficients make the ENTIRE quotient identically constant off the target. Only then compare the explicitly defined f value at the point. Agreement of two arbitrary paths is never treated as a general existence proof.

Review 2 repeats **288 tasks / 576 PL/EN views**, **3,456** correct/wrong/empty/malformed/invalid grading scenarios and **336** displayed numeric path-step checks. Expected inputs are derived independently from the visible formula. The SymPy 1.14.0 check confirms the all-path identities/counterexamples and point-value comparison. Counts are unchanged, not added to prior executions or historical counters.

## Repeated complete semantic sample

The same 18 tuples were reread in both languages after the definition repair: questions, both hints, all 230 working actions/reasons and 36 final steps (266 displayed steps). The five angular pairs now explicitly define f before any transfer from g limits. Coordinate signs/fractions, zero coordinates, constant-quotient sufficiency and the nonremovable case where f(a,b) equals only one axis limit were checked again. This is agent/template-assisted review, not external human approval. The current `semantic-review.md` fingerprints the repaired presentations; its previous unconditional PASS is explicitly superseded.

Current sample: **18 PASS / 270 NOT_VERIFIED** in the candidate, pending Work re-review. Earlier version: **13 PASS / 5 NEEDS_FIXES** among those 18, with 72 total known under-defined angular tuples. Difficulty calibration, generic coefficient notation usability, physical Safari and original-source comparison remain separate NOT_VERIFIED/BLOCKED_SOURCE items. They are not fixed or certified by this task.

## Reproduction and release boundary

1. `npx vitest run src/qa/qa003FunctionDefinition.test.ts src/qa/qa003AngularLocalization.test.ts src/university/polarContinuity.test.ts src/university/multivarLimits.test.ts`.
2. `npx vitest run --config vitest.qa003.config.ts` exports the same 288-task cohort with review-2 provenance.
3. `python scripts/qa/qa003_multivariable_sympy.py` independently validates complete definitions and mathematics, including negative mutation checks.
4. Full Vitest, TypeScript/production build and `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npx playwright test --config playwright.qa003.config.ts`.

The production UI matrix retains the previous hard-level pins and adds the already reviewed angular advanced:1 and expert:5 to show the new definition with fractional/signed coordinates at 375/1280 px in PL/EN. These UI witnesses are not additional independently audited mathematical variants. Console/page/network/overflow guards and actual correct/wrong/empty/malformed feedback remain enabled. The UI explicitly checks the rendered f=g relation. No common harness, CI workflow or timeout is changed.

Current main still contains both defects until a separately authorized merge and matching main CI/Pages. The revised implementation and final exact delivery HEAD/CI are recorded in `evidence-summary.json` and PR #191's validation section. The old CI at ace2e815 is historical test execution, not proof of complete task semantics; the final revised HEAD needs its own CI. No merge, auto-merge, deployment, issue closure, counter inflation or SOURCE_PASS claim. Leave #191 Draft for Work.


Local revalidation at implementation `ce151089c6b46c1b078b4014833a8c79af968312`: **20/20 focused regressions**, explicit audit **288/288 tasks / 3,456 scenarios**, independent SymPy **576 complete visible definitions / 1,152 rejected mutations**, the same **18 full semantic PL/EN reviews**, full Vitest **142 files / 1,723 tests**, TypeScript/production build, and production Chromium **24/24 scenarios / 56 witnesses** all PASS. No console/page/request/HTTP/overflow errors were recorded. These are review-2 results; they do not retroactively certify ace2e815 or increase the cohort counters. Final revised HEAD and fresh CI are paired in the existing Draft PR validation section. Work re-review remains pending.
