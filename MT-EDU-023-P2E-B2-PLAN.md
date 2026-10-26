# MT-EDU-023 P2E-B2 — długość łuku krzywej parametrycznej

Baza: **zależna gałąź B1** (PR #81), a nie main. Nie scalać B2 przed B1; po scaleniu B1 docelowo ustawić B2 na main.

- Jedna nowa rodzina `integral-arc-parametric`, 72 warianty na poziomach hard/advanced/expert.
- Krzywa x(t)=k(t³/3−t)+h, y(t)=kt²+q, k>0, t∈[L,U].
- Pochodne: x′=k(t²−1), y′=2kt, a szybkość √(x′²+y′²)=k(t²+1)>0. Długość = k[(U³−L³)/3+(U−L)].
- Własność nie wymaga monotoniczności x(t); wyniki dokładne; rozwiązania PL/EN. Testy weryfikują niezależnie prędkość i numeryczne przybliżenia całki.
- Przy docelowych obu PR: 182 rodziny i 14 997 wariantów; I08 nadal częściowe.

## Bramki
- [ ] Vitest, build i Playwright PASS na aktualnym HEAD
- [ ] Recenzja matematyczna i techniczna
- [ ] Osobna zgoda właściciela na Squash and merge (dopiero po scaleniu #81)

Walidacja CI: workflow repo jest uruchamiany tylko dla PR do main. Podczas testów tego zestawu target PR #82 można tymczasowo ustawić na main, a po walidacji przywrócić do gałęzi PR #81; PR #82 nie zostanie scalony przed #81.

## CI po nieukończonym przebiegu
- Weryfikacja początkowa na aktualnym kodzie: Vitest i build TypeScript przeszły; run [#40320760008](https://github.com/eluyz/math-tutor-app/actions/runs/40320760008) zatrzymał się na instalacji Chromium i nie osiągnął Playwright w czasie diagnostyki.
- Ten objaw nie oznacza błędu matematycznego ani pozytywnego wyniku E2E. Wykonujemy niezależny nowy przebieg pełnego CI na tym samym kodzie, zmieniając wyłącznie notatkę diagnostyczną; testy i kod generatora pozostają bez zmian.
- Bez sukcesu nowego CI status pozostaje Draft. Po walidacji przywrócić bazę PR #82 do gałęzi PR #81.
