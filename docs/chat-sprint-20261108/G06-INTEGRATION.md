# G06 — scalone źródło matematyczne i kandydat integracji UI

Dzień: 2026-11-09. PR #235 został scalony metodą squash na main (`982960b5fe256564c05a741942c0335a91401d9c`). PR #244 to oddzielny **DRAFT** z integracją, **NIE** jest jeszcze zatwierdzony do merge.

## Przegląd zakresu

- Nowa `analysis-euler-function-infinity` zawiera 24 zadania typu `hard` z x→+∞; zachowuje 96 starych wariantów `analysis-euler-function` x→0.
- `EulerInfinityProblem` w dyskryminowanej unii `UniversityProblem`, jeden wpis w katalogu, prezentacja `analysis-euler-infinity` przed ogólnym `isElementaryAnalysis`.
- G06 ma dwie rodziny i pozostaje `coverage: partial`. Brak deklaracji pełnego `SOURCE_PASS`.
- PL/EN, 375/1280 px, poprawna/błędna/pusta odpowiedź i rozwiązanie są kontrolowane przez testy integracyjne i przeglądarkowe.
- Pierwotna gałąź #244 przeszła CI https://github.com/eluyz/math-tutor-app/actions/runs/42524843661 na swoim SHA. Po pogodzeniu z I04 wymagany jest **nowy** pełny PASS na nowym SHA.

## Kumulacyjne liczniki po I04 #239 i G06 #244

| Wskaźnik | Main z I04 (przed G06) | Kandydat z G06 |
| --- | ---: | ---: |
| Rodziny | 241 | 242 |
| Rodziny poza całkami | 219 | 220 |
| Warianty | 18 405 | 18 429 |
| Warianty poza całkami | 16 821 | 16 845 |

Liczby ważne wyłącznie wobec main, na którym jest I04 i źródłowy generator G06. Jeśli kolejne integracje dodadzą rodziny, liczniki trzeba zaktualizować ponownie i wykonać niezależne testy.

## Warunki wydania

1. Zakończyć CI i Pages na exact SHA po scaleniu #235.
2. Uzyskać pełny CI na nowym HEAD #244, obejmujący B–G, oraz niezależną recenzję.
3. W przypadku innych zmergowanych integracji: wykonać ponowny rebase oraz kontrolę liczników i formuł.
4. Dopiero po osobnej zgodzie właściciela scalić #244.
5. Potwierdzić post-merge CI + Pages na tym samym SHA; weryfikację źródło→opublikowany UI prowadzić bez publicznego kopiowania prywatnych zadań i kluczy.

`SOURCE_FORM_MATCH 4/4` dla prywatnych P26/3a–d nie stanowi formalnego SOURCE_PASS.
