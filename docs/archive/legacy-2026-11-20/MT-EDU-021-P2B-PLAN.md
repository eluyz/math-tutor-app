# MT-EDU-021 P2B — całki niewłaściwe

## Punkt wyjścia
- Po zaakceptowanym Squash and merge #75 baza `main` = `bb281eeb22d6e3b9a403ccfed058630bfe3007f5` (172 rodziny / 14 277 wariantów).
- Kontrola CI na main i GitHub Pages po #75 jest osobnym warunkiem wdrożenia; nie wyciągać wniosków o publikacji bez sprawdzenia.
- Zmiany P2B wdrażane są wyłącznie w odrębnym PR i wymagają osobnej zgody na scalenie.

## Audyt rzeczywistej luki I06
- Dotąd `integral-definite` generuje całki oznaczone wielomianów po domkniętym, ograniczonym przedziale o dokładnych granicach wymiernych, ale **bez granic niewłaściwych**.
- Dodajemy dwie nowe, różne klasy osobliwości: nieskończony przedział oraz niecałkowalna lub całkowalna osobliwość na górnym końcu.
- `integral-improper-infinity`: 72 warianty hard/advanced/expert, całka ∫₀^∞ k/(x+a)^p dx przy a>0 i p=1,2,3,4. P=1 → znakowana rozbieżność logarytmiczna, p>1 → dokładna liczba k/((p−1)a^(p−1)).
- `integral-improper-endpoint`: 72 warianty hard/advanced/expert, całka ∫₀^b k/(b−x)^p dx przy b=u² i u>0. Dla p=1/2 zbieżna z dokładną wartością 2ku, dla p=1 lub p=2 rozbieżna ze znakiem k.
- Łącznie 144 warianty; po ewentualnym zaakceptowanym merge 174 rodziny / 14 421 wariantów.
- Wszystkie obliczenia dokładne na Rational, rozwiązania po polsku i angielsku, walidacja odpowiedzi skończonych i ±∞; Playwright mobilny/stacjonarny.
- Oznaczenie I06 pozostaje **częściowe** — bez całek niewłaściwych w dowolnym punkcie wewnętrznym, porównawczych kryteriów całkowych czy ogólnego parsera funkcji.

## Bramka jakości i zatwierdzenia
- [ ] Pełne Vitest PASS (w tym niezależne matematyczne testy wszystkich wariantów).
- [ ] TypeScript i build PASS.
- [ ] Pełne Playwright PASS.
- [ ] Recenzja matematyczna oraz techniczna.
- [ ] Osobna, wyraźna zgoda użytkownika na Squash and merge P2B.
