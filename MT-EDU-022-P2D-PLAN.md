# MT-EDU-022 P2D-A — pełniejsze badanie funkcji (D05, D07–D10)

## Punkt wyjścia
- PR #77 scalony przez zatwierdzone Squash and merge; `main` `24f6ead322f20770cd86f305eb420d1390092601` zawiera 176 rodzin / 14 565 wariantów.
- CI na `main` po #77: [run #40292040427](https://github.com/eluyz/math-tutor-app/actions/runs/40292040427) SUCCESS. [Deploy Pages #40293285164](https://github.com/eluyz/math-tutor-app/actions/runs/40293285164) wymaga niezależnego wyniku.
- Stary `functionStudy.ts` ma dwa kontrolowane typy, wielomian sześcienny i wymierną m(t+1/t), po 2 poziomy. Brakuje wielomianów parzystych stopnia 4, zmiennego rozstawu ekstremów i odpowiedniej analizy asymptot z przesunięciem.
- Rozwój sprawdzianów pozostaje wstrzymany; zadania dodajemy do zwykłego katalogu PL/EN.

## Nowy zakres P2D-A
1. `analysis-study-quartic` — `f(x)=m((x−a)²−q²)²+k`, m≠0, q>0. Dokładnie trzy punkty krytyczne t=−q,0,q; tabela znaków pierwszej pochodnej, dwa przegięcia x=a±q/√3, końce ±∞ i jakościowy szkic W/M. Poziomy hard/advanced: współrzędne trzech punktów; expert: globalne max/min na [a−2q,a+2q], z porównaniem pięciu kandydatów.
2. `analysis-study-rational-shift` — `f(x)=m((x−a)+q²/(x−a))+k`, m≠0, q>0. Biegun x=a, dwustronne granice ±∞, asymptota ukośna `y=m(x−a)+k`, dwa punkty stacjonarne ±q, znak f′ po obu stronach bieguna i brak przegięcia w wyłączonym punkcie. Expert: globalne max/min na [a+q/2,a+2q].
3. Dwie rodziny × trzy poziomy × 24 warianty = **144**; po ewentualnym osobnym zatwierdzonym merge 178 rodzin / 14 709 wariantów.
4. Testy niezależnego rachunku punktów, znaków pochodnej i ekstremów, pełny zestaw Vitest, Playwright na 375/1280 px oraz PL/EN.

## Jawne ograniczenia
- D05/D07/D08/D09/D10 pozostają **częściowe**. Nie ma ogólnego parsera symbolicznego ani możliwości zadania dowolnej funkcji.
- Tabele znaków i opis jakościowego szkicu **nie są rysunkiem krzywej**. Realne rysowanie i weryfikacja szkiców pozostają do odrębnego P2D-B.
- Brak nowej kategorii, zależności zewnętrznych, zmian historii sesji, skanowania pisma i trybu uczelnianego.

## Bramka
- [ ] Pełne Vitest PASS.
- [ ] TypeScript i build PASS.
- [ ] Pełne Playwright PASS.
- [ ] Końcowa recenzja matematyczna i techniczna.
- [ ] **Nowa zgoda właściciela na Squash and merge**.
