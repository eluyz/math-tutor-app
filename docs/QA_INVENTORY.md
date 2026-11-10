# QA-10 — deterministyczna inwentaryzacja katalogu tuple

## Cel
Ten dokument opisuje **spis tuple katalogowych** (`family_id / difficulty / variant_index`) dla bieżącego `main`.
To jest wyłącznie inwentaryzacja rejestrów i wariantów. **Nie jest to audyt poprawności matematycznej** i nie stanowi `SOURCE_PASS`.

## HEAD `main` użyty do inwentaryzacji
- `inventory_sha`: `31551537c3b8c021f27b344195c33e891c183355`
- lokalny checkout roboczy: `/home/runner/work/math-tutor-app/math-tutor-app`

## Źródła rejestrów (kod)
- legacy: `templates` + `makeInstance` (`/home/runner/work/math-tutor-app/math-tutor-app/src/generators.ts`)
- supplemental: `supplementalPool` (`/home/runner/work/math-tutor-app/math-tutor-app/src/education/supplements.ts`)
- education: `educationTemplates` + `makeEducationInstance` + `VARIANTS_PER_LEVEL` (`/home/runner/work/math-tutor-app/math-tutor-app/src/education/catalog.ts`, `/home/runner/work/math-tutor-app/math-tutor-app/src/education/types.ts`)
- higher: `supportsHigher` + `makeHigherInstance` + `HIGHER_VARIANTS` (`/home/runner/work/math-tutor-app/math-tutor-app/src/advanced/catalog.ts`)
- university: `universityFamilies` + `makeUniversityTask` + `UNIVERSITY_VARIANTS` (`/home/runner/work/math-tutor-app/math-tutor-app/src/university/catalog.ts`)
- dozwolone poziomy: `difficultyConfig` (`/home/runner/work/math-tutor-app/math-tutor-app/src/difficulty.ts`)

## Schemat rekordu tuple
Każdy rekord zawiera:
- `family_id`
- `difficulty`
- `variant_index`
- `canonical_key` (`family_id/difficulty/variant_index`)
- `category` (jeśli istnieje)
- `inventory_sha`
- `locales` (stały widok `['pl','en']`, **nie osobne tuple**)
- `source` (legacy/supplemental/education/higher/university)
- `source_variant` (indeks wariantu źródłowego przed kanonizacją)

## Determinizm i walidacje
Walidacja w `/home/runner/work/math-tutor-app/math-tutor-app/src/qa/inventory.ts` wymusza:
1. brak kolizji `canonical_key`,
2. brak nieznanych poziomów,
3. brak luk zakresu `variant_index` w każdej parze `family_id + difficulty`,
4. brak rozdzielenia widoków locale na osobne tuple,
5. zgodność liczby tuple z sumą deklaracji źródłowych,
6. odrzucenie nieobsługiwanego typu metadanych.

Negatywne przypadki testowe:
- duplikat klucza,
- brakujący/nieznany poziom,
- luka wariantu,
- traktowanie PL/EN jako osobnych tuple,
- nieobsługiwane metadane.

## Komendy uruchomione
1. Instalacja:
```bash
cd /home/runner/work/math-tutor-app/math-tutor-app
npm_config_cache=/tmp/math-tutor-npm npm ci
```
2. Testy modułu inwentaryzacji:
```bash
cd /home/runner/work/math-tutor-app/math-tutor-app
npm test -- src/qa/inventory.test.ts
```
3. Generacja artefaktu JSON (bez commita dumpu):
```bash
cd /home/runner/work/math-tutor-app/math-tutor-app
npm run qa:inventory -- --format json --inventory-sha 31551537c3b8c021f27b344195c33e891c183355 --output /tmp/math-tutor-inventory/qa-inventory.json
```
4. (wymagane dla QA-10) pełna walidacja projektu:
```bash
cd /home/runner/work/math-tutor-app/math-tutor-app
npm test
npm run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-b
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-c
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-d
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-e
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-f
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-g
```

## Rzeczywiste liczniki (dla SHA powyżej)
- `families`: **240**
- `tuples`: **18333**
- `locales` (widoki): **36666**
- `declarations`: **794**
- `duplicate canonical_key`: **0** (18333 unikalnych kluczy)

## Ograniczenia
- Narzędzie enumeruje tuple z aktualnych rejestrów kodu; nie mapuje ich do historycznych raportów QA.
- Inwentaryzacja nie ocenia jakości podpowiedzi/rozwiązań i nie orzeka PASS matematycznego.
- Artefakt jest generowany na żądanie do pliku lokalnego (`/tmp/...`) i nie powinien być commitowany jako duży dump.

## Odtwarzanie
Przy identycznym `inventory_sha` uruchom komendę `qa:inventory` z tym samym parametrem `--inventory-sha`.
Sortowanie rekordów i klucze kanoniczne są stabilne, więc wynik jest deterministyczny dla tego samego kodu źródłowego.
