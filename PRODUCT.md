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

## MT-003A.1 i MT-003B.1

MT-003A.1 zachowuje rodzinę i poziom w swobodnym ćwiczeniu przy „Nowy przykład” i „Następny przykład”; ręczna zmiana poziomu zachowuje rodzinę. Sesje nadal mieszają rodziny w wybranej kategorii.

MT-003B.1 dodaje podsumowanie 10 zadań i opcjonalną sugestię poziomu na następną sesję. Dla każdego zadania zapisuje tylko pierwszą ważną ocenę głównej odpowiedzi. Nieważne zapisy są pomijane, a ponowienia, podpowiedzi i poprawienie błędu nie zmieniają pierwszej oceny. Przejście dalej bez ważnej oceny oznacza pominięcie. Podsumowanie opisuje te zdarzenia, a nie wiedzę lub przyczyny błędów użytkownika.

Potrzeba co najmniej 7 ważnych pierwszych prób. Przy 8–10 poprawnych z 10 proponowany jest jeden poziom wyżej, przy 0–4 jeden niżej, przy 5–7 obecny, w granicach łatwy–trudny. Przy mniejszej liczbie ważnych prób aplikacja wyjaśnia brak danych i umożliwia powtórzenie obecnego poziomu. Użytkownik musi świadomie zaakceptować sugestię, aby rozpocząć nową sesję; może też pozostać przy obecnym poziomie lub wybrać inny ręcznie. Nowa sesja resetuje statystyki.

To pierwszy ograniczony etap adaptacji, nie pełny adaptacyjny dobór rodzin. Poziom nie zmienia się w trakcie sesji. W samym MT-003B.1 nie było trwałej historii; MT-004A dodaje zapis ukończeń, zachowując bieżącą sesję w pamięci. Nadal nie ma backendu, kont ani zewnętrznych żądań. Podsumowanie otrzymuje fokus i ma opisane wartości dostępne dla czytników ekranu oraz czytelne na telefonie.

## MT-EDU-001 — autorski pakiet od algebry do macierzy

Oferta zachowuje pięć dotychczasowych kategorii i rozszerza je do 35 rodzin w dwóch działach: „Powtórka podstaw” oraz „Matematyka na studia”. Nowe kategorie to wzory i równania kwadratowe, macierze oraz wyznaczniki. Cztery rodziny powtórkowe ćwiczą minusy i nawiasy, jednomiany i potęgi, współczynniki iloczynu nawiasów oraz równania z ułamkiem. Sześć rodzin kwadratowych obejmuje trzy wzory, deltę, jej interpretację i rozwiązywanie dla wszystkich trzech znaków delty.

Siedem rodzin macierzowych uczy wymiaru, indeksów od 1, dodawania, odejmowania, skalowania, transpozycji prostokątnej i iloczynu AB z przykładami nieprzemienności. Użytkownik wpisuje całe macierze wynikowe do 3×3. Trzy rodziny wyznaczników obejmują ad−bc, sześć iloczynów Sarrusa i zerowy wiersz. Obliczenia są dokładne, także dla ułamków, minusów i zera.

Przed odpowiedzią dostępna jest wskazówka „Jak zacząć”; po błędzie stopniowe podpowiedzi, po poprawnej odpowiedzi pełne kroki. Formularz nie podaje z góry liczby pierwiastków: użytkownik sam wybiera przypadek, a następnie wpisuje wartości, bez znaczenia kolejności. Niekompletny lub niepoprawnie zapisany formularz jest nieważną próbą. Te same wyniki correct/incorrect/invalid sterują dotychczasowymi statystykami i sugestią poziomu sesji.

To samodzielnie opracowane materiały do nauki, nie oficjalny kurs UWM ani ocena umiejętności. Nowe rodziny bez uzasadnionej reguły pokazują neutralną nieustaloną przyczynę. Zachowano tryb swobodny w jednej rodzinie, sesje i reset formularzy. Nie ma backendu, trwałego zapisu, nowych zależności, zaokrąglania wyników ani swobodnego parsera wyrażeń. Viète, macierz odwrotna, Cramer i analiza matematyczna pozostają poza tym pakietem.

## MT-EDU-002A — brudnopis i dostępne rozwiązania

Panel zadania ma brudnopis Rysuj/Pisz z niezależnymi treściami, symbolami w miejscu kursora, gumką całych śladów, ograniczoną historią, odwracalnym ręcznym czyszczeniem i powiększeniem. Domyślne automatyczne czyszczenie można wyłączyć na czas pracy w karcie, także między sesjami. Automatyczny reset usuwa historię poprzedniego zadania; błędne próby, wskazówki, podgląd, zmiana trybu i rozmiaru nie usuwają notatek.

Każda z 35 rodzin ma rzeczywiste, deterministyczne rozwiązanie: działanie i powód każdego kroku, a na końcu pełną odpowiedź. Przycisk jest dostępny przed oceną; kolejne etapy można odsłaniać osobno lub naraz. Podgląd przed pierwszą ważną oceną jest osobną kategorią sesji, nie sukcesem, błędem ani pominięciem. Nie zmienia wcześniejszej ważnej oceny. Do sugestii poziomu liczą się tylko samodzielnie sprawdzone odpowiedzi; dotychczasowe minimum i progi pozostają takie same.

