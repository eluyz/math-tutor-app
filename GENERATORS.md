# Generatory zadań — katalog bieżący i rozwój historyczny

Bieżący katalog UI i sesji: **153 rodziny**, **12909 instancji**. `allTemplates` i `taskPool` obejmują 51 rodzin po MT-EDU-004, 12 z MT-EDU-005, 4 rodziny wyznaczników MT-EDU-006A, 11 rodzin MT-EDU-006B, 16 rodzin P0–P3 MT-EDU-007 oraz 6 rodzin całek MT-EDU-008. 109 rodzin wspiera advanced, a 101 expert; dostępność niższych poziomów jest jawna w tabelach. Sekcje MT-003A/MT-EDU-001/MT-EDU-003 poniżej opisują fundament historyczny, a nowe rodziny mają osobne tabele. Dotychczasowe `templates` i `pool` zachowują 15 rodzin skalarnych w pięciu kategoriach do niezależnych regresji. `createGenerator(seed).next(category, difficulty, templateId?)` wybiera wyłącznie niewidzianą treść z odpowiedniego zakresu. Po wyczerpaniu usuwa klucze tej puli z pamięci, zwraca `repeated: true` i zaczyna nowy cykl. Nie ma losowania w pętli do skutku. Stan znika po odświeżeniu.

Łącznie rodziny L4: **109**, L5: **101**.

## MT-EDU-019 P0D — równania macierzowe 3×3

- `matrix-ax-shift-three`: `AX=4X+B`, `A-4I` odwracalna, 24 warianty na poziomie średnim, trudnym i zaawansowanym (72).
- `matrix-axb-three`: `AXB=C`, obie macierze mnożące odwracalne, 24 warianty na trudnym, zaawansowanym i ekspercie (72).
- Dokładne wyniki 3×3, eliminacja Gaussa–Jordana, zachowanie stron mnożenia, podstawienie do oryginalnego równania, PL/EN i walidacja błędnych oraz nieważnych odpowiedzi. Zachowane oryginalne 2×2.

## Pierwotne rodziny

| Kategoria | Rodziny |
| --- | --- |
| Kolejność działań | `order-add-product`, `order-subtract-product`, `order-parentheses` |
| Liczby dodatnie i ujemne | `signed-add`, `signed-subtract-negative`, `signed-product` |
| Ułamki | `fraction-add`, `fraction-subtract`, `fraction-product` |
| Algebra | `algebra-substitute`, `algebra-like-terms`, `algebra-distribute` |
| Równania | `equation-add`, `equation-subtract`, `equation-fraction` |

Pierwotny `Template` ma zakresy `parameterSets` i czyste `create(parameters)`. `makeInstance` waliduje parametry. `pool` tworzy skończone kombinacje i deduplikuje treści. Zachowano dokładne ułamki, kroki pomocnicze i niskopewne hipotezy z MT-002; `possible()` odrzuca kolizję błędnej odpowiedzi z poprawnym wynikiem. Wyższe poziomy dodają m.in. znaki ujemne, różne mianowniki i kolejne czynniki.

`src/generators.test.ts` nadal audytuje 647 różnych treści tych 15 rodzin (652 instancje po zsumowaniu osobnych pul kategorii i poziomów; część treści powtarza się między poziomami), ich odpowiedzi, kroki i reguły. Dawna próba z ośmiu seedów dawała 557 treści; aktualne losowanie obejmuje także EDU i ma osobną kontrolę unikalności. Piętnaście stałych przykładów w `src/locales/pl.ts` pozostaje katalogiem referencyjnym, nie źródłem losowania w UI.

## MT-EDU-001 — 20 nowych rodzin

Cztery nowe rodziny powtórkowe dodano do istniejących kategorii algebry/równań. Trzy nowe kategorie są w dziale „Matematyka na studia”. Każda rodzina ma trzy poziomy. Materiały są autorskie i niezależne od programu konkretnej uczelni.

| Rodzina | Umiejętność i odpowiedź |
| --- | --- |
| `algebra-negative-brackets` | Minus/mnożnik przed nawiasem; współczynnik przy x i wyraz wolny |
| `algebra-monomials` | Iloczyn współczynników, suma wykładników tej samej podstawy; dwa pola |
| `algebra-polynomial-product` | Cztery iloczyny i łączenie wyrazów; współczynniki przy x², x i stała |
| `equation-fraction-balance` | Odjęcie ułamka i mnożenie obu stron; dokładne x |
| `quadratic-square-sum` | (ax+b)²; trzy współczynniki, także podwójny iloczyn |
| `quadratic-square-difference` | (ax−b)²; ujemny środkowy współczynnik, dodatnia stała |
| `quadratic-difference-squares` | Rozpoznanie rozkładu u²−v²; kontrolowany wybór czynników |
| `quadratic-discriminant` | Δ=b²−4ac ze znakami; liczba |
| `quadratic-delta-sign` | Trzy znaki delty i liczba pierwiastków; kontrolowany wybór |
| `quadratic-roots` | Wybór dwóch/jednego podwójnego/braku pierwiastków; dokładne wartości w dowolnej kolejności |
| `matrix-dimensions` | Liczba wierszy i kolumn w tej kolejności |
| `matrix-entry` | Odczyt aᵢⱼ; indeksy od 1 |
| `matrix-add` | Pełna suma macierzy zgodnych wymiarami |
| `matrix-subtract` | Pełna różnica, także odjęcie ujemnych elementów |
| `matrix-scale` | Skalar mnoży każde pole, także zera i ułamki |
| `matrix-transpose` | Pełne Aᵀ, w tym 2×3 ↔ 3×2 |
| `matrix-product` | Pełne AB: wiersz razy kolumna; porównanie z BA |
| `determinant-two` | ad−bc: wyniki dodatnie, ujemne i zero |
| `determinant-sarrus` | Sześć iloczynów 3×3 i odjęcie całej drugiej sumy |
| `determinant-zero-row` | Świadomy wybór własności zerowego wiersza |

### Dokładność, granice i wydajność

`EducationTemplate.create(variant, difficulty)` otrzymuje jeden indeks 0–23. Pola macierzy są pochodnymi tego indeksu i małych wartości, a nie iloczynem dziewięciu niezależnych list. Jedna rodzina ma maksymalnie 24 kandydatów na poziom; 20 rodzin to najwyżej 1440 kandydatów na wszystkich poziomach (łącznie z pierwotnymi pulami 2092 instancje w historycznym stanie trzech poziomów; obecne uzupełnienia i L4/L5 opisano niżej). Testy wymagają co najmniej 10 różnych treści na rodzinę/poziom. Pule są buforowane; `makeEducationInstance` odrzuca indeksy spoza zakresu.

`contentKey` nowych zadań obejmuje pytanie i dane pokazanych macierzy, więc stałe polecenie „Oblicz A + B” z innymi macierzami jest nową treścią. `id` obejmuje rodzinę, poziom i indeks. To pozwala zachować pamięć treści oraz indywidualne oceny sesji.

Łatwe zadania macierzowe mają małe liczby całkowite; wyższe poziomy wprowadzają wymiary prostokątne i dokładne ułamki. Siatka jest najwyżej 3×3. Wyznaczniki są wyłącznie 2×2 i 3×3; Sarrus nie jest uogólniany na większe macierze. Przypadki Δ≥0 konstruujemy z wymiernych pierwiastków i całkowitych współczynników. Dla Δ<0 nie żądamy pozornych przybliżeń rzeczywistych.

`TypedExercise` ma `AnswerSpec`: scalar, list, matrix, choice albo roots (kontrolowany wybór przypadku i lista wartości). Formularz roots nie ujawnia oczekiwanej liczby pierwiastków. Współczynniki są uporządkowane; pierwiastki porównywane jako wielozbiór. Niekompletne lub źle zapisane pola dają invalid; kompletna zła wartość daje incorrect. Wspólne statusy zachowują pierwsze próby i sugestie MT-003B.1. Nowe rodziny nie wymyślają przyczyn błędów: domyślnie mają puste reguły i neutralną diagnozę.

### Audyt i dodawanie treści

`src/education/catalog.test.ts` niezależnie przelicza wszystkie warianty i poziomy: współczynniki, tożsamości wielomianowe, podstawienia do równań, deltę, dokładne pierwiastki i każdą komórkę działań macierzowych. Wyznaczniki 3×3 są sprawdzane przez rekurencyjny Laplace, a nie ponowne użycie Sarrusa. Testy obejmują znaki i zero, nieprzemienność, błędne i niekompletne odpowiedzi, odwrotną kolejność pierwiastków, skończone pule i powtórki. `matrices.test.ts` osobno testuje operacje i niewykonalne wymiary; `answers.test.ts` wspólne statusy oraz sesje. Playwright sprawdza rzeczywiste interakcje na telefonie i komputerze.

Nową rodzinę edukacyjną dodaj do odpowiedniego modułu `education/`, wybierz precyzyjny typ odpowiedzi, zdefiniuj skończony zakres wariantu i własne wyjaśnienia krokowe. Dodaj niezależny rachunek w audycie oraz test UI, jeśli zmienia się sposób odpowiedzi. Nie zwiększaj liczby niezależnych parametrów pól macierzy. Stare skalarne rodziny można nadal rozszerzać przez `Template`, ale każda zmiana wymaga odpowiedniego niezależnego audytu.

