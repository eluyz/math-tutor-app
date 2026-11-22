# ST-107 — Charts & interpretation

The candidate activates **Charts & interpretation / Wykresy i interpretacja** between Measures of dispersion and Statistical Interpretation. The lesson uses simulated visit counts for selected rooms during one hour on Monday. All seven Statistics fundamentals topics are playable in the candidate. The nine University topics remain planned, and Statistics retains **Work in progress** status. Easy, Medium and Hard are available. Advanced and Expert remain disabled.

## Exercise families

| Difficulty | Families |
| --- | --- |
| Easy | Read one room’s count. Identify the room with the most or fewest visits. |
| Medium | Compare two distinct rooms, including equal counts. Find their absolute difference or total. |
| Hard | Choose the one statement supported by the plotted values, or identify the one statement the values leave undetermined. |

Each chart shows three to five rooms labelled A–E and integer counts from zero to twenty. Easy prompts about a single highest or lowest bar use a strict extremum. The pure evaluator returns the complete set of tied rooms in fixed category order. An all-zero chart can ask for a count. The pure evaluator accepts one to five unique rooms and counts from zero to one hundred, so pair sums and differences stay exact.

A supported-conclusion question has one fact confirmed by the counts and two contradicted numerical claims. An unsupported-conclusion question has two facts confirmed by the counts and one claim requiring evidence about a cause, a later hour or unplotted rooms. The worked solution shows the relevant count or arithmetic and explains the missing evidence. The snapshot measures only visits to the selected rooms in that hour. Histograms, time series, causal inference and hypothesis testing are outside the lesson’s scope. Hypothesis testing remains an unnumbered University topic.

A uint32 seed and difficulty fix the chart, prompt family, three distinct choices and their order. The grader checks the complete exercise against its seeded form and evaluates the selected answer against exact counts or the evidence rule. Whitespace is empty even when the correct count is zero. Malformed and stale selections are invalid. Next uses the shared seed increment and wrap.

## Presentation and accessibility

The SVG uses a linear axis starting at a labelled zero and equal integer tick intervals. The highest tick covers the maximum observed count. An all-zero chart keeps a positive axis range and draws zero-height bars. Each category and exact count are printed on the chart. The accessible graphic has a name, a description and an association with the visible data table. The table lists all categories and counts using a caption and scoped headers. The chart and table sit above the shared native radio answers.

Polish and English versions share data and choice identities. Locale switching preserves selection, feedback, hints and the worked solution. Unsubmitted answers use the existing discard confirmation for task changes. The lesson uses Focus Studio’s heading, full-width exercise and bottom selector.

## Verification and release

The independent unit oracle uses displayed data and structured statements over 259 seeds per level. Literal fixtures cover zero data, extrema and ties, exact comparisons and sums, malformed input and evidential limits. Browser cases cover both languages at 375 and 1280 CSS px, with 320 px smoke cases. They derive grading expectations from visible values and inspect SVG scale, label geometry, focus, language and draft behavior. Automated Chromium verification and physical-device or learner feedback are separate evidence.

ST-101 through ST-106 are integrated on the verified `main` baseline. ST-107 requires review and exact-head CI, including root Playwright and acceptance batches B–G. Publication requires the maintainer’s merge approval followed by successful main CI and Pages on the release SHA.
