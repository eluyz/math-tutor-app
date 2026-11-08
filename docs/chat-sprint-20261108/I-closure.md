# [CHAT-SPRINT-I] I04 — dwukrotne całkowanie przez części (2026-11-08)

## Zakres i punkt odniesienia
- Baza: `main@c44ef85531906c9179c529fdfc852eb0035a13b7`.
- Jedna luka egzaminacyjna I04: wielomian stopnia 2 razy sinus lub cosinus funkcji liniowej. Trop prywatnego źródła: P36/1j (bez kopiowania treści arkusza).
- Istniejące `integral-parts`, `integral-parts-trig-linear` oraz wszystkie ich warianty pozostają nietknięte.
- Brak zmian w wspólnych `catalog.ts`, `schema.ts`, `competencyIndex.ts`, rejestrach i CI.

## Dostarczono — zakres lokalny
- `src/university/integralPartsTrigQuadratic.ts`: samodzielny generator 24 wariantów × 3 poziomy (`hard`, `advanced`, `expert`) dwóch postaci: `k*x²*sin(ax+b)` i `k*x²*cos(ax+b)`, z `a,k ≠ 0`.
- Dokładne współczynniki trzech składników pierwotnej, pełne dwa kroki przez części, uzasadnienia PL/EN, odpowiedź `primitive` i obowiązkowe `+C`.
- `src/university/integralPartsTrigQuadratic.test.ts`: kontrola wszystkich 72 wariantów, identyczności po zróżniczkowaniu niezależnej od algorytmu, granic i błędnych danych, PL/EN oraz oceniania błędnych współczynników.
- Staged: rodzina nie jest jeszcze dołączona do katalogu produkcyjnego. Nie ogłaszamy udostępnienia jej studentom.

## Dowody i ograniczenia
- `SYMPY_FORMULA_PASS`: 72/72 syntetycznych wariantów zróżniczkowano niezależnie i dokładnie; 24 różne warianty na poziom.
- Kontrole ręczne: `a=1, b=-3, k=1, sin` -> `(-1,2,2)`; `a=-2, b=-2, k=1, cos` -> `(-1/2,1/2,1/4)`.
- `VITEST=NOT_RUN`, `BUILD=NOT_RUN`, `PLAYWRIGHT=NOT_RUN` (w tym środowisku brak checkoutu repo/dependencies, a dostęp do GitHub jest przez konektor).
- `SOURCE_PASS=NOT_GRANTED`: oryginalne świadectwo nie jest kopiowane do publicznego repo; szczegółowy audyt źródłowy i UI pozostaje osobnym etapem.

## Oddzielny PR integracyjny — wyraźnie poza tym zakresem
Po ukończeniu równoległych zmian, jeden koordynowany PR powinien:
1. Dodać `IntegralPartsTrigQuadraticProblem` do `UniversityProblem` w `src/university/schema.ts`.
2. Importować i rozwinąć `integralPartsTrigQuadraticFamily` w `src/university/catalog.ts` oraz przekierować `kind=integral-parts-trig-quadratic` do `presentQuadraticTrigParts`.
3. Dopisać `integral-parts-trig-quadratic` do `I04.familyIds` w `src/competencyIndex.ts`.
4. Zaktualizować rzeczywiście zależne baseline liczebności (np. `src/university/integrals.test.ts` dla 1512→1584 w kategorii), wykonać celowany Vitest, build, CI i Playwright na dokładnym HEAD.
5. Sprawdzić w wyszukiwarce kompetencji oraz poprawność interfejsu PL/EN, podpowiedzi i wpisywania trzech współczynników.

Nie scalać niniejszego Draft PR bez ustalenia kolejności integracji. Gdy CI nie jest zielone lub kontrakt katalogowy wymaga dalszych zmian, pozostawić Draft i raportować konkretny blocker.

Refs #108