Historyczny zakres MT-EDU-001 nie obejmował Viète'a, macierzy odwrotnej, Cramera ani analizy matematycznej. Późniejsze sekcje opisują wdrożone Cramera i analizę; MT-004A dodało historię, a MT-EDU-003 pełne katalogi PL/EN. Nadal nie używamy `eval`, zaokrągleń ani dowolnego parsera odpowiedzi symbolicznych.

## MT-EDU-003 — pięć poziomów i dwie wersje językowe

Kanoniczne ID, kolejność, opisy oraz etykiety PL/EN są w `src/difficulty.ts`: easy, medium, hard, advanced, expert. `allTemplates[].supportedDifficulties` deklaruje rzeczywiste wsparcie; `availableDifficulties(category)` wyznacza zakres sesji i rekomendacji. Niedostępna rodzina nie jest zastępowana poziomem hard. UI pokazuje wyjaśnienie i dostępną alternatywę. Nowe poziomy wykorzystują `advanced/schema.ts`, `catalog.ts` i `engine.ts`, oddzielone od React.

Historyczny rdzeń MT-EDU-003 — Instancje: **3501** (historyczne **2092**, uzupełnienia **17**, L4/L5 **1392**).
Rodziny L4: **29**, L5: **29**. Nowe identyfikatory rodzin: **0**. Każda z ośmiu kategorii wspiera oba wyższe poziomy. Każda wspierana kombinacja rodzina × poziom ma co najmniej 10 różnych treści. Nowe L4/L5 mają dokładnie 24 warianty na kombinację. Język nie mnoży liczby wariantów matematycznych.

Pierwotne siatki parametrów `templates/parameterSets` i 2092 historyczne pytania, wyniki oraz formaty odpowiedzi zachowano. `education/supplements.ts` dodaje tylko 17 jawnych zestawów, bez rozszerzania iloczynów kartezjańskich: po jednym dla trzech poziomów każdej z trzech rodzin liczb ze znakami (9), dwa dla łatwego odejmowania ułamków i sześć dla podstawiania (4 easy, 1 medium, 1 hard). Uzupełniają 13 historycznych kombinacji mających wcześniej 6–9 treści. `pool` pozostaje audytem starych siatek; `taskPool` dodaje uzupełnienia i nowe poziomy. Zmienia to celowo wielkość niektórych pul oraz sekwencję losowania, nie treść istniejących przykładów. Skalarne `id` obejmuje teraz poziom, usuwając pięć dawnych kolizji między poziomami; nie ma trwałego stanu wymagającego migracji. Identyfikatory są niezmienne podczas zmiany języka. DOM używa wyłącznie numeru uruchomienia, bez parametrów przechowywanych w technicznym ID.

### Mapa 35 historycznych rodzin MT-EDU-003

`1–5` oznacza wszystkie poziomy; `1–3` oznacza świadome ograniczenie. Wszystkie wyższe poziomy korzystają ze znaków i dokładnych ułamków. Poniższe symbole opisują wzorce, nie jeden stały przykład.

| Rodzina | Poziomy | L3 — zachowane | L4 — Zaawansowany | L5 — Ekspert |
| --- | --- | --- | --- | --- |
| order-add-product | 1–5 | dodawanie i iloczyn | suma z iloczynem zawierającym iloraz w nawiasie | zagnieżdżone ilorazy, nawiasy, iloczyn i końcowa różnica |
| order-subtract-product | 1–5 | odejmowanie iloczynu | odejmowanie iloczynu różnicy podzielonego przez liczbę | cały licznik złożony z różnicy i iloczynu podzielony przez sumę |
| order-parentheses | 1–5 | jeden nawias i mnożenie | iloczyn dwóch nawiasów i dzielenie | ilorazy wewnątrz dwóch czynników i ich iloczyn |
| signed-add | 1–3 | różne znaki i wartości bezwzględne | — pojedyncza czynność | — złożenia są w signed-product |
| signed-subtract-negative | 1–3 | minus ujemnej liczby | — pojedyncza zmiana działania | — złożenia są w signed-product |
| signed-product | 1–5 | kilka czynników ze znakami | ujemny ułamek razy różnica z ilorazem | dodatkowe dzielenie przez sumę; plan znaków i kolejności |
| fraction-add | 1–5 | wspólny mianownik dwóch ułamków | suma dwóch ilorazów ułamków | cała suma dzielona przez kolejną różnicę |
| fraction-subtract | 1–5 | odejmowanie dwóch ułamków | różnica dwóch ilorazów ułamków | mianownik będący sumą oraz odejmowany iloczyn z nawiasem |
| fraction-product | 1–5 | iloczyn dwóch ułamków | iloczyn sumy i różnicy ułamków | cały iloczyn dzielony przez kolejną różnicę |
| algebra-substitute | 1–5 | x²+kx dla ujemnego x | podstawienie ułamka do kwadratu nawiasu i iloczynu | kwadrat wyrażenia liniowego oraz drugi iloczyn z nawiasem |
| algebra-like-terms | 1–5 | łączenie współczynników i podstawienie | dwa różne nawiasy przed podstawieniem | trzeci nawias, racjonalne współczynniki i podstawienie |
| algebra-distribute | 1–5 | mnożnik przed jednym nawiasem | różnica dwóch rozwinięć; dwa współczynniki | iloczyn dwóch nawiasów minus wyrażenie liniowe; trzy współczynniki |
| equation-add | 1–5 | ax+b=c | nawias po lewej i x po obu stronach | różne dodatkowe nawiasy i ułamki po obu stronach |
| equation-subtract | 1–5 | ax−b=c | odejmowany nawias i x po obu stronach | dodatkowe różne wyrażenia liniowe i przekształcenia dwustronne |
| equation-fraction | 1–5 | x/a+b=c | przesunięta niewiadoma w liczniku i x po obu stronach | dodatkowe ilorazy nawiasów po obu stronach |
| algebra-negative-brackets | 1–5 | ujemny mnożnik przed nawiasem | różnica dwóch nawiasów ze znakami | ujemny iloczyn dwóch nawiasów minus trzeci nawias |
| algebra-monomials | 1–5 | mnożenie współczynników i potęg | mnożenie i dzielenie jednomianów dla x≠0 | uproszczenie ilorazu, następnie łączenie jednomianów podobnych |
| algebra-polynomial-product | 1–5 | dwa nawiasy i redukcja | dwa ogólne nawiasy i dodatkowy wyraz liniowy | różnica dwóch iloczynów nawiasów |
| equation-fraction-balance | 1–5 | odjęcie ułamka i mnożenie | ułamkowe wyrażenia liniowe po obu stronach | dodatkowe różne ułamkowe nawiasy, zebranie x i stałych |
| quadratic-square-sum | 1–5 | (ax+b)² | kwadrat minus wyrażenie liniowe | dwa kwadraty minus iloczyn dwóch nawiasów |
| quadratic-square-difference | 1–5 | (ax−b)² | kwadrat różnicy minus wyrażenie liniowe | dwa kwadraty z różnymi znakami minus iloczyn nawiasów |
| quadratic-difference-squares | 1–5 | rozpoznanie wzoru | równanie (2x+a)²=b²; liczba i wartości pierwiastków | równanie (2x+a)²=(x+b)²; uproszczenie i dwa czynniki liniowe |
| quadratic-discriminant | 1–5 | delta uporządkowanego równania | rozwinięcie iloczynu i redukcja przed deltą | różne kwadraty po obu stronach; dopiero potem a,b,c i delta |
| quadratic-delta-sign | 1–3 | liczba pierwiastków ze znaku delty | — klasyfikacja pozostaje elementarna | — rozumowanie w quadratic-roots/discriminant |
| quadratic-roots | 1–5 | gotowe ax²+bx+c=0 | uproszczenie iloczynu i obliczenie pierwiastków | kwadraty po obu stronach; wszystkie trzy znaki delty i dokładne wartości |
| matrix-dimensions | 1–3 | odczyt wierszy i kolumn | — sama czynność nie ma uczciwego L4 | — wymiary są kontrolowane w złożonych działaniach |
| matrix-entry | 1–3 | odczyt aᵢⱼ | — sam odczyt nie jest złożonym zadaniem | — indeksowanie jest częścią każdego działania L4/L5 |
| matrix-add | 1–5 | A+B | 2A+B | (3/2)(A+Bᵀ)−C |
| matrix-subtract | 1–5 | A−B | Aᵀ−B | (A−B)C |
| matrix-scale | 1–5 | kA | (−3/2)(A+B) | (−3/2)AB−C |
| matrix-transpose | 1–5 | Aᵀ, także prostokątna | (AB)ᵀ | (AB−C)ᵀ |
| matrix-product | 1–5 | AB, wiersz × kolumna | AB−C | (AB)ᵀ−(3/2)C |
| determinant-two | 1–5 | ad−bc | det(2A−B) | det(AB−Cᵀ) dla 2×2 |
| determinant-sarrus | 1–5 | sześć iloczynów | det(2A−B) dla 3×3 | det(AB−Cᵀ) dla 3×3 |
| determinant-zero-row | 1–3 | własność zerowego wiersza | — nie wydłużamy sztucznie odczytu własności | — przypadki zerowe występują w pełnych działaniach |

