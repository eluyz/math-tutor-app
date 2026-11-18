# MT-UI-001 — audyt UI/UX

Dokument historyczny prototypu przed MT-UI-003. Zrzuty i wyniki poniżej dotyczą
ówczesnej wersji. Aktualne zmiany i ograniczenia weryfikacji opisuje
[MT_UI_003_NIGHT_LOG.md](MT_UI_003_NIGHT_LOG.md).

Zakres: `src/App.tsx`, `src/styles.css`, moduły progress/exam, lokalizacja, istniejące testy. Baza końcowa: aktualny main `d62424a` (pobrany przed finalną implementacją). Audyt heurystyczny kodu i przeglądarki; nie badanie z użytkownikami.

| Priorytet | Obszar / dowód | Problem i zalecenie |
| --- | --- | --- |
| P1 | Home: `.practice`, nagłówek i nawigacja | Aktualny main ma już kompaktowe wejście bez hero; zachować ten kierunek i poprawić hierarchię. |
| P1 | Nawigacja: `App.tsx`, `.view-navigation` | Nagłówek i luźny pasek trybów nie tworzą jednej hierarchii; wyrównać do wspólnej osi. |
| P1 | Przedmioty | Dostępne Matematyka i rozwijana Statystyka; Ekonometria i Matematyka finansowa prowadzą do roadmap. Zachować wszystkie cztery pozycje i jawne statusy. |
| P1 | `.category-picker` | Jednorzędowa przewijana lista ukrywa działy; zawijana siatka, równa wysokość i odstępy. |
| P1 | `.exercise-item` | Duże szeryfowe etykiety i 114 px wiersze ograniczają skanowanie; kompaktowy, czytelny katalog i wyraźny stan aktywny. |
| P1 | Mobile | Kafelki przedmiotów i przewijane działy mają różne układy; uporządkować w równe kolumny i zachować kompaktowe wejście. |
| P1 | Dostępność | Brak skip link, focus zdefiniowany tylko dla części kontrolek; uzupełnić globalny focus, w tym select/summary/textarea, i reduced motion. |
| P2 | Typografia / przyciski | Mieszanka szeryfów, małych kapitalików i różnych promieni; systemowe tokeny i jedna skala. |
| P2 | Formularze i podpowiedzi | Dobre etykiety, statusy, feedback i progresywne podpowiedzi już istnieją; zachować, poprawić wizualną hierarchię. |
| P2 | Wzory | Natywny tekst, Unicode, osobne renderery tabel/SVG. Nie wprowadzać nowego silnika; sprawdzić długie treści i przewijanie lokalne. |
| P2 | Postępy / egzamin | Istnieją osobne komponenty i blokady. Zachować funkcje i dane; pełny redesign dopiero po akceptacji prototypu. |

## Przed / po

Zrzuty w `screenshots/`. Pomiary czterech szerokości: [viewport-checks.json](viewport-checks.json). Wszystkie: bez poziomego przewijania PL/EN, działający skip link i focus odpowiedzi; równe wysokości działów (59,69 px mobile, 48 px desktop). Wzory pozostają tekstem i dedykowanymi tabelami/SVG; prototyp nie jest migracją do LaTeX.

## Materiał do odbioru

| Widok | Przed | Po |
| --- | --- | --- |
| Mobile 375 | [przed](screenshots/before-375.png) | [katalog](screenshots/after-home-375.png), [ćwiczenie](screenshots/after-exercise-375.png) |
| Desktop 1440 | [przed](screenshots/before-1440.png) | [katalog](screenshots/after-home-1440.png), [ćwiczenie](screenshots/after-exercise-1440.png) |
| Mobile 390 | — | [katalog](screenshots/after-home-390.png), [ćwiczenie](screenshots/after-exercise-390.png) |
| Desktop 1280 | — | [katalog](screenshots/after-home-1280.png), [ćwiczenie](screenshots/after-exercise-1280.png) |

Zrzuty „przed” przedstawiają aktualną bazę main bez warstwy `redesign.css`; „po” — tę samą aplikację z prototypem. Dwie statyczne koncepcje: [CONCEPTS.html](CONCEPTS.html).

## Przegląd implementacji

Niezależny przegląd kodu wykrył i skorygowano: zbyt słaby selektor focus (`:where` zastąpiono `:is`), możliwość przycięcia obrysu regionu listy (focus wewnętrzny) i nieprecyzyjny opis wpływu wspólnego shell na inne widoki. Zmiany React to skip link, kontener docelowy focusu, klasa zakresu i dekoracyjne symbole; bez zmian handlerów i stanu.

## Testy — zakres i ograniczenia

- Build produkcyjny przechodzi; pozostaje ostrzeżenie o dużym chunku (ponad 500 kB). Podział pakietu jest poza zakresem tego prototypu.
- Playwright: 78/78 testów akceptacyjnych (`ui-redesign`, `compact-practice-entry`, `subject-roadmap`, `statistics-practice`, `practice-navigation`, `localization`, `local-progress`) oraz 15/15 `exam.spec.ts`, Chromium systemowy, jeden worker.
- Pełny lokalny `npm run test:e2e` został rozpoczęty, ale przerwany z powodu współdzielenia 2 CPU z testami jednostkowymi; nie deklarujemy przejścia całego zestawu. Istniejący workflow CI uruchamia pełny zestaw na PR.
- Podczas testów postępów pojawiały się ostrzeżenia React o powtórzonych kluczach w istniejących scenariuszach; testy przechodzą. Logika postępów nie była zmieniana.
- Pierwszy pełny Vitest: 2602/2603; `src/catalogSearch.test.ts:78` przekroczył 5 s podczas równoległego obciążenia. Izolowane powtórzenie tego pliku: 7/7. Końcowy pełny przebieg z jednym workerem i limitem 30 s raportowany poniżej. Nie zmieniano limitów w repozytorium.

Końcowy pełny Vitest: **202/202 pliki, 2603/2603 testy** (`npm test -- --maxWorkers=1 --testTimeout=30000`, 217,54 s).
