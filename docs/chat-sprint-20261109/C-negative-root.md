# C02 — negative square root / linear denominator (isolated source method)

- Scope: a **bounded synthetic method witness** for a separately observed source-shape gap under C02. Keep the university task sheet and its answer key private; do not copy original values or exercise wording.
- Staged only in `src/university/sequenceNegativeRootLinear.ts` with 96 deterministic combinations, medium/hard/advanced/expert, in both PL and EN.
- Form: `-sqrt(a² n² + b n + c)/(d n + e)` for `n>=1`, `a,d>0`, `b,e>=0`, `a²+c>0`; exactly `-a/d`, with negative sign preserved explicitly in each teaching step.
- Independent regression test uses a separate cross-multiplied rational oracle, high-n numeric evaluation, input validation and positive/negative/blank/malformed grading in both languages.
- NO catalog registration; NO modification of global schema, counters, app behavior or previous C02 generators. This isolated code does not count as deployed or full C02 source acceptance.
- Further work: only after the distinct PR #242 C02 quartic-root catalog integration is approved and released; separate owner-approved serial catalog integration required. Ref #108.
