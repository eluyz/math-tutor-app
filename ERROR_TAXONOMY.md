# Taksonomia typowych błędów — MT-002 i MT-003A

Każda reguła ma stabilny `errorCode`, `category`, `confidence`, polskie `explanation` i dydaktyczne `hint`. Reguła uruchamia się, gdy końcowa odpowiedź jest matematycznie niepoprawna i odpowiada znanemu wzorcowi wyniku. **Kod oznacza hipotezę o drodze do wyniku, a nie potwierdzenie procesu myślenia.** Wszystkie reguły oparte tylko na odpowiedzi końcowej mają `confidence: low`.

## Co jest ustalone, a co nie

| Sytuacja | Co aplikacja może stwierdzić | Czego nie może stwierdzić |
| --- | --- | --- |
| Poprawna odpowiedź | Wartość jest równa wynikowi zadania; pełne rozwiązanie można pokazać. | Czy użytkownik użył właściwej metody. |
| Błędna liczba | Wartość nie jest równa wynikowi zadania. | Który krok lub nawyk spowodował błąd. |
| Pasująca reguła | Wynik jest zgodny z jedną lub kilkoma znanymi pomyłkami. | Że którakolwiek z nich faktycznie wystąpiła. |
| Odpowiedź na pytanie pomocnicze | Wartość tego jednego kroku jest poprawna albo błędna. | Że sama odpowiedź wyjaśnia cały wcześniejszy tok rozumowania. |
| Brak pasującej reguły | `UNDETERMINED`, `confidence: none` i komunikat „nieustalona przyczyna”. | Konkretnej przyczyny. |
| Nieprawidłowe wejście, np. `1/0` | Wpis nie jest dopuszczalną odpowiedzią. | Czy użytkownik popełnił błąd matematyczny w rozwiązaniu. |

Jeśli kilka reguł pasuje do tej samej liczby, silnik zwraca wszystkie hipotezy i oznacza wynik jako niejednoznaczny. Nie wybiera pierwszej reguły arbitralnie. Wyjaśnienia używają zwrotów „Możliwe, że…”, a podpowiedzi proszą o sprawdzenie konkretnego działania.

## Reguły

| Obszar | Stabilne kody | Co może sygnalizować wynik |
| --- | --- | --- |
| Kolejność działań | `ORDER_LEFT_TO_RIGHT`, `ORDER_IGNORED_PARENTHESES`, `ORDER_SUBTRACTION_FIRST` | Liczenie od lewej, pominięcie nawiasu lub wykonanie odejmowania przed mnożeniem. |
| Liczby dodatnie i ujemne | `SIGNED_WRONG_DIRECTION`, `SIGNED_ADDED_MAGNITUDES`, `SIGNED_DOUBLE_MINUS`, `SIGNED_PRODUCT_SIGN` | Zły kierunek na osi, dodanie wartości bezwzględnych, błąd przy dwóch minusach lub znaku iloczynu. |
| Ułamki | `FRACTION_ADD_DENOMINATORS`, `FRACTION_SUBTRACT_DENOMINATORS`, `FRACTION_ADDED_INSTEAD` | Działanie osobno na mianownikach lub dodawanie zamiast mnożenia. |
| Podstawy algebry | `ALGEBRA_PARTIAL_DISTRIBUTION`, `ALGEBRA_FORGOT_SUBSTITUTION`, `ALGEBRA_SQUARE_AS_DOUBLE`, `ALGEBRA_COEFFICIENT_IGNORED`, `ALGEBRA_MISSING_X` | Pominięcie części nawiasu, podstawienia, znaczenia kwadratu lub współczynnika. |
| Równania liniowe | `EQUATION_STOPPED_AT_2X`, `EQUATION_STOPPED_AT_3X`, `EQUATION_WRONG_INVERSE`, `EQUATION_STOPPED_AT_HALF_X`, `EQUATION_DIVIDED_AGAIN` | Zatrzymanie na wartości wyrażenia z x albo użycie niewłaściwego działania odwrotnego. |