Nie dodano nowych nazw rodzin: dotychczasowe rodziny uzyskały jawne wieloetapowe wzorce. Zmiana rodzaju odpowiedzi na L4/L5 jest celowa, np. równanie z różnicy kwadratów ma `roots`, a rozwinięcie złożonego nawiasu `list`. Formularz wynika z konkretnego `AnswerSpec`, nie z nazwy rodziny.

### Rachunek, tłumaczenia i audyt

`MathProblem` obejmuje drzewa dokładnych działań, wielomiany, równania i wyrażenia macierzowe. Rozwiązanie realizuje porządek drzewa: zagnieżdżone działania, współczynniki według potęg, przenoszenie stron, delta, pierwiastki, każde pole każdej operacji macierzowej, sześć podpisanych iloczynów Sarrusa. Nie dzieli istniejącego opisu na zdania ani nie wykonuje kodu z treści. Dzielniki są niezerowe; rzeczywiste pierwiastki są dokładnie wymierne. Macierze nie przekraczają 3×3.

`advanced/catalog.test.ts` sprawdza wszystkie nowe warianty arytmetyką niezależną od operatorów produkcyjnych. Wielomiany weryfikuje przez podstawienia, a współczynniki równania odzyskuje z wartości w 0, 1 i −1. Sprawdza pierwiastki podstawieniem oraz sumą i iloczynem; macierze osobnymi pętlami, wyznaczniki rekurencyjnym Laplace'em. Osobno weryfikuje każdy rachunek pośredni, wynik finalny, odpowiedzi poprawne/błędne/niekompletne, wymiary, unikalność i deklaracje dostępności. `supplements.test.ts` kontroluje minimum 10, globalną unikalność ID i sumy dokumentacji. Dawne audyty nadal niezależnie przeliczają pierwotne siatki.

`locales/catalog.ts` wybiera prezentację PL/EN dla tego samego modelu. `locales/lessons-en.ts` zawiera autorskie parametryczne polecenia, wskazówki i opisy starych kroków; `locales/math.ts` oba katalogi komunikatów nowego silnika. Dawne polskie fabryki pozostają źródłem zgodnych treści PL. Język nie wpływa na generator, parametry, `id`, `contentKey`, wartości ani rachunki. `locales/lessons.test.ts` audytuje oba języki dla wszystkich instancji, zgodność rachunków i wyników, pełność kluczy i brak polskich komunikatów w EN. Zmiana metod starego rozwiązania wymaga jednoczesnego przeglądu odpowiadającej mu angielskiej sceny; test kontroluje również zgodność liczby etapów.

## MT-EDU-004 — katalog P1–P3

MT-EDU-004: **1728** nowych instancji; łącznie **5229**. Rdzeń MT-EDU-003 zachowuje wszystkie 3501 instancji i niezmienione treści/wyniki. Każda deklarowana kombinacja poniżej ma 24 odrębne warianty.

Nowe rodziny: **16**. Pary rodzina/poziom: **72**. W opublikowanym MT-EDU-004 było łącznie 43 rodzin L4 i 43 L5.

### P1: układy równań — 504 instancje

| Rodzina | Poziomy | Umiejętność |
| --- | --- | --- |
| system-substitution | easy, medium, hard, advanced, expert | Izolowanie, podstawienie, dokładne ułamki; L4 rozwijanie nawiasów, L5 pomocnicze u=x+y, v=x−y i powrót do x,y |
| system-elimination | easy, medium, hard, advanced, expert | Eliminacja z niezerowym elementem głównym i pełnymi operacjami na wierszach; L4 nawiasy, L5 zmiana niewiadomych |
| system-classification | easy, medium, hard | Rząd, sprzeczność 0=c, zmienne swobodne i trzy klasy rozwiązań, w tym zerowy wiersz |
| system-cramer-two | easy, medium, hard, advanced, expert | D, D_x, D_y, warunek D≠0; L4 nawiasy, L5 zmiana niewiadomych |
| system-cramer-three | hard, advanced, expert | Dokładne cztery wyznaczniki 3×3; L4 ułamki/nawiasy; L5 u=x+y, v=y+z, w=z i odwrócenie zmiany |

Typ `system` wymaga wyboru klasyfikacji i wszystkich uporządkowanych niewiadomych przy dokładnie jednym rozwiązaniu, także w rodzinie klasyfikacyjnej. Puste lub nieprawidłowe współrzędne pozostają błędem formatu. Przy układzie sprzecznym lub nieoznaczonym pola x/y nie są pokazywane. Układy oznaczone wymagają wszystkich uporządkowanych wartości. Cramer przy D=0 przechodzi do klasyfikacji eliminacją, bez dzielenia. Każde rozwiązanie jest sprawdzane w oryginalnych równaniach. Niezależny audyt korzysta z rozwinięcia Laplace'a, własnej arytmetyki ułamków i podstawienia wszystkich niewiadomych; nie korzysta z produkcyjnego solvera. Zapis historii obejmuje nowe kanoniczne ID rodzin bez zmiany schematu.

### P2: funkcje — 888 instancji

| Rodzina | Poziomy | Umiejętność |
| --- | --- | --- |
| function-value | easy, medium, hard, advanced, expert | Wartości; L3 ułamki i niezerowy mianownik; L4 złożenie; L5 różnica złożeń z argumentami przeciwnymi |
| function-domain | easy, medium, hard, advanced, expert | Wielomiany, bieguny, pierwiastki; L3–L5 przecięcie warunków i ścisła dodatniość pierwiastka w mianowniku |
| function-zeros | easy, medium, hard, advanced, expert | Zera liniowe/kwadratowe, wszystkie znaki delty; L3–L5 wykluczenia dziedziny, złożenia i różnica liczników |
| function-linear | easy, medium, hard, advanced, expert | Rekonstrukcja z dwóch punktów; L4 h=f+g, L5 h=f∘g i odzyskanie współczynników f |
| function-monotonicity | easy, medium, hard | Znak nachylenia, również stała; upraszczanie złożeń i różnic funkcji liniowych |
| function-vertex | easy, medium, hard, advanced, expert | Wierzchołek i oś; postać kanoniczna, ogólna, ułamki, złożenie, różnica przesuniętych kwadratów |
| function-range | easy, medium, hard, advanced, expert | Dokładny zbiór wartości po obliczeniu wierzchołka, zwrot ramion i osiągany koniec |
| function-composition | medium, hard, advanced, expert | Dwie funkcje liniowe, kwadratowa z liniową, dwie kwadratowe, f∘g−g∘f |

Każda z 37 par ma 24 warianty. Przedziały są normalizowanymi zbiorami z wymiernymi końcami, flagami domknięcia i nieskończonością; formularz oferuje kontrolowane, semantyczne odpowiedzi. Nie parsuje dowolnych zapisów symbolicznych. Zera mają neutralny wybór liczby 0/1/2 bez ujawnienia wyniku i wymagają dokładnych wartości; pojedyncze zero nie jest błędnie nazywane podwójnym. Wielomiany złożeń mają opisane pola współczynników, łącznie z zerami. Audyt niezależnie rozwija wielomiany przez splot i potęgi, sprawdza kompletność zer i wszystkie obliczenia. Audyt dziedziny sprawdza każdy punkt graniczny i każdą komórkę stałego znaku czynników. Wykresy pozostają opcjonalnym zakresem przyszłym.

### P3: granice ciągów — 336 instancji

| Rodzina | Poziomy | Umiejętność |
| --- | --- | --- |
| sequence-rational | easy, medium, hard, advanced, expert | Stopnie i współczynniki wiodące, zero i oba znaki nieskończoności; L4 redukcja różnicy rosnących wyrażeń; L5 dwa skracające się składniki i mnożenie przez n |
| sequence-geometric | easy, medium, hard, advanced, expert | Wszystkie przypadki q, dominacja, oscylacje; L4 równe moduły i skracanie; L5 ilorazy z odmiennymi podciągami |
| sequence-conjugate | medium, hard, advanced, expert | Sprzężenie, √(n²)=n dla n≥1; L4 n(√(n²+b)−n), L5 usunięcie również składnika liniowego i drugi rząd |

14 par × 24 warianty. Typ `limit` rozróżnia dokładną liczbę, +∞, −∞ i brak granicy. Nieprawidłowy zapis liczby jest błędem formatu, a nie błędną oceną matematyczną. Ciągi geometryczne są analizowane symbolicznie po n=2k+p i połączeniu równych podstaw. Oscylacja ani postać ∞−∞ nie jest automatycznie wynikiem nieskończonym. Audyt używa niezależnego splotu wielomianów, osobnego grupowania dodatnich modułów i dokładnych tożsamości sprzężenia; nie zgaduje granic z kilku wyrazów.

