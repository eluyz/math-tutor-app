# Generatory zadań — MT-003A i MT-EDU-001

UI i sesje używają `allTemplates` oraz `taskPool`: 35 rodzin na poziomach easy/medium/hard. Dotychczasowe `templates` i `pool` zachowują 15 rodzin skalarnych w pięciu kategoriach do niezależnych regresji. `createGenerator(seed).next(category, difficulty, templateId?)` wybiera wyłącznie niewidzianą treść z odpowiedniego zakresu. Po wyczerpaniu usuwa klucze tej puli z pamięci, zwraca `repeated: true` i zaczyna nowy cykl. Nie ma losowania w pętli do skutku. Stan znika po odświeżeniu.

## Pierwotne rodziny

| Kategoria | Rodziny |
| --- | --- |
| Kolejność działań | `order-add-product`, `order-subtract-product`, `order-parentheses` |
| Liczby dodatnie i ujemne | `signed-add`, `signed-subtract-negative`, `signed-product` |
| Ułamki | `fraction-add`, `fraction-subtract`, `fraction-product` |
| Algebra | `algebra-substitute`, `algebra-like-terms`, `algebra-distribute` |
| Równania | `equation-add`, `equation-subtract`, `equation-fraction` |

Pierwotny `Template` ma zakresy `parameterSets` i czyste `create(parameters)`. `makeInstance` waliduje parametry. `pool` tworzy skończone kombinacje i deduplikuje treści. Zachowano dokładne ułamki, kroki pomocnicze i niskopewne hipotezy z MT-002; `possible()` odrzuca kolizję błędnej odpowiedzi z poprawnym wynikiem. Wyższe poziomy dodają m.in. znaki ujemne, różne mianowniki i kolejne czynniki.

`src/generators.test.ts` nadal audytuje 647 różnych treści tych 15 rodzin, ich odpowiedzi, kroki i reguły. Dawna próba z ośmiu seedów dawała 557 treści; aktualne losowanie obejmuje także EDU i ma osobną kontrolę unikalności. Piętnaście stałych przykładów w `src/locales/pl.ts` pozostaje katalogiem referencyjnym, nie źródłem losowania w UI.

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

`EducationTemplate.create(variant, difficulty)` otrzymuje jeden indeks 0–23. Pola macierzy są pochodnymi tego indeksu i małych wartości, a nie iloczynem dziewięciu niezależnych list. Jedna rodzina ma maksymalnie 24 kandydatów na poziom; 20 rodzin to najwyżej 1440 kandydatów na wszystkich poziomach (łącznie z pierwotnymi pulami najwyżej 2087 instancji). Testy wymagają co najmniej 10 różnych treści na rodzinę/poziom. Pule są buforowane; `makeEducationInstance` odrzuca indeksy spoza zakresu.

`contentKey` nowych zadań obejmuje pytanie i dane pokazanych macierzy, więc stałe polecenie „Oblicz A + B” z innymi macierzami jest nową treścią. `id` obejmuje rodzinę, poziom i indeks. To pozwala zachować pamięć treści oraz indywidualne oceny sesji.

Łatwe zadania macierzowe mają małe liczby całkowite; wyższe poziomy wprowadzają wymiary prostokątne i dokładne ułamki. Siatka jest najwyżej 3×3. Wyznaczniki są wyłącznie 2×2 i 3×3; Sarrus nie jest uogólniany na większe macierze. Przypadki Δ≥0 konstruujemy z wymiernych pierwiastków i całkowitych współczynników. Dla Δ<0 nie żądamy pozornych przybliżeń rzeczywistych.

`TypedExercise` ma `AnswerSpec`: scalar, list, matrix, choice albo roots (kontrolowany wybór przypadku i lista wartości). Formularz roots nie ujawnia oczekiwanej liczby pierwiastków. Współczynniki są uporządkowane; pierwiastki porównywane jako wielozbiór. Niekompletne lub źle zapisane pola dają invalid; kompletna zła wartość daje incorrect. Wspólne statusy zachowują pierwsze próby i sugestie MT-003B.1. Nowe rodziny nie wymyślają przyczyn błędów: domyślnie mają puste reguły i neutralną diagnozę.

### Audyt i dodawanie treści

`src/education/catalog.test.ts` niezależnie przelicza wszystkie warianty i poziomy: współczynniki, tożsamości wielomianowe, podstawienia do równań, deltę, dokładne pierwiastki i każdą komórkę działań macierzowych. Wyznaczniki 3×3 są sprawdzane przez rekurencyjny Laplace, a nie ponowne użycie Sarrusa. Testy obejmują znaki i zero, nieprzemienność, błędne i niekompletne odpowiedzi, odwrotną kolejność pierwiastków, skończone pule i powtórki. `matrices.test.ts` osobno testuje operacje i niewykonalne wymiary; `answers.test.ts` wspólne statusy oraz sesje. Playwright sprawdza rzeczywiste interakcje na telefonie i komputerze.

Nową rodzinę edukacyjną dodaj do odpowiedniego modułu `education/`, wybierz precyzyjny typ odpowiedzi, zdefiniuj skończony zakres wariantu i własne wyjaśnienia krokowe. Dodaj niezależny rachunek w audycie oraz test UI, jeśli zmienia się sposób odpowiedzi. Nie zwiększaj liczby niezależnych parametrów pól macierzy. Stare skalarne rodziny można nadal rozszerzać przez `Template`, ale każda zmiana wymaga odpowiedniego niezależnego audytu.

Bez `eval`, zaokrąglania, dowolnego parsera symbolicznego, Viète'a, macierzy odwrotnej, Cramera i analizy matematycznej w obecnym zakresie. Trwała historia to MT-004. Przy przyszłym tłumaczeniu teksty rodzin należy przenieść do katalogów językowych.
