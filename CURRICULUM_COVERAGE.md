# Mapa 64 kompetencji matematycznych — Math Tutor

To **robocza mapa tematów i kompetencji** potrzebnych do opanowania ośmiu działów matematyki, połączona z rzeczywistymi generatorami w repozytorium. `Pokryte` oznacza, że dany typ zadania jest zaimplementowany w opisanych granicach; nie stanowi obietnicy pokrycia wszystkich możliwych wariantów. `Częściowo` oznacza ograniczoną klasę przypadków. `Teoria` dotyczy umiejętności, której nie można rzetelnie ocenić wyłącznie pojedynczym wynikiem liczbowym. Pełne pokrycie wymaga weryfikacji każdego typu zadania, rozwiązania i testu.

ID w tabeli są prawdziwymi identyfikatorami rodzin. `—` oznacza brak generatora. MT-EDU-006A / PR #21 na main pokryło kontrolowane M08–M11. MT-EDU-006B dodaje M12–M14 i U05–U08 w granicach opisanych poniżej; pełne M05 pozostaje przyszłe; U03 obejmuje teraz kontrolowane układy 4×4. MT-EDU-007 P0 dodaje wybrane F02–F04/F07, P1 kontrolowane C05/G04/G06/G07, P2 D03/D04/D07, a częściowe P3 D08/D09. Pozostałe grupy planuje [ROADMAP.md](ROADMAP.md). Zadania są autorskie i dostępne w uniwersalnym katalogu.

