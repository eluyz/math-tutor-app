# Batch G — independent sequences, functions and asymptotes QA

Execution: 2026-11-05 (Europe/Warsaw; raw test timestamps are UTC). Branch `qa/batch-g-sequences-functions-asymptotes` was created solely from current main `37617586563300787f1964932cbd38706f918865`. At the initial check F #174 had already been merged by the owner, with PR HEAD `0a9c22c18ca9c6a2bbc6d7ed4a497afd55b94c3a`; no unmerged F branch was used. Baseline [CI 42022441279](https://github.com/eluyz/math-tutor-app/actions/runs/42022441279) was initially in progress and subsequently completed SUCCESS. Baseline [Pages 42025457341](https://github.com/eluyz/math-tutor-app/actions/runs/42025457341) also completed SUCCESS on that exact main SHA.

**Tested implementation HEAD: `c3776c0a139129430217b829072c4c6a951039e5`.** The following documentation-only commit adds this report and the [compact SHA-256 ledger](qa-batch-g/local-results.json). The single Draft PR validation section pairs the exact final delivery HEAD with its immutable terminal GitHub Actions URL and artifact. This avoids a self-referential report SHA or an additional CI run solely to insert its own URL. `git rev-parse HEAD` resolves the delivery commit locally; [Actions for this branch](https://github.com/eluyz/math-tutor-app/actions?query=branch%3Aqa%2Fbatch-g-sequences-functions-asymptotes) lists the corresponding run. A queued or running job is not PASS.

## Scope and acceptance boundary

Exactly **8 competencies, 16 family–level combinations, unit variants 0–23 inclusive: 384 distinct tasks and 768 localized PL/EN instances**. Exactly **32 distinct UI pins × PL/EN × 375/1280 px = 128 witnesses in 64 Chromium scenarios**. Hand-derived controls reuse sampled IDs. No new generator, dependency, catalog variant, general symbolic solver, UI redesign, subagent or global audit. Catalog remains 231 families / 18,093 variants. No actual remaining Codex quota counter is available, so no percentage is inferred.

Curriculum coverage, syllabus V2, previous acceptance architecture/tests and the selected production generators and regressions were read. No private university original, PDF or key was read or published. PR #142, F05, D10, W01–W03, Issues #106/#151, existing PR branches and source counters are untouched. No merge or subsequent batch is performed.

- **METHOD_PASS** means the selected representative method and its displayed reasoning/application workflow passed in this explicit matrix.
- **METHOD_PARTIAL** describes the wider competency beyond this bounded slice. An excluded existing mode is a test gap, not evidence that the generator is missing.
- **NEEDS_FIX** means a remaining confirmed defect. Two small presentation/localization defects were repaired; none remains in the selected matrix.
- **BLOCKED_SOURCE** applies to all eight competencies: direct comparison with private originals and final source review remain outstanding. **Zero SOURCE_PASS and no formal counter updates.**

| Competency | Selected evidence | Wider competency | Source gate | Distinct tasks |
| --- | --- | --- | --- | ---: |
| C05 | METHOD_PASS — positive shifted Euler-product bases and exact exponent sum | METHOD_PARTIAL | BLOCKED_SOURCE | 24 |
| C06 | METHOD_PASS — all five nonconstant monotonicity/boundedness classes | METHOD_PARTIAL; constants excluded by this factory | BLOCKED_SOURCE | 24 |
| F03 | METHOD_PASS — absolute-value radical domain and closed endpoints | METHOD_PARTIAL; empty/denominator forms not in this slice | BLOCKED_SOURCE | 24 |
| F04 | METHOD_PASS — intersected radical/log/denominator conditions, empty and disconnected sets | METHOD_PARTIAL | BLOCKED_SOURCE | 48 |
| F06 | METHOD_PASS — polynomial parity, composition order, invertible Möbius domains/ranges and inverse point | METHOD_PARTIAL | BLOCKED_SOURCE | 72 |
| F07 | METHOD_PASS — controlled log/power identities, log-product equation, both log-base inequality directions | METHOD_PARTIAL | BLOCKED_SOURCE | 72 |
| G06 | METHOD_PASS — two-sided scaled power limit with positive local base | METHOD_PARTIAL | BLOCKED_SOURCE | 24 |
| G07 | METHOD_PASS — pole/hole distinction, both infinities, horizontal/oblique/no-linear cases | METHOD_PARTIAL | BLOCKED_SOURCE | 96 |

These task counts are disjoint and sum to 384.

## Exact matrix

Each row independently tests all **24 unit variants 0–23** in both languages. Complete IDs are `family:level:variant`. The last column lists the entire UI selection; pool traversal does not add acceptance tasks.

| Block / skill | Generator : level | Method and representative boundary | UI variants |
| --- | --- | --- | --- |
| G1 C05 | `sequence-euler-product:expert` | Two shifted Euler factors; exact rational contributions a·c, positive bases for every n≥1; positive/negative total exponents. | 0, 1 |
| G1 C06 | `sequence-monotonic-bounded:advanced` | Linear, reciprocal and alternating formulas; exact differences and one-/two-sided bounds. All five factory classes. | 2, 4 |
| G2 F03 | `analysis-absolute:medium` | √(abs(x−p)−r), r>0: two closed outer rays, excluded interior. | 0, 1 |
| G2 F04 | `function-mixed-domain:medium` | Product radical over log: radicand≥0, argument>0, log≠0; connected/disconnected domains. | 0, 4 |
| G2 F04 | `function-mixed-domain:hard` | Product radical over √log: log>0 strictly; both base directions and empty/connected domains. | 1, 3 |
| G2 F06 | `function-parity:hard` | Independent polynomial f(−x) and −f(x), symmetric domain R; even, odd, neither. | 0, 2 |
| G2 F06 | `function-composition:expert` | Independent Horner expansion of f∘g−g∘f; all coefficients and their descending UI labels. | 0, 1 |
| G2 F06 | `function-mobius-inverse-point:expert` | Nonzero determinant, excluded original pole/range value, both inverse identities, inverse at the supplied target. | 0, 1 |
| G2 F07 | `analysis-power-law:hard` | log_a(a^k)+a^(log_a u)=k+u, including negative powers and fractional base. | 0, 1 |
| G2 F07 | `analysis-elementary-equation:hard` | Log-product equation: both arguments positive; independent quadratic factorization rejects the extraneous root. | 0, 1 |
| G2 F07 | `analysis-log-inequality:hard` | Non-strict log inequality: positive argument, exact a^k and reversed direction for 0<a<1. | 0, 1 |
| G3 G06 | `analysis-euler-function:hard` | (1+a·x)^(b/x); local positivity, logarithmic limit a·b and exp(a·b)>0. | 0, 11 |
| G3 G07 | `analysis-asymptote-vertical:advanced` | Cancellation retains original excluded point; finite hole or pole with both one-sided sign orientations. | 0, 1 |
| G3 G07 | `analysis-asymptote-horizontal:advanced` | a+b·x/√(x²+1) has two different limits; nonconstant linear mode has no horizontal asymptote. | 0, 1 |
| G3 G07 | `analysis-asymptote-oblique:advanced` | Independent polynomial long division; both slopes/intercepts, zero and nonzero remainders, original excluded point. | 0, 1 |
| G3 G07 | `analysis-asymptote-oblique:expert` | √(x²+1)+x+b has oblique at +∞ and horizontal at −∞; quadratic mode has no linear asymptote. | 0, 1 |

## Independent mathematical evidence

`batchGCertificate` reads only original task parameters (`task.university`). It never reads production answers, hints, solution steps or a production mathematical solver as oracle inputs. Production answer/solution fields are the objects under test. `wrongBatchG` may inspect available choice options solely to select an incorrect UI response, never to establish an expected result. Test-only exact rational/polynomial primitives from unchanged `batchFMath.ts` are reused. New `batchGMath.ts` supplies interval-cell construction, Horner composition and exact signed powers. The pre-existing `selectedSetContains` parser only interprets the actual serialized set for comparison with independent predicates.

- **C05:** b+1>0 and 1+min(a,0)/(1+b)>0 prove base positivity for all n≥1. With u=a/(n+b), log factor = [ln(1+u)/u]·a(cn+d)/(n+b)→a·c. Each exponent is genuinely infinite because c≠0. Add rational contributions before exponentiating. Shifts vanish; products are justified by positive factors. No claim of a sampled zero total exponent.
- **C06:** linear difference is s. Reciprocal difference is −s/((n+k)(n+k+1)). Alternating difference is −s(−1)^n(2n+2k+1)/((n+k)(n+k+1)), which changes sign. Explicit bounds follow from 0<1/(n+k)≤1/(k+1), absolute amplitude, or a₁ for a one-sided linear bound. Exact checks at n=1,2,3,10,100 supplement these identities; they are not the monotonicity proof. A nonzero amplitude factory omits constant sequences.
- **F03/F04:** enumerate independent critical points, endpoints and open cells, evaluate the exact inequality predicates, then serialize their intersection. Compare actual domain membership at every critical point, all cell representatives and both tails. Each predicate has constant truth on its cells, so this is a sign decomposition, not arbitrary numerical sampling. A denominator √log requires log>0; log alone excludes argument 1. F03's positive radius gives nonempty rays; F04's empty domains do not establish F03 empty-case coverage.
- **F06:** coefficient parity identities require the symmetric polynomial domain R. Both polynomial composition orders are independently expanded and checked by exact nested substitution. Möbius determinant ad−bc≠0 and c≠0 give original D=R\{−d/c}, W=R\{a/c}. Cross multiplication yields inverse (d·y−b)/(a−c·y); both matrix-adjugate products equal determinant times I, establishing both inverse identities on the excluded domains. Inverse D/W swap; the target denominator is checked and f(f⁻¹(y))=y is verified exactly. The app grades the inverse point; it has no separately graded arbitrary range field. Polynomial composition domain is R; no claim that every polynomial range is R.
- **F07:** require a>0, a≠1 and positive log arguments. Exact integer powers include negative exponents and a=1/2. In the equation z=x−p>0 and z(z+1)=2, roots 1 and −2 arise algebraically; only 1 satisfies the original logs. For the selected ≤ inequality, base>1 yields (p,p+a^k], base<1 yields [p+a^k,+∞), with the left log-domain restriction preserved. No arbitrary symbolic exponent/log engine is implied.
- **G06:** |x|<1/(2|a|) gives 1+a·x>1/2. Apply ln(1+u)/u→1 from both sides, so ln L=a·b and L=exp(a·b)>0; b/x has opposite signed infinities on opposite sides. This is a local two-sided power limit, not an unconditional rule for negative bases.
- **G07:** independently cancel common factors but retain original domain exclusions. A finite two-sided limit is a hole, not a vertical asymptote. For c/(x−h), numerator and side signs give both infinite limits. Radical horizontal limits use √(x²)=abs(x). Rational oblique long division is independently reconstructed and verified by D·Q+R=N; R/D→0 separately at both infinities. For √(x²+1), the exact conjugate remainder 1/(√(x²+1)+abs(x))→0 gives the different lines at ±∞. A quadratic has no finite f(x)/x limit and therefore no linear asymptote; this is not a claim that no polynomial reference curve exists.

Hand controls repeat existing sampled IDs: Euler product exponent 5/12, increasing/unbounded sequence, power identity −21/2, equation −10, function Euler exponent 4, vertical pair +∞/−∞, rational oblique slope 1 and intercept −14.

## Didactic and browser checks

All 768 localized unit instances assess independently correct, wrong and empty answers, including the final answer step. Every working step must have its own independently constructed mathematical anchors and the exact working-step count must match. Intermediate equations, signs, factors, exclusions and values are checked, as are every structured calculation, both hints, explanation and reason text. Choice labels are independently matched to the mathematical result. English rejects known Polish learning copy including `Dla`, `gdy`, `lub`. Selected teaching templates and their theorem justifications were read against the derivations above. Length/localization checks alone are not a proof of natural-language reasoning, and this is not a general automatic proof checker.

Production Chromium uses `vite preview` port 4773 and two workers. The existing B–F acceptance runner is reused with one optional navigation-group field; its default remains university. Three existing F07 algebra families are reached through the real “Review the basics” / “Powtórka podstaw” navigation. There is no new QA backdoor or duplicated browser engine. The G callback checks every mathematical anchor in the rendered solution, the selected option label and descending composition coefficient labels.

Each of 128 witnesses checks empty→invalid, wrong→incorrect, correct→correct, both real hints, all steps/reasons, final visibility and whole-page overflow after hints and solution. Console errors, pageerror, failed HTTP requests and HTTP≥400 must all be absent. Every locale/viewport pair covers the same 32 IDs. Screenshots and witness attachments record those IDs. Viewports are not a physical mobile-device or full accessibility audit. No timeout was increased.

## Confirmed defects and repairs

Exactly two small production presentation changes; no mathematical answer, coefficients, domain or catalog size changed:

1. `sequenceFollowup.ts`: the English linear-unbounded solution contained `Dla n→+∞: ...`. Reproduced by the PL/EN check; localized to `As ...` in EN.
2. `elementaryAnalysis.ts`: fractional-base text `log_1/2` was ambiguous. A small display helper now uses `log_(1/2)` and parenthesizes the fractional power base. It applies to the existing log-domain/power-law/equation/inequality family text. Independent tests reject the old ambiguous text in the selected F07 questions; all source regressions pass.

The first full-unit run detected the expected historical content-hash difference caused by the second repair. A narrowly scoped test serializer maps only these two intentional notation replacements back to their historical spelling, only for those four elementary families. Original archive fixture hashes remain unchanged. No coefficients, answers or mathematical failures are exempted. The archive regression then passed, followed by the complete unit suite alone. This is test archive compatibility, not a third generator repair.

## Wider coverage and concrete remaining gaps

| Skill | Existing inventory used / excluded scope |
| --- | --- |
| C05 | Existing Euler-product family (medium/hard/advanced/expert) supports shifts/products; expert selected. Other Euler sequence families/levels are outside this slice. |
| C06 | Existing monotonic/bounded family (medium/hard/advanced), nonzero amplitudes. All five selected classes verified; constant cases are absent from this factory and remain a concrete method-form gap. No new family added. |
| F03 | Existing absolute family (easy/medium/hard/advanced/expert) has a medium domain mode; selected √(abs(x−p)−r), r>0. Absolute expressions in denominators and empty absolute-domain cases are not established by this family/manifest. |
| F04 | Existing mixed-domain family (easy/medium/hard); medium/hard chosen. The easy root/log mode remains existing but untested here, not a missing generator. |
| F06 | Existing parity (easy/medium/hard), composition (medium/hard/advanced/expert), Möbius inverse point (hard/advanced/expert). Only selected levels verified. Nonsymmetric parity domains, arbitrary inverse existence and non-Möbius inverses are outside this slice. |
| F07 | Existing power-law/equation families (easy/medium/hard) and log inequality (medium/hard); selected hard controlled forms. Other equation modes and strict medium inequalities are excluded test cases. No arbitrary symbolic equations/inequalities claimed. |
| G06 | Existing Euler-function family (medium/hard/advanced/expert); hard scaled form chosen. Ratio/offset/basic and degenerate base-one forms remain excluded existing modes. |
| G07 | Existing vertical/horizontal families (medium/hard/advanced) and oblique family (advanced/expert); chosen advanced/expert cases cover both ends and hole/pole/no-line boundaries. Other rational horizontal, double-pole and level variants remain outside this matrix. |

All eight require owner-led private-original comparison and final source acceptance. Recommended follow-up is that source review, then a small explicitly scoped slice for necessary excluded forms (not automatic Batch H). Do not infer full syllabus or source acceptance from this synthetic suite.

## Execution, evidence and integration

- G1 checkpoint `cd633bfdbbb38e5971afd480f19c0ab99cee5040`: 2 combinations / 48 tasks × PL/EN passed after the EN repair.
- G2 checkpoint `6bad1d56cb64e6375af93a43843299a296724d27`: 11 cumulative combinations / 264 tasks × PL/EN passed after the notation repair.
- G3 checkpoint `1e58744ad845c2229f977bb7f59e729b721ee1c6`: 16 combinations / 384 tasks × PL/EN passed.
- Final local **Batch G 18/18 PASS; selected existing regressions 49/49 in 8 files PASS; production build PASS; historical archive regression 1/1 PASS; full units 1,659/1,659 in 128 files PASS; production Chromium 64/64 PASS in 168.16 seconds**, 128 witnesses, zero browser/network errors. The existing >500 kB bundle warning remains. Browser and full-unit runs were serialized; no timeout increase or needless repeated full suite.
- The compact ledger stores exact commands, raw report hashes, generator/test/config SHA-256, production asset hashes and all pinned IDs. Large local JSON/HTML/screenshots stay ignored. CI uploads `batch-g-browser-evidence` with 14-day retention; download it before expiration for long-term evidence.
- Final CI includes full units, production build, base browser regressions and B/C/D/E/F/G acceptance. Only the G step and artifact upload are added to the existing workflow; the 40-minute limit is unchanged. Final terminal result, exact delivery HEAD and immutable run/artifact links are recorded together in the Draft PR validation section.

Reproduce with `npm ci`, `npm run test:batch-g`, `npm run build`, `npm run test:e2e:batch-g`, the eight-file regression command in the ledger, then `npm test`. This cloud environment uses `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium` and npm cache `/tmp/math-tutor-npm`; no dependency was added.

F #174 was already on the starting main. Only G's branch is modified; no other PR branch is rebased, retargeted or merged. Preserve existing B–F scripts/configs/artifacts alongside the additive G entries. If main subsequently changes, update only G and require new CI on the resulting exact HEAD. Stop after this package.