MT-EDU-004 zostało scalone i opublikowane w PR #17. Powyższy historyczny katalog obejmuje P1–P3; P0 zmieniło brudnopis bez dodawania instancji. Dawne P4/P5 realizuje MT-EDU-005 poniżej; P6 pozostaje przyszłym zakresem ROADMAP.

## MT-EDU-005 — P0/P1: granice funkcji i pochodne

MT-EDU-005: **1152** nowych instancji; łącznie **6381**.

| Rodzina | Poziomy | Umiejętność |
| --- | --- | --- |
| limit-point | easy, medium, hard, advanced, expert | Ciągłość; 0/0 i skracanie w przebitym otoczeniu; krotności i znaki jednostronne; redukcja różnicy i złożeń; f(a) a granica |
| limit-infinity | easy, medium, hard, advanced, expert | Stopnie i znaki przy obu kierunkach nieskończoności, redukcja dominujących składników przed porównaniem |
| limit-conjugate | medium, hard, advanced, expert | Sprzężenie liniowego i kwadratowego pierwiastka; odjęcie wyrazu liniowego; dwa pierwiastki z redukcją drugiego rzędu |

14 par po 24 odrębne warianty. Pierwiastki mają dodatni podpierwiastkowy w otoczeniu punktu dzięki dodatniemu wyrazowi stałemu s². Granice drugiego rzędu wynikają z dokładnych tożsamości różnicy kwadratów. Audyt używa niezależnego rozwinięcia dwumianowego wokół punktu, a nie produkcyjnego dzielenia syntetycznego; sprawdza rachunki pośrednie i oba języki. P0 obejmuje 336 instancji. P1 jest opisany poniżej.

### P1 — pochodne: 816 instancji

| Rodzina | Poziomy | Umiejętność |
| --- | --- | --- |
| derivative-formula | easy, medium, hard, advanced, expert | Stałe i potęgowa; suma; iloczyn; łańcuch; różnica złożenia i iloczynu |
| derivative-point | easy, medium, hard, advanced, expert | Te same reguły i dokładne podstawienie do pochodnej |
| derivative-rational-point | medium, hard, advanced, expert | Dziedzina i reguła ilorazu; iloczyn/łańcuch w liczniku, niezerowy mianownik |
| derivative-tangent | medium, hard, advanced, expert | f(a), f′(a), y=mx+b; weryfikacja obu warunków stycznej |
| derivative-stationary | hard, advanced, expert | Kwadratowa, złożenie, sześcienna z dwoma ekstremami albo stacjonarnym punktem bez ekstremum |
| derivative-extrema | hard, advanced, expert | Klasyfikacja minimum/maksimum i punktu stacjonarnego bez ekstremum; kolejność rosnących x |
| derivative-monotonicity | hard, advanced, expert | Dokładne zbiory f′>0 i f′<0; otwarte końce i podwójne zero pochodnej |
| derivative-economics | medium, hard, advanced, expert | Koszt/przychód krańcowy; zysk, iloczyn ceny i produkcji; złożony koszt i różnica pochodnych |
| derivative-profit-maximum | hard, advanced, expert | Maksimum wklęsłego zysku na 0≤q≤Q; wnętrze, zero i górny limit produkcji |

34 par po 24 warianty. Współczynniki podaje się od najwyższej opisanej potęgi do stałej (pole 1); zera są wymagane. Styczna ma pola m,b, maksimum q*,P(q*). q jest ciągłą wielkością rzeczywistą; pochodne krańcowe mają jednostkę pieniężną na jednostkę produkcji i nie są dokładnym przyrostem dla dodatkowej całej jednostki. Audyt niezależnie rozwija wielomiany przez splot i dwumian, kontroluje każdy pokazany wzór pochodnej oraz rachunek, znak w każdej komórce między zerami, warunki stycznej i certyfikat wklęsłości z uwzględnieniem końców przedziału.

Niezmienność wszystkich 5229 poprzednich instancji, ich poziomów, ID, contentKey i pełnych lekcji PL/EN kontroluje fixture z opublikowanego main afcb248 w history-regression.test.ts. Nie wolno aktualizować jego skrótów po zmianie nowego generatora. Po MT-EDU-005 katalog miał 63 rodziny, 6381 instancji, 13 kategorii; 48 nowych par ×24=1152.

## MT-EDU-006A — wyznaczniki 4×4 i 5×5

MT-EDU-006A: **264** nowych instancji; łącznie **6645**. Nowe rodziny: **4**. Pary rodzina/poziom: **11**. Każda para ma 24 różne macierze i dokładny wynik; język nie mnoży wariantów. Wszystkie 6381 instancji wcześniejszego `main` pozostają bez zmiany.

| Rodzina | Poziomy | Rachunek i zakres |
| --- | --- | --- |
| determinant-laplace-four | hard, advanced, expert | 4×4 z zerami: odpowiednio jeden, dwa, trzy niezerowe elementy w wybranym wierszu; jawne znaki i minory 3×3 |
| determinant-row-operations | advanced, expert | Gęstsza 4×4: odwracanie kilku dodawań wierszy i zamiany; Expert także skala; redukcja do trójkątnej i poprawka czynnika |
| determinant-laplace-five | advanced, expert | Rzadka 5×5: wiersz lub kolumna z jednym niezerowym elementem, potem minor 4×4 i obliczenie 3×3 |
| determinant-properties | medium, hard, advanced, expert | Proporcjonalne wiersze i det=0; dodanie wielokrotności; zamiana; Expert także skala jednego wiersza |

Trzy 4×4 rodziny mają 72+48+96=216 wariantów, 5×5 ma 48. Macierze zawierają małe liczby całkowite i niektóre dokładne ułamki; odpowiedź jest skalarna, bez 16 lub 25 pól. Poziomy nie są sztucznie uzupełniane: easy jest niedostępny we wszystkich czterech, medium tylko w rodzinie własności. `SquareDeterminantMatrix` nie podnosi limitu starych formularzy do 3×3. Wyznacznik liczymy przez Laplace'a dla 4×4/5×5; Sarrus jest używany tylko dla minora 3×3. Redukcja uwzględnia znak po zamianie, czynnik skali i niezmienność przy dodaniu wielokrotności innego wiersza.

`determinants.test.ts` niezależnie oblicza każde 264 pytania metodą dokładnej eliminacji BigInt i kontroluje pokazane minory, znaki, czynniki, wszystkie typowane rachunki, poprawne/błędne/nieważne odpowiedzi oraz tekst PL/EN. Testuje także macierze jednostkowe, trójkątne, zależne, skalowane, zamienione i odrzucenie niewłaściwego wymiaru. `determinant-regression.test.ts` porównuje SHA-256 pełnego zadania i rozwiązania dla wszystkich dawnych 6381 wariantów w obu językach z archiwum scalonego `main` 69452a6. Playwright sprawdza sześć kombinacji języka i szerokości 375/768/1280, kroki, brudnopis, Undo, sesję i lokalną historię. Ręczny test fizycznego Safari pozostaje do wykonania.

## MT-EDU-006B — dokładna algebra liniowa

MT-EDU-006B: **720** nowych instancji; łącznie **7365**. Jedenaście rodzin, 30 par rodzina/poziom × 24 prawdziwie różne zadania. P0: 4 rodziny / 312; P1: 3 / 144; P2: 2 / 168; opcjonalne P3 częściowo: 2 / 96. Wszystkie dawne 6645 lekcji PL/EN, ID i klucze treści są porównywane z niezależnym archiwum `main` `ea1cae4017b1c972f7762cc36aca5f1b0e223b79`.

| Rodzina | Poziomy | Rzeczywisty zakres |
| --- | --- | --- |
| inverse-two | easy, medium, hard | 2×2, det=0 na hard; poprawna macierz albo kontrolowany brak odwrotności |
| inverse-three | hard, advanced, expert | 3×3, dokładny Gauss–Jordan z zamianami wierszy i ułamkami |
| inverse-existence | medium, hard, advanced | Rząd=n/det≠0 dla 2×2/3×3; także osobliwe przypadki |
| inverse-applications | medium, hard, advanced, expert | AX=B, X=A⁻¹B, wymiary 2×1, 2×2, 3×2 i kontrola AX |
| matrix-rank | medium, hard, advanced | 2×3, 3×3, 3×4; zerowa macierz, zależne wiersze, ułamki i zamiany |
| capelli-given-ranks | easy | 2–5 niewiadomych, podane możliwe rzędy, trzy klasy rozwiązania |
| capelli-matrices | hard, advanced | Rząd A i [A|b] z jawnej macierzy; 3×3 oraz 3×4, sprzeczność i parametry |
| gauss-unique | medium, hard, advanced, expert | Układy 3×3/4×4, 3/4 pola x,y,z,w, zamiana zerowego pivota, podstawienie wsteczne |
| gauss-classification | hard, advanced, expert | 3×3/4×4, jedno/brak/nieskończenie wiele, jawny wiersz sprzeczny i demonstracja parametrów |
| cramer-four | advanced, expert | 4×4: D i D1…D4 przez Laplace’a, podstawienie czterech niewiadomych, przy D=0 klasyfikacja z rang |
| inverse-right-applications | advanced, expert | XA=B, X=BA⁻¹; 2×2/3×3 i dokładne ułamki |