| Kod | Umiejętność z indeksu | Status | Rodziny Math Tutor / granica pokrycia |
| --- | --- | --- | --- |
| M01 | Skalar, dodawanie, odejmowanie | pokryte | `matrix-scale`, `matrix-add`, `matrix-subtract` |
| M02 | Transpozycja | pokryte | `matrix-transpose` |
| M03 | Mnożenie i wykonalność | częściowo | `matrix-product`, `matrix-dimensions`, `matrix-compatibility`, `matrix-chained-dimensions`, `matrix-rectangular-evaluation`, `matrix-transpose-dimensions`; obliczenia prostokątne i wymiary wyrażeń z transpozycją do 3×3, bez ogólnych wymiarów |
| M04 | Działania złożone i potęgi | częściowo | `matrix-product`, `matrix-add`, `matrix-powers`, `matrix-composite-operations`, `matrix-rectangular-evaluation`, `matrix-transpose-dimensions`; nawiasy, transpozycja, ułamki i mnożenie prostokątne do 3×3; bez potęg ujemnych i dowolnych rozmiarów |
| M05 | Równanie macierzowe i układ dwóch macierzy | częściowo | `inverse-applications`, `inverse-right-applications`, `matrix-coupled-equations`, `matrix-ax-shift`, `matrix-axb`, `matrix-inverse-plus`, `matrix-bx-shift`, `matrix-ax-shift-three`, `matrix-axb-three`; AX=B, XA=B, dwa równania dla X i Y, AX=4X+B i AXB=C (PR #43), a w PR P1 także (A+4X)⁻¹=B i 3X+A=BX (wszystkie nowe rodziny 2×2); P0D dodaje AX=4X+B i AXB=C dla 3×3; nadal brak ogólnych rozmiarów oraz szerszych typów układów |
| M06 | Wyznacznik 2×2 | pokryte | `determinant-two` |
| M07 | Wyznacznik 3×3 | pokryte | `determinant-sarrus` |
| M08 | Laplace 4×4 z zerami | pokryte | `determinant-laplace-four` |
| M09 | 4×4 bez dogodnych zer, operacje wierszowe | częściowo | `determinant-row-operations`, `determinant-dense-four`, `determinant-strategy-four`, `determinant-gaussian-pivot-four`; pełny Laplace bez zer, wybrane operacje i kontrolowane redukcje 4×4; P0E1 rozszerza dynamiczny dobór pivota, zamiany wierszy i zerowe wyznaczniki; bez wszystkich dowolnych macierzy |
| M10 | Wyznacznik 5×5 | częściowo | `determinant-laplace-five`, `determinant-dense-five`, `determinant-strategy-five`, `determinant-gaussian-pivot-five`; rzadkie, gęste i kontrolowane redukcje 5×5, P0E1 dodaje dynamiczną eliminację i zerowe pivoty; nadal bez dowolnych swobodnych macierzy |
| M11 | Własności i wyznacznik zerowy | częściowo | `determinant-properties`, `determinant-zero-row`; zależność wierszy, zamiana, skalar, dodanie wielokrotności |
| M12 | Macierz odwrotna | częściowo | `inverse-two`, `inverse-three`, `inverse-existence`, `inverse-four-gauss-jordan`; P0F1 dodaje dokładne odwrotności i przypadki osobliwe 4×4 (Gauss–Jordan, sprawdzenie AA⁻¹=I), nadal bez ogólnych dowolnych rozmiarów i metod |
| M13 | Równanie z odwrotnością | częściowo | `inverse-four-ax-equation`, `inverse-applications`, `inverse-right-applications`, `matrix-ax-shift`, `matrix-axb`, `matrix-inverse-plus`, `matrix-bx-shift`, `matrix-ax-shift-three`, `matrix-axb-three`; AX=B → A⁻¹B, XA=B → BA⁻¹ (2×2/3×3) oraz (A−4I)X=B, AXB=C (PR #43), a w PR P1 także (A+4X)⁻¹=B i (B−3I)X=A (2×2); P0D dodaje dwa typy równań z obliczaniem odwrotności 3×3; P0F1 dodaje AX=B dla 4×4 (B: 4×2); nadal bez dowolnych rozmiarów i innych typów równań |
| M14 | Rząd macierzy | częściowo | `matrix-rank`, `capelli-matrices`, `matrix-rank-four-square`, `matrix-rank-four-rectangular`; wcześniejsze 2×3, 3×3, 3×4 oraz P0E2: 4×4 i 4×5, dokładna eliminacja Gaussa–Jordana, rzędy 0–4, wiersze zależne, ułamki i brakujące pivoty; bez macierzy o większej liczbie wierszy i pełnej dowolności wymiarów |
| U01 | Rozpoznanie układu Cramera | częściowo | `system-cramer-two`, `system-cramer-three`, `cramer-applicability`; rozpoznanie D≠0 i klasyfikacja przypadków D=0 na 2×2/3×3/4×4, nadal bez wszystkich struktur układów |
| U02 | Cramer 3 niewiadome | pokryte | `system-cramer-three`, `cramer-determinants-three`; pełne rozwiązanie i osobna kontrola D,D1–D3 |
| U03 | Cramer 4 niewiadome | częściowo | `cramer-four`, `cramer-determinants-four`, `cramer-four-singular-minors`; dokładne D,D1–D4 również przy D=0, osobne wpisywanie wyznaczników i klasyfikacja D=0 w kontrolowanych układach 4×4 |
| U04 | Łańcuch równości / jedna niewiadoma | częściowo | `system-substitution`, `system-chain-five`; nowy generator pięciu znaków równości pomiędzy sześcioma wyrażeniami z dwiema niewiadomymi, pytaniem o samo x lub y, wyjaśnieniem i kontrolą wszystkich równości. Bez dowolnych nieliniowych łańcuchów |
| U05 | Liczba rozwiązań z podanych rzędów | pokryte | `capelli-given-ranks`; poprawne relacje r(A), r([A|b]), n |
| U06 | Klasyfikacja przez obliczenie rzędów | częściowo | `capelli-matrices`, `gauss-classification`, `system-rectangular-3x2`, `system-rectangular-4x3`; klasyfikacja układów 3 równań / 2 niewiadomych i 4 / 3 na podstawie obliczanych rang (jedno, brak, wiele). Bez pełnej dowolności wymiarów |
| U07 | Gauss: jedno rozwiązanie | częściowo | `gauss-unique`; 3×3/4×4, zamiana wierszy i podstawienie wsteczne w kontrolowanych układach |
| U08 | Gauss: parametry i sprzeczność | częściowo | `gauss-classification`, `capelli-matrices`, `gauss-parameters-one`, `gauss-parameters-two`; poza klasyfikacją dodano pełną ocenę stałych i współczynników t1/t2 w rozwiązaniach 3×3/4×4 z 1–2 zmiennymi swobodnymi; P2 dodaje pełną ocenę parametryzacji 3×2/4×3/2×3 w trzech rodzinach `gauss-rectangular-3x2-parameters`, `gauss-rectangular-4x3-parameters`, `gauss-rectangular-2x3-parameters` (144 warianty); nadal brak dowolnych rozmiarów i dowolnego symbolicznego zapisu |
| C01 | Granica wielomianu i ilorazu | pokryte | `sequence-rational` |
| C02 | Pierwiastek w ilorazie | częściowo | `sequence-conjugate`, `sequence-radical-ratio`; także ilorazy pierwiastków z kwadratami i możliwością skrócenia wyrazów wiodących, bez wszystkich ogólnych radykałów |
| C03 | Różnica pierwiastków | pokryte | `sequence-conjugate` |
| C04 | Granice ciągów wykładniczych | częściowo | `sequence-geometric`, `sequence-exponential-ratio`; dodatnie różne podstawy, dominacja, równe podstawy i skracanie współczynników; nadal brak dowolnych ciągów wykładniczych |
| C05 | Postać Eulera 1^∞ | częściowo | `analysis-euler-sequence`, `sequence-euler-product`; przesunięte czynniki (1+a/(n+b))^(cn+d), w tym iloczyny, bez ogólnej teorii |
| C06 | Pojęcia ciągu, monotoniczność, ograniczoność | teoria | —; zadania z granic nie uczą całej teorii |
| F01 | Dziedzina: pierwiastek i ułamek | pokryte | `function-domain` |
| F02 | Dziedzina logarytmu | częściowo | `analysis-log-domain`; dodatni argument liniowy i ilorazowy, dodatkowy warunek pierwiastka/mianownika; nie dowolne złożenia |
| F03 | Moduł w dziedzinie | częściowo | `analysis-absolute`; pierwiastek z \|x−p\|−r, kontrolowane brzegi, bez ogólnych złożeń |
| F04 | Kilka warunków dziedziny | częściowo | `function-domain`, `analysis-log-domain`, `function-tangent-domain`, `function-mixed-domain`; przecięcia warunków pierwiastka i logarytmu, wyłączenia okresowe tg(ax+bπ) w kontrolowanych postaciach; bez wszystkich możliwych połączeń |
| F05 | Własności z wykresu | częściowo | `function-graph-domain-range`, `function-graph-zeros`, `function-graph-monotonicity`, `function-graph-extrema`, `function-graph-symmetry`: dziedzina, zbiór wartości, miejsca zerowe, monotoniczność odcinkowa, globalne ekstrema i symetria na kontrolowanych łamanych SVG. Wciąż bez odczytu dowolnych krzywych i wszystkich punktów nieciągłości |
| F06 | Parzystość, złożenie i odwrotność | częściowo | `function-composition`, `function-parity`, `function-affine-inverse`; parzystość wielomianów i funkcja odwrotna do liniowej; bez odwrotności ogólnych; odczyt symetrii wykresów uzupełnia `function-graph-symmetry` |
| F07 | Prawa exp/log, równania i nierówności | częściowo | `analysis-power-law`, `analysis-elementary-equation`, `analysis-log-inequality`; wybrane dokładne tożsamości i równania, bez ogólnych złożeń |
| G01 | Granica przez podstawienie | pokryte | `limit-point` |
| G02 | 0/0 przez skrócenie | pokryte | `limit-point` |
| G03 | Granice jednostronne i brak granicy | pokryte | `limit-point` |
| G04 | ±∞: stopnie i pierwiastki | częściowo | `limit-infinity`, `analysis-asymptote-horizontal`, `analysis-asymptote-oblique`; kontrolowane pierwiastki √(x²+1), nie ogólna klasa |
| G05 | Sprzężenie | pokryte | `limit-conjugate` |
| G06 | Granica potęgowa funkcji | częściowo | `analysis-euler-function`; kontrolowane postaci Eulera przy x→0 |
| G07 | Asymptoty | częściowo | `analysis-asymptote-vertical`, `analysis-asymptote-horizontal`, `analysis-asymptote-oblique`; także dziury i dwie strony nieskończoności, bez badania dowolnej funkcji |
| G08 | Ciągłość i granica Heinego | częściowo | `limit-point`; f(a) kontra granica, bez twierdzenia Heinego |
| D01 | Pochodna potęg po uproszczeniu | pokryte | `derivative-formula` |
| D02 | Iloczyn i iloraz | częściowo | `derivative-formula`, `derivative-rational-point`, `derivative-product-point`, `derivative-quotient-point`; pochodna iloczynu (czynnik liniowy × kwadratowy) i ilorazu dwóch funkcji liniowych w punkcie, bez parsera dowolnych pochodnych symbolicznych |
| D03 | Łańcuch i funkcje elementarne | częściowo | `derivative-formula`, `analysis-log-exp-derivative`, `derivative-trig-chain`, `derivative-trig-special-point`; wielomiany, ln(u), ln|u|, e^u, prosty iloczyn, pochodne sin/cos/tg i reguła łańcuchowa z argumentem liniowym (wzory i kontrolowane punkty); bez pełnych złożeń i ogólnych ilorazów |
| D04 | L’Hospital | częściowo | `analysis-lhospital`, `analysis-lhospital-infinity`; kontrolowane 0/0 i ∞/∞ jedno- i dwukrokowe dla wielomianów, ln i e^u, bez wszystkich postaci nieoznaczonych |
| D05 | Monotoniczność i ekstrema lokalne | częściowo | `derivative-monotonicity`, `derivative-extrema`; kontrolowane wielomiany |
| D06 | Brak pochodnej w punkcie krytycznym | częściowo | `derivative-absolute-one-sided`, `derivative-piecewise-point`: pochodne jednostronne funkcji z modułem, ciągłość i różniczkowalność prostych funkcji przedziałami, załamania i skok. Bez ogólnych wierzchołków, stycznych pionowych i szerszych klas funkcji |
| D07 | Wypukłość i przegięcia | częściowo | `analysis-concavity`; znak drugiej pochodnej, zero bez przegięcia i dwa przegięcia w kontrolowanych wielomianach |
| D08 | Pełne badanie funkcji | częściowo | `analysis-study-polynomial`, `analysis-study-rational`; dwie kontrolowane postacie, bez ogólnych funkcji |
| D09 | Szkic z tabeli | częściowo | `analysis-study-polynomial`, `analysis-study-rational`; przedziały znaków i zachowanie w rozwiązaniu, bez narysowanego wykresu |
| D10 | Ekstrema globalne | częściowo | `derivative-profit-maximum`; ograniczony model kwadratowy |
| I01 | Całka bezpośrednia po uproszczeniu | częściowo | `integral-direct`; wielomiany i sumy do stopnia 3, bez ogólnych przekształceń algebraicznych przed całkowaniem |
| I02 | Całka trygonometryczna i tablicowa | częściowo | `integral-table`; sin(ax+b), cos(ax+b), e^(ax+b), 1/(ax+b) z dziedziną, bez pełnej tablicy |
| I03 | Podstawienie | częściowo | `integral-substitution`; liniowe i kwadratowe u o kontrolowanej pochodnej oraz dodatkowy składnik liniowy |
| I04 | Całkowanie przez części | częściowo | `integral-parts`; x^m e^(ax), m=1–3, bez ogólnych iloczynów |
| I05 | Całka powracająca | częściowo | `integral-recurring`; e^(ax)(p sin bx+q cos bx), b>0, bez innych rodzin powracających |
| I06 | Całka oznaczona | częściowo | `integral-definite`; wielomiany i dokładne granice wymierne, bez niewłaściwych całek |
| I07 | Pole między krzywymi | częściowo | `integral-area-between`; kontrolowana parabola i prosta, rozcięcie w przecięciach; nie obejmuje ogólnych par krzywych |
| I08 | Długość łuku | częściowo | `integral-arc-length`; łuk krzywej potęgowej na zadanych granicach; inne klasy wymagają rozszerzenia |
| W01 | Pochodne cząstkowe I/II | częściowo | `multivar-partial-point`, `multivar-gradient-point`; kontrolowane wielomiany kwadratowe, pochodne I/II i gradient, bez ogólnych funkcji 2D |
| W02 | Ekstrema 2D | częściowo | `multivar-stationary-point`, `multivar-hessian-classify`; wybrane funkcje kwadratowe, punkt stacjonarny i test Hessiana (w tym D=0), bez ogólnych warunków brzegowych i funkcji 2D |
| W03 | Granica i ciągłość 2D | teoria | —; wymaga ujęcia pojęciowego i zadań |

Po dodaniu nowych rodzin należy aktualizować wyłącznie wiersze, których umiejętność rzeczywiście obejmują. Mapa kompetencji służy ocenie ogólnego zakresu matematyki, bez przypisywania go jednej uczelni. Nie publikujemy zewnętrznych arkuszy, materiałów dydaktycznych ani danych studentów.
