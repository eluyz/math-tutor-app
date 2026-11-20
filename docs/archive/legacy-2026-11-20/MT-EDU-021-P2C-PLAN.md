# MT-EDU-021 P2C — W03 granice i ciągłość funkcji dwóch zmiennych

## Baza i aktualny stan
- Zatwierdzony i scalony PR #76: `main` `47b510aca73171d2b0873e23ffc8d3104929bd3d`; 174 rodziny, 14 421 wariantów.
- Pełne CI na main [#40285641478](https://github.com/eluyz/math-tutor-app/actions/runs/40285641478) oraz Deploy Pages [#40286775096](https://github.com/eluyz/math-tutor-app/actions/runs/40286775096): SUCCESS.
- W03 przed tym PR: `teoria`, brak generatora. W01/W02 posiadają już ograniczone zadania kwadratowe.
- P2C to osobny, niescalony PR. Nie rozpoczynamy nowego trybu egzaminu, nie dodajemy nazw uczelni ani zależności.

## Matematyczny zakres W03
1. `multivar-path-limit` — 72 warianty (medium/hard/advanced):
   - Funkcja przesunięta do punktu (a,b), u=x−a, v=y−b.
   - `c + k u²v/(u⁴+v²)`: po prostej v=0 granica c, po paraboli v=mu² granica `c+km/(1+m²)`, gdzie k,m≠0. Różne wartości dowodzą braku granicy 2D.
   - `c + k u²v²/(u²+v²)`: ograniczenie `|k|u²v²/(u²+v²)≤|k|(u²+v²)/4` dowodzi granicy c niezależnej od drogi.
2. `multivar-continuity-point` — 72 warianty (medium/hard/advanced):
   - Te same dwie funkcje w otoczeniu punktu i jawna wartość f(a,b).
   - Klasyfikacja: ciągłość, nieciągłość usuwalna (granica istnieje ≠ f(a,b)), nieciągłość nieusuwalna (brak granicy).
   - Zadanie uczy, że zmiana wyłącznie f(a,b) nie może naprawić braku granicy.
3. Dokładne wartości wymierne, wyprowadzenia PL/EN, różne przykłady w obrębie 24 wariantów na poziom, poprawne i błędne odpowiedzi oraz scenariusze urządzeń 375/1280px.
4. Razem +144 warianty, po ewentualnym merge: 176 rodzin / 14 565 wariantów.

## Czego nie deklarujemy
- W03 po PR przechodzi wyłącznie z `teoria` do `częściowo`. Nie wprowadzamy ogólnego algorytmu granic 2D, współrzędnych biegunowych, kwantyfikatorowego dowodu ε–δ ani wszystkich klas funkcji.
- W01/W02 nadal pozostają częściowe; P2C nie zmienia ich generatorów.
- Liczba rodzin i wariantów nie jest miernikiem gotowości na egzamin.

## Kontrole przed możliwym scaleniem
- [ ] Wszystkie testy Vitest PASS, z niezależnym dowodem matematycznym.
- [ ] TypeScript i build PASS.
- [ ] Wszystkie testy Playwright Chromium PASS.
- [ ] Recenzja matematyczna i techniczna HEAD.
- [ ] Wyraźna osobna zgoda właściciela na Squash and merge.

Każdą zmianę w dokumentacji po scaleniu aktualizujemy wraz z rzeczywistym statusem wdrożenia na main.
