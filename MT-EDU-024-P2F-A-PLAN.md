# MT-EDU-024 P2F-A — I01/I02, pakiet autorskich całek
Baza: main 6a39cf77e948a694dacf466fe60034f4d2663588, 182 rodzin / 14 997 wariantów, CI oraz Pages PASS.

## Zakres
- I01: integral-direct-product; (ax+b)(cx²+dx+e). Rozwinięcie przy użyciu dokładnych ułamków, całka wielomianu 3 stopnia i 4 współczynniki F(x), obowiązkowa stała +C. 24 warianty w każdym z poziomów hard, advanced, expert.
- I02: integral-table-arctan; całka z k/[1+(ax+b)²], a oraz k niezerowe, dowolne x rzeczywiste. Antypochodna (k/a) arctan(ax+b)+C; uwzględnienie ujemnego a. 24 warianty w każdym z poziomów hard, advanced, expert.
- Razem 2×72=144 warianty; docelowo 184 rodziny / 15 141 wariantów.
- Bez ogólnego parsera wyrażeń i bez nowych funkcji egzaminów. Nie deklarujemy pełnego pokrycia I01/I02.

## Kontrole
- [ ] Niezależny audyt wzorów i wszystkich 144 wariantów (dokładne współczynniki i różniczkowanie numeryczne).
- [ ] TypeScript/build i cały Vitest — PASS na HEAD.
- [ ] Pełny Playwright Chromium — PASS na HEAD (PL/EN, mobile i desktop, brak kolizji katalogu).
- [ ] Końcowa recenzja kodu.
- [ ] Wyraźna zgoda właściciela na Squash and merge. Bez automatycznego scalenia.