`linearAlgebraMath.ts` przechowuje wyłącznie dokładne `Rational`/BigInt, waliduje wymiary, wykonuje Gaussa–Jordana albo eliminację z osobnym podstawieniem wstecznym. Macierz 4×4 jest tylko danymi i tabelą: nie zmienia limitu starego formularza macierzy 3×3. Przy jednym rozwiązaniu formularz `system` wymaga wszystkich niewiadomych; zadanie klasyfikacyjne i przypadek osobliwy używają kontrolowanego `choice`, bez swobodnej oceny wzorów parametrycznych. Pierwsza nieważna odpowiedź nie zużywa samodzielnej próby sesji.

`inverses.test.ts` sprawdza obie strony AA⁻¹=I metodą niezależnych dopełnień; `ranks.test.ts` liczy wszystkie rzędy przez minory; `gauss.test.ts` stosuje Laplace'a/Cramera i podstawia wszystkie niewiadome do oryginalnych równań. Testy przechodzą przez każdą instancję PL/EN i poprawne, błędne oraz nieważne formularze. `linear-algebra-regression.test.ts` porównuje pełne hash'e wszystkich 6645 poprzednich zadań i lekcji, a Playwright bada widoki 375/768/1280 px. Własny solver produkcyjny nie jest źródłem oczekiwań audytu. P3 dodaje `cramer-four` i `inverse-right-applications`. `cramerFour.test.ts` porównuje każdy wyznacznik 4×4 z niezależnym wzorem Leibniza, sprawdza D=0 bez dzielenia, wszystkie podstawienia i pełne lekcje PL/EN. Układ dwóch równań macierzowych pozostaje przyszły; nie deklarujemy pokrycia prywatnych arkuszy ani fizycznego Safari.

## MT-EDU-007 P0 — logarytmy, potęgi i moduł

MT-EDU-007 P0: **384** nowych instancji; łącznie **7749**. Pięć rodzin, 16 uczciwych par rodzina/poziom po 24 odrębne treści każda. Wartości są wymierne dokładnie; nie stosujemy parsera wyrażeń ani przybliżeń logarytmów.

| Rodzina | Poziomy | Rzeczywisty zakres |
| --- | --- | --- |
| analysis-log-domain | easy, medium, hard | Dodatniość argumentu; znak ilorazu i wyłączenie bieguna; pierwiastek nad logarytmem w mianowniku z wyłączeniem log_a(1)=0 |
| analysis-power-law | easy, medium, hard | log_a(a^k)=k, a^(log_a u)=u przy u>0, suma obu praw z dokładnym ułamkiem |
| analysis-elementary-equation | easy, medium, hard | Równanie wykładnicze, logarytmiczne z dziedziną i suma dwóch logarytmów wymagająca odrzucenia niedozwolonego pierwiastka |
| analysis-log-inequality | medium, hard | Log_a(x-p)>k oraz ≤k; obie strony podstawy 1, w tym odwrócenie znaku dla 0<a<1 |
| analysis-absolute | easy, medium, hard, advanced, expert | Dwa rozwiązania \|x−p\|=r; dziedzina pierwiastka z modułem; przedział ostry; suma dwóch modułów ≤ lub ≥ progu z trzema obszarami |

Odpowiedzi używają istniejących typów `scalar`, `roots` i kontrolowanego wyboru kanonicznego zbioru (`setKey`). Dziedziny i zbiory rozwiązań zachowują otwarte/domknięte końce. `elementaryAnalysis.test.ts` sprawdza wszystkie 384 warianty w PL/EN niezależnymi warunkami algebraicznymi i punktami brzegowymi, `correct/incorrect/invalid` oraz unikalność treści. `function-analysis-regression.test.ts` porównuje 7365 pełnych lekcji PL/EN z opublikowanym `main` 793315c. P1 jest opisany niżej; P2 jest opisany niżej; P3 jest częściowo opisany niżej; brakujące scenariusze pozostają przyszłe.

## MT-EDU-007 P1 — granice Eulera i asymptoty

MT-EDU-007 P1: **384** nowych instancji; łącznie **8133**. Pięć rodzin i 16 par rodzina/poziom × 24 unikalne pytania. Zachowano wszystkie 7365 lekcji sprzed MT-EDU-007. Nie przybliżamy liczby e: odpowiedź e^q ma kontrolowany identyfikator i dokładny wykładnik wymierny.

| Rodzina | Poziomy | Rzeczywisty zakres |
| --- | --- | --- |
| analysis-euler-sequence | medium, hard, advanced, expert | Ciąg (1+a/n)^n, skalowany wykładnik, iloraz dwóch liniowych ciągów i przesunięty wykładnik; także e^0=1 |
| analysis-euler-function | medium, hard, advanced, expert | Analogiczna granica funkcji przy x→0; uzasadnienie przez logarytm dodatniej podstawy |
| analysis-asymptote-vertical | medium, hard, advanced | Biegun prosty, biegun podwójny, skrócenie i dziura; osobne znaki granic jednostronnych |
| analysis-asymptote-horizontal | medium, hard, advanced | Iloraz liniowych wielomianów, pierwiastek z x²+1 z rozróżnieniem ±∞, brak asymptoty przy prostej o niezerowym nachyleniu |
| analysis-asymptote-oblique | advanced, expert | Dzielenie wielomianów, sprzężenie √(x²+1), asymptota ukośna/pozioma w różnych kierunkach oraz brak prostej dla funkcji kwadratowej |

`analysisLimitsAsymptotes.test.ts` niezależnie wyprowadza wykładniki, znaki granic oraz proste asymptotyczne dla każdego wariantu PL/EN, sprawdza format i wynik odpowiedzi. Wszystkie proste zapisuje jako dokładne współczynniki wymierne. Test katalogu wymusza globalnie różne treści między rodzinami i poziomami.

## MT-EDU-007 P2 — reguła de l’Hospitala i druga pochodna

MT-EDU-007 P2: **360** nowych instancji; łącznie **8493**. Cztery rodziny, 15 par rodzina/poziom × 24 różne pytania. Wyniki pozostają wymierne: e^0 jest dokładnie 1, a logarytm w punkcie ma argument 1 lub wartość bezwzględną 1. Nie przybliżamy funkcji wykładniczej w ocenianiu odpowiedzi.

| Rodzina | Poziomy | Rzeczywisty zakres |
| --- | --- | --- |
| analysis-lhospital | medium, hard, advanced, expert | Rzeczywiste 0/0, jedna lub dwie aplikacje dla wielomianów i e^u; jawna kontrola różniczkowalności, pochodnej mianownika i granicy ilorazu |
| analysis-lhospital-infinity | medium, hard, advanced, expert | Rzeczywiste ±∞/∞: ilorazy wielomianów jedno- i dwukrokowe, ln(1+mx)/ln x oraz ln(1+mx)/ln(1+x^k), k=2 lub 3; kontrolowana dziedzina i niezerowa pochodna mianownika |
| analysis-log-exp-derivative | medium, hard, advanced, expert | ln(1+u), e^u, ln|u| po ujemnej stronie oraz iloczyn e^u(1+v); reguła łańcuchowa i pochodna w punkcie |
| analysis-concavity | hard, advanced, expert | Zmiana znaku f'' dla sześcianu, brak przegięcia przy zerze podwójnym czwartej potęgi, dwa rzeczywiste przegięcia w mieszanym wielomianie czwartego stopnia |

`advancedCalculus.test.ts` wyznacza niezależnie wyniki dla wszystkich 360 wariantów PL/EN, liczy pochodne i znaki f'' dokładną arytmetyką oraz odróżnia zera bez zmiany znaku. Sprawdza poprawne, błędne i nieprawidłowe formularze.

## MT-EDU-007 P3 — częściowe badanie funkcji

MT-EDU-007 P3 (częściowo): **96** nowych instancji; łącznie **8589**. Dwie rodziny, cztery pary rodzina/poziom po 24 różne pytania. Pełne lekcje przedstawiają dziedzinę, miejsca zerowe, symetrię, granice i asymptoty, znaki f' i f'', ekstrema oraz wypukłość; formularz ocenia jeden logiczny wynik zamiast wielkiej listy własności. Expert dodaje porównanie punktów krytycznych i końców ograniczonego domkniętego przedziału.

| Rodzina | Poziomy | Rzeczywisty zakres |
| --- | --- | --- |
| analysis-study-polynomial | advanced, expert | Przesunięty wielomian m(t³−3t): trzy dokładne zera (w tym ±√3 symbolicznie), dwie stacjonarne wartości, przegięcie, globalne max/min na [a−3/2,a+3/2] |
| analysis-study-rational | advanced, expert | m(t+1/t): wykluczony biegun, asymptota pionowa i ukośna, brak rzeczywistych zer, dwa stacjonarne punkty, brak przegięcia w biegunie, globalne max/min na [a+1/2,a+2] |

