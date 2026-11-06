# W01 P43 — source-shaped symbolic polynomial, log and radical partials

## Private original audit

The owner-provided private original P43 task sheet and associated private answer key were visually inspected. Four remaining **method shapes** in P43/1a,1f,1c,1g require partial differentiation **as symbolic functions**: (1a) a cubic polynomial with a mixed term, (1f) a mixed cubic polynomial, (1c) a logarithm of a strictly positive quadratic sum, and (1g) a square root of a quadratic-plus-linear inner argument. The previously merged families primarily evaluated polynomial derivatives at points or used other log/root argument shapes.

This candidate implements synthetic, structurally equivalent tasks with independent coefficients **without publishing any original task formula or key formula**. It neither claims to be the exact original exercise nor imports university-branded content.

## What the bounded family covers

One family `multivar-source-shape-partial`, four shapes, six symbolic targets (`x,y,xx,xy,yx,yy`), one hard level = **24 independently generated tasks**, first/second/mixed derivative order. No general symbolic parser is implied; an explicitly declared linearly independent **function basis** lets the existing coefficient-list grader check exact answers without point substitution.

| Synthetic shape | Source method | Domain |
| --- | --- | --- |
| Cubic with mixed xy term | P43/1a | `R²`, smooth |
| Cubic polynomial with x²y and xy² | P43/1f | `R²`, smooth |
| Logarithm of positive quadratic sum | P43/1c | `R²`, positive argument everywhere |
| Radical of quadratic in x and linear in y | P43/1g | Real function `u≥0`; C² chain-rule derivatives `u>0` |

The polynomial working includes first, second and mixed symbolic derivatives and an exact coefficient-basis expansion. Log and square root working explicitly shows all inner derivatives, both outer derivatives, the two-term second partial chain/product identity and correct domain. Both languages are supported.

## Mathematical validation and oracle

`src/qa/w01SourceShapes.ts` builds independent sparse bivariate polynomial functions, differentiates monomials once or twice, or uses **outer-function differentiation identities** (for log: `u_i/u`, `u_ij/u - u_i u_j/u²`; for square root: `u_i/(2√u)`, `u_ij/(2√u)-u_i u_j/(4u^(3/2))`). It then extracts expected exact rational coefficients from an **independent basis map** and rejects nonzero residual terms outside the intended answer basis. It never reads production coefficient helpers or grading answer fields.

Validation required: all 24 tasks × PL/EN for correct/wrong/empty grading, seven mathematical solution steps, domain, mixed symmetry and language; 12 pinned UI tasks covering every method in PL/EN × 375/1280px (48 witnesses), plus full CI including unit/build/standard Playwright and Batch B–G.

## Acceptance boundaries

The private answer key contains independently verified errors (P43/1g f_xx, P43/1j f_xx and f_yy). The implementation must use mathematical differentiation, **not a copied key error**. This family is a bounded source-method witness, not evidence to automatically increase global SOURCE_PASS. A final source→app inspection of all ten original exercise method classes, original answer-key discrepancy handling and production UI remains required.

**Until independently reviewed and owner-authorized merge:** candidate only, W01 METHOD_PARTIAL / SOURCE_NOT_VERIFIED, global 14/64 SOURCE_PASS unchanged. No #106/#142 changes, and parent #108 remains open. CI on exact final HEAD, separate owner Squash approval and postmerge same-SHA main CI+Pages required.
