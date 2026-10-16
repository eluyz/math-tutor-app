# Produkt

Math Tutor pomaga dorosłym odbudować pewność w matematyce po długiej przerwie. Użytkownik ma móc zacząć bez konta, rozwiązać krótkie zadanie i otrzymać zrozumiałą informację zwrotną.

## MT-001

Prototyp obejmuje ekran startowy i trzy ćwiczenia: kolejność działań (`3 + 4 × 2`), liczby ujemne (`−7 + 12`) i podstawową algebrę (`2x + 3 = 11`). Odpowiedź jest liczbą. System pokazuje poprawny tok rozumowania po dobrej odpowiedzi oraz wskazówkę po błędnej. Dla kilku znanych pomyłek wskazówki są bardziej konkretne.

Ta wersja nie ocenia sposobu rozumowania użytkownika. Rozpoznaje jedynie wybrane błędne wyniki. Nie zawiera adaptacyjnego doboru ćwiczeń, zapisu postępów, backendu ani kont.

## MT-002

Katalog obejmuje 15 zadań w pięciu kategoriach, po trzy w każdej. Po błędnym wyniku aplikacja potwierdza, że odpowiedź nie jest matematycznie poprawna, i może przedstawić jedną lub więcej **możliwych** przyczyn. Gdy brakuje podstaw do przypisania rodzaju pomyłki, pokazuje „nieustalona przyczyna”. Nie stwierdza procesu myślenia na podstawie samego wyniku.

Podpowiedzi są odsłaniane stopniowo. W pięciu zadaniach użytkownik może dodatkowo sprawdzić pierwszy krok; poprawna i błędna odpowiedź pomocnicza prowadzą do innych wskazówek. Po poprawnym wyniku użytkownik widzi pełne wyjaśnienie i może przejść do następnego zadania. Odpowiedzi w postaci ułamków i równoważnych dokładnych liczb dziesiętnych są porównywane bez błędów zaokrągleń.

MT-002 nie zapisuje historii, nie dobiera adaptacyjnie ćwiczeń i nie rozpoznaje wszystkich możliwych przyczyn pomyłek. Taksonomię i ograniczenia opisuje [ERROR_TAXONOMY.md](ERROR_TAXONOMY.md).

## MT-003A

Zamiast wybierać wyłącznie z 15 niezmiennych przykładów, użytkownik ćwiczy 15 rodzin zadań w trzech ręcznie wybieranych poziomach. Może losować nowy wariant w wybranej kategorii lub rodzinie oraz przejść sesję 10 zadań z licznikiem postępu i ekranem zakończenia. W sesji można przejść dalej także bez poprawnej odpowiedzi; licznik oznacza zadania pokazane, a nie liczbę poprawnych rozwiązań.

Testy potwierdzają 647 różnych treści w dostępnych pulach. Nowe zadanie powstaje tylko po działaniu użytkownika; ponowna próba zachowuje bieżący wariant. Losowanie i dane odpowiedzi pozostają w pamięci przeglądarki. Reguły błędów wynikają z parametrów danego zadania i nadal przedstawiają jedynie hipotezy. Dotychczasowe 15 przykładów pozostaje przypadkami referencyjnymi testów regresyjnych. Dobór adaptacyjny i zapis postępów nie są częścią MT-003A.

## Zasady produktu

- Język ma być życzliwy i nie zawstydzać po pomyłce.
- Wyjaśnienia muszą być poprawne matematycznie i pokazywać kolejność kroków.
- Odpowiedzi użytkownika pozostają na urządzeniu.
- Interfejs musi działać na małym ekranie i z klawiaturą.