`functionStudy.test.ts` niezależnie podstawia punkty kandydatów, bada znaki obu pochodnych i granice asymptotyczne dla wszystkich 96 wariantów PL/EN. P3 pozostaje **częściowy**: nie ma niesmooth stycznych dla |x|, ogólnych funkcji wymiernych ani renderowanego wykresu. Tabele znaków są zapisane w krokach, a nie przedstawiane jako narysowany wykres.

## MT-EDU-008 P0–P2 — całki

MT-EDU-008 P0–P2: **432** nowych instancji; łącznie **9021**. Sześć autorskich rodzin, 18 obsługiwanych par rodzina/poziom, każda po 24 różne pytania. Zachowano wszystkie 8589 wcześniejszych instancji i ich identyfikatory. P3 (pola między krzywymi, długość łuku) pozostaje przyszłym etapem.

| Rodzina | Poziomy | Umiejętność i granice |
| --- | --- | --- |
| integral-direct | easy, medium, hard | Całkowanie stałych, sum i wielomianów do stopnia 3 dokładną regułą potęgową |
| integral-table | medium, hard | Kontrolowane sin(ax+b), cos(ax+b), e^(ax+b) oraz 1/(ax+b); ostatni przypadek wymaga x≠−b/a i ln|ax+b| |
| integral-substitution | medium, hard, advanced | Potęga liniowego argumentu; x(ax²+b)^n; na advanced dodatkowy składnik liniowy |
| integral-parts | hard, advanced, expert | x^m e^(ax), m=1,2,3; powtarzanie przez części aż do zaniku wielomianu |
| integral-recurring | advanced, expert | e^(ax)(p sin bx+q cos bx), b>0; układ dwóch całek powracających z niezerowym a²+b² |
| integral-definite | easy, medium, hard, advanced, expert | Wielomiany na rosnących granicach całkowitych lub wymiernych; dokładne F(b)−F(a) |

Całki nieoznaczone mają ograniczony formularz: uczeń wpisuje **dokładny współczynnik przy każdej wskazanej funkcji bazowej**, także zero, oraz zaznacza `+C`. Nie ma pola na swobodne wyrażenie; dowolny składnik stały jest pominięty przy porównaniu, bo funkcje pierwotne różniące się stałą są równoważne. Jest to świadome ograniczenie walidacji symbolicznej. Błędny współczynnik daje ogólną informację bez wymyślonej diagnozy; poprawne współczynniki bez `+C` dają jednoznaczną wskazówkę. Całka oznaczona używa dokładnego pola liczbowego bez `+C`.

`integrals.test.ts` audytuje wszystkie 432 warianty niezależnymi równaniami pochodnej: regułą potęgową, łańcuchową, iloczynu i liniowym układem współczynników sin/cos; całki oznaczone liczy osobno jako sumę dokładnych momentów na granicach. Sprawdza poziomy, unikalność, PL/EN, poprawne/błędne/nieprawidłowe odpowiedzi i brak `+C`. Rozwiązania krok po kroku pokazują metodę, przekształcenia, sprawdzenie pochodnej i ostateczną odpowiedź.

## MT-EDU-009 — uzupełnienie luk macierzowych i gęstych wyznaczników

MT-EDU-009: **216** nowych instancji; łącznie **9237**. Nowe rodziny: **3**. Pary rodzina/poziom: **9**.

| Rodzina | Poziomy | Zakres |
| --- | --- | --- |
| matrix-coupled-equations | medium, hard, advanced, expert | Dwa równania aX+bY=A oraz cX+dY=B, niewiadome 2×2, osiem dokładnych pól odpowiedzi |
| determinant-dense-four | hard, advanced, expert | Pełny Laplace dla 4×4 bez zer, znaki i minory |
| determinant-dense-five | advanced, expert | Pełny Laplace dla 5×5 bez zer, minory 4×4/3×3 |

Wcześniejsze rodziny, poziomy i zadania pozostają bez zmian.

## MT-EDU-010 — zadania z macierzy bez nowych trybów sprawdzianów

MT-EDU-010: **384** nowe instancje; łącznie **9621**. Nowe rodziny: **4**. Pary rodzina/poziom: **16**. Każda wspierana para ma 24 warianty.

| Rodzina | Poziomy | Zakres |
| --- | --- | --- |
| matrix-powers | medium, hard, advanced, expert | Mnożenie macierzy A²/A³, 2×2 i 3×3; nie potęgowanie elementów |
| matrix-composite-operations | hard, advanced, expert | AB−C, (A+B)C, A(B−C), (AB)ᵀ−C oraz skalowanie ułamkiem |
| matrix-compatibility | easy, medium, hard, advanced, expert | Wykonalność A+B, AB, BA i rozmiary wyników lub poprawne „nie można” |
| matrix-chained-dimensions | medium, hard, advanced, expert | Wykonalność AB+C, A(B+C), A(BC) z analizą krokową |

Nowe rodziny mają dokładne rozwiązania PL/EN i niezależny audyt. Wymiary obejmują macierze o bokach 2 i 3. Bez potęg ujemnych, dowolnych wymiarów ani pełnej algebry symbolicznej. Wcześniejsze 9237 instancji pozostaje niezmienione.

## MT-EDU-012 — wyznaczniki pośrednie Cramera

MT-EDU-012: **120** nowych instancji; łącznie **9741**. Nowe rodziny: **2**. Pary rodzina/poziom: **5**, po 24 warianty.

| Rodzina | Poziomy | Zakres |
| --- | --- | --- |
| cramer-determinants-three | hard, advanced, expert | D,D1–D3 układów 3×3, wymiana kolumn i Laplace z minorami 2×2 |
| cramer-determinants-four | advanced, expert | D,D1–D4 układów 4×4, Laplace z minorami 3×3 |

Ocena wszystkich wyznaczników osobno w czterech albo pięciu polach. Invertowalna macierz trójkątna bazowa, odwracalne operacje na wierszach, dokładne Rational/BigInt, weryfikacja formułą Leibniza i podstawieniem xᵢ=Dᵢ/D. Przypadki osobliwe pozostają w istniejącym `cramer-four`, bez zmian wcześniejszych 9621 zadań i bez deklaracji zgodności z konkretnymi arkuszami.


## MT-EDU-013 P0 — dwie rodziny równań macierzowych 2×2 (PR #43)

168 autorskich wariantów 2×2: 96 z AX=4X+B (medium, hard, advanced, expert) i 72 z AXB=C (hard, advanced, expert). Dla pierwszej rodziny X=(A−4I)⁻¹B; dla drugiej X=A⁻¹CB⁻¹. Odwracalność skonstruowana, nie zakładana bez uzasadnienia, wyniki dokładne (Rational), weryfikowane przez podstawienie. Obie rodziny mają dokładne kroki Gaussa–Jordana, polskie i angielskie wskazówki oraz odpowiedź macierzową.

| Rodzina | Poziomy | Zakres |
| --- | --- | --- |
| matrix-ax-shift | medium, hard, advanced, expert | (A−4I)X=B, odejmowanie od przekątnej, odwrotność |
| matrix-axb | hard, advanced, expert | Lewa i prawa odwrotność, kolejność iloczynu A⁻¹CB⁻¹ |

MT-EDU-013 P0: **168** nowych instancji; łącznie **9909**. Nowe rodziny: **2**. Pary rodzina/poziom: **7**. Pozostałe typy równań z MT-EDU-013 są w dalszym zakresie; ten pakiet nie zamyka całego działu.

## MT-EDU-013 P1 — dalsze dwa równania macierzowe 2×2

P1 dodaje **168** nowych wariantów (7 par rodzina/poziom po 24), łącznie **10077 instancji** w **113 rodzinach**. Rodzina `matrix-inverse-plus` rozwiązuje (A+4X)⁻¹=B, wymagając odwracalności B i poprawnego przekształcenia X=(B⁻¹−A)/4. Rodzina `matrix-bx-shift` rozwiązuje 3X+A=BX przez (B−3I)X=A. Wszystkie przykłady są odwracalne z konstrukcji, liczone dokładnie (Rational), z podstawieniem kontrolnym i objaśnieniami PL/EN. Wciąż nie jest to pełne pokrycie wszystkich rozmiarów macierzy i nietypowych przekształceń.

| Rodzina | Poziomy | Zakres |
| --- | --- | --- |
| matrix-inverse-plus | hard, advanced, expert | (A+4X)⁻¹=B, odwrotność B, X=(B⁻¹−A)/4 |
| matrix-bx-shift | medium, hard, advanced, expert | 3X+A=BX, odwrotność (B−3I), kontrola przez podstawienie |

## MT-EDU-014 P0 — pełne współczynniki rozwiązań parametrycznych metodą Gaussa

Dwie autorskie rodziny, **120 instancji** w pięciu parach rodzina/poziom (po 24). Cały katalog po P0: **115 rodzin i 10197 instancji**.

| Rodzina | Poziomy | Cel |
| --- | --- | --- |
| gauss-parameters-one | hard, advanced, expert | Układ 3×3/4×4 o rzędzie n−1; pełna postać z parametrem t1 |
| gauss-parameters-two | advanced, expert | Układ 4×4 o rzędzie n−2; pełna postać z t1 i t2 |

