# Math Tutor

Otwarty prototyp nauki podstaw matematyki dla dorosłych wracających do nauki po przerwie. W MT-001 można rozwiązać trzy krótkie zadania, sprawdzić odpowiedź i zobaczyć wyjaśnienie. Interfejs jest po polsku i działa na telefonie oraz komputerze.

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

## CI i GitHub Pages

Workflow [CI](.github/workflows/ci.yml) działa przy Pull Requestach do `main` oraz po push na `main`. Instaluje zależności przez `npm ci`, uruchamia Vitest, buduje aplikację i wykonuje testy Playwright w Chromium. Tylko udany przebieg CI po push na `main` zapisuje `dist/` jako artefakt `site-dist`. Osobny workflow [Deploy Pages](.github/workflows/pages.yml) pobiera ten konkretny artefakt i publikuje go po zakończeniu CI z sukcesem. PR nie uruchamia publikacji.

Właściciel repozytorium musi ustawić **Settings → Pages → Build and deployment → Source: GitHub Actions**. W razie ograniczeń repozytorium należy też upewnić się, że **Settings → Actions → General** zezwala na uruchamianie użytych akcji oraz że środowisko `github-pages` dopuszcza wdrożenia z `main`. Po scaleniu zmian do `main` sprawdź przebiegi **CI** i **Deploy Pages** w zakładce Actions, a następnie rzeczywisty adres `https://eluyz.github.io/math-tutor-app/`. Samo dodanie workflow nie oznacza, że strona jest już opublikowana.

## Zakres i prywatność

Przykładowe odpowiedzi są sprawdzane lokalnie i deterministycznie. Dla wybranych typowych błędów aplikacja pokazuje dopasowaną wskazówkę; nie jest to inteligentna diagnostyka. Nie ma backendu, kont ani przesyłania odpowiedzi na serwer. Stan ukończonych ćwiczeń istnieje tylko w pamięci bieżącej sesji.

Projekt jest dostępny na licencji [MIT](LICENSE). Bezpośrednie zależności używają licencji MIT lub Apache 2.0; szczegóły są w [ARCHITECTURE.md](ARCHITECTURE.md). Zobacz też [PRODUCT.md](PRODUCT.md), [ROADMAP.md](ROADMAP.md) i [CONTRIBUTING.md](CONTRIBUTING.md).
