# G — FINAL FREEZE / PM acceptance (2026-11-10)

Scope: only G01–G08 (function limits), read-only source originals and existing staged G04. **No new generator, PR, Issue or merge was created as part of FINAL FREEZE.**

## Current verified reference
- At audit checkpoint: `main@d942b0f1ec77feb7b83a228502b562df005cde14`. Its exact-HEAD CI #42796038238 = SUCCESS and Pages #42801530402 = SUCCESS.
- Main catalog: **263 families / 19,989 variants** (all subject areas); relevant G04 mixed-root family from merged PR #270 is already available to students.
- Existing staged PR #289 adds **one** G04 exponential-family (24 hard variants) → expected **264 families / 20,013 variants** if subsequently merged by PM. Do not call this published before main CI and Pages.
- Earlier PR #289 HEAD `9445d0f036c8857352869c08b31644172bf03d09` had exact-HEAD CI #42785456236 = SUCCESS. HEAD has drifted from main due to matrix M04/M14; this is evidence for old HEAD only. Require fresh CI at final head.

## Syllabus-relevant competence coverage (index in actual main)
| ID | Source task or theme | Existing main status | Source-certification |
| --- | --- | --- | --- |
| G01 | P26/1l substitution | bounded (family registered) | exact source witness not reviewed here |
| G02 | P26/1a,b,d,k,w–z rational 0/0 cancellation | bounded | exact source witness not reviewed here |
| G03 | P26/1c,e,j,m,v,y one-sided/nonexisting limits | bounded | exact source witness not reviewed here |
| G04 | P26/1f–i,p–u growth and roots; P26/2f exponential growth | partial on main; mixed square/cube family #270 merged, exponent method only in pending #289 | NOT SOURCE_PASS |
| G05 | P26/2a–d,g,h,j conjugates | bounded | exact source witness not reviewed here |
| G06 | P26/3a–d Euler at +∞ | partial, synthetic infinity family already on main | NOT SOURCE_PASS |
| G07 | P24/1–9 rational vertical/horizontal/oblique asymptotes | partial, bounded rational families on main | NOT SOURCE_PASS |
| G08 | P22 lecture Heine and continuity | partial; piecewise and oscillatory synthetic checks in main | lecture/exam status unknown, NOT SOURCE_PASS |

**8/8 named skills have a linked student-facing method; 4 bounded and 4 partial.** Bounded does not equal validated source parity.

## Independently verified mathematics and limits
- Private original source checked locally (not copied publicly): P26/2f uses an exponential quotient at +∞ in which the numerator's dominant base is lower than the denominator's. Its limit is 0, matching the staged METHOD class in #287/#289. This checks a method witness only, **not a SOURCE_PASS for all G04 or G01–G08**.
- On 2026-11-10, independent Python `fractions.Fraction` oracle recomputed all 24 bounded G04 exponent candidate expressions from coefficient construction, *not* production `exponentialFunctionRatioLimit`: **24/24 exact limit classifications PASS** (8 zero, 8 nonzero finite rationals, 4 +∞, 4 −∞). All dominant denominator coefficients are positive. Review of the existing stage generator source and tests shows rational exact comparison and paired PL/EN hints, worked steps and grading; UI verification is based on actual CI, not this mathematical oracle.
- Private asymptote source worksheet enumerates **9** tasks, while its supplied answer-key PDF enumerates **1–8** only: explicit missing reference for P24/9; do not invent source-key approval. Independent math is possible separately, but missing source answer remains a documentation limitation.
- No independent source-by-source witness validation for all P26/P24/P22 tasks was completed in this freeze; final `SOURCE_PASS` status **NOT_VERIFIED**.

## PR handling
- **#270:** merged with CI PASS and released, includes staged mixed √ and ∛ source from **#268**. #268 is duplicate/stage-only, still Draft/open; **do not merge or close without PM review**.
- **#287:** stand-alone exponential stage, terminal CI #42711936442 SUCCESS, still Draft/open; its exact files are included by existing combined **#289**, so **do not merge independently or close without PM review**.
- **#289:** existing combined exponential catalog integration, 24 synthetic source-shaped problems, no known math error; no merge in freeze. Verify latest exact-HEAD CI and independent PL/EN representative UI before PM approval. Its code/tests/docs must preserve every concurrent main change.
- Other subject PRs are outside G scope; no action on them.

## QA gates and final decision
- **Math QA**: PASS for independently checked 24 synthetic G04 exponential variants; previously mixed root #270 24/24 independent QA noted in its review. Not a blanket pass for every source example.
- **PL/EN app tests**: prior exact-HEAD #289 CI SUCCESS, latest reconciled HEAD must re-run; leave NOT_VERIFIED until it terminates SUCCESS. No manual independent device visual review was performed in this freeze.
- **Source parity**: NOT_VERIFIED; G04/G06/G07/G08 partial and P24/9 absent from official supplied key. No observed confirmed mathematical blocker in existing main.
- **LEARNING_READY:** *bounded existing methods on main* are usable under current CI/Pages; **SOURCE_CERTIFIED/COMPLETE: NO**. The G04 optional queued integration is PM-controlled, not justification for additional generators.
- **PM recommendation:** Freeze feature development and stop parallel G work. Receive or explicitly defer #289 after its fresh exact-HEAD CI and a brief independent PL/EN smoke QA; mark #268 and #287 as redundant staging candidates but do not close without verification. Document source gaps as acceptance exceptions. Do not merge automatically.

## Post-#284/#304 reconciliation (2026-11-10)
- #289 targets main `50e8259c9265e57776f4dc2e2bb12730592c5879`. Current main: 265 families / 20,133 variants; this G04 candidate would yield 266 families / 20,157 variants. Earlier counts remain historical checkpoints.
- Scope unchanged: 24 synthetic exponential-ratio problems and existing bilingual QA. P26/2(f) has a source-form and answer witness; no blanket G04 SOURCE_PASS is claimed. Exact-HEAD CI and PM approval remain separate release gates; NO MERGE from this branch audit.
