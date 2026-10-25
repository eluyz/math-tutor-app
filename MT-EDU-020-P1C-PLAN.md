# MT-EDU-020 P1C — granice funkcji i kryterium Heinego

## Stan wejściowy i zależności
- PR #73 **squash merged** do `main` jako `ddcf827af0f6d1e709e94418169f3d2668f25518`.
- Baza: **168 rodzin / 13 989 wariantów**. Po-merge CI i Pages kontrolowane oddzielnie — nie zgadywać wyników.
- P1C wyłącznie na osobnej gałęzi, bez merge bez nowej zgody właściciela.

## Audyt pokrycia istniejących generatorów
- G01/G02/G03 i G05: już ćwiczone przez `limit-point` i `limit-conjugate`.
- G04: są granice ilorazów wielomianowych `limit-infinity` oraz asymptoty z pierwiastkami w kontrolowanej postaci `√(x²+1)`. Brak niezależnych ćwiczeń granic `√(a²x²+b)+cx+d` przy obu nieskończonościach z przypadkami skończonymi i ±∞ oraz prawidłową obsługą `|x|`.
- G06: jest `analysis-euler-function` dla kilku przypadków przy x→0. Brak ogólnych złożeń, ale powielanie tych przykładów w P1C byłoby mało użyteczne.
- G07: istnieją `analysis-asymptote-vertical/horizontal/oblique` i rozróżnienie dziury od asymptoty. Ogólne badanie funkcji nadal niedomknięte.
- G08: `limit-point` porównuje punktową wartość funkcji i granicę, ale nie uczy ciągów Heinego po dwóch stronach i klasyfikacji rzeczywistej funkcji przedziałami.

## Zakres P1C
1. `limit-radical-infinity` — 72 warianty (hard, advanced, expert). Wyrażenie `√(a²x²+b)+cx+d` z dodatnimi `a,b`; limit przy `+∞` lub `−∞`; dowód sprzężeniem `√(a²x²+b)−a|x|=b/(√(...)+a|x|)→0`. Wynik: `d` lub `±∞`, zależnie od znaku dominującego współczynnika i kierunku.
2. `limit-piecewise-heine` — 72 warianty (medium, hard, advanced). Osobne proste wzory dla `x<a`, `x=a`, `x>a`; analiza `xₙ=a−1/n`, `yₙ=a+1/n`; klasy ciągła / nieciągłość usuwalna / skok.
3. Razem **144 warianty**; po zatwierdzonym merge: **170 rodzin / 14 133 wariantów**. Trwałe dane postępu i istniejące moduły bez migracji.
4. Niezależne testy matematyczne dokładnych ułamków, wszystkie poziomy i warianty, PL/EN oraz Playwright na 375 px i 1280 px.
5. G04 i G08 nadal **częściowe**; brak deklaracji pełnego zamknięcia programu.

## Warunki dopuszczenia do merge
- [ ] Pełne CI Vitest PASS
- [ ] TypeScript i build PASS
- [ ] Pełne Playwright Chromium PASS
- [ ] Końcowa recenzja matematyczna i techniczna
- [ ] Osobna, wyraźna zgoda właściciela na Squash and merge
