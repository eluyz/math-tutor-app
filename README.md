# Math Tutor

Otwarta aplikacja do ćwiczenia podstaw matematyki dla dorosłych wracających do nauki po przerwie. Zawiera 15 zadań w pięciu obszarach: kolejność działań, liczby dodatnie i ujemne, ułamki, podstawy algebry oraz równania liniowe. Interfejs jest po polsku i działa na telefonie oraz komputerze.

## Uruchomienie

Wymagany Node.js 22.12+ i npm. W katalogu repozytorium:

```sh
npm ci
npm run dev
```

Otwórz adres podany przez Vite (ścieżka `/math-tutor-app/`). W Codex Cloud, jeśli katalog domowy jest tylko do odczytu, użyj `npm_config_cache=/tmp/math-tutor-npm npm ci`.

## Weryfikacja

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

W Codex Cloud dostępny jest systemowy Chromium. Testy interfejsu można uruchomić bez pobierania przeglądarki: `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e`.

Build zapisuje statyczne pliki w `dist/`. `base` Vite jest ustawione na `/math-tutor-app/`, czyli ścieżkę projektu na GitHub Pages.

## Jak działają ćwiczenia

Wybierz kategorię i zadanie, a następnie wpisz liczbę lub ułamek `a/b`. Możesz użyć minusa `-` lub `−` także w liczniku i mianowniku. Przy ułamkach można też użyć dokładnie równoważnego zapisu dziesiętnego, np. `3/4`, `0.75` i `0,75` są uznawane za tę samą wartość. `0.3333333333` nie jest dokładnie równe `1/3`. Dzielenie przez zero, zbyt długie i nieprawidłowe wejście są odrzucane.

Po błędnej odpowiedzi zobaczysz wstępną wskazówkę oraz ewentualną **hipotezę** o typie pomyłki. Kolejną wskazówkę możesz odsłonić samodzielnie. Pięć zadań oferuje dodatkowe pytanie o pierwszy krok rozwiązania; odpowiedź na nie zmienia następną podpowiedź, ale nie ustala przyczyny wcześniejszego błędu. Zmiana odpowiedzi głównej usuwa ocenę i wskazówki poprzedniej próby. Pełne rozwiązanie jest pokazywane po poprawnej odpowiedzi. Następne ćwiczenie otwiera osobny przycisk.

Niepoprawność wyniku jest matematycznie potwierdzona. Przyczyna błędu pozostaje przypuszczeniem opartym na końcowej odpowiedzi. Gdy kilka pomyłek daje ten sam wynik, aplikacja pokazuje wszystkie pasujące możliwości; gdy żadna reguła nie pasuje, wyświetla „nieustalona przyczyna”. Szczegóły opisuje [ERROR_TAXONOMY.md](ERROR_TAXONOMY.md).

## CI i GitHub Pages

Workflow [CI](.github/workflows/ci.yml) działa przy Pull Requestach do `main` oraz po push na `main`. Instaluje zależności przez `npm ci`, uruchamia Vitest, buduje aplikację i wykonuje testy Playwright w Chromium. Tylko udany przebieg CI po push na `main` zapisuje `dist/` jako artefakt `site-dist`. Osobny workflow [Deploy Pages](.github/workflows/pages.yml) pobiera ten konkretny artefakt i publikuje go po zakończeniu CI z sukcesem. PR nie uruchamia publikacji.

W tym repozytorium Pages używa źródła GitHub Actions. Po scaleniu zmian do `main` sprawdź przebiegi **CI** i **Deploy Pages** w zakładce Actions, a następnie stronę pod adresem `https://eluyz.github.io/math-tutor-app/`. Samo otwarcie PR nie aktualizuje strony. W nowym forku właściciel musi ustawić **Settings → Pages → Build and deployment → Source: GitHub Actions**; w razie ograniczeń także dopuścić użyte akcje i wdrożenia z `main` do środowiska `github-pages`.

## Zakres i prywatność

Odpowiedzi są sprawdzane lokalnie i deterministycznie, bez `eval` i tolerancji zmiennoprzecinkowej. Nie ma backendu, kont, telemetrii ani przesyłania odpowiedzi na serwer. Stan ukończonych ćwiczeń istnieje tylko w pamięci bieżącej sesji; odświeżenie strony go usuwa.

Projekt jest dostępny na licencji [MIT](LICENSE). Bezpośrednie zależności używają licencji MIT lub Apache 2.0; szczegóły są w [ARCHITECTURE.md](ARCHITECTURE.md). Zobacz też [PRODUCT.md](PRODUCT.md), [ROADMAP.md](ROADMAP.md) i [CONTRIBUTING.md](CONTRIBUTING.md).
