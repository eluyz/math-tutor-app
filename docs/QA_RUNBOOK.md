# QA Runbook (krótki, dla wykonawców i recenzentów PR)

## 1) Komendy (tylko aktualnie dostępne w repo)

```bash
# czysta instalacja
npm_config_cache=/tmp/math-tutor-npm npm ci

# testy jednostkowe
npm test

# build produkcyjny
npm run build

# Playwright (Chromium lokalnie w Codex Cloud)
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e

# pełny pakiet Playwright jak w CI
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-b
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-c
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-d
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-e
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-f
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-g
```

## 2) Co sprawdzamy gdzie

- **CI dla PR** (`ci.yml`, trigger `pull_request`): weryfikuje zmiany na gałęzi PR przed scaleniem.
- **Pełne CI na `main`** (`ci.yml`, trigger `push`): uruchamia się po merge na `main`; to osobne potwierdzenie dla finalnego SHA na `main`.
- **Publikacja GitHub Pages** (`pages.yml`): osobny workflow, uruchamiany po **udanym** CI z `push` na `main`; należy potwierdzić niezależnie od zielonego CI.

## 3) Minimalny raport odbioru (w opisie Draft PR lub komentarzu QA)

- PR: `#...`
- HEAD SHA (dokładny): `...`
- Wykonane komendy + wynik każdej:
  - `npm ci` → `PASS/FAIL`
  - `npm test` → `PASS/FAIL`
  - `npm run build` → `PASS/FAIL`
  - `npm run test:e2e` (+ batch B–G, jeśli uruchamiane) → `PASS/FAIL`
- Link(i) do runów CI (PR i/lub `main`): `https://github.com/.../actions/runs/...`
- Link do runu Pages (po merge na `main`): `https://github.com/.../actions/runs/...`
- Przypadki pozytywne/negatywne sprawdzone ręcznie (krótko, punktowo).
- Ograniczenia (czego nie sprawdzono i dlaczego).
- Status końcowy: `PASS` / `NEEDS_FIXES` / `BLOCKED`.

## 4) Zasada jakości merytorycznej

Zielone CI ani duża liczba wariantów testów **nie dowodzą** poprawności matematycznej i dydaktycznej. Wymagane są niezależne oracles (oczekiwane wyniki liczone poza kodem pod testem) oraz ręczna inspekcja objaśnień i komunikatów w PL/EN.

## 5) Bramka wydawnicza (release gate)

- [ ] Przed scaleniem: akcept właściciela dla **dokładnego SHA** z Draft PR.
- [ ] Po scaleniu do `main`: osobno potwierdzone zielone CI dla `main`.
- [ ] Po scaleniu do `main`: osobno potwierdzony udany workflow Pages dla tego wdrożenia.
- [ ] Jeśli którykolwiek warunek nie jest spełniony: status `NEEDS_FIXES` albo `BLOCKED` (bez „domyślnego PASS”).
