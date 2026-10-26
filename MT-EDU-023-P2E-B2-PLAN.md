# MT-EDU-023 P2E-B2 — długość łuku krzywej parametrycznej

Baza: zatwierdzony Squash and merge PR #81 do `main` (commit `909af053ba2a89e54609631c03569b7afc337a72`), 181 rodzin / 14 925 wariantów. PR #82 został przeniesiony na bieżący `main` jako pojedynczy commit wyłącznie z pakietem B2. PR #82 nadal **nie jest scalony**.

- Jedna nowa rodzina `integral-arc-parametric`, 72 warianty na poziomach hard/advanced/expert.
- Krzywa x(t)=k(t³/3−t)+h, y(t)=kt²+q, k>0, t∈[L,U].
- Pochodne: x′=k(t²−1), y′=2kt, a szybkość √(x′²+y′²)=k(t²+1)>0. Długość = k[(U³−L³)/3+(U−L)].
- Własność nie wymaga monotoniczności x(t); wyniki dokładne; rozwiązania PL/EN. Testy weryfikują niezależnie prędkość i numeryczne przybliżenia całki.
- Przy docelowych obu PR: 182 rodziny i 14 997 wariantów; I08 nadal częściowe.

## Bramki
- [ ] Vitest, build i Playwright PASS na aktualnym HEAD
- [ ] Recenzja matematyczna i techniczna
- [ ] Osobna zgoda właściciela na Squash and merge PR #82 (PR #81 już scalony)

Walidacja CI: workflow repo uruchamia się dla PR do `main`. Po zakończeniu PR #81 baza PR #82 jest już na stałe ustawiona na `main`, bez pośredniej gałęzi. Każdy nowy HEAD PR #82 wymaga własnego, zielonego CI i recenzji przed decyzją właściciela.

## CI po nieukończonym przebiegu
- Weryfikacja początkowa na aktualnym kodzie: Vitest i build TypeScript przeszły; run [#40320760008](https://github.com/eluyz/math-tutor-app/actions/runs/40320760008) zatrzymał się na instalacji Chromium i nie osiągnął Playwright w czasie diagnostyki.
- Ten objaw nie oznacza błędu matematycznego ani pozytywnego wyniku E2E. Wykonujemy niezależny nowy przebieg pełnego CI na tym samym kodzie, zmieniając wyłącznie notatkę diagnostyczną; testy i kod generatora pozostają bez zmian.
- Historyczne nieukończone przebiegi nie są dowodem PASS. Po uporządkowaniu historii do `main` obowiązuje zielone CI aktualnego HEAD; do jego potwierdzenia PR pozostaje Draft.
