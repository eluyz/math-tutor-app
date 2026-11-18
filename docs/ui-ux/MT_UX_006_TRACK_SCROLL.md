# MT-UX-006 — Learning-track scroll stability

## Scope

A small navigation fix on existing Draft PR #337. Preserve Focus Studio, all
educational behavior and deliberate exercise/keyboard focus. No generator,
grading, scoring or dependency changes; no merge is authorized.

## Investigation checkpoint

- Mathematics track selection generates a task. A source-dependent React effect
  then focuses its answer without `preventScroll`. This effect also exists on
  main; the issue predates Focus Studio.
- Statistics has a separate task-dependent focus effect. Returning to its
  fundamentals track requests answer focus; selecting the university roadmap
  removes the task and changes document height. Focus, native scroll anchoring
  and unavoidable document-bound clamping must be distinguished experimentally.
- New browser regressions measure actual scroll offsets before and after native
  pointer activation at 375/390/768/1280 px in PL/EN, in both directions.
- Temporary causal probes compare native behavior with focus-scroll suppression,
  anchoring suppression and both, without changing application code.
- Local secure Chromium aborts before assertions on the environment's existing
  SUID/crashpad setup. No sandbox bypass is used. Reproduction and final browser
  validation use the supported existing GitHub Actions environment.

Production changes and final results are pending the causal evidence. The PR
description records exact HEADs and CI links; current screenshots from MT-UI-005
remain a separate, unresolved visual-acceptance gate.
