# Instructions for repository agents

## Scope, approvals and communication

- Use the existing checkout; do not create a worktree unless requested.
- Do not modify `main` or merge without explicit maintainer approval.
- Keep mathematical logic separate from React components; verify final answers and teaching steps independently.
- Write **public documentation, PR descriptions, technical notes and issues in English**.
- Keep the **learning app bilingual (English and Polish)** with no fallback to untranslated content.
- When responding directly to the owner in ChatGPT, use concise Polish status reports, with tested claims, risks and next actions.

## Quality and release checks

Use `npm ci`, `npm test`, `npm run build`, `npm run test:e2e`. Where the Codex Cloud environment requires it, use `npm_config_cache=/tmp/math-tutor-npm` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium`.

- Test correct/incorrect/empty/invalid responses as applicable, exact rational equivalence and supported lesson boundaries.
- Maintain deterministic seeds/variants and independent mathematical oracles. Do not silently regenerate baseline fixtures to hide a regression.
- Follow the canonical **subject heading -> full-width task -> bottom selector panel** layout for every playable lesson. Test PL/EN, focus, no horizontal overflow and mobile/desktop widths (at least 375 and 1280 px).
- Treat physical Safari/iPhone/iPad testing as different from Chromium viewport emulation.
- Run full CI at the exact PR HEAD. Do not weaken assertions or increase timeouts just to turn a failing check green.
- Merging and Pages deployment require separate approval and subsequent verification.

## Copyright, privacy and truthful scope

Math Tutor is not affiliated with a university. Do not publish private course scans, external copyrighted worksheet figures or institutional branding as original content. Do not invent syllabus coverage, independent audits or user adoption. Do not add accounts, a backend, telemetry, paid APIs or `eval` without separate approval. Preserve exam, progress and unsaved-work safeguards.

## UI/UX skill guidance

Approved design is the default. Optional skills in `.agents/skills/` (`ui-ux-pro-max`, `impeccable`, `web-design-guidelines`) may inform scoped work but do not authorize redesigns or approval-bypassing hooks. Consult `.agents/UI-UX-SETUP.md` and avoid automatic agent modes that bypass confirmations.

Older technical records and the full previous agent instructions are available in [the legacy archive](docs/archive/legacy-2026-11-20/AGENTS.md).
