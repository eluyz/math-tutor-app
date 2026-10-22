# Wskazówki dla agentów

Pracuj w istniejącym checkout repozytorium; środowisko chmurowe jest już izolowane, więc nie twórz dodatkowego worktree bez wyraźnej prośby. Nie zmieniaj `main` bez upoważnienia. Zachowaj oddzielenie logiki matematycznej od komponentów React. Każdą zmianę reguł sprawdzania pokryj testami poprawnych i błędnych odpowiedzi oraz sprawdź wyjaśnienia ręcznie.

Używaj `npm ci`, `npm test`, `npm run build` i `npm run test:e2e`. W Codex Cloud ustaw `npm_config_cache=/tmp/math-tutor-npm` podczas instalacji, a przy testach interfejsu `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium`. Nie dodawaj backendu, kont, telemetrii, płatnych API ani `eval` bez zmiany zakresu zadania. Teksty dla użytkownika mają być po polsku, a przyszłe tłumaczenia powinny trafić do katalogów językowych.

## Uniwersalny zakres edukacyjny

Math Tutor jest aplikacją ogólnodostępną, a nie projektem konkretnej uczelni. Nie dodawaj nazw instytucji, kierunków, kodów zajęć ani pochodzenia materiałów do interfejsu, komunikatów PL/EN, identyfikatorów, bieżącej dokumentacji, nazw przyszłych gałęzi i opisów nowych PR. Inspiracją mogą być różne programy matematyki, ale zadania, treść wyjaśnień i testy muszą być autorskie. Nie publikuj prywatnych prezentacji ani skanów. Pokrycie programu weryfikuj w `CURRICULUM_COVERAGE.md`: każde wymagane zagadnienie musi mieć odpowiedni, przetestowany generator lub jawnie opisaną lukę. Nie deklaruj pełnego pokrycia przed zamknięciem wszystkich luk.
