# MT-EDU-021 P2A — pochodne wyrażeń złożonych

## Stan i cel
- Baza: `main` po PR #74, commit `14d5788eb97ed34d972de82a696af89d8a77014b` (170 rodzin / 14 133 warianty).
- Status po-merge CI/Pages #74 wymaga odrębnego sprawdzenia; nie deklarować ukończenia przed potwierdzeniem.
- P2A jest osobnym PR **bez automatycznego merge**.

## Audyt luk vs. syllabus
- **D01 pokryte:** `derivative-formula` wspiera pochodną potęg i wielomianów.
- **D02 częściowo:** `derivative-product-point` sprawdza (ax+b)(cx²+d), a `derivative-quotient-point` wyłącznie iloraz dwóch funkcji liniowych. Brakuje kwadratowego licznika ilorazu i jego pochodnej w zadanym punkcie.
- **D03 częściowo:** `analysis-log-exp-derivative` oraz rodziny trygonometryczne uczą podstawowych ln(u), exp(u) i sin/cos/tg przy kontrolowanych argumentach. Brakuje logarytmu pełnego wielomianu kwadratowego z uprzednim sprawdzeniem u(h)>0.
- Inne D04–D10 i I01–I08 pozostają częściowe, ale ich zakres wymaga osobnego pakietu; nie oznaczamy ich jako ukończonych.

## Zakres wdrożenia
1. `derivative-quadratic-quotient`: `f(x)=(ax²+bx+c)/(dx+e)`; 72 warianty (hard/advanced/expert). Sprawdzenie D(h)≠0, obliczenie N(h), N′(h), D(h), dokładne (N′D−ND′)/D².
2. `derivative-log-quadratic`: `f(x)=ln(ax²+bx+c)`; 72 warianty (hard/advanced/expert). Współczynniki generowane tak, aby u(h)>0; pochodna u′(h)/u(h). Uwzględniono wyniki zerowe.
3. 2 × 3 poziomy × 24 odmienne zadania = **144 warianty**. Po ewentualnym zatwierdzonym merge: **172 rodziny / 14 277 wariantów**.
4. Bilingwalne rozwiązania krok po kroku, testy jednostkowe z niezależnym rozwinięciem ilorazu, testy odpowiedzi poprawnej/błędnej/pustej i Playwright mobilny/stacjonarny.
5. D02/D03 zostają **częściowe**; nie dodajemy ogólnego parsera funkcji.

## Bramka przed scaleniem
- [ ] Vitest pełny PASS.
- [ ] TypeScript i build PASS.
- [ ] Playwright Chromium pełny PASS.
- [ ] Recenzja matematyczna i techniczna.
- [ ] **Nowa wyraźna zgoda użytkownika na Squash and merge PR P2A.**
