# MT-EDU-023 P2E-A — poszerzenie całek I03/I04/I06

## Punkt wyjścia
- PR #79 zatwierdzony i scalony do `main` (commit `cf755e4b11ca6030bc91848aa2f82c060a0532a4`), **178 rodzin i 14 709 wariantów**.
- CI i GitHub Pages dla #79 trzeba sprawdzić osobno — nie zakładać ich powodzenia przed faktycznym wynikiem.
- I01–I08 obecne na mapie 64 kompetencji, ale każda kompetencja całkowania oznaczona jako `częściowo`.
- Najbliższa duża luka: całki oznaczone **inną metodą niż bezpośrednie całkowanie wielomianu**, w szczególności zmiana granic przy podstawieniu oraz poprawna różnica wartości F(b)−F(a) po całkowaniu przez części.

## Zakres implementacji
1. `integral-substitution-definite` — `∫_L^U k(2x+b)(x²+bx+c)^n dx`, n dodatnie, k niezerowe, wymierne k,b,c,L,U. Zapis `u=x²+bx+c`, `du=(2x+b)dx` i **przeliczenie obu granic**. Monotoniczność u na całym przedziale nie jest potrzebna. Wynik `k/(n+1)[u(U)^(n+1)−u(L)^(n+1)]`.
2. `integral-parts-definite` — `∫_L^U kx(x+b)^n dx`; `u=x`, `dv=k(x+b)^n dx`, `v=k(x+b)^(n+1)/(n+1)`. Wynik z pierwotnej `F=k[x(x+b)^(n+1)/(n+1)−(x+b)^(n+2)/((n+1)(n+2))]` poprzez `F(U)−F(L)`. Niezależna weryfikacja przez zmianę y=x+b i bezpośrednie całkowanie `y^(n+1)−b y^n`.
3. Obydwie rodziny mają poziomy hard/advanced/expert, 24 zadania na poziom, **łącznie +144 warianty**. Po ewentualnym scaleniu: **180 rodzin / 14 853 wariantów**.
4. Pełne kroki PL/EN; poprawna, błędna i niepoprawna odpowiedź; testy ułamków dokładnych, niezależna kontrola pochodnej F'(x) i numeryczna kontrola całki na gęstej siatce oraz Playwright dla telefonów/desktop.

## Granice tego pakietu
- Nie wprowadzamy dowolnych funkcji symbolicznych, całek niewłaściwych z osobliwością wewnętrzną, metody rozkładu na ułamki proste ani innych pól/długości łuków. Kolejny pakiet **P2E-B** powinien poszerzyć I07/I08 (pola i długości łuków).
- I03/I04/I06 po tym pakiecie nadal pozostają częściowe, zgodnie z ograniczonym zakresem generatorów.
- Nie zmieniamy diagnostyki, historii postępu, trybu egzaminu ani zasad nauki aplikacji.

## Bramki jakości i zgody
- [ ] Pełne Vitest PASS i niezależna recenzja rachunków.
- [ ] TypeScript/build PASS.
- [ ] Pełne Playwright PASS w PL/EN i na 375/1280 px.
- [ ] Recenzja techniczna i matematyczna aktualnego HEAD.
- [ ] Osobna wyraźna zgoda właściciela na Squash and merge — brak automatycznego scalenia.
