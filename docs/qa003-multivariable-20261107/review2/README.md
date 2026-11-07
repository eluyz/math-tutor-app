# Work review correction — QA003-MV-02

Review 1 at `ace2e815b33320c60dc6e1573c9ad927000f11c2` is **NEEDS_FIXES / NOT_READY**, not semantically PASS. Its numerical g-limit calculations and localized conclusions were correct, but all 72 angular-continuity questions omitted f=g off the assigned point in BOTH languages. Earlier oracles implicitly supplied that missing premise. Work identified the gap; this revision accepts and repairs it.

- `finding-definition-before.json`: actual 144 affected question fingerprints and six original PL/EN examples from the reviewed HEAD, captured before editing.
- `pre-review-invariants.json`: frozen SHA-256 of all 72 IDs' parameters, full university data and PL/EN answer specs before the repair. The regression checks them unchanged. The hash recipe and reviewed HEAD are included. Do not regenerate these fixtures from a changed generator to make a test pass.
- `old-dataset-negative.json`: the stricter SymPy validator rejects the actual previous dataset with nonzero exit and the missing-definition error. TS tests also reject the six captured questions.
- Updated root `tuple-ledger.csv`, `semantic-review.md`, `sympy-summary.json` and `evidence-summary.json` describe **review 2**, with explicit prior-revision failure flags. Git history at ace2e815 retains the superseded raw report; its unconditional angular semantic PASS is retracted here and in the current report/register.

The cohort is unchanged: 288 tasks, 576 localized views, 3,456 grading scenarios and the same 18 semantic-review tuples. Re-execution, negative mutations and more UI witnesses are not additional independent mathematical coverage. No source acceptance is claimed.