Notatki nie są interpretowane ani wysyłane; odświeżenie usuwa je wraz z ustawieniem czyszczenia. Szablony matematyczne, eksport, rozpoznawanie pisma i trwała historia pozostają poza V1. Chromium jest automatycznie testowany na 375/768/1280 px; Safari iPad/iPhone wymaga osobnego testu ręcznego na urządzeniu.

## Zasady produktu

- Język ma być życzliwy i nie zawstydzać po pomyłce.
- Wyjaśnienia muszą być poprawne matematycznie i pokazywać kolejność kroków.
- Odpowiedzi użytkownika pozostają na urządzeniu.
- Interfejs musi działać na małym ekranie i z klawiaturą.

## MT-EDU-003 — pięć poziomów oraz pełny proces PL/EN (scalone i opublikowane)

Pięć poziomów to Łatwy/Easy, Średni/Medium, Trudny/Hard, Zaawansowany/Advanced i Ekspert/Expert. Dwa wyższe w 29 rodzinach łączą techniki zamiast zwiększać wyłącznie liczby: ułamkowe działania z nawiasami, przekształcenia dwustronne, kilka nawiasów przed deltą, wieloetapowe wyrażenia macierzowe i wyznaczniki. Wszystkie osiem kategorii ma oba poziomy. Sześć czynności elementarnych pozostaje jawnie ograniczone do trzech niższych. Pełna mapa i 3501 instancji są opisane oraz audytowane w GENERATORS.md.

Cała nauka działa po polsku i angielsku: wybór, treść, typowane odpowiedzi, pomoc i diagnoza, uzasadnione etapy, brudnopis oraz sesje. Przełącznik w nagłówku zmienia tylko prezentację, zachowując to samo zadanie i stan pracy. Domyślny PL i preferencja języka istnieją wyłącznie w pamięci. Tekst użytkownika pozostaje jego tekstem, bez tłumaczenia, rozpoznawania pisma lub wysyłania.

Historyczne przykłady pozostają, a 17 jawnych uzupełnień zapewnia minimum 10 dla małych pul. Rekomendacje obejmują pięć dostępnych poziomów w kategorii z niezmienionymi zasadami samodzielności i progami. Publikacja pozostaje osobną decyzją po CI, niezależnej recenzji i zgodzie użytkownika.

## MT-004A — historia pracy i składany brudnopis (scalone i opublikowane w PR #15)

„Moje postępy / My progress” zachowuje do 200 ukończonych sesji na danym urządzeniu i w danej przeglądarce. Pokazuje liczbę sesji, samodzielnych poprawnych i błędnych pierwszych ocen, podglądów przed oceną i pominięć, według kategorii i poziomów oraz w ostatnich sesjach. Kategorie i poziomy pozostają wspólne dla PL/EN. Filtry obejmują kategorię, poziom i wszystkie/ostatnie 30 dni. Procent zawsze ma mianownik samodzielnie ocenionych zadań; brak takich ocen nie staje się wynikiem 0%. Mała liczba ocen jest jawnie oznaczona, bez diagnozowania poziomu wiedzy, streaków ani nowych rekomendacji.

Zapis następuje tylko po zakończeniu sesji. Utrwalane są anonimowe ID sesji, czas, kategoria, trudność, liczniki oraz rodzina i pierwszy rezultat każdego z 10 zadań. Nie zapisujemy odpowiedzi, brudnopisu, aktywnego zadania, niedokończonej sesji ani języka. Zmiana języka i nawigacja pulpit ↔ ćwiczenia zachowują pracę w bieżącej karcie. Odświeżenie przywraca jedynie historię ukończeń.

Użytkownik może wyeksportować całą dostępną historię do JSON oraz usunąć ją po potwierdzeniu. Dane nie synchronizują się; wyczyszczenie przeglądarki może je bezpowrotnie usunąć. Przy niedostępnym storage nauka trwa w pamięci z komunikatem. Nieznana wersja lub uszkodzony zapis nie jest nadpisywany. Nieudane kasowanie nie jest pokazywane jako sukces.

Układ zadania to: treść i dane → niewielki pasek brudnopisu → odpowiedź → Sprawdź. Brudnopis domyślnie jest zwinięty. Pokazanie/schowanie nie odmontowuje edytora, nie zmienia zaznaczenia, trybu, tekstu, rysunków ani Undo/Redo. Auto-clear nadal działa wyłącznie na granicy nowego uruchomienia zadania, według checkboxa. Powiększenie, symbole i obsługa dotyku pozostają. Schowanie powiększenia zwalnia fokus i przewijanie.

Import, synchronizacja urządzeń, utrwalanie niedokończonych sesji lub notatek, adaptacyjna powtórka i nowe działy są poza tym PR. Ręczna kontrola fizycznego Safari, zielone CI, recenzja Work i zgoda użytkownika pozostają bramkami przed merge.

