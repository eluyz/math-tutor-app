# Math Tutor — sylabus: audyt pokrycia v2 (64 kompetencje)

**Data:** 2026-11-01 · **Wersja bazowa `main`:** `410c484af47f2ce76d6c2ab2d25de2792128aff8` (owner-approved PR #147; [main CI #41240044320](https://github.com/eluyz/math-tutor-app/actions/runs/41240044320) i [Pages #41241290137](https://github.com/eluyz/math-tutor-app/actions/runs/41241290137) completed SUCCESS przy tym samym SHA). **Katalog:** 222 rodziny / 17 877 wariantów. PR #149 to **osobna, niescalona poprawka F05**.

## Cel i granice dowodów

To jest **nowa, 64-wierszowa kolejka akceptacji**, scalająca aktualną mapę `CURRICULUM_COVERAGE.md`, historyczny `SYLLABUS_ACCEPTANCE.md` i `SYLLABUS_AUDIT_2026-10-28.md` (oraz potwierdzony release #147). Historyczny audyt źródeł obejmował **43 prywatne pliki PDF / 221 stron** w 8 działach. **Nie wykonano ponownie w tej rewizji weryfikacji wszystkich 221 stron ani niezależnego źródłowego 64/64 testu**; nie należy podawać tego dokumentu jako zakończonego audytu matematycznego ani jako certyfikatu 100% pokrycia.

**Podstawowa różnica wobec starszych raportów:** `pokryte` jest **wąskim stanem generatora**, a nie statusem oryginalnego przykładu. `częściowo` nie znaczy, że metoda jest niezaimplementowana. **Żaden wiersz nie staje się automatycznie SOURCE_PASS** na podstawie CI, rodzin/variant counts lub dokumentacji. Status indywidualnego świadectwa w tej macierzy to **WYMAGA AKCEPTACJI** dla wszystkich wierszy, chyba że osobny przypięty raport z niezależnym oraclem udowodni coś mocniejszego.

**Źródła:** [mapa 64](../CURRICULUM_COVERAGE.md) · [źródłowa macierz 64](../SYLLABUS_ACCEPTANCE.md) · [audyt 28.10](../SYLLABUS_AUDIT_2026-10-28.md) · [F05 prywatne świadki](F05_SOURCE_WITNESS_ACCEPTANCE.md) · [nadrzędne Issue #108](https://github.com/eluyz/math-tutor-app/issues/108). Oznaczenia Pxx są nieidentyfikującymi odnośnikami do prywatnych materiałów, bez publikowania oryginalnych treści/kluczy.

## Wskaźniki startowe (nie mylić z ukończeniem sylabusa)

- `64/64` kompetencje są zmapowane do istniejących metod/katalogu.
- `14/64` oznaczono **pokryte** w określonym zakresie matematycznym; `50/64` **częściowo**; to jest **opis generatorów, nie procent materiału egzaminacyjnego**.
- `0/6` oryginalnych pełnych wykresów F05 jest SOURCE_PASS (wiele syntetycznych metod i sześć ocenianych pól już istnieje).
- `#106`: niezależny audyt odpowiedzi i dydaktyki **wstrzymany**, nie zwiększać liczby przebadanych na podstawie tej kolejki.
- `#104` Własne zadanie nadal **deferred**; #108 otwarte. Nie scalać PR bez odrębnej zgody właściciela na finalny HEAD.

## Status całych działów (pokrycie generatora)

| Dział | Oznaczone pokryte | Częściowo | Akceptacja źródeł |
| --- | ---: | ---: | --- |
| Macierze i wyznaczniki (M) | 4/14 | 10/14 | **Nie zakończona** |
| Układy równań (U) | 2/8 | 6/8 | **Nie zakończona** |
| Granice ciągów (C) | 2/6 | 4/6 | **Nie zakończona** |
| Funkcje (F) | 1/7 | 6/7 | **Nie zakończona** |
| Granice funkcji (G) | 4/8 | 4/8 | **Nie zakończona** |
| Pochodne (D) | 1/10 | 9/10 | **Nie zakończona** |
| Całki (I) | 0/8 | 8/8 | **Nie zakończona** |
| Funkcje dwóch zmiennych (W) | 0/3 | 3/3 | **Nie zakończona** |

## Przed wdrażaniem nowych generatorów: zamykaj potwierdzenia źródłowe

1. **P0 (szybkie zwycięstwa):** dla 14 obecnie `pokryte` wybierz 1–2 oryginalne zadania z oznaczeń Pxx, sprawdź odpowiedź inną metodą niż generator, rozwiązanie PL/EN, błędne/puste odpowiedzi i mobile. To mogą być 14 szybkie, faktyczne akceptacje bez nowego kodu.
2. **P0 (już wdrożone dawne luki):** M06 (pierwiastki 2×2, PR #115), M14 (większe rzędy, #112), D09 (papierowy szkic, #121), I07 (dy, #120; dodatkowo obszar przy przecięciu) i F05 (rysunki a–f; otwarte końce PR #149) — **porównaj ze źródłem zamiast tworzyć kolejne 72 warianty**.
3. **P1 (treści dla egzaminu):** W01/W02 i D05/D07/D08 oraz I03/I04/I06 — zbadaj źródłowe konkretne formy i dopiero brak topo/metody kieruj do małego implementacyjnego PR. W01/W02 muszą objąć pochodne mieszane z funkcjami elementarnymi i przypadki z nierozstrzygającym Hessianem.
4. **P1 (pozostałe częściowe):** porównaj jeden oryginalny format na wiersz; klasyfikuj `SOURCE_PASS`, `NEEDS_FIXES`, `METHOD_GAP`, `LECTURE_ONLY` albo `NOT_VERIFIED`.
5. **P2 teoria:** C06, F07, G08, W03 — ustal, co jest na egzaminie pisemnym, bez wymyślania ćwiczeń dla wykładowych pojęć.
6. **QA:** przywróć niezależny audyt #106 dopiero przy zatwierdzonej infrastrukturze i z osobnym zakresem; CI aplikacji nie sprawdza samo siebie w roli niezależnego matematycznego oracla.

## Macierz operacyjna 64/64

**Status w kolumnie „Mapa”** = zakres generatora, **nie** źródłowe zaliczenie. Każdy wiersz wymaga osobnego dowodu akceptacji. Wiersze poniżej to `Pxx` / najbliższa ścieżka, a nie opublikowana treść zadania.

| ID | Kompetencja | Mapa | Prywatny trop źródłowy | Kolejka | Następny rozstrzygający krok |
| --- | --- | --- | --- | --- | --- |
| M01 | Skalar, dodawanie, odejmowanie | pokryte | P03/1a,1j,2a | P0 • potwierdzenie źródła | Porównać ≥1 oryginalne zadanie, niezależny wynik i komplet wskazówek |
| M02 | Transpozycja | pokryte | P03/1b,1e–f,3 | P0 • potwierdzenie źródła | Porównać ≥1 oryginalne zadanie, niezależny wynik i komplet wskazówek |
| M03 | Mnożenie i wykonalność | częściowo | P03/1c–m,2d–f | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| M04 | Działania złożone i potęgi | częściowo | P03/2b–h,3 | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| M05 | Równanie macierzowe i układ dwóch macierzy | częściowo | P03/4–5 | P1 • równania macierzowe | Sprawdzić kolejność mnożenia przez odwrotność i złożone równania z dwóch macierzy |
| M06 | Wyznacznik 2×2 | częściowo | P09/1a–b | P0 • szybka akceptacja | Sprawdzić oryginalny wyznacznik 2×2 z pierwiastkami z wdrożonym `determinant-radical-two` (#115) |
| M07 | Wyznacznik 3×3 | pokryte | P09/1c–f,1n | P0 • potwierdzenie źródła | Porównać ≥1 oryginalne zadanie, niezależny wynik i komplet wskazówek |
| M08 | Laplace 4×4 z zerami | pokryte | P09/1h,1l,1t | P0 • potwierdzenie źródła | Porównać ≥1 oryginalne zadanie, niezależny wynik i komplet wskazówek |
| M09 | 4×4 bez dogodnych zer, operacje wierszowe | częściowo | P09/1g–j,1o–s | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| M10 | Wyznacznik 5×5 | częściowo | P09/1k,1m | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| M11 | Własności i wyznacznik zerowy | częściowo | P09/1q,1u | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| M12 | Macierz odwrotna | częściowo | P05/1a–h | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| M13 | Równanie z odwrotnością | częściowo | P05/2a–e | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| M14 | Rząd macierzy | częściowo | P07/1a–m | P0 • szybka akceptacja | Sprawdzić źródłowe macierze 5×4/6×3 po #112 (rząd, kroki redukcji, ułamki) |
| U01 | Rozpoznanie układu Cramera | częściowo | P12/1a–h | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| U02 | Cramer 3 niewiadome | pokryte | P12/1a–c,1f–g | P0 • potwierdzenie źródła | Porównać ≥1 oryginalne zadanie, niezależny wynik i komplet wskazówek |
| U03 | Cramer 4 niewiadome | częściowo | P12/1e,5s | P1 • Cramer 4×4 | Porównać D i D1–D4 z oryginalnymi przypadkami, w tym D=0 |
| U04 | Łańcuch równości / jedna niewiadoma | częściowo | P12/2 | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| U05 | Liczba rozwiązań z podanych rzędów | pokryte | P12/3a–d | P0 • potwierdzenie źródła | Porównać ≥1 oryginalne zadanie, niezależny wynik i komplet wskazówek |
| U06 | Klasyfikacja przez obliczenie rzędów | częściowo | P12/4a–h | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| U07 | Gauss: jedno rozwiązanie | częściowo | P12/5b,e,k,m | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| U08 | Gauss: parametry i sprzeczność | częściowo | P12/5a,c–d,f–t | P1 • parametry układów | Sprawdzić przypadki z 0/1/2 parametrami, sprzeczność i poprawny opis rozwiązania |
| C01 | Granica wielomianu i ilorazu | pokryte | P15/1a–l | P0 • potwierdzenie źródła | Porównać ≥1 oryginalne zadanie, niezależny wynik i komplet wskazówek |
| C02 | Pierwiastek w ilorazie | częściowo | P15/1b,1h | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| C03 | Różnica pierwiastków | pokryte | P15/1m–t | P0 • potwierdzenie źródła | Porównać ≥1 oryginalne zadanie, niezależny wynik i komplet wskazówek |
| C04 | Granice ciągów wykładniczych | częściowo | P15/1v–y | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| C05 | Postać Eulera 1^∞ | częściowo | P15/2a–g | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| C06 | Pojęcia ciągu, monotoniczność, ograniczoność | częściowo | P13/2–8 (lecture) | P2 • zakres teorii | Sprawdzić, czy teoria ciągów wymaga osobnych zadań egzaminacyjnych; nie wymyślać brakujących typów |
| F01 | Dziedzina: pierwiastek i ułamek | pokryte | P17/1a,b,h,k | P0 • potwierdzenie źródła | Porównać ≥1 oryginalne zadanie, niezależny wynik i komplet wskazówek |
| F02 | Dziedzina logarytmu | częściowo | P17/1c,i,l,m | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| F03 | Moduł w dziedzinie | częściowo | P17/1f,g,n | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| F04 | Kilka warunków dziedziny | częściowo | P17/1e,j,l,n | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| F05 | Własności z wykresu | częściowo | P21/a–f: all six source scan/key pairs visually checked directly (private files, no reproductions) | P0 • źródłowe wykresy | 6 prywatnych P21/a–f × 6 ocenianych pól: nadal 0/6 SOURCE_PASS; PR #149 dotyczy otwartych końców przy asymptotach |
| F06 | Parzystość, złożenie i odwrotność | częściowo | P18/9,13 (lecture exercises) | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| F07 | Prawa exp/log, równania i nierówności | częściowo | P19/2–10 (lecture) | P2 • zakres teorii | Potwierdzić zakres rachunków exp/log na egzaminie; wskazania z wykładu nie oznaczają osobnego zadania |
| G01 | Granica przez podstawienie | pokryte | P26/1l | P0 • potwierdzenie źródła | Porównać ≥1 oryginalne zadanie, niezależny wynik i komplet wskazówek |
| G02 | 0/0 przez skrócenie | pokryte | P26/1a,b,d,k,w–z | P0 • potwierdzenie źródła | Porównać ≥1 oryginalne zadanie, niezależny wynik i komplet wskazówek |
| G03 | Granice jednostronne i brak granicy | pokryte | P26/1c,e,j,m,v,y | P0 • potwierdzenie źródła | Porównać ≥1 oryginalne zadanie, niezależny wynik i komplet wskazówek |
| G04 | ±∞: stopnie i pierwiastki | częściowo | P26/1f–i,p–u | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| G05 | Sprzężenie | pokryte | P26/2a–d,g,h,j | P0 • potwierdzenie źródła | Porównać ≥1 oryginalne zadanie, niezależny wynik i komplet wskazówek |
| G06 | Granica potęgowa funkcji | częściowo | P26/3a–d | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| G07 | Asymptoty | częściowo | P24/1–9 | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| G08 | Ciągłość i granica Heinego | częściowo | P22/2–12,21–23 (lecture) | P2 • zakres teorii | Potwierdzić wymagania dot. Heinego i ciągłości; uwzględnić testujące ciągi z `limit-piecewise-heine` |
| D01 | Pochodna potęg po uproszczeniu | pokryte | P29/1g,h,i,s | P0 • potwierdzenie źródła | Porównać ≥1 oryginalne zadanie, niezależny wynik i komplet wskazówek |
| D02 | Iloczyn i iloraz | częściowo | P29/1a–f,j–m,5,7 | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| D03 | Łańcuch i funkcje elementarne | częściowo | P29/1n,t–z,1–12 | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| D04 | L’Hospital | częściowo | P34/1a–j | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| D05 | Monotoniczność i ekstrema lokalne | częściowo | P32/1a–o | P1 • znaki f′ | Porównać źródłowe tabele monotoniczności i ekstrema z odpowiedzią i rozwiązaniem generatora |
| D06 | Brak pochodnej w punkcie krytycznym | częściowo | P32/1o | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| D07 | Wypukłość i przegięcia | częściowo | P32/2a–g | P1 • znaki f″ | Sprawdzić źródłowe wypukłość/przegięcia i punkty z nieokreśloną pochodną |
| D08 | Pełne badanie funkcji | częściowo | P32/3a–h | P1 • pełne badanie | Odwzorować jedno zadanie P32/3 z dziedziną, f′/f″, asymptotą, punktami przegięcia i szkicem |
| D09 | Szkic z tabeli | częściowo | P32/4a–b (sketch) | P0 • papierowy szkic | Sprawdzić P32/4a–b w wdrożonym trybie rysunku na kartce (#121); bez deklarowania automatycznej oceny szkicu |
| D10 | Ekstrema globalne | częściowo | P32/5a–f,6 | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| I01 | Całka bezpośrednia po uproszczeniu | częściowo | P36/1a–d,n–p,z | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| I02 | Całka trygonometryczna i tablicowa | częściowo | P36/1m,q,x,y | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| I03 | Podstawienie | częściowo | P36/1e–i,v | P1 • podstawienie | Zestawić oryginalne całki z podstawieniem z pochodną funkcji pierwotnej, w tym całki oznaczone |
| I04 | Całkowanie przez części | częściowo | P36/1j–l,r–t | P1 • przez części | Porównać przypadki dwukrotnego całkowania i trygonometrię z przykładem źródłowym |
| I05 | Całka powracająca | częściowo | P36/1u,w | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| I06 | Całka oznaczona | częściowo | P38/1a–n | P1 • oznaczone/niewłaściwe | Sprawdzić granice, osobliwości wewnątrz przedziału i nie mylić wartości głównej z całką niewłaściwą |
| I07 | Pole między krzywymi | częściowo | P38/2a–j incl. 2i | P0 • obszar dy/dx | Sprawdzić oryginalne P38/2i (po dy, #120) i P38/2g (zmiana kolejności krzywych); brak metody tylko jeśli dowód |
| I08 | Długość łuku | częściowo | P38/3a–c | P1 • sprawdzenie próbki | Sprawdzić ≥1 oryginalną formę na istniejącym wariancie; tylko potwierdzona różnica daje nowe zadanie programistyczne |
| W01 | Pochodne cząstkowe I/II | częściowo | P43/1a–j | P1 • pochodne 2D | Porównać oryginalne P43/1a–j: pochodne mieszane, trig/log/pierwiastki, stopień zgodności generatorów |
| W02 | Ekstrema 2D | częściowo | P43/2a–h | P1 • ekstrema 2D | Porównać P43/2a–h: równania stacjonarności i klasyfikację Hessianem; odróżnić degenerate/test inconclusive |
| W03 | Granica i ciągłość 2D | częściowo | P41/2–5 (lecture) | P2 • zakres teorii | Ustalić, czy granice/ciągłość 2D są odrębnie egzaminowane; zachować metody po drogach i współrzędnych biegunowych |

## Warunek zmiany statusu dla jednego wiersza

- Wskazać źródło Pxx i **dokładny istniejący `family_id` + `variant` + `difficulty` + zatwierdzony SHA** (albo udowodnioną lukę formy).
- Niezależnie policzyć poprawny wynik i krytyczne kroki, nie wywodząc odpowiedzi z silnika, który testujemy.
- Ocenianie kompletne: prawidłowa, błędna i pusta odpowiedź; podpowiedzi i rozwiązanie w **PL + EN**; 375px + desktop bez obcięcia matematyki.
- Dla szkicu/teorii określić uczciwe ograniczenia metody oceny (np. rysunek na kartce i samokontrola, nie automatyczne ocenianie grafiki).
- Zarejestrować **SOURCE_PASS** z dowodem, **NEEDS_FIXES** z konkretną pomyłką, albo **NOT_VERIFIED**. W przeciwnym razie nigdy nie oznaczać jako zamknięty.
- Po rozwiązaniu udowodnionej luki dopiero PR, testy, recenzja, zgoda na dokładny HEAD, CI+Pages identycznego merge SHA.

## Proponowane kryterium zamknięcia Issue #108

- **Każda realnie egzaminowana forma** ma źródłowo zaakceptowany generator albo jawnie zatwierdzoną alternatywną ścieżkę (papierowy szkic / wykładowa teoria).
- 64 wiersze rozstrzygnięte z dowodem; nie wymagamy sztucznie obsługi wszystkich symbolicznych wariantów algebry poza materiałami.
- Nie ma nierozwiązanych błędów matematycznych blokujących źródłowe rodziny; niezależna kontrola dydaktyki #106 obejmuje próbki wysokiego ryzyka.
- Ostatnie main CI i Pages są PASS na jednym SHA. Właściciel **osobno** potwierdza ukończenie sylabusa. Dopiero potem przejście do rozszerzeń zadań i #104.

**Rejestr jest punktem STARTOWYM procesu akceptacji, nie końcowym wynikiem audytu 43 PDF.**