Zamiast oceniać jedynie „nieskończenie wiele rozwiązań”, formularz wymaga **osobno stałej i każdego współczynnika parametrów** dla każdej zmiennej, w ustalonej konwencji: pierwsza swobodna zmienna od lewej to t1, druga to t2. Odpowiedź przyjmuje dokładne ułamki i ocenia całą rodzinę, nie tylko jeden wektor szczególny. Macierze budowane z niezależnych wierszy oraz kombinacji liniowych gwarantują spójność i wymaganą liczbę stopni swobody; operacje Gaussa i kontrola każdego współczynnika w oryginalnym Ax=b są dokładne. PL/EN. Inne parametryzacje równoważne po zmianie podstawy nie są oceniane; wymagamy jawnie podanej normalizacji zmiennych swobodnych.

## MT-EDU-014 P1 — łańcuchy równości i układy prostokątne

**3 rodziny i 192 nowe warianty** (8 par rodzina/poziom × 24). Katalog po P1: **118 rodzin / 10389 instancji**, w tym **101 rodzin na poziomie advanced** i **95 na expert**.

| Rodzina | Poziomy | Cel |
| --- | --- | --- |
| system-chain-five | medium, hard, advanced, expert | Pięć znaków równości między sześcioma wyrażeniami wymiernymi w x,y; dwa niezależne równania; żądana jest tylko wskazana niewiadoma x lub y |
| system-rectangular-3x2 | medium, hard | 3 równania / 2 niewiadome; przypadki dokładnie jednego, żadnego i nieskończenie wielu rozwiązań, uzasadnione rzędem |
| system-rectangular-4x3 | advanced, expert | 4 równania / 3 niewiadome; obliczenie RREF i rzędu macierzy rozszerzonej, kontrolowane przypadki wszystkich trzech klas |

Zadania mają dokładne ułamki Rational, PL/EN i objaśnienia z operacjami Gaussa. Łańcuch wymaga wpisania pojedynczego wyniku; pozostałe trzy równości są weryfikowane przez podstawienie. Prostokątne układy wymagają **klasyfikacji**, a w krokach zawierają wyprowadzone wartości dla przypadku jednoznacznego, parametryzację dla nieskończenie wielu rozwiązań lub jawny wiersz sprzeczności. Nie twierdzimy, że aplikacja ocenia pełną parametryzację prostokątnych układów.


## MT-EDU-014 P2 — pełne rozwiązania prostokątne

| Rodzina | Poziomy | Rząd A = rząd [A|b] | Parametry | Warianty |
|---|---|---|---|---|
| gauss-rectangular-3x2-parameters | hard, advanced | 1 | 1 | 48 |
| gauss-rectangular-4x3-parameters | advanced, expert | 2 / 1 | 1 / 2 | 48 |
| gauss-rectangular-2x3-parameters | advanced, expert | 2 / 1 | 1 / 2 | 48 |

**3 rodziny / 6 par / 144 warianty**; katalog po P2: **121 rodzin / 10533 instancje**, 104 rodziny na advanced i 97 na expert. Hard w 3×2 uczy eliminowania zależnych równań z jednym parametrem; advanced wprowadza dokładne ułamki, a w układach trzech niewiadomych dwa pivoty. Expert wymaga dwóch parametrów, także niepoczątkowych kolumn pivotowych i trzecich części we wzorach. Poziomy nie różnią się wyłącznie wielkością liczb.

`gaussRectangularParameters.ts` konstruuje niezależną bazę schodkową, dodaje zależne równania i wykonuje odwracalne operacje na całych wierszach, łącznie z b. Gwarantuje to zgodność i dokładny rząd. Każda para ma 24 różne zbiory rozwiązań, nie tylko inaczej przeskalowane macierze. Istniejący prezenter `presentGaussParameters` wyprowadza współczynniki i sprawdza Ax=b dla części stałej oraz Ax=0 oddzielnie dla każdej części parametrycznej we wszystkich m równaniach.

Formularz `list` wymaga wszystkich n(1+k) liczb (w tym 0 i 1) w jawnej konwencji: zmienne swobodne od lewej to t1, t2. Inne bazy parametrów nie są przyjmowane; aplikacja nie interpretuje dowolnych napisów symbolicznych. Puste/nieprawidłowe pola są invalid, błędne współczynniki incorrect. Zachowano standardowe sesje, historię i brudnopis.

Niezależny audyt używa wszystkich minorów do rzędów i reguły Cramera na odwracalnym minorze do stałych i współczynników, sprawdza kompletność bazy, wszystkie oryginalne równania oraz każdą pokazaną operację eliminacji i RREF w PL/EN. Fixture z main `f585218e3ce87bcf963a725aabbf056ba1e486fa` chroni pełne 10389 wcześniejszych zadań i rozwiązań PL/EN haszami SHA-256. E2E obejmuje PL/EN, 375/1280 px, wszystkie nowe pary, sesje 10 zadań, lokalny zapis, brudnopis i Undo/Redo.

## MT-EDU-015A — granice ciągów (P0)

Trzy nowe rodziny, 4 poziomy medium–expert, po 24 odrębne przykłady na każdą parę: **288 wariantów**. Po zmianie: **124 rodziny i 10821 instancji**, w tym 107 rodzin advanced i 100 expert.

| Rodzina | Poziomy | Wynik ucznia |
| --- | --- | --- |
| sequence-radical-ratio | medium, hard, advanced, expert | Iloraz dwóch wyrażeń z pierwiastkami kwadratowymi i wyrazami liniowymi, możliwość kasowania wiodącego n |
| sequence-exponential-ratio | medium, hard, advanced, expert | Dokładna granica ilorazu sum potęg dodatnich podstaw; równe podstawy łączymy przed wyborem dominanty, także ±∞ |
| sequence-euler-product | medium, hard, advanced, expert | Granice potęg (1+a/(n+b))^(cn+d), także iloczyn dwóch takich potęg, symboliczne e^(q), bez przybliżania e |

Każdy generator jest autorski, z gwarantowanymi dziedzinami i dokładnymi rachunkami Rational. Specyfikacja odpowiedzi to istniejący `limit` albo — dla granic e^(q), które nie są wymierne — kontrolowany wybór symboliczny. Dodatkowe testy pokrywają PL/EN, przypadki skróceń i granice niewłaściwe. Program nie obsługuje wszystkich nieoznaczonych postaci symbolicznych.

## MT-EDU-015B P1 — parzystość i odwrotność funkcji

| Rodzina | Poziomy | Warianty | Zakres |
| --- | --- | ---: | --- |
| function-parity | easy, medium, hard | 72 | Porównanie f(−x) z ±f(x), trzy klasy na każdym poziomie i dokładne współczynniki |
| function-affine-inverse | easy, medium, hard | 72 | Zamiana x/y i wyznaczenie współczynników m,n f⁻¹(x)=mx+n w trzech postaciach liniowych |

**2 rodziny / 6 par / 144 warianty**, katalog po P1: **126 rodzin / 10965 instancji**; poziomy advanced i expert nie zostały sztucznie dopisane. Odpowiedzi są oceniane dokładnie, a matematyczny test odwrotności sprawdza oba złożenia. Wykresy i bardziej złożone dziedziny pozostają dalszymi pracami MT-EDU-015B.

## MT-EDU-015B P2A — dziedziny tangensa i składane warunki

| Rodzina | Poziomy | Warianty | Ograniczenia |
| --- | --- | ---: | --- |
| function-tangent-domain | easy, medium, hard | 72 | Dziedzina tan(ax+bπ), wykluczenia okresowe k∈ℤ, w hard dodatkowy mianownik x−p |
| function-mixed-domain | easy, medium, hard | 72 | Dziedzina √(x−p)/log_a(x−b), √((x−p)(x−q))/log_a(x−b) i √((x−p)(x−q))/√(log_a(x−b)) |

**2 rodziny / 6 par / 144 warianty**, katalog po P2A: **128 rodzin / 11109 instancji**. Wyniki dla π pozostają symboliczne, warunki 0<a<1 i a>1 obsługiwane bez przybliżeń, a warunki pierwiastka/logarytmu przecinają się dokładnie. Wykresy SVG oraz odczytywanie własności zostają w P2B.

## MT-EDU-015B P2B-1 — odczytywanie wykresów

| Rodzina | Poziomy | Warianty | Zakres |
| --- | --- | ---: | --- |
| function-graph-domain-range | easy, medium, hard | 72 | Dziedzina lub zbiór wartości trójwierzchołkowej łamanej, końce otwarte i domknięte |
| function-graph-zeros | easy, medium, hard | 72 | Dwa miejsca zerowe odcinków z dokładnymi współrzędnymi |

Katalog po tym etapie: **130 rodzin / 11253 instancji**. Każda rodzina ma 24 warianty na poziom, rozwiązania PL/EN i kontrolowany SVG bez zewnętrznej biblioteki. F05 pozostaje częściowe (brak monotoniczności i symetrii z wykresu).

## MT-EDU-015B P2B-2 — monotoniczność, ekstrema, symetria

