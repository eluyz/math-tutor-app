# Generatory zadań — MT-003A

`src/generators.ts` dostarcza 15 parametrycznych rodzin po trzy w każdej kategorii. Rodzina (`Template`) ma stabilne `id`, kategorię, tytuł, zakresy `parameterSets` dla poziomów `easy`, `medium`, `hard` i czystą funkcję `create(parameters)`. Funkcja zwraca treść, dokładną odpowiedź, wyjaśnienie, dwie wskazówki, opcjonalne pytanie o pierwszy krok i opcjonalne reguły typowych błędów. Komponent React otrzymuje gotowe `GeneratedExercise` i nadal używa `checkAnswer` oraz `checkStep` z MT-002.

## Rodziny i ograniczenia

| Kategoria | Rodziny | Dobór parametrów |
| --- | --- | --- |
| Kolejność działań | `order-add-product`, `order-subtract-product`, `order-parentheses` | Dodatnie całkowite; nawias albo pierwszeństwo mnożenia. Trudniejsze zakresy obejmują wynik ujemny przy odejmowaniu. |
| Liczby dodatnie i ujemne | `signed-add`, `signed-subtract-negative`, `signed-product` | Dodawanie różnych znaków, podwójny minus oraz od jednego do trzech czynników w zależności od poziomu. |
| Ułamki | `fraction-add`, `fraction-subtract`, `fraction-product` | Dodatnie, niezerowe mianowniki; na wyższych poziomach różne mianowniki i możliwy wynik ujemny. |
| Algebra | `algebra-substitute`, `algebra-like-terms`, `algebra-distribute` | Wartość x i współczynniki dobrane tak, by pytanie było jednoznaczne; poziom trudny obejmuje ujemne x. |
| Równania | `equation-add`, `equation-subtract`, `equation-fraction` | Najpierw wybierane jest rozwiązanie x, potem współczynniki i prawa strona. `equation-fraction` ma niezerowy dzielnik, a na wyższych poziomach wymaga także pracy z ułamkową prawą stroną. |

Trudność zmienia nie tylko wielkość liczb: dochodzą różne mianowniki, ujemne wyniki, dodatkowy czynnik lub ułamkowa prawa strona. Parametry są skończonymi listami; `makeInstance` odrzuca wartości spoza list. Obliczenia ułamkowe używają `rational()` i operacji na `bigint`, bez tolerancji i `eval`. Poziom może wybrać użytkownik; nie ma automatycznej adaptacji.

## Instancje, losowanie i powtórki

Każda instancja zawiera `templateId`, numeryczne `parameters`, stabilne `id` wynikające z szablonu i parametrów, `difficulty` oraz `contentKey` wyprowadzony z widocznej, kanonicznie spacjowanej treści. `pool(category, difficulty)` tworzy wszystkie kombinacje dopuszczalnych parametrów i usuwa identyczne treści. `createGenerator(seed)` używa deterministycznego `xorshift32`; przy każdym `next(category, difficulty, templateId?)` wybiera spośród treści jeszcze niewidzianych w danej sesji. Przy wyczerpaniu puli usuwa jej klucze z pamięci, zwraca `repeated: true` i rozpoczyna nowy cykl. Nie ma nieograniczonego losowania próbnego ani pętli czekającej na unikat. Seed jest parametrem modułu do testów; interfejs tworzy go z czasu podczas rozpoczęcia sesji.

Test `src/generators.test.ts` enumeruje wszystkie pule, niezależnie liczy odpowiedzi i etapy oraz sprawdza reguły, parametry i osiem ustalonych seedów. Potwierdza **647 unikalnych treści** w pełnym zbiorze i **557 unikalnych treści** w próbie z ośmiu seedów. Zachowane 15 przykładów w `src/locales/pl.ts` pozostaje regresją MT-002, nie jest źródłem losowania w interfejsie.

## Jak dodać nową rodzinę

1. Dodaj wpis `Template` z unikalnym `id`, kategorią i trzema zestawami dozwolonych parametrów; nie umieszczaj zera w polu dzielnika.
2. Napisz czystą funkcję `create`, która oblicza odpowiedź jako `Rational` i składa treść, wyjaśnienie, wskazówki oraz ewentualny etap pomocniczy z tych samych parametrów. Treść musi jednoznacznie określać zadanie.
3. Regułę błędu twórz z błędnego obliczenia dla bieżących parametrów. `possible()` pomija regułę, gdy jej wynik jest poprawną odpowiedzią. Komunikat ma pozostać hipotezą z niską pewnością.
4. Dodaj niezależny wzór do audytu w `src/generators.test.ts`, sprawdź etap pomocniczy i liczbę unikalnych treści. Przetestuj też warianty na telefonie i komputerze, jeśli nowa treść jest długa.

W przyszłości teksty rodzin należy przenieść do katalogu językowego przy dodawaniu angielskiego. Sesja i pamięć powtórek nie są zapisywane po odświeżeniu strony; historię przewiduje MT-004.
