# G07: integration with published G07 stage, merged C02 and I04 QA

2026-11-09. Draft PR #258 is rebased by a merge-parent reconciliation on main@bf7367de143975ab01ce1dc56f8f05ff57aa71b2. Previous isolated G07 PR #257 has been owner-approved and merged (same main SHA); parent generator plus 24 synthetic variants are present but not yet registered.

## Scope

- New hard-only family `analysis-asymptotes-combined-rational` — 24 synthetic rational method cases asking for ALL vertical and horizontal/oblique asymptotes in one exercise.
- Six deterministic method shapes, grading two answer fields separately, PL/EN authored hints and steps, independent math unit tests and responsive bilingual browser witnesses at 375/1280 px.
- Preserves existing separate G07 families, all G06, M06, W02, C02 #242 and the I04 bilingual QA #255; no changes to their generator files or tests.
- New discriminated problem type in schema, one family registration and explicit presenter dispatch ahead of generic elementary-analysis handler; new family searchable via G07, retains partial competency coverage.

## Cumulative counts

| Quantity | Main after C02 | After G07 |
| --- | ---: | ---: |
| Families | 244 | 245 |
| Nonintegral families | 222 | 223 |
| Variants | 18,621 | 18,645 |
| Nonintegral variants | 17,037 | 17,061 |

These counts are valid only for the pinned main. Every further catalog merge requires fresh reconciliation, code and CI check.

## Source-bound limitation

Nine original worksheet questions but eight answer-key entries; the unmatched ninth was independently solved, but no full answer-key verification or source→published UI acceptance is established. No original coefficients, scans or original answer-key data included in the public repository. SOURCE_PASS pending.

## Release gates

- [x] Source stage PR #257 merged with full exact-head unit/build/Playwright/Batch B–G PASS.
- [ ] New exact-head #258 CI full unit/build/Playwright/Batch B–G PASS after this reconciliation.
- [ ] Final mergeability and cumulative inventory preflight; owner-approved integration merge only if clean and tested.
- [ ] Postmerge full main CI + same-SHA GitHub Pages PASS.
- [ ] Independent source-to-deployed-UI witness before SOURCE_PASS.
