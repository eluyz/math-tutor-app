# Math Tutor — Development roadmap

**Current direction (November 2026):** maintain reliable Mathematics practice, extend the bounded Statistics pilot, and build a useful, understandable open-source learning project.

This is a prioritized plan, **not** a promise of release dates, external adoption or curriculum completeness.

## Priority and release gates

| Stream | Status | Next acceptance requirement |
| --- | --- | --- |
| Mathematics and Focus Studio | Available | Preserve exact grading, local history and shared task-first UI |
| Statistics ST-101 / ST-102 | Released | Maintain bilingual exact practice |
| Statistics ST-103 | Playable integration merged in PR #340 | Preserve bilingual exact population-variance practice |
| Statistics ST-104 | Playable integration merged in [PR #345](https://github.com/eluyz/math-tutor-app/pull/345) | Preserve bilingual exact interpretation practice |
| Statistics ST-105 Mode | Playable integration merged in [PR #346](https://github.com/eluyz/math-tutor-app/pull/346) | Preserve exact bilingual Mode practice |
| Statistics ST-106 Frequency tables | Integrated on the verified `main` baseline | Preserve exact bilingual frequency-table practice. [Lesson notes](docs/ST106_FREQUENCY_TABLES_NOTES.md) |
| Statistics ST-107 Charts & interpretation | Playable candidate | Complete exact-head CI and maintainer review. Verify main CI and Pages on the release SHA after any owner-approved merge. [Lesson notes](docs/ST107_CHARTS_NOTES.md) |
| Further Statistics topics | Planned | Define explicit scope and independent mathematical oracles |
| Econometrics | Planned | Hand-checkable introductory regression; not currently playable |
| Financial Mathematics | Planned | Bounded interest, present value, annuities and NPV; not currently playable |
| OSS adoption | Early stage | English docs, accessible examples, good-first-issues, genuine usage evidence |

## Release contract

Every change must state supported cases and unsupported cases. Use independent mathematical witnesses, PL/EN copy, exact-head Vitest/build/Playwright, and Batch B–G as applicable. No merge without explicit maintainer approval. Verify CI on the merged `main` SHA and subsequent Pages deployment separately. Do not infer a published course from a pure generator.

## Community and product quality

Prioritize reproducible bug reports, clear CONTRIBUTING instructions, guided first-user tasks, accessibility and mobile usability. Never invent download counts, users, contributors, external reviews or stars. Preserve original mathematical-source boundaries rather than turning deterministic generator counts into academic acceptance claims.

See the [subject roadmap](docs/SUBJECT_EXPANSION_PLAN.md), [product overview](PRODUCT.md) and [QA register](QA_AUDIT_PROGRESS.md).

The entire earlier Polish development roadmap, including past candidate and draft statements, is kept unmodified in [the archive](docs/archive/legacy-2026-11-20/ROADMAP.md). Historical statuses must not be presented as current statuses.
