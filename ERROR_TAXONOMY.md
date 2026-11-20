# Error feedback taxonomy

A final answer can establish whether the submitted result matches the exact expected value. It usually **cannot** establish which thinking step was wrong. Math Tutor presents bounded suggestions and must avoid a false diagnosis.

## Claims supported by the evidence

| Observation | What is known | What must not be inferred |
| --- | --- | --- |
| Correct typed answer | The submitted result satisfies the mathematical answer contract | The learner used a particular method |
| Wrong answer | The value differs from the answer contract | The unique cause of the mistake |
| Match with a known error pattern | A possible error hypothesis | A confirmed thinking process |
| Incorrect checked intermediate step | That specific step is wrong | The full origin of the initial answer |
| No matching pattern | Cause is undetermined | A fabricated precise diagnosis |
| Invalid input such as `1/0` | The response is not a valid answer | A mathematical misconception |

Known error rules may carry stable codes, teaching hints and **low confidence** when they are based only on a final result. Multiple plausible causes should be shown together, not arbitrarily reduced to the first matching rule.

Examples: the exact value of `3 + 4 × 2` is `11`; another value is wrong, but does not uniquely identify the learner's reasoning. For `x² + 2x` with `x = 3`, the correct value is `15`, while `12` has multiple plausible causes. Exact rational grading accepts equivalent fractions, not approximate truncated decimals as exact equals.

## Contributor requirements

Preserve correct/incorrect/invalid separation, documented unknown-cause outcomes, and step-specific probes. Do not describe speculative feedback as a diagnostic certainty. Maintain full English/Polish message coverage and browser-only privacy guarantees.

The complete original code-by-code taxonomy and historical test examples remain unchanged in [the archive](docs/archive/legacy-2026-11-20/ERROR_TAXONOMY.md).
