# MT-EDU-020 — P1B: funkcje, dziedziny i odwrotności

## Stan po P1A
- PR #72 został scalony (commit main `404cefd8bb75e9df86db2c453303be9e1cb4f8b8`).
- Katalog na main: **166 rodzin, 13 845 wariantów**. CI/Pages po merge sprawdzane osobno.
- P1B: zmiany wyłącznie na gałęzi `feature/mt-edu-020-p1b-function-gaps`, bez merge i bez nowych zależności.

## Audyt istniejących rodzin
- F01: `function-domain` zawiera pierwiastki i ułamki — już pokryte.
- F02: `analysis-log-domain` zawiera logarytm argumentu liniowego i wybrane ilorazy, brakuje trzech punktów krytycznych.
- F04: `function-mixed-domain` łączy pierwiastki i logarytmy, `function-tangent-domain` sprawdza bieguny okresowe; brakuje ścisłego znaku całego ilorazu wewnątrz ln.
- F05: istnieją zadania `function-graph-*` (dziedzina, wartości, zera, monotoniczność, ekstrema, symetria); pozostaje odczyt bardziej ogólnych wykresów — odkładamy.
- F06: `function-affine-inverse` działa wyłącznie dla odwrotnej liniowej. Brakuje nietrywialnej funkcji wymiernej z wykluczonym punktem.
- F07: wybrane prawa logarytmów i równania już obecne; bez powielania.

## Zmiany P1B
1. `function-log-rational-domain` (72 warianty): rzeczywista dziedzina `ln(((x−p)(x−q))/(x−s))` dla p<q i s różnego od p, q. Trzy proste punkty krytyczne i dwie dodatnie otwarte składowe, weryfikacja znaku poza punktami krytycznymi. Położenie s zmienne: przed p, wewnątrz (p,q), za q.
2. `function-mobius-inverse-point` (72 warianty): `f(x)=(ax+b)/(cx+d)` dla `c≠0, ad−bc≠0`, odwrotna w podanym punkcie obrazu, brakująca wartość `a/c`, wyłączenie bieguna `−d/c`. Ścisły rachunek wymierny, niezależna próba przez `f(f⁻¹(y))=y`.
3. Każda rodzina: poziomy hard/advanced/expert po 24 warianty, zadania i objaśnienia PL/EN, błędne/poprawne/puste odpowiedzi, testy jednostkowe i Playwright mobilny/stacjonarny.
4. Po ewentualnym merge: **168 rodzin / 13 989 wariantów** (+144).

## Ograniczenia i bramka
- F02, F04 i F06 zostają **częściowo** pokryte; nie deklarujemy dowolnego parsera wyrażeń, wszystkich funkcji odwrotnych ani ukończenia syllabusa.
- Wymagane: pełny Vitest PASS, TypeScript/build PASS, pełny Playwright Chromium PASS, końcowa recenzja matematyczna i techniczna.
- **Nie wykonywać Squash and merge bez kolejnej, wyraźnej zgody właściciela.**