## MT-EDU-004 — P0–P3: układy, funkcje i granice ciągów (scalone i opublikowane w PR #17)

Zakres dodaje 16 rodzin i 1728 wariantów, zachowując 3501 wcześniejszych instancji. Łącznie jest 51 rodzin w 11 kategoriach. Każda nowa deklarowana para rodzina/poziom ma 24 różne treści z pełną prezentacją PL/EN. Dostępne poziomy są jawne: klasyfikacja układów i monotoniczność liniowej pozostają na 1–3, Cramer 3×3 zaczyna od hard, pozostałe rodziny wspierają pięć poziomów oprócz złożeń zaczynających od medium.

Układy uczą podstawiania, eliminacji, rzędu i klasyfikacji oraz Cramera 2×2/3×3. Wyższe poziomy wymagają redukcji nawiasów i odwrócenia pomocniczych niewiadomych. Wszystkie wyniki są dokładne i sprawdzane we wszystkich oryginalnych równaniach. Wybór jednego rozwiązania wymaga wszystkich wartości; pozostałe klasy nie wymagają fikcyjnych x/y.

Funkcje obejmują wartości, dziedzinę, miejsca zerowe z wykluczeniami, współczynniki liniowej z punktów i złożeń, monotoniczność, wierzchołek i oś symetrii, osiągany koniec zbioru wartości i złożenia. Nie przywracamy dziury w dziedzinie po skróceniu czynnika. Przedziały mają jawnie otwarte/zamknięte końce; formularz zer nie zdradza ich liczby.

Granice ciągów wynikają z dokładnych potęg, współczynników, sprzężenia i podciągów. Odpowiedź rozróżnia liczbę, +∞, −∞ i brak granicy. Oscylacje nie stają się nieskończonością; postać różnicy rosnących wyrażeń wymaga przekształcenia. Wyjaśnienia opisują dominację, nie przybliżenia dla kilku indeksów.

P0 ustawia Powiększ/Expand przed Schowaj/Hide w DOM, Tab i układzie. Brudnopis pozostaje domyślnie zwinięty. Zachowuje edytor, zaznaczenie, treści, rysunki, historię, auto-clear, pełny ekran, fokus i scroll. Scoring, podgląd przed oceną oraz lokalne postępy pozostają zgodne z wcześniejszym produktem. Nie dodano backendu, telemetrii ani usług tłumaczeniowych.

Historyczny PR #17 obejmował wyłącznie P0–P3 i został scalony oraz opublikowany. Granice funkcji i pochodne rozwija odrębne MT-EDU-005; całki i dwie zmienne pozostają przyszłe. Każda nowa zmiana nadal wymaga własnego CI, recenzji i zgody na merge/publikację. Fizyczny Safari wymaga osobnego testu ręcznego.

## MT-EDU-005 — dwa działy rachunku różniczkowego

P0 dodaje 3 rodziny granic funkcji: punkt/jednostronne, nieskończoność i sprzężenia. P1 dodaje 9 rodzin pochodnych: wzór, wartość w punkcie, iloraz w punkcie, styczna, punkty stacjonarne, klasyfikacja ekstremów, monotoniczność, wielkości krańcowe i maksimum zysku. Razem 1152 nowych wariantów, 63 rodziny i 6381 instancji w całej aplikacji. Wszystkie 5229 starych lekcji pozostają identyczne. Rodziny mają uczciwie ograniczone poziomy i po 24 odrębne warianty każdej wspieranej pary.

Osoba wracająca do nauki otrzymuje wskazówkę pierwszego działania oraz uzasadnienie każdego etapu. 0/0 jest postacią nieoznaczoną, nie wynikiem; funkcja nie otrzymuje wartości w usuniętej dziurze przez samo skracanie. Nierówne granice jednostronne dają brak granicy obustronnej. Pierwiastki analizujemy w dodatnim otoczeniu punktu, a nieskończoność przez stopnie, parzystość i znaki. Nie zastępujemy dowodu próbkami numerycznymi.

Wzór pochodnej ma nazwane pola wszystkich współczynników, ze stałą oznaczoną 1. Styczna wymaga m,b, punkt stacjonarny wszystkich uporządkowanych współrzędnych, a zbiory znaków pochodnej kontrolowanego wyboru. Zerowa pochodna bez zmiany znaku nie jest nazywana ekstremum. Zadania krańcowe podają jednostki i różnicę między chwilowym tempem a dokładnym przyrostem. Maksimum zysku uwzględnia 0≤q≤Q dla ciągłej rzeczywistej produkcji, końce przedziału i możliwość straty.

Pełne PL/EN, sesje, pierwsza ważna samodzielna ocena, pominięcia i podglądy, historia oraz składany brudnopis korzystają z tych samych mechanizmów co dotąd. Nie ma backendu, telemetrii, kont, nowych zależności ani parsera dowolnych napisów matematycznych. Całki, wiele zmiennych i egzamin próbny są poza MT-EDU-005.
