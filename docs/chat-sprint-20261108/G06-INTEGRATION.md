# G06 — integracja po I04 i W02

Data: 2026-11-09. Rodzic PR #235 został zatwierdzony i scalony w `main@982960b5fe256564c05a741942c0335a91401d9c`. Następnie scalenie W02 PR #248 dało `main@374b50db1552776521f9f0a3b24af932299c728f`. PR #244 pozostaje osobnym kandydatem do scalenia.

## Zmiany

- G06 x→+∞: jedna nowa rodzina `analysis-euler-function-infinity`, 24 warianty poziomu hard, podstawa typu (1+a/x) lub iloraz liniowy, dokładne wyniki z e/π. Stara rodzina x→0 i 96 historycznych wariantów pozostają bez zmian.
- Zarejestrowano `EulerInfinityProblem` w schemacie, `eulerInfinityFamilies` w katalogu, presenter z pierwszeństwem przed ogólnym `isElementaryAnalysis` oraz rodzinę w wyszukiwarce kompetencji G06 (nadal `partial`).
- Niezależne testy granic, PL/EN, poprawnych/błędnych/pustych odpowiedzi, 375 px i 1280 px, oraz testy bezpośredniego wyszukiwania rodziny w interfejsie.
- Zachowano kompletną integrację I04 (PR #239) i W02 (PR #248), bez zastąpienia ich generatorów, testów, dopasowań w katalogu czy wartości liczników.

## Kumulacyjne liczniki

| Wskaźnik | Main po W02 | Kandydat po G06 |
| --- | ---: | ---: |
| Rodziny | 241 | 242 |
| Rodziny poza całkami | 219 | 220 |
| Warianty | 18 429 | 18 453 |
| Warianty poza całkami | 16 845 | 16 869 |

Jeśli przed scaleniem pojawi się inna integracja, ponownie sprawdzić liczniki i pełny diff.

## Walidacja i bramki wydania

1. Kod źródłowy rodzica #235: CI na HEAD przed scaleniem PASS; po scaleniu main CI oraz GitHub Pages na dokładnym SHA PASS.
2. Poprzedni kandydat #244 miał pełny PASS na SHA `63e3d5b4d915f63c1c92d659626ffbdde796631c`, lecz jego CI nie wystarcza do akceptacji obecnej wersji po I04 i W02.
3. Nowy exact-HEAD wymaga `npm test`, produkcyjnego buildu, Playwright oraz akceptacji Batch B–G.
4. Właściciel projektu musi wyrazić zgodę na scalenie integracji. Po merge wymagane osobne main CI i Pages PASS na tym samym SHA.
5. Cztery prywatne oryginalne P26/3a–d były niezależnie porównane matematycznie, ale `SOURCE_FORM_MATCH 4/4` nie oznacza formalnego `SOURCE_PASS`, ani identycznej treści w przeglądarce. Żadnych prywatnych danych źródłowych nie publikować.

**NIE oznaczać jako SOURCE_PASS przed niezależnym świadkiem źródło→wdrożona aplikacja.**
