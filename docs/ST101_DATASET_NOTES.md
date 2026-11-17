# ST-101 deterministic dataset notes — NIGHT-STAT-01 Task A

Status: unintegrated Statistics work in progress. No public exercises or release.

## Implementation plan and scope

Spec: [NIGHT-STAT-01 #313](https://github.com/eluyz/math-tutor-app/issues/313),
Task A; foundation `6afcae65eb574a3b189209610938ac5971f7ddea` in PR #312.
Only this document, `src/statistics/datasets.ts` and its new test file may change.
Use the existing exact `summarizeIntegerDataset` helper; do not duplicate grading.

- [x] Specify seed, difficulty, bounds, repeatability, independence and exact-mean tests first.
- [x] Implement `generateMeanDataset(difficulty, seed)` returning frozen observations and mean.
- [x] Run the targeted tests, full `npm test`, and production `npm run build`.
- Deliver `codex/st101-datasets` as a Draft PR targeting the unchanged foundation branch.
- CI gate: check the exact task HEAD; stop before B if the required CI cannot run.

Design choice: a local unsigned 32-bit xorshift stream, rather than a global PRNG
or random library. It keeps calls independent and requires no dependency changes.
The shared helper remains the sole production calculation of the mean. Tests use
fixed hand-summed examples and integer cross-multiplication as a separate pathway.

Review focus: invalid/runtime seed and difficulty values; upper seed endpoint;
interleaved calls; integer versus fractional means; attempts to mutate returned data.
The issue's explicit stop-on-failed-test rule takes precedence over intentionally
running a failing implementation test: tests are written first, but verification
starts only after implementation. No failing verification will be ignored.

## Contract and seed policy

`generateMeanDataset(difficulty: "easy" | "medium" | "hard", seed: number)`
returns `{ difficulty, seed, values: readonly number[], mean: Rational }`.
Seed must be an integer in [0, 4294967295]; NaN, infinity, fractions, strings and
out-of-range values are rejected. An unknown difficulty is rejected at runtime.
No implicit truncation or coercion. Negative zero is numerically equivalent to zero.

The stream starts at unsigned `seed XOR salt`, with salts 1/2/3 for easy/medium/hard;
a zero state is replaced by `0x6d2b79f5`. Each draw uses xorshift32 shifts 13, 17, 5,
then unsigned remainder by the requested bound. This is reproducible synthetic
teaching data, not uniform statistical sampling or a cryptographic generator.
Different seeds may coincide; no unique variant count or exhaustive catalogue is
claimed. Call order, clock and `Math.random` have no influence.

| Difficulty | Count | Observation bounds | Construction |
|---|---:|---:|---|
| easy | 5 | 0..12 | Integer centre 2..10, two balanced pairs and the centre; integer mean |
| medium | 6..8 | 0..20 | First two observations equal; fractional means allowed |
| hard | 7..9 | −20..20 | At least one strictly negative observation; fractional means allowed |

Balanced easy values are intentional pedagogy, not a random population sample.
The values array, Rational mean and result object are frozen; later calls allocate
fresh data. The generator reads no storage and changes no existing Mathematics code.

## Independently checked fixtures (seed 0)

| Difficulty | Observations | Hand sum / count | Exact mean |
|---|---|---|---|
| easy | [3, 2, 2, 1, 2] | (3+2+2+1+2)/5 = 10/5 | 2 |
| medium | [3, 3, 1, 16, 7, 13] | (3+3+1+16+7+13)/6 = 43/6 | 43/6 |
| hard | [−16, −13, 8, 17, −1, 14, −9] | (−29+25+4)/7 = 0/7 | 0 |

These are internal fixtures, not independent third-party review or source acceptance.

## CI preflight and stop ledger

Main verified before starting: `3cbd210dcccf36a5f2411739546a9afb2998d232`.
[Main CI](https://github.com/eluyz/math-tutor-app/actions/runs/43949513427)
and [Pages](https://github.com/eluyz/math-tutor-app/actions/runs/43954476522): success.
[Foundation CI](https://github.com/eluyz/math-tutor-app/actions/runs/43950973685):
success on the foundation SHA, **not evidence for this task's new HEAD**.

At the first handoff, `.github/workflows/ci.yml` only ran for PR bases
`main` and `qa/batch-c-controlled-acceptance`, leaving stacked PR #319 untested
by GitHub CI. This is a **historical stop condition**, not a continuing claim.

On 2026-11-17 the maintainer separately verified and merged foundation PR #312
into main via merge commit `73d5d68bf7941bedba1813161876d9fd6448f3e3`;
the maintainer then retargeted Draft PR #319 to `main`. That permits GitHub's
existing CI without weakening tests or modifying workflow files.
This documentation-only follow-up commit deliberately triggers a new PR
synchronize event. **Check the new exact HEAD CI before claiming CI PASS**.
Any future stack based on Codex branches must not inherit a false CI requirement
that the default workflow cannot satisfy: local tests are interim evidence,
and combined/final PRs targeting main must receive full exact-head CI before merge.

## Local verification and handoff

- `npm ci --cache /tmp/math-tutor-npm`: PASS with the existing lockfile.
- `npm test -- src/statistics/datasets.test.ts`: **23/23 PASS**.
- `npm test`: **2482/2482 PASS**, 195 files; 122.89 seconds.
- `npm run build`: PASS (TypeScript + Vite); existing large-bundle warning remains.
- Test matrix: seeds 0..255 and 4294967295 for each of three difficulties,
  independently checking the mean by cross-multiplication. This is a bounded
  policy sample, not a claimed count of distinct exercises or an exhaustive seed audit.
- Author review: seed validation, unsigned stream, balanced easy construction,
  negative/repeated data, frozen return values, and exact helper reuse checked.
  No external peer review is claimed.
- Browser acceptance: NOT RUN; this pure module has no UI integration. Public
  Mathematics and Statistics navigation are unchanged.

The delivery SHA, Draft PR and exact-HEAD GitHub check results are recorded in the
PR description and final handoff (avoiding a self-referential commit hash here).
**A is locally verified, not CI-complete. B–I are NOT STARTED.** Stop at the CI gate;
do not substitute the foundation's successful CI for the new task HEAD.

Maintainer action: separately authorize a safe CI trigger for the stack or revise
the coordinator's CI gate; then resume from this Draft's exact HEAD. Do not change
the legacy Copilot queue. No quota counter is exposed, so no remaining-quota
percentage is estimated. Work stops for the concrete CI limitation, not the clock.
The preferred time cutoff is 2026-11-17 07:00 Europe/Warsaw (06:00 UTC).


## Maintainer CI-unblock checkpoint (2026-11-17)
- PR #312 foundation: merged, full PR CI PASS; `main` `73d5d68bf7941bedba1813161876d9fd6448f3e3`.
- PR #319 base: changed from foundation branch to `main`, still Draft.
- Production Statistics exercises: still 0; no changes to any public UI.
- CI for this updated doc commit: **not yet verified at edit time**; review exact Actions result and use only its verified SHA.
- Avoid claiming earlier `c704eab...` had GitHub CI: it had none. Original local tests/build remain reported for original code commit.
