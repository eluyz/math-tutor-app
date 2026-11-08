# G06 — katalog i akceptacja integracji (2026-11-08)

## Zakres, zależności

- PR rodzica: #235, HEAD `96290c84cd3cb08d8f89a811f42378b3e191f6a8`; własny kod matematyczny i testy samodzielne.
- PR integracji: #244, gałąź `chat/closure-g06-integration-20261108` wyprowadzona z #235. PR tymczasowo ma bazę `main`, aby uruchomić istniejące GitHub Actions (`ci.yml` ogranicza `pull_request.branches` do `main` i `qa/batch-c-controlled-acceptance`). W tym stanie jego diff obejmuje również kod rodzica.
- Nie scalać #244 przed zamknięciem zależności i kontrolą kolizji z #239 (I04), #199 (QA-10) i innymi równoległymi gałęziami.

## Co zostało zintegrowane

- `EulerInfinityProblem` w `src/university/schema.ts`.
- Rodzina `analysis-euler-function-infinity` (24 przypadki na poziomie `hard`) w `src/university/catalog.ts`.
- Dispatch `analysis-euler-infinity` PRZED ogólnym `isElementaryAnalysis`.
- Kod kompetencji G06 znajduje teraz obecną rodzinę `analysis-euler-function` (x→0) oraz nową rodzinę `analysis-euler-function-infinity` (x→+∞), nadal z oznaczeniem `partial`.
- Żaden kod z dotychczasowej rodziny x→0 ani historyczna paczka 96 wariantów nie są zmieniane.
- Dołączono testy integracyjne generowania, oceniania i lokalizacji oraz testy PL/EN w przeglądarce na 375 i 1280 px.

## Oczekiwane liczniki na izolowanej bazie main@c44ef85531906c9179c529fdfc852eb0035a13b7

| Wskaźnik | Main przed zmianą | Po dodaniu G06 |
| --- | ---: | ---: |
| Rodziny | 240 | 241 |
| Rodziny poza całkami | 219 | 220 |
| Warianty | 18 333 | 18 357 |
| Warianty poza całkami | 16 821 | 16 845 |

Te liczby nie pozostają prawidłowe po scaleniach innych gałęzi dodających rodziny. W szczególności integracja I04 (#239) musi zostać zserializowana, a globalne asercje przeliczone na aktualnym main; nie wolno na ślepo scalać stałych 241 / 18 357.

## Dowody i bramki

- Niezależny przegląd matematyczny: 24/24 obliczeń granicy logarytmicznej pokrywa wyniki w generatorze, łącznie z przypadkiem podstawy równej 1; to nie jest test interfejsu ani SOURCE_PASS.
- Testy jednostkowe i build PR #235: sukces we wczesnej części CI; cały CI wymaga końcowego `SUCCESS` na dokładnym SHA.
- CI PR #244 wymaga pełnego `SUCCESS`, gdy ruszy po zdarzeniu `synchronize`. Bez tego oznaczyć `NOT_RUN` / `PENDING`.
- Następny krok po CI: kontrola niezależna zmian wspólnych, akceptacja UI na prywatnych materiałach źródłowych bez publikowania ich treści, zgodny z uprawnieniami ownera merge, a potem post-merge main CI + Pages na tym samym SHA.
- Do tego momentu `SOURCE_PASS=0` dla nowej rodziny, `PRODUCTION_DEPLOYED=false`; projekt i dział G **nie są ukończone**.
