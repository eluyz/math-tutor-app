# Wskazówki dla agentów

Pracuj w istniejącym checkout repozytorium; środowisko chmurowe jest już izolowane, więc nie twórz dodatkowego worktree bez wyraźnej prośby. Nie zmieniaj `main` bez upoważnienia. Zachowaj oddzielenie logiki matematycznej od komponentów React. Każdą zmianę reguł sprawdzania pokryj testami poprawnych i błędnych odpowiedzi oraz sprawdź wyjaśnienia ręcznie.

Używaj `npm ci`, `npm test`, `npm run build` i `npm run test:e2e`. W Codex Cloud ustaw `npm_config_cache=/tmp/math-tutor-npm` podczas instalacji, a przy testach interfejsu `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium`. Nie dodawaj backendu, kont, telemetrii, płatnych API ani `eval` bez zmiany zakresu zadania. Teksty dla użytkownika mają być po polsku, a przyszłe tłumaczenia powinny trafić do katalogów językowych.

## Uniwersalny zakres edukacyjny

Math Tutor jest aplikacją ogólnodostępną, a nie projektem konkretnej uczelni. Nie dodawaj nazw instytucji, kierunków, kodów zajęć ani pochodzenia materiałów do interfejsu, komunikatów PL/EN, identyfikatorów, bieżącej dokumentacji, nazw przyszłych gałęzi i opisów nowych PR. Inspiracją mogą być różne programy matematyki, ale zadania, treść wyjaśnień i testy muszą być autorskie. Nie publikuj prywatnych prezentacji ani skanów. Pokrycie programu weryfikuj w `CURRICULUM_COVERAGE.md`: każde wymagane zagadnienie musi mieć odpowiedni, przetestowany generator lub jawnie opisaną lukę. Nie deklaruj pełnego pokrycia przed zamknięciem wszystkich luk.

## Redesign i skille UI/UX

- Podczas redesignu czytaj odpowiednie skille z `.agents/skills/`: `ui-ux-pro-max` (rekomendacje), `impeccable` (warsztat i audyt), `web-design-guidelines` (przegląd). Stosuj je w zakresie zadania, zgodnie z poleceniami użytkownika i tym plikiem.
- Zachowuj zatwierdzony design system, tokeny i komponenty. Sugestie skilli nie upoważniają do zastąpienia uzgodnionego kierunku. Draft PR #337 nie stanowi sam w sobie zatwierdzenia ani zgody na merge.
- Sprawdzaj desktop i mobile (co najmniej 1280 i 375 px), PL/EN, klawiaturę, czytelność, kontrast i brak poziomego przewijania.
- Redesign nie obejmuje logiki matematycznej, generatorów, reguł odpowiedzi ani testów matematycznych; ich zmiana wymaga osobnego zadania. Nie dodawaj bibliotek React bez uzgodnionej potrzeby.
- Przed merge wymagane są `npm ci`, `npm test`, `npm run build`, `npm run test:e2e` oraz audyt UI/UX i dostępności z opisem wyników oraz ograniczeń w PR. Merge wymaga osobnego polecenia użytkownika.
- Nie aktywuj hooków wykonujących polecenia poza standardowymi zatwierdzeniami. Zachowaj instalację Impeccable bez hooków. Opcjonalny Taste nie jest zainstalowany; jego ewentualna instalacja wymaga osobnego zadania i przeglądu hooków. Nie uruchamiaj instalatorów/aktualizacji z nadpisywaniem istniejących skilli bez przeglądu źródła i lokalnych zmian.
- Impeccable Live/Apply może uruchamiać agenta z pominięciem zatwierdzeń: przed ewentualnym użyciem ustaw `IMPECCABLE_LIVE_COPY_AGENT=off` (ewentualnie `chat` dla obsługi w zatwierdzanej sesji). Nie korzystaj z automatycznego trybu CLI omijającego zatwierdzenia.
- Źródła, wersje, ograniczenia i weryfikacja instalacji: `.agents/UI-UX-SETUP.md`.
