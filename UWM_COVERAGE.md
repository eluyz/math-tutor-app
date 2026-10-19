# Mapa 64 kompetencji — ekonomia UWM a Math Tutor

To **wstępna mapa tematów**, oparta na indeksie M01–W03 z [Issue #20](https://github.com/eluyz/math-tutor-app/issues/20) i na faktycznych generatorach w repozytorium. Nie mieliśmy dostępu do 43 prywatnych PDF-ów (221 stron), oryginalnych poleceń ani kluczy odpowiedzi. `Pokryte` oznacza opanowanie typu zadania opisanego w Issue, **nie** potwierdzenie zgodności z każdym arkuszem. `Częściowo` oznacza węższy przypadek; `teoria` to temat, którego nie da się uczciwie utożsamić z samym ćwiczeniem rachunkowym. Zgodność z konkretnymi podpunktami i formą zaliczenia pozostaje **do weryfikacji** na podstawie prywatnych źródeł. Nie określamy kolejności wejściówek.

ID w tabeli są prawdziwymi identyfikatorami rodzin. `—` oznacza brak generatora. MT-EDU-006A / PR #21 na main pokryło kontrolowane M08–M11. MT-EDU-006B dodaje M12–M14 i U05–U08 w granicach opisanych poniżej; pełne M05 pozostaje przyszłe; U03 obejmuje teraz kontrolowane układy 4×4. MT-EDU-007 P0 dodaje wybrane F02–F04/F07, P1 kontrolowane C05/G04/G06/G07, a P2 D03/D04/D07. Pozostałe grupy planuje [ROADMAP.md](ROADMAP.md). Zadania są autorskie i użyteczne także poza UWM.

| Kod | Umiejętność z indeksu | Status | Rodziny Math Tutor / granica pokrycia |
| --- | --- | --- | --- |
| M01 | Skalar, dodawanie, odejmowanie | pokryte | `matrix-scale`, `matrix-add`, `matrix-subtract` |
| M02 | Transpozycja | pokryte | `matrix-transpose` |
| M03 | Mnożenie i wykonalność | częściowo | `matrix-product`, `matrix-dimensions`; bez ogólnego testu wykonalności |
| M04 | Działania złożone i potęgi | częściowo | `matrix-product`, `matrix-add`; bez dowolnych potęg |
| M05 | Równanie macierzowe i układ dwóch macierzy | częściowo | `inverse-applications`, `inverse-right-applications`; AX=B i XA=B, bez układu dwóch równań |
| M06 | Wyznacznik 2×2 | pokryte | `determinant-two` |
| M07 | Wyznacznik 3×3 | pokryte | `determinant-sarrus` |
| M08 | Laplace 4×4 z zerami | pokryte | `determinant-laplace-four` |
| M09 | 4×4 bez dogodnych zer, operacje wierszowe | częściowo | `determinant-row-operations`; wybrane kontrolowane struktury |
| M10 | Wyznacznik 5×5 | częściowo | `determinant-laplace-five`; struktury z zerami/blokami, nie dowolna gęsta macierz |
| M11 | Własności i wyznacznik zerowy | częściowo | `determinant-properties`, `determinant-zero-row`; zależność wierszy, zamiana, skalar, dodanie wielokrotności |
| M12 | Macierz odwrotna | częściowo | `inverse-two`, `inverse-three`, `inverse-existence`; 2×2/3×3, także osobliwe, bez ogólnej 4×4 |
| M13 | Równanie z odwrotnością | częściowo | `inverse-applications`, `inverse-right-applications`; AX=B → A⁻¹B i XA=B → BA⁻¹, tylko 2×2/3×3 |
| M14 | Rząd macierzy | częściowo | `matrix-rank`, `capelli-matrices`; 2×3, 3×3, 3×4 z eliminacją, bez dowolnej 4×4 |
| U01 | Rozpoznanie układu Cramera | częściowo | `system-cramer-two`, `system-cramer-three`; warunek D≠0 wyjaśniony, brak osobnej klasyfikacji |
| U02 | Cramer 3 niewiadome | pokryte | `system-cramer-three` |
| U03 | Cramer 4 niewiadome | częściowo | `cramer-four`; dokładne D,D1–D4 i klasyfikacja D=0 w kontrolowanych układach 4×4 |
| U04 | Łańcuch równości / jedna niewiadoma | częściowo | `system-substitution`; bez dedykowanego łańcucha |
| U05 | Liczba rozwiązań z podanych rzędów | pokryte | `capelli-given-ranks`; poprawne relacje r(A), r([A|b]), n |
| U06 | Klasyfikacja przez obliczenie rzędów | częściowo | `capelli-matrices`, `gauss-classification`; jawne 3×3/3×4/4×4, kontrolowane struktury |
| U07 | Gauss: jedno rozwiązanie | częściowo | `gauss-unique`; 3×3/4×4, zamiana wierszy i podstawienie wsteczne w kontrolowanych układach |
| U08 | Gauss: parametry i sprzeczność | częściowo | `gauss-classification`, `capelli-matrices`; konkretne wiersze sprzeczne i demonstracja parametrów, formularz ocenia wyłącznie klasę |
| C01 | Granica wielomianu i ilorazu | pokryte | `sequence-rational` |
| C02 | Pierwiastek w ilorazie | częściowo | `sequence-conjugate`; tylko wybrane postaci |
| C03 | Różnica pierwiastków | pokryte | `sequence-conjugate` |
| C04 | Granice ciągów wykładniczych | częściowo | `sequence-geometric`; bez ogólnych wykładniczych |
| C05 | Postać Eulera 1^∞ | częściowo | `analysis-euler-sequence`; wybrane dodatnie podstawy 1+t i wymierne wykładniki, bez ogólnej teorii |
| C06 | Pojęcia ciągu, monotoniczność, ograniczoność | teoria | —; zadania z granic nie uczą całej teorii |
| F01 | Dziedzina: pierwiastek i ułamek | pokryte | `function-domain` |
| F02 | Dziedzina logarytmu | częściowo | `analysis-log-domain`; dodatni argument liniowy i ilorazowy, dodatkowy warunek pierwiastka/mianownika; nie dowolne złożenia |
| F03 | Moduł w dziedzinie | częściowo | `analysis-absolute`; pierwiastek z \|x−p\|−r, kontrolowane brzegi, bez ogólnych złożeń |
| F04 | Kilka warunków dziedziny | częściowo | `function-domain`, `analysis-log-domain`; przecięcia dla pierwiastka, ilorazu i logarytmu w kontrolowanych postaciach |
| F05 | Własności z wykresu | brak | —; brak wykresów do odczytu |
| F06 | Parzystość, złożenie i odwrotność | częściowo | `function-composition`; bez parzystości/odwrotności |
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
| D02 | Iloczyn i iloraz | częściowo | `derivative-formula`, `derivative-rational-point`; iloraz tylko w punkcie |
| D03 | Łańcuch i funkcje elementarne | częściowo | `derivative-formula`, `analysis-log-exp-derivative`; wielomiany, ln(u), ln|u|, e^u i prosty iloczyn, bez trygonometrii |
| D04 | L’Hospital | częściowo | `analysis-lhospital`; kontrolowane 0/0 jedno- i dwukrokowe dla wielomianów i e^u, bez wszystkich postaci nieoznaczonych |
| D05 | Monotoniczność i ekstrema lokalne | częściowo | `derivative-monotonicity`, `derivative-extrema`; kontrolowane wielomiany |
| D06 | Brak pochodnej w punkcie krytycznym | brak | — |
| D07 | Wypukłość i przegięcia | częściowo | `analysis-concavity`; znak drugiej pochodnej, zero bez przegięcia i dwa przegięcia w kontrolowanych wielomianach |
| D08 | Pełne badanie funkcji | brak | — |
| D09 | Szkic z tabeli | brak | — |
| D10 | Ekstrema globalne | częściowo | `derivative-profit-maximum`; ograniczony model kwadratowy |
| I01 | Całka bezpośrednia po uproszczeniu | brak | — |
| I02 | Całka trygonometryczna i tablicowa | brak | — |
| I03 | Podstawienie | brak | — |
| I04 | Całkowanie przez części | brak | — |
| I05 | Całka powracająca | brak | — |
| I06 | Całka oznaczona | brak | — |
| I07 | Pole między krzywymi | brak | — |
| I08 | Długość łuku | brak | — |
| W01 | Pochodne cząstkowe I/II | brak | — |
| W02 | Ekstrema 2D | brak | — |
| W03 | Granica i ciągłość 2D | teoria | —; wymaga ujęcia pojęciowego i zadań |

Po dodaniu nowych rodzin należy aktualizować wyłącznie wiersze, których umiejętność rzeczywiście obejmują. Dokładne porównanie do 43 PDF-ów i ewentualnych zmian programu jest osobnym, prywatnym audytem; oryginalne materiały ani dane studentów nie trafiają do repozytorium.
