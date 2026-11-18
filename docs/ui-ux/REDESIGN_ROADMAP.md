# MT-UI-001 — plan and boundaries

## Goal and architecture

An initial premium prototype for adults and students. React and existing CSS, without new dependencies. Design: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Preserve generators, schemas, localization, progress, exam, and existing components.

## Implementation plan

- [x] Audit code and materials; capture before screenshots at 375/1440 for the then-current baseline.
- [x] Compare two directions and select Focus Studio.
- [x] Header and navigation; skip link; detailed styles limited to the learning workspace; shared tokens and shell also affect the surroundings of other views.
- [x] Selection of existing levels and topics, with equal button grids.
- [x] A representative order-of-operations screen using the shared renderer, without mathematical changes.
- [x] Verify 375/390/1280/1440, PL/EN, focus, reflow, formulas, existing tests, and build.
- Delivery: one Draft PR; no merge or deployment.

## Areas requiring particular attention

Long PL/EN topic names; grids at increased zoom; matrix tables within their own region; focus when entering an exercise; session and exam safeguards. Do not change navigation state or handlers.

## After prototype approval (do not implement now)

1. Plan a separate redesign of the existing Statistics screen; Econometrics and Financial Mathematics remain explicit roadmaps.
2. Separately design progress, exam, solutions, and scratchpad using the approved tokens.
3. Organize the long catalog; consider filtering and addressable URLs, which require a separate behavior task.
4. Audit all answer types; conduct screen reader checks and usability testing with adult learners.


## MT-UI-003 continuation

Packages A–F were implemented in separate commits; G fixes the regressions found.
Visual approval and full E2E remain merge gates regardless of passing unit tests.
Do not start another visual direction or add educational content. Resume from
the NIGHT_LOG and the exact HEAD of PR #337. The sprint does not authorize a merge.
