# W01 — final source-shape acceptance witness matrix (public, private data excluded)

## Why this QA-only PR exists

P43/1a–j has ten verified second-order partial-derivative method shapes in the owner-provided PRIVATE worksheet. Independent differentiation of the private original P43 answer key yielded **27/30 matching results**, with three confirmed errors (1g f_xx; 1j f_xx and f_yy). The private original equations, their coefficients and corrected exact expressions remain outside this repository.

The merged families #180 (trigonometry), #182 (rational) and #184 (polynomial/log/root) already implement all ten synthetic method shapes. However browser pins for rational and source-shape families previously included x/xy/yy but not **xx**, despite original P43 explicitly requiring the second-order family. This PR repairs that **evidence gap without adding generators**.

## Source-method mapping and independent witnesses

| Private worksheet ID | Synthetic family / mode | Four second-order targets |
| --- | --- | --- |
| P43/1a | source-shape / poly-cubic | xx, xy, yx, yy |
| P43/1b | rational / inverse-cubic | xx, xy, yx, yy |
| P43/1c | source-shape / log-positive | xx, xy, yx, yy |
| P43/1d | rational / linear-quotient | xx, xy, yx, yy |
| P43/1e | trig / sin-square-linear | xx, xy, yx, yy |
| P43/1f | source-shape / poly-mixed | xx, xy, yx, yy |
| P43/1g | source-shape / root-linear | xx, xy, yx, yy |
| P43/1h | rational / simple-quotient | xx, xy, yx, yy |
| P43/1i | rational / bilinear-quotient | xx, xy, yx, yy |
| P43/1j | trig / cos-xy-square | xx, xy, yx, yy |

The unit matrix `src/qa/w01SourceMethodMatrix.test.ts` directly constructs **40 source-shape/order cases** (10×4), verifies generator mode and order, uses three independent production-agnostic symbolic oracles, and checks accepted/wrong/blank answers, complete solution steps and hints in **both Polish and English**.

The source-shaped rational and polynomial/log/root Chromium tests now pin **xx** as well as their existing x/xy/yy candidates, 16 variants per family × 2 languages × 2 widths = **64 production UI witnesses per family**, up from 48. The trig family already pins both methods for all six first/second/mixed orders in 48 UI witnesses. Chromium acceptance uses the real app and grades inputs; it must pass final-head CI.

## Formal status / limitations

- W01 synthetic method classes: **10/10 mapped**.
- Original-private key mathematical comparison: **27/30 consistent**, 3 independently corrected discrepancies.
- The source tests **do not render original private examples into public app**, and **do not prove exact coefficient-for-coefficient original source exercises can be entered by a public user**. This remains a separately documented exact-source UI limitation.
- **Global formal SOURCE_PASS remains 14/64 pending owner review**. The PR is QA-only and cannot change the competency counter by itself.
- No changes to #106 PAUSED, PR #142 held or unrelated W02 source work. Separate exact-head merge approval and same-commit main CI/Pages required.
