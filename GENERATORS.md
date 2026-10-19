# Generatory zadań — katalog bieżący i rozwój historyczny

Bieżący katalog UI i sesji: **62 rodzin**, **6309 instancji**. `allTemplates` i `taskPool` obejmują zachowane 35 historycznych rodzin oraz 16 nowych z P1–P3. Po 54 rodziny wspierają advanced i expert; dostępność niższych poziomów jest jawna w tabelach. Sekcje MT-003A/MT-EDU-001/MT-EDU-003 poniżej opisują fundament historyczny, a nowe rodziny mają osobne tabele MT-EDU-004. Dotychczasowe `templates` i `pool` zachowują 15 rodzin skalarnych w pięciu kategoriach do niezależnych regresji. `createGenerator(seed).next(category, difficulty, templateId?)` wybiera wyłącznie niewidzianą treść z odpowiedniego zakresu. Po wyczerpaniu usuwa klucze tej puli z pamięci, zwraca `repeated: true` i zaczyna nowy cykl. Nie ma losowania w pętli do skutku. Stan znika po odświeżeniu.

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

Cztery nowe rodziny powtórkowe dodano do istniejących kategorii algebry/równań. Trzy nowe kategorie są w dziale „Matematyka na studia”. Każda rodzina ma trzy poziomy. Materiały są autorskie, nie stanowią oficjalnego programu UWM.

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

Bez `eval`, zaokrąglania, dowolnego parsera symbolicznego, Viète'a, macierzy odwrotnej, Cramera i analizy matematycznej w obecnym zakresie. Trwała historia to MT-004. Przy przyszłym tłumaczeniu teksty rodzin należy przenieść do katalogów językowych.

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

Nowe rodziny: **16**. Pary rodzina/poziom: **72**. Łącznie rodziny L4: **54**, L5: **54**.

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

P4–P6 pozostają przyszłym zakresem ROADMAP. Powyższy katalog obejmuje wyłącznie P1–P3; P0 zmienia brudnopis bez dodawania instancji.

## MT-EDU-005 — P0: granice funkcji

MT-EDU-005: **1080** nowych instancji; łącznie **6309**.

| Rodzina | Poziomy | Umiejętność |
| --- | --- | --- |
| limit-point | easy, medium, hard, advanced, expert | Ciągłość; 0/0 i skracanie w przebitym otoczeniu; krotności i znaki jednostronne; redukcja różnicy i złożeń; f(a) a granica |
| limit-infinity | easy, medium, hard, advanced, expert | Stopnie i znaki przy obu kierunkach nieskończoności, redukcja dominujących składników przed porównaniem |
| limit-conjugate | medium, hard, advanced, expert | Sprzężenie liniowego i kwadratowego pierwiastka; odjęcie wyrazu liniowego; dwa pierwiastki z redukcją drugiego rzędu |

14 par po 24 odrębne warianty. Pierwiastki mają dodatni podpierwiastkowy w otoczeniu punktu dzięki dodatniemu wyrazowi stałemu s². Granice drugiego rzędu wynikają z dokładnych tożsamości różnicy kwadratów. Audyt używa niezależnego rozwinięcia dwumianowego wokół punktu, a nie produkcyjnego dzielenia syntetycznego; sprawdza rachunki pośrednie i oba języki. P0 obejmuje 336 instancji. P1 jest opisany poniżej.

### P1 — pochodne: 744 instancje

| Rodzina | Poziomy | Umiejętność |
| --- | --- | --- |
| derivative-formula | easy, medium, hard, advanced, expert | Stałe i potęgowa; suma; iloczyn; łańcuch; różnica złożenia i iloczynu |
| derivative-point | easy, medium, hard, advanced, expert | Te same reguły i dokładne podstawienie do pochodnej |
| derivative-rational-point | medium, hard, advanced, expert | Dziedzina i reguła ilorazu; iloczyn/łańcuch w liczniku, niezerowy mianownik |
| derivative-tangent | medium, hard, advanced, expert | f(a), f′(a), y=mx+b; weryfikacja obu warunków stycznej |
| derivative-stationary | hard, advanced, expert | Kwadratowa, złożenie, sześcienna z dwoma ekstremami albo stacjonarnym punktem bez ekstremum |
| derivative-monotonicity | hard, advanced, expert | Dokładne zbiory f′>0 i f′<0; otwarte końce i podwójne zero pochodnej |
| derivative-economics | medium, hard, advanced, expert | Koszt/przychód krańcowy; zysk, iloczyn ceny i produkcji; złożony koszt i różnica pochodnych |
| derivative-profit-maximum | hard, advanced, expert | Maksimum wklęsłego zysku na 0≤q≤Q; wnętrze, zero i górny limit produkcji |

31 par po 24 warianty. Współczynniki podaje się od najwyższej opisanej potęgi do stałej (pole 1); zera są wymagane. Styczna ma pola m,b, maksimum q*,P(q*). q jest ciągłą wielkością rzeczywistą; pochodne krańcowe mają jednostkę pieniężną na jednostkę produkcji i nie są dokładnym przyrostem dla dodatkowej całej jednostki. Audyt niezależnie rozwija wielomiany przez splot i dwumian, kontroluje każdy pokazany wzór pochodnej oraz rachunek, znak w każdej komórce między zerami, warunki stycznej i certyfikat wklęsłości z uwzględnieniem końców przedziału.
