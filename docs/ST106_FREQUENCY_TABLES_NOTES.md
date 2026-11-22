# ST-106 — Frequency tables

ST-106 activates the existing **Data & tables / Dane i tabele** topic in Statistics fundamentals. All exercises present a simple ungrouped table of distinct integer values and their absolute frequencies. Categories include zero and negative values. Counts are nonnegative integers and their total is positive. The generated tables have three or five rows. Grouped data, histograms and inferential techniques are outside this lesson’s scope. A separate candidate covers [ST-107 bar-chart interpretation](ST107_CHARTS_NOTES.md). Hypothesis testing remains an unnumbered University statistics topic.

## Exercise families

| Difficulty | Families | Answer |
| --- | --- | --- |
| Easy | Read the count for one value. Sum all row counts. | Absolute count |
| Medium | Find the relative frequency for one value. Find the percentage share for one value. | Exact proportion or percentage |
| Hard | Combine two specified values. Count observations at or below a boundary. Find the percentage outside one category. | Exact proportion, count or percentage, respectively |

Let **N** be the sum of the frequency column, and **k** the sum of the relevant counts. The absolute frequency is **k**, the relative frequency is **k/N**, and the percentage share is **(100k/N)%**. For example, one of three observations has relative frequency **1/3** and share **(100/3)%**, meaning exactly 100/3 percent. Zero matches give **0** and **0%**, and all matches give **1** as a proportion and **100%**. Fractions are reduced and all noninteger percentages are written as parenthesized fractions.

The difficulty and a uint32 seed determine the table, question and option order. Next uses the shared increment and wraps to zero. Each question offers three distinct exact values in a single unit. Choice IDs combine the exercise identity, unit and reduced rational value. Grading recomputes the answer from the table and validates the complete offered set. Blank input is empty even when zero is correct. Forged and stale IDs are invalid.

## Teaching and practice

The table is visible with the prompt, with a bilingual caption and scoped headers for both columns and each category. Each question has two hints and a worked solution showing the total, selected count and any conversion to a proportion or percentage. The lesson uses the existing Focus Studio layout and native radios. Switching languages preserves the current task, selection, feedback, hints and solution. The existing discard confirmation covers changing an unsubmitted answer's task, topic, difficulty or track.

## Verification and publication

The unit oracle independently calculates selected counts and compares exact fractions by cross multiplication for 259 seeds per difficulty. Literal fixtures include thirds, reducible fractions, zero, all-selected data, ties, unsorted and signed categories, and malformed data and responses. Browser checks read the rendered table and options in both languages at 375 and 1280 CSS px, with 320 px smoke cases. They also cover keyboard navigation, state, redraw and existing Statistics and Mathematics workflows.

During ST-106 candidate verification, local Chromium aborted before opening the app because its SUID sandbox helper was misconfigured. The standard Playwright browser download returned HTTP 403. Collection establishes which tests are registered. Full Playwright and batches B–G require exact-head CI runtime evidence.

Statistics retains **Work in progress** status. ST-106 is integrated on the `main` baseline at `d8b8be61774450cb0d3b3f49ceca74f7b7ef838a`, with successful main CI and Pages on that SHA. [Main CI](https://github.com/eluyz/math-tutor-app/actions/runs/45072584420) · [Pages](https://github.com/eluyz/math-tutor-app/actions/runs/45076496402)
