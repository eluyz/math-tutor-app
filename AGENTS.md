# Wskazówki dla agentów

Pracuj w istniejącym checkout repozytorium; środowisko chmurowe jest już izolowane, więc nie twórz dodatkowego worktree bez wyraźnej prośby. Nie zmieniaj `main` bez upoważnienia. Zachowaj oddzielenie logiki matematycznej od komponentów React. Każdą zmianę reguł sprawdzania pokryj testami poprawnych i błędnych odpowiedzi oraz sprawdź wyjaśnienia ręcznie.

Używaj `npm ci`, `npm test`, `npm run build` i `npm run test:e2e`. W Codex Cloud ustaw `npm_config_cache=/tmp/math-tutor-npm` podczas instalacji, a przy testach interfejsu `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium`. Nie dodawaj backendu, kont, telemetrii, płatnych API ani `eval` bez zmiany zakresu zadania. Teksty dla użytkownika mają być po polsku, a przyszłe tłumaczenia powinny trafić do katalogów językowych.

## Uniwersalny zakres edukacyjny

Math Tutor jest aplikacją ogólnodostępną, a nie projektem konkretnej uczelni. Nie dodawaj nazw instytucji, kierunków, kodów zajęć ani pochodzenia materiałów do interfejsu, komunikatów PL/EN, identyfikatorów, bieżącej dokumentacji, nazw przyszłych gałęzi i opisów nowych PR. Inspiracją mogą być różne programy matematyki, ale zadania, treść wyjaśnień i testy muszą być autorskie. Nie publikuj prywatnych prezentacji ani skanów. Pokrycie programu weryfikuj w `CURRICULUM_COVERAGE.md`: każde wymagane zagadnienie musi mieć odpowiedni, przetestowany generator lub jawnie opisaną lukę. Nie deklaruj pełnego pokrycia przed zamknięciem wszystkich luk.

## Redesign and UI/UX skills

- Future GitHub-facing UI/UX documentation and PR descriptions must be written in English. Final reports to the user must remain in Polish. This documentation rule does not change the application’s PL/EN localization.
- During redesign work, read the relevant skills in `.agents/skills/`: `ui-ux-pro-max` (recommendations), `impeccable` (design practice and audit), and `web-design-guidelines` (review). Apply them within the task’s scope, in accordance with the user’s instructions and this file.
- Preserve the approved design system, tokens, and components. Skill suggestions do not authorize replacing the agreed direction. Draft PR #337 does not itself constitute approval or permission to merge.
- Check desktop and mobile (at least 1280 and 375 px), PL/EN, keyboard access, readability, contrast, and the absence of horizontal scrolling.
- Redesign work excludes mathematical logic, generators, answer rules, and mathematical tests; changing them requires a separate task. Do not add React libraries without an agreed need.
- Before merging, run `npm ci`, `npm test`, `npm run build`, and `npm run test:e2e`, and conduct a UI/UX and accessibility audit with results and limitations documented in the PR. Merging requires a separate user instruction.
- Do not enable hooks that execute commands outside the standard approval process. Keep the Impeccable installation free of hooks. The optional Taste tool is not installed; installing it requires a separate task and a review of its hooks. Do not run installers/updates that overwrite existing skills without reviewing their source and local changes.
- Impeccable Live/Apply can launch an agent that bypasses approvals: before any use, set `IMPECCABLE_LIVE_COPY_AGENT=off` (or `chat` for use in a session with approvals). Do not use the automatic CLI mode that bypasses approvals.
- Sources, versions, limitations, and installation verification: `.agents/UI-UX-SETUP.md`.
