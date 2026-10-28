# D09 — guided graph sketch from derivative and concavity signs

**Status:** bounded study workflow proposed in Issue #119. A generated exercise and an optional reference curve do **not** constitute automated grading of a freehand drawing. Parent syllabus acceptance gate: #108.

## Why this is needed

The anonymized worksheet inventory contains two exercises (private pointer P32/4a–b) asking for a qualitative **hand-drawn graph** from derivative and concavity information. There is no supplied official reference sketch for those examples. A scalar answer, plotted final graph, or collection of endpoint choices cannot be called a scored sketch.

## Proposed first implementation — bounded and honest

Family: `derivative-sign-sketch`; 24 variants at each of hard, advanced and expert (72), in PL and EN.

Reference mathematical family, used to independently construct the signs and a curve:

`f(x)=e[(x−a)+s²/(x−a)]+v`, where `e∈{−1,+1}`, `s∈{1,2,3}`, and `a,v` are bounded integers.

- **Domain:** all real x except `a`; x=a is a vertical asymptote.
- **Oblique asymptote:** `y=e(x−a)+v`.
- **First derivative:** `f′=e(1−s²/(x−a)²)`; zeros `a−s` and `a+s`; signs for the four intervals are `e,−e,−e,e`.
- **Second derivative:** `f″=2e s²/(x−a)³`; signs are `−e,−e,e,e`. **No inflection** occurs at the excluded pole.
- **Stationary points:** `(a−s, v−2es)` and `(a+s, v+2es)`, with the types reversed if e is negative.
- **Near the pole:** the two branches are disconnected; their limit directions depend on e. The curve lies on opposite sides of its oblique asymptote on either side of a.

The app shows the sign table, formula and instructions to **draw the shape on paper**. It checks the four typed stationary-point coordinates numerically with exact arithmetic, with wrong/blank/invalid answers and worked steps. The student can *choose* to open a reference SVG after drawing; the reference is not automatically scored against the paper image.

## Paper-sketch acceptance checklist

1. Mark both forbidden x-values and asymptotes; there is exactly one excluded x-value.
2. Draw two disconnected branches. The two one-sided limits at x=a go to opposite infinities.
3. Place and classify both extrema using the f′ sign changes.
4. Draw the left branch with the correct concavity from f″ and the right with the opposite concavity.
5. Check which side of the oblique asymptote each branch occupies; it must approach the line for |x|→∞.
6. Compare the drawn shape with the voluntarily revealed reference SVG and the textual solution. Mark the drawing as satisfactory **only yourself**; the app only scores the numerical checkpoints.

## Limits and graduation gate

This does **not** provide a touch-drawing canvas, freehand image recognition, automated art grading, a general graph parser, or full form-by-form acceptance of P32/4a–b. The teacher/source may use other function families and domain constraints. Exact 2026Z syllabus coverage remains **OPEN** in Issue #108.

Before merging: independent symbolic/finite-difference checks of all 72 variants, PL/EN correct/incorrect/invalid response tests, mobile 375px and desktop Chromium cases, solution and SVG review, explicit owner squash-merge approval for final HEAD. After any approved merge: same-commit main CI + Pages verification.

Original course worksheets and institutional details are private and are not reproduced.
