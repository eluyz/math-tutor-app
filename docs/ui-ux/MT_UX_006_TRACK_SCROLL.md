# MT-UX-006 — Learning-track scroll stability

## Scope

A small navigation fix on existing Draft PR #337. Preserve Focus Studio, all
educational behavior and deliberate exercise/keyboard focus. No generator,
grading, scoring or dependency changes; no merge is authorized.

## Confirmed causes

[Reproduction CI](https://github.com/eluyz/math-tutor-app/actions/runs/44359824297)
on `d4d1d2f5a9bd18dde8881d535a2b0bd91e969891` passed 2665 unit tests and the
build, then reproduced **16 failing viewport cases**. Two temporary causal
experiments passed and recorded native focus and anchoring separately. Later
acceptance gates were not run after the expected reproduction failure.

- **Mathematics:** changing track generates a task, and a source-dependent React
  effect focuses its answer. At 375 px PL, the first switch moved from 425 to
  910 px; returning to basics moved from 1803 to 708 px. These movements were
  larger than document-bound clamping. The same effect exists on main; this is
  a pre-existing issue, not a Focus Studio regression.
- **Mathematics layout/anchoring:** the first task relocates the catalog, and later
  task/category changes alter content height above it. In the 390 px causal
  experiment, suppressing focus scrolling alone still moved 1883 to 1549 px,
  despite a new maximum of 1825 px. Suppressing both focus scrolling and native
  anchoring left only the unavoidable clamp (1883 to the new maximum, 1794 px).
  The generated task heights varied between probe arms; these are observed
  offsets, not an assertion that every arm had identical geometry.
- **Statistics:** returning from the university roadmap to fundamentals explicitly
  requests answer focus in a task-dependent effect. At 390 px PL this moved
  from 0 to 1209 px. Disabling anchoring alone did not prevent it; suppressing
  focus scrolling did. Entering the university roadmap did **not** reproduce a
  downward jump in the measured baseline: no answer exists and no answer-focus
  call occurs. Both directions remain covered by the regression contract.

No `scrollTo`/`scrollIntoView` call is attached to the track handlers. Native
focus scrolling, layout anchoring and a shorter document's physical scroll
limit are separate mechanisms; changing only one focus call would not address
all confirmed Mathematics movement.

## Isolated fix

- A track change restores focus to the selected track control. Pointer activation
  uses `preventScroll`; keyboard activation retains native scrolling when needed
  to keep the focused selector visible after a layout change. This also avoids
  opening a mobile answer keyboard merely to change the track.
- Only the changing Mathematics catalog and Statistics card contents opt out of
  scroll anchoring. Content outside the catalog can still be a native anchor.
  A shared, pointer-only track transition snapshots the current offset, flushes
  the committed layout, restores it before paint and checks it once in the next
  animation frame. Cleanup cancels that frame on replacement/unmount. Keyboard
  transitions clear the snapshot. There is no global policy or persistent scroll
  lock; a shortened document still uses its native physical limit.
- Track controls have 8 px scroll margins so native keyboard scrolling leaves
  the focus outline clear of the viewport edge.
- Explicit Start/Continue, New example, Next, lesson and level actions retain
  their existing exercise/answer focus policy. Tab and Shift+Tab remain native.
- The existing Statistics navigation test now asserts selected-track focus after
  a pointer track switch. Separate keyboard cases verify actual answer focus and
  intentional scrolling after generating an exercise; no grading/history
  assertions were removed.

## Follow-up validation

The first application-fix run
[CI](https://github.com/eluyz/math-tutor-app/actions/runs/44362019912) at
`f2baeedbfec6e40b8e902354436d11e2a20371b3` passed unit/build and all eight
Statistics pointer cases. Mathematics retained anchor adjustments outside the
catalog (up to 365 px in that run), requiring the bounded viewport snapshot.
The eight new keyboard journeys also exposed a test error (Tab from the first
track reaches the second track before Mean) and fractional clipping at the
viewport edge (720.3125 px). The test now asserts that real intermediate Tab
stop, while scroll margins address clipping without loosening visibility or
offset assertions. The gate reported 8 PASS / 16 FAIL; later gates were not run.
The independent reviewer found no Important/Critical issue in the bounded
follow-up; final browser results remain pending CI.

## Verification checkpoint

The final suite has **24 browser cases**: 16 pointer cases across both subjects,
PL/EN and 375/390/768/1280 px, plus eight keyboard/exercise-focus journeys.
Pointer cases retain the 16 originally failing regressions and strengthen them
with a nonzero initial offset. Both directions and repeated switching are checked.
Offsets may differ only by rounding (2 px) or the browser's unavoidable clamp to
a shorter document's new maximum. Keyboard tests require visible focus, natural
Tab order and real intentional exercise scrolling. The two passing, temporary
counterfactual probes were removed after diagnosis; their observations are
recorded above, and their global test-only overrides do not ship.

Local dependency installation and E2E TypeScript checks passed; full Vitest,
build and final browser/acceptance results are recorded with exact HEADs in the
PR description. The independent read-only review found no Important/Critical
issues in this bounded patch. Browser PASS is not claimed before CI completes.

Local secure Chromium still aborts before assertions on the environment's
existing SUID/crashpad setup. No sandbox bypass is used. Browser validation uses
the existing supported GitHub Actions environment. The unresolved MT-UI-005
manual screenshot acceptance remains a separate release gate.