| Rodzina | Poziomy | Warianty | Zakres |
| --- | --- | ---: | --- |
| function-graph-monotonicity | easy, medium, hard | 72 | Kierunek na kolejnych odcinkach: rośnie / maleje / stała |
| function-graph-extrema | easy, medium, hard | 72 | Współrzędne globalnego maksimum/minimum w wierzchołku |
| function-graph-symmetry | easy, medium, hard | 72 | Symetria osiowa i środkowa z uwzględnieniem dziedziny |

Katalog po P2B-2: **133 rodziny / 11469 instancji**; bez nowego backendu, biblioteki graficznej ani wariantów L4/L5 wymuszonych sztucznie. SVG ma opisy tekstowe i warunkowe końce otwarte/domknięte. 24 warianty na każdy obsługiwany poziom rodziny.

## MT-EDU-016 P0 — punkty nieróżniczkowalności (D06)

| Rodzina | Poziomy | Warianty | Zakres |
| --- | --- | ---: | --- |
| derivative-absolute-one-sided | easy, medium, hard | 72 | Dokładne f′₋(h) oraz f′₊(h) w punkcie załamania a\|x−h\| + b(x−h) + c, a≠0 |
| derivative-piecewise-point | easy, medium, hard | 72 | Pochodna istnieje / ciągłe załamanie / nieciągły skok dla dwóch kontrolowanych gałęzi liniowych |

Razem **2 nowe rodziny, 144 warianty**. Katalog po P0: **135 rodzin / 11613 instancji**. Nie rozszerzono L4/L5 ani zakresu na ogólne krzywe i pionowe styczne. Zachowano dotychczasowe identyfikatory i generatory.

## MT-EDU-016 P1A — pochodne funkcji trygonometrycznych

| Rodzina | Poziomy | Warianty | Zakres |
| --- | --- | ---: | --- |
| derivative-trig-chain | easy, medium, hard | 72 | Symboliczna pochodna sin/cos/tan funkcji liniowej z regułą łańcuchową, kontrolowane dystraktory |
| derivative-trig-special-point | easy, medium, hard | 72 | Dokładna wartość pochodnej w punkcie o argumencie 0, π, π/2 lub 3π/2; różne współczynniki |

Po P1A: **137 rodzin / 11757 instancji**. Każda rodzina: 24 warianty na obsługiwany poziom, pełne PL/EN i testy automatyczne. Tan/tg tylko poza zerami cosinusa; wartości w zadaniach punktowych są dokładnie wymierne.

## MT-EDU-016 P1B — pochodne iloczynu i ilorazu

| Rodzina | Poziomy | Warianty | Zakres |
| --- | --- | ---: | --- |
| derivative-product-point | easy, medium, hard | 72 | Pochodna iloczynu czynnika liniowego i kwadratowego w punkcie |
| derivative-quotient-point | easy, medium, hard | 72 | Pochodna ilorazu dwóch funkcji liniowych w punkcie, z dokładnym D(h)≠0 |

P1B dodaje **144 warianty** bez dodatkowych bibliotek i parserów. Po połączeniu z P1A: **139 rodzin / 11901 instancji**; zakres D02 nadal jest częściowy.

## MT-EDU-017 — obszary między krzywymi i długości łuków

| Rodzina | Poziomy | Warianty | Zakres |
| --- | --- | ---: | --- |
| integral-area-between | easy, medium, hard | 72 | Dokładne pola między parabolą a prostą z podziałem według przecięć |
| integral-arc-length | easy, medium, hard | 72 | Długość krzywej y=(2k/3)(x−h)^(3/2)+c; kontrolowane końce i dokładne ułamki |

Dwie rodziny, 144 instancje. Izolowany PR: 141 rodzin / 12045 instancji. I07/I08 pozostają częściowo pokryte poza kontrolowanymi rodzinami.

## MT-EDU-018 P1 — funkcje dwóch zmiennych: pochodne i gradient

| Rodzina | Poziomy | Warianty | Zakres |
| --- | --- | ---: | --- |
| multivar-partial-point | easy, medium, hard | 72 | Pochodne cząstkowe I i II rzędu wielomianu kwadratowego w punkcie |
| multivar-gradient-point | easy, medium, hard | 72 | Gradient funkcji 2D jako para wymiernych pochodnych w punkcie |

P1 dodaje 144 instancje do katalogu po #59: **143 rodzin / 12189 wariantów**. Inne klasy funkcji dwóch zmiennych pozostają do wdrożenia.

## MT-EDU-018 P2 — punkty stacjonarne i Hessian

| Rodzina | Poziomy | Warianty | Zakres |
| --- | --- | ---: | --- |
| multivar-stationary-point | easy, medium, hard | 72 | Rozwiązywanie f_x=f_y=0 dla funkcji kwadratowych 2D z dokładnymi ułamkami |
| multivar-hessian-classify | easy, medium, hard | 72 | Test Hessiana: minimum, maksimum, punkt siodłowy i przypadek D=0, kiedy test nie rozstrzyga |

P2 wnosi 144 zadania; razem z #59 oraz #60 katalog po scaleniu #61 będzie liczył **145 rodzin i 12333 warianty**. **Poziom Łatwy:** punkty stacjonarne mają całkowite współrzędne z przedziału [−2, 2], bez nadmiernie dużych współczynników liniowych. Poziom Średni: małe ułamki z mianownikiem 2; Trudny: ułamki z mianownikiem 3 i szerszy zakres współrzędnych. Przypadek D=0 nie oznacza automatycznie braku ekstremum; wygenerowany przykład z czwartą potęgą ma rzeczywiste minimum, którego sam test Hessiana nie potwierdza. Zakres W02 pozostaje częściowy.

## MT-EDU-019 P0A — kontrolowana redukcja 4×4 i 5×5

| Rodzina | Poziomy | Warianty | Zakres |
| --- | --- | ---: | --- |
| determinant-strategy-four | easy, medium, hard | 72 | 4×4: odpowiednio 1, 2 lub 4 operacje; w trudnych również zamiana wierszy |
| determinant-strategy-five | easy, medium, hard | 72 | 5×5: odpowiednio 1, 2 lub 4 operacje; korekta znaku po zamianie |

Po dodaniu P0A: **147 rodzin i 12477 instancji**. Oryginalne 145 rodzin / 12333 warianty pozostają niezmienione. Macierze są budowane z górnotrójkątnych o małych dokładnych współczynnikach, a następnie transformowane operacjami `R_i += kR_j` i opcjonalnym swap; rozwiązanie jawnie odwraca każdą operację. M09/M10 wciąż pozostają częściowe dla dowolnych macierzy i strategii.

## MT-EDU-019 P0B — diagnostyka metody Cramera (U01/U03)

| Rodzina | Poziomy | Warianty | Charakter |
| --- | --- | ---: | --- |
| cramer-applicability | easy, medium, hard | 72 | Dla 2×2/3×3/4×4 rozstrzyga, czy D≠0 i kiedy wolno użyć Cramera; przy D=0 porównuje rzędy |
| cramer-four-singular-minors | easy, medium, hard | 72 | D oraz D₁–D₄ dla 4×4, także układy zgodne i sprzeczne przy D=0, z wyjaśnionymi rangami |

W każdym poziomie każdej rodziny jest dokładnie 8 układów jednoznacznych, 8 zgodnych nieoznaczonych i 8 sprzecznych; macierze mają w tym poziomie 24 odrębne zestawy danych. **D=0 nie oznacza automatycznie sprzeczności ani nieskończenie wielu rozwiązań.** Niezależny test enumeruje minory dla rzędu macierzy oraz rozwija wszystkie D,Dᵢ. Wszystkie poprzednie 147 rodzin / 12477 wariantów pozostają dostępne. Po P0B: **149 rodzin / 12621 wariantów**.

## MT-EDU-019 P0C — działania prostokątne i transpozycja

| Rodzina | Poziomy | Warianty | Co użytkownik wpisuje |
| --- | --- | ---: | --- |
| matrix-rectangular-evaluation | easy, medium, hard | 72 | Wszystkie elementy wyniku `AB+C`, `(A+B)C`, `A(B−C)` lub `(AB)ᵀ−C` / `(AB)ᵀ−(3/2)C` |
| matrix-transpose-dimensions | easy, medium, hard | 72 | Wykonalność i wymiar `AᵀB`, `Aᵀ(B+C)`, `(AB)ᵀ+C`, `ABᵀ+C`, `(A+Bᵀ)C` |

Generatory korzystają z macierzy 2×2, 2×3, 3×2 i 3×3. Poziom easy: małe liczby całkowite i co najwyżej dwa działania; medium: trzy macierze i nawiasy; hard: transpozycja, dodatkowe kroki i ułamki. W rodzinie wymiarów wszystkie poziomy mieszają zadania wykonalne i niewykonalne. Testy używają niezależnych obliczeń każdej komórki, osobnych reguł zgodności wymiarów i sprawdzają 144 unikalne warianty. **Po potencjalnym scaleniu** 151 rodzin / 12 765 wariantów; 149 poprzednich rodzin i 12 621 wariantów pozostaje dostępnych.