Przykład niejednoznaczności: dla `x² + 2x`, gdy `x = 3`, poprawny wynik to `15`. Odpowiedź `12` może powstać przez policzenie `x²` jako `2x` (`6 + 6`) albo przez pominięcie współczynnika w `2x` (`9 + 3`). Aplikacja pokazuje obie możliwości z niską pewnością. Pytanie „Ile wynosi x² dla x = 3?” daje dalszą wskazówkę zależną od odpowiedzi, ale nie zamienia hipotezy w pewną diagnozę.

Przykład nierozpoznanej przyczyny: dla `3 + 4 × 2` odpowiedź `10` jest niepoprawna, lecz nie pasuje do żadnej reguły. Silnik zwraca `UNDETERMINED` i ogólną wskazówkę. Poprawny wynik `11` prowadzi do pełnego wyjaśnienia: najpierw `4 × 2 = 8`, potem `3 + 8 = 11`.

## Granice rozpoznawania

W MT-003A reguły dla wygenerowanych instancji powstają z bieżących parametrów. Dla `a + b × c` wynik `(a + b) × c` może uruchomić `ORDER_LEFT_TO_RIGHT`, o ile nie jest jednocześnie wynikiem poprawnym. Dla `x² + kx` różne hipotezy mogą prowadzić do tego samego wyniku; aplikacja wyświetla je razem z `confidence: low`. Reguły po kolizji z poprawną odpowiedzią są odrzucane. Rodziny bez wiarygodnego dopasowania zwracają `UNDETERMINED` i ogólną wskazówkę. Kody z powyższej tabeli opisują 15 przykładów referencyjnych; generator używa części tych kodów i nowych kodów takich jak `EQUATION_STOPPED_AT_AX` lub `EQUATION_STOPPED_AT_QUOTIENT`.

Reguły nie analizują zapisu kroków użytkownika i nie uczą się z danych. Nie służą do oceniania zdolności ani diagnozowania przyczyn edukacyjnych. Dokładne porównanie ułamków nie używa tolerancji: `3/4` i `0,75` są równoważne, ale skończony zapis `0,3333333333` nie jest dokładnie równy `1/3`. Odpowiedzi nie opuszczają przeglądarki.

## MT-DIAG-001 — prezentacja hipotez, sprawdzanie kroku i powtórka

Przycisk „Znajdź mój błąd” uruchamia analizę **na żądanie** po błędnej głównej odpowiedzi albo dopiero po oddaniu sprawdzianu. Silnik korzysta z tych samych reguł `checkAnswer`; nie zmienia ich znaczenia ani nie zgłasza hipotetycznych pomyłek jako zaobserwowanych. `possible` oznacza symulowany wzorzec wyniku (wraz ze wszystkimi kolidującymi wzorcami), `unknown` — brak przesłanek, `confirmed` — wyłącznie sprawdzony brak `+C` przy zgodnych współczynnikach.

Dla zadań posiadających autorskie `exercise.step` sprawdzenie wartości przez `checkStep` zwraca `correct`, `incorrect` lub `invalid`. Nowy, niezależny moduł `probeFor` sprawdza również wybrane **jednoznacznie określone** kroki: ad z det 2×2, pierwszy dodatni iloczyn Sarrusa, (AB)₁₁, wyznacznik główny Cramera 2×2/3×3 oraz minor M₁ⱼ Laplace’a 4×4/5×5. Używa dokładnej arytmetyki wymiernej. Tylko `incorrect` potwierdza błędną wartość tego **wpisanego** kroku; nie przypisujemy bez dowodów konkretnej przyczyny ani nie zgadujemy innych niewpisanych kroków. Nie jest to pełna diagnoza metod użytkownika.

Powtórka losuje trzy różne treści w dokładnie tej samej rodzinie i na tym samym poziomie (wykluczając zadanie wyjściowe). Próby są sprawdzane dokładnym wspólnym parserem; niekompletny/zły składniowo zapis nie liczy się jako ważna pierwsza próba. Po prawidłowej lub nieprawidłowej ważnej próbie można poznać rozwiązanie i przejść do następnego zadania. Powtórka nie aktualizuje oceny oryginalnego zadania, postępów i historii sprawdzianu. Informacje istnieją wyłącznie w pamięci karty.
