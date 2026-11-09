# D08 — Integracja badania funkcji wymiernej bez biegunów (#245)

Stan przygotowania: 2026-11-09. Repo: eluyz/math-tutor-app.

## Cel i zależności

- Generator D08 jest już na `main` po scaleniu PR #238 (commit `33585006945b687445c8fa7db81665d3b0f7b6c5`), z osobno potwierdzonym CI oraz GitHub Pages.
- PR #245 dodaje **jedną rodzinę do katalogu studenta**. Integracja jest budowana na main obejmującym I04 z PR #239, W02 z PR #248, M06 z PR #251, G06 z PR #244, C02 z PR #242, U06/U08 z PR #252, G07 z PR #258 oraz C02/C05 z PR #259.
- Scalenie #245 wymaga końcowego pełnego CI na dokładnym HEAD, akceptacji właściciela oraz po scaleniu sukcesu CI i Pages na nowym `main`. Bez tych dowodów nie oznaczać jako LIVE.
- D08 zachowuje `coverage: partial`. Formalny SOURCE_PASS oryginalnych arkuszy nie jest przyznany. Pliki prywatnych arkuszy nie są publikowane.

## Nowa rodzina `analysis-study-smooth-rational`

- 24 warianty na poziom, poziomy hard/advanced/expert: **72 zadania**, każde w PL/EN.
- `f(x)=k+m q²/((x−a)²+q²)` dla `q>0`, `m≠0`: dziedzina ℝ, brak rzeczywistych biegunów, asymptota pozioma, jeden punkt stacjonarny i dwa rzeczywiste przegięcia.
- hard/advanced: oceniane dokładne `(x₀,y₀)`; expert: oceniane `max f` i `min f` na domkniętym przedziale `[a−2q,a+2q]`.
- Pełne rozumowanie f′ i f″ oraz znaki, monotoniczność i wklęsłość są pokazywane w rozwiązaniu. Szkic wykonuje student na kartce, bez automatycznej oceny rysunku.

## Kontrola jakości

- Unit: po 24 × 3 = 72 wygenerowane konfiguracje, PL/EN, błędne, poprawne i niekompletne odpowiedzi, brak niedozwolonych poziomów, wyszukiwanie D08 i tytułów.
- Playwright: 12 scenariuszy = 3 poziomy × PL/EN × 375px/1280px; widoczność rozwiązania, ocenianie, i brak overflow.
- Odrębna walidacja matematyczna SymPy: 72/72 PASS w kandydacie #238.
- Pre-merge PR #245 na poprzednim HEAD `5101a06490d2791581fe13b2a472b454ed466d51` przeszedł pełne CI włącznie z Batch B–G ([run 42573152254](https://github.com/eluyz/math-tutor-app/actions/runs/42573152254)).
- Zmiany integracji przeniesione na bazę zawierającą I04, W02 (#248), M06 (#251), G06 (#244), C02 (#242), U06/U08 (#252), G07 (#258) i C02/C05 (#259). Po dołączeniu D08 oczekiwany katalog to **250 rodzin, 19 053 warianty**, w tym 228 rodzin i 17 469 wariantów poza całkami oraz 1 584 warianty całek. Kolejne scalenia wymagają ponownego przeliczenia.
- Liczba rodzin L4 (advanced): 188; L5 (expert): 171, dla obecnego zakresu. Liczniki w dokumentach historycznych nie są obietnicą stanu produkcyjnego.

## Status

Zadanie D08 jest matematycznie przygotowane i poddane QA. Etap 4 — scalona integracja #245, zewnętrzna akceptacja i potwierdzone CI oraz GitHub Pages na finalnym `main` — pozostaje bramką zakończenia. Szkic oraz pełne SOURCE_PASS to odrębny zakres; nie mylić z katalogowym PASS.
