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

Build zapisuje statyczne pliki w `dist/`. `base` Vite jest ustawione na `/math-tutor-app/` dla przyszłego hostingu GitHub Pages. Publikacja nie jest częścią MT-001.

## Zakres i prywatność

Przykładowe odpowiedzi są sprawdzane lokalnie i deterministycznie. Dla wybranych typowych błędów aplikacja pokazuje dopasowaną wskazówkę; nie jest to inteligentna diagnostyka. Nie ma backendu, kont ani przesyłania odpowiedzi na serwer. Stan ukończonych ćwiczeń istnieje tylko w pamięci bieżącej sesji.

Projekt jest dostępny na licencji [MIT](LICENSE). Zobacz [PRODUCT.md](PRODUCT.md), [ROADMAP.md](ROADMAP.md), [ARCHITECTURE.md](ARCHITECTURE.md) i [CONTRIBUTING.md](CONTRIBUTING.md).
