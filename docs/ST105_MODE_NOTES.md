# ST-105 — Mode

## Scope and numbering

The existing **Mode / Dominanta** topic in Statistics fundamentals is playable on the `main` baseline after [PR #346](https://github.com/eluyz/math-tutor-app/pull/346). It follows ST-101 arithmetic mean, ST-102 median, ST-103 population variance, and ST-104 statistical interpretation. Easy, Medium, and Hard are playable. Statistics keeps its **Work in progress** status, with Advanced, Expert, and all University statistics topics disabled.

The maintainer assigned **ST-105** to Mode and supplied a historical ST-105 alias for hypothesis testing. That alias is superseded. Hypothesis testing remains an unnumbered, planned University statistics topic. The current Markdown and reachable Git history searches found no competing numbered specification. The oldest matching repository roadmap entry lists hypothesis testing without a number. [Historical roadmap at 85ed692](https://github.com/eluyz/math-tutor-app/blob/85ed692aaacd36625b63a0ea4c76d3180f863391/docs/SUBJECT_EXPANSION_PLAN.md)

## Exact rule and task generation

Count the occurrences of each distinct value. If the largest count is at least two, the answer includes every value with that count. Ties at the maximum make the dataset multimodal, including a dataset where every distinct value has the same repeated count. If the largest count is one, choose **No mode**. This includes a singleton. A constant dataset with at least two observations has one mode.

| Observations | Frequency result | Answer |
| --- | --- | --- |
| `[2, 0, 2, -1]` | 2 occurs twice | `{2}` |
| `[7, -3, 0, 7, 0, -3]` | Each value occurs twice | `{-3, 0, 7}` |
| `[3, 0, -2, 5]` | Each value occurs once | No mode |
| `[0, 0, 0]` | 0 occurs three times | `{0}` |
| `[-9]` | -9 occurs once | No mode |

Each difficulty generates all three answer families. Easy uses five observations, Medium uses seven, and Hard uses nine. Datasets include unsorted values and zero, with signed values at Medium and Hard and occasional safe-integer endpoints at Hard. The pure count model also accepts one to 100 safe-integer observations. Choices show a singleton set, a set of two or more distinct values, or **No mode**. A singleton dataset or a constant dataset with one distinct value uses an adjacent safe integer in a distractor so all three alternatives remain distinct.

An unsigned 32-bit seed and the difficulty determine the exercise ID, observations and shuffled option order. **Next exercise** advances the seed by one, wrapping from 4294967295 to zero. Grading recalculates the frequencies of the displayed observations, validates the complete set of three choices and distinguishes correct, incorrect, empty and invalid responses. Mode sets use canonical ascending values and locale-independent IDs.

## Teaching and interaction

Mode uses the same native radio form as ST-104 and the same Focus Studio layout as the other Statistics lessons. The first hint asks learners to count each distinct value. The second asks them to apply the maximum-frequency rule. The open solution shows a bilingual frequency table with a caption and row and column headers, then explains the count, maximum and complete answer.

The existing Statistics practice state preserves exercise identity, selection, feedback, hints and the open solution when switching languages. Changing an unsubmitted response to a different task, lesson, level or track follows the existing discard confirmation. Statistics practice state is kept in memory, separate from saved Mathematics and exam progress.

## Verification and publication

The unit suite checks 259 seeds per level with independent counts, literal edge cases, malformed responses and choices, and matching PL/EN mathematics. Playwright covers PL/EN at 375 and 1280 CSS px, plus 320 px smoke cases for the Hard safe-integer exercise. The browser cases cover native keyboard and focus, grading, replay, locale changes, discard confirmation, track scroll, responsive tables, and Mathematics, Statistics, progress and exam regressions.

During ST-105 candidate verification, local Chromium aborted before loading the application because its sandbox helper was misconfigured, and the Playwright Chromium download returned HTTP 403. The browser cases were collected locally and configured in the early recovery gate and full browser suite in CI. The merged PR records the candidate checks. Publication verification uses main CI and the Pages deployment on the release SHA.
