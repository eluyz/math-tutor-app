# W01 — symbolic logarithm and square-root partials

## Baseline and source gate

Base main: `e2453fb8cab90426f1bcba6f3992347cbe7bbea0`; merged #177 verified. Baseline CI [42117804487](https://github.com/eluyz/math-tutor-app/actions/runs/42117804487) and Pages [42122543249](https://github.com/eluyz/math-tutor-app/actions/runs/42122543249) completed SUCCESS on that exact SHA. Branch `feature/w01-elementary-symbolic-partials`. No main push, merge, auto-merge, #106 audit, #142 change or source-counter update.

No local PDF was found. Connected Drive searches for the specified document title and P43 returned no results. The private original was not read. The user's listed method classes are the audit input; exact correspondence to P43/1a–j remains **BLOCKED_SOURCE**, not SOURCE_PASS. Only authored synthetic formulas are published. No institutional branding is added to the app.

## Coverage matrix

| Required method | Existing generator / new delivery | Method coverage | Confirmed gap / action |
| --- | --- | --- | --- |
| Polynomial partials | multivar-partial-point, multivar-gradient-point, multivar-cubic-partial | METHOD_PASS within Batch H scope; wider METHOD_PARTIAL | Existing point grading does not grade arbitrary symbolic functions; retained unchanged. |
| Polynomial compositions | multivar-chain-gradient | METHOD_PARTIAL | First-order gradient only, not elementary second partials. |
| Composite natural logarithm | NEW multivar-elementary-partial, log mode | METHOD_PASS for controlled quadratic u; wider METHOD_PARTIAL | Symbolic first/second/mixed derivatives and real/C² domain now covered. General log arguments remain excluded. |
| Square root | NEW same family, root mode | METHOD_PASS for controlled quadratic u; wider METHOD_PARTIAL | Symbolic derivatives and u≥0 versus u>0 distinction now covered. Higher roots/general radicands remain excluded. |
| Composite trigonometric functions | No W01 family found | METHOD_GAP | Next priority: source-specific controlled trig forms. One-variable trig tasks are not W01 coverage. |
| Bivariate polynomial quotients | No W01 family found | METHOD_GAP | Next priority after trig: nonconstant denominators, exclusions, mixed quotient/chain/product rules. |
| Variable exponent, including x^y | No W01 family found | METHOD_GAP | Later bounded logarithmic-differentiation package on x>0. |
| Combined rules | New f_ij=F″(u)u_i u_j+F′(u)u_ij | METHOD_PASS for chain+product here; METHOD_PARTIAL overall | Does not implement a general quotient or variable-exponent solver. |

## Complete bounded implementation

One family, one level (`hard`), variants 0–23: 24 distinct tasks, 12 mode/order pairs repeated with different authored quadratic coefficients. Targets x,y,xx,xy,yx,yy; modes ln(u), √u. The fixed 24-slot catalog convention is reused, with no extra difficulty multiplication. Catalog changes from 233/18,141 to 234/18,165.

u=a x²+bxy+c y²+d with a>0,c<0,d>0. Thus u>0 is a nonempty proper open set, not a vacuous global-domain assumption. Since 4ac−b²<0, the inner Hessian is invertible; its only stationary point is the origin, where u=d>0. Consequently u=0 is a regular boundary. ln(u) has domain u>0; √u has real domain u≥0 but these C² formulas apply only on u>0.

The answer is a **function identity**, not a value at a point. Users enter rational coefficients in a specified linearly independent function basis: x/u,y/u (or x/√u,y/√u) for first partials; 1/u,x²/u²,xy/u²,y²/u² (or the corresponding root denominators) for second partials. Because d≠0, the common-numerator constant term uniquely determines the 1/u or 1/√u coefficient; the remaining polynomial coefficients are unique. This uses existing list grading/UI. It is controlled symbolic coefficient grading, not a general parser accepting arbitrary equivalent symbolic expressions.

Solutions show original u/f, real and differentiability domains, all first/second inner derivatives, both outer derivatives, the chain/product identity, selected substitution and expanded coefficients. Both hints adapt to derivative order. English mathematical basis labels are added by an explicit bounded whitelist, not an unrestricted translation fallback.

## Independent proof and verification

The production routine uses direct controlled coefficient formulas. The oracle independently expands and differentiates bivariate monomials and uses **implicit identities** exp(f)=u or f²=u:

- log: u f_i=u_i; u² f_ij=u u_ij−u_i u_j;
- root: 2√u f_i=u_i; 4u^(3/2)f_ij=2u u_ij−u_i u_j.

It extracts expected basis coefficients from these polynomial identities using exact rational arithmetic. It never reads the production coefficient helper, answer field, hints or working as oracle input. Both mixed differentiation orders are compared. Unit checks cover all 24 tasks × PL/EN, correct/wrong/empty answers, all seven working steps, both hints, final answer, domain signs and localization. Domain validity follows the analytic argument above, not numerical samples alone. Existing W01/W02 and Batch H regressions are retained.

Historical catalog accounting explicitly excludes the new independently tested family from the unchanged 8,685-task archive baseline. Current catalog assertions are increased by exactly one family/24 tasks; no historical hashes or correctness assertions are relaxed.

New Playwright uses the unchanged acceptance harness and independent coefficient oracle. Pins v0–11 cover every mode/order pair in PL/EN at 375/1280 px, with correct/wrong/empty inputs, actual hints/full steps, domains, page overflow and console/page/HTTP errors. `playwright.w01.config.ts` runs the production bundle on port 5179 with two workers. The existing default browser suite discovers the new spec and Batch H; existing CI separately runs B–G. No workflow timeout increase.

## Results and delivery

Final local results, source SHA-256 and exact tested implementation HEAD are recorded in `docs/qa-w01/local-results.json`. The single Draft PR validation section pairs the final delivery HEAD with terminal GitHub Actions evidence. Initial full-unit integration failures (catalog bookkeeping and explicit English basis labels) were corrected without weakening assertions. No remaining mathematical defect was identified in existing W01 families.

Verdict: **PASS for this complete log/root subpackage; W01 overall METHOD_PARTIAL; exact source coverage BLOCKED_SOURCE.** Next work requires original-method review, then a bounded trig package, quotient package and variable-exponent package in that priority order. No subsequent package starts automatically.

Tested implementation HEAD: `4dddf50a3f075e3f6d6df569ea5a4179b5fc702a`. Local results: 42/42 initial W01/W02/H targeted checks; 258/258 integration checks; final full Vitest **1698/1698 in 132 files**, build PASS, production Chromium **4/4 scenarios, 48 witnesses**, zero errors. The documentation-only successor records this evidence; final CI must verify its exact delivery SHA.
