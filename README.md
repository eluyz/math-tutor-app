# Math Tutor

Otwarta aplikacja do samodzielnej nauki matematyki dla dorosłych wracających do nauki po przerwie. Zawiera 35 parametrycznych rodzin: dotychczasowe pięć kategorii podstaw oraz wzory i równania kwadratowe, macierze i wyznaczniki. Działy **Powtórka podstaw** i **Matematyka na studia** porządkują ofertę na telefonie i komputerze. Materiały są autorskie; nie są oficjalnymi materiałami ani pełnym programem UWM.

## Uruchomienie

Wymagany Node.js 22.12+ i npm. W katalogu repozytorium:

```sh
npm ci
npm run dev
```

Otwórz adres podany przez Vite (ścieżka `/math-tutor-app/`). W Codex Cloud, jeśli katalog domowy jest tylko do odczytu, użyj `npm_config_cache=/tmp/math-tutor-npm npm ci`.

## Weryfikacja

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

W Codex Cloud dostępny jest systemowy Chromium. Testy interfejsu można uruchomić bez pobierania przeglądarki: `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e`.

Build zapisuje statyczne pliki w `dist/`. `base` Vite jest ustawione na `/math-tutor-app/`, czyli ścieżkę projektu na GitHub Pages.

## Jak działają ćwiczenia

Wybierz kategorię, poziom (łatwy, średni, trudny) i rodzinę. **Nowy przykład** oraz dostępny po poprawnej odpowiedzi **Następny przykład** losują kolejną treść z tej samej rodziny na bieżącym poziomie. Zmiana poziomu również zachowuje rodzinę; inny rodzaj zadania wybierzesz na liście rodzin lub przez zmianę kategorii. Każda zmiana przykładu czyści odpowiedź, ocenę, wskazówki i pytanie pomocnicze. Jeśli nic jeszcze nie wybrano, **Nowy przykład** rozpoczyna ćwiczenie w bieżącej kategorii.

**Rozpocznij sesję (10 zadań)** uruchamia serię mieszającą rodziny w wybranym temacie i na wybranym poziomie; **Następne zadanie** przechodzi dalej także wtedy, gdy chcesz pominąć bieżący wariant. Licznik pokazuje numer zadania, a po dziesiątym pojawia się komunikat o zakończeniu. Przełączenie rodziny, poziomu lub kategorii podczas sesji jest zablokowane. Losowanie nie powtarza identycznej treści, dopóki pula wybranego zakresu się nie wyczerpie; po wyczerpaniu pojawia się komunikat o wznowieniu puli.

### Podsumowanie sesji — MT-003B.1

Po dziesiątym zadaniu zobaczysz liczbę pokazanych zadań, poprawnych pierwszych ważnych prób, zadań z błędną pierwszą próbą oraz pominięć bez ważnej oceny. Liczy się wyłącznie pierwsza sprawdzona odpowiedź o statusie poprawnym lub niepoprawnym. Puste i nieprawidłowe zapisy nie są ważną próbą. Powtarzanie sprawdzenia, edycja, podpowiedzi i późniejsza poprawa błędu nie zmieniają pierwszej oceny; samo wpisanie odpowiedzi bez sprawdzenia nie jest próbą.

Sugestia poziomu wymaga ważnej pierwszej próby w co najmniej 7 z 10 zadań. Przy mniejszej liczbie pojawia się „Za mało danych do sugestii poziomu” i możliwość powtórzenia obecnego poziomu. Przy wystarczających danych 8–10 poprawnych pierwszych prób sugeruje jeden poziom wyżej, 0–4 jeden poziom niżej, a 5–7 powtórzenie obecnego. Sugestia pozostaje w granicach łatwy–trudny; progi odnoszą się do wszystkich 10 zadań, nie tylko ocenionych.

To prosty wskaźnik jednej sesji, nie diagnoza umiejętności ani pełny system adaptacyjnego doboru rodzin. Poziom i kategoria nie zmieniają się samoczynnie. Dopiero **Rozpocznij kolejną sesję na sugerowanym poziomie** rozpoczyna nową serię na proponowanym poziomie i resetuje statystyki. Możesz też zostać przy obecnym poziomie, wybrać inny ręcznie lub wrócić do swobodnego ćwiczenia. Dane pozostają tylko w pamięci aplikacji; odświeżenie je usuwa.

### Odpowiedzi i wskazówki

MT-EDU-001 dodaje 20 rodzin: minus przed nawiasem, jednomiany i wykładniki, iloczyn nawiasów, przekształcenia równań z ułamkiem; kwadrat sumy i różnicy, różnicę kwadratów, deltę i równania kwadratowe; wymiar i odczyt elementu macierzy, dodawanie, odejmowanie, skalar, transpozycję i mnożenie; wyznaczniki 2×2, Sarrusa dla 3×3 i własność zerowego wiersza. Każda rodzina ma poziomy łatwy/średni/trudny oraz dyskretną wskazówkę „Jak zacząć” przed odpowiedzią. Pełne kroki i wynik pojawiają się po poprawnej ocenie.

Format odpowiedzi zależy od pytania: liczba/ułamek, opisane pola współczynników, pełna macierz w siatce do 3×3 albo kontrolowany wybór. W równaniu kwadratowym samodzielnie wybierz liczbę pierwiastków rzeczywistych i, gdy istnieją, wpisz ich dokładne wartości. Kolejność dwóch pierwiastków jest dowolna. Nie wymagamy zaokrągleń: generowane rzeczywiste pierwiastki są wymierne. Niepełny formularz jest nieważną odpowiedzią, więc nie zużywa pierwszej ważnej próby w sesji. Zmiana przykładu czyści wszystkie pola, wybory, wskazówki i ocenę. Pola macierzy są opisane wierszem i kolumną, licząc od 1; Tab przechodzi przez nie wierszami.

Wpisz liczbę lub ułamek `a/b`. Możesz użyć minusa `-` lub `−` także w liczniku i mianowniku. Przy ułamkach można też użyć dokładnie równoważnego zapisu dziesiętnego, np. `3/4`, `0.75` i `0,75` są uznawane za tę samą wartość. `0.3333333333` nie jest dokładnie równe `1/3`. Dzielenie przez zero, zbyt długie i nieprawidłowe wejście są odrzucane.

Po błędnej odpowiedzi zobaczysz wstępną wskazówkę oraz ewentualną **hipotezę** o typie pomyłki. Kolejną wskazówkę możesz odsłonić samodzielnie. Sześć rodzin oferuje dodatkowe pytanie o pierwszy krok rozwiązania; odpowiedź na nie zmienia następną podpowiedź, ale nie ustala przyczyny wcześniejszego błędu. Zmiana odpowiedzi głównej usuwa ocenę i wskazówki poprzedniej próby. Pełne rozwiązanie jest pokazywane po poprawnej odpowiedzi. Próbując ponownie, pracujesz nad tym samym zadaniem.

Niepoprawność wyniku jest matematycznie potwierdzona. Przyczyna błędu pozostaje przypuszczeniem opartym na końcowej odpowiedzi. Gdy kilka pomyłek daje ten sam wynik, aplikacja pokazuje wszystkie pasujące możliwości; gdy żadna reguła nie pasuje, wyświetla „nieustalona przyczyna”. Szczegóły opisuje [ERROR_TAXONOMY.md](ERROR_TAXONOMY.md).

Automatyczny audyt zachowuje **647 różnych treści** pierwotnych 15 rodzin oraz 557 treści w dawnej próbie z ośmiu seedów. Nowe 20 rodzin ma osobny audyt wszystkich 24 kandydatów na poziom (co najmniej 10 odmiennych treści na rodzinę i poziom). Macierze nie powstają z ogromnego iloczynu dziewięciu parametrów. Szczegóły katalogu, ograniczeń i niezależnego sprawdzania są w [GENERATORS.md](GENERATORS.md).

## CI i GitHub Pages

Workflow [CI](.github/workflows/ci.yml) działa przy Pull Requestach do `main` oraz po push na `main`. Instaluje zależności przez `npm ci`, uruchamia Vitest, buduje aplikację i wykonuje testy Playwright w Chromium. Tylko udany przebieg CI po push na `main` zapisuje `dist/` jako artefakt `site-dist`. Osobny workflow [Deploy Pages](.github/workflows/pages.yml) pobiera ten konkretny artefakt i publikuje go po zakończeniu CI z sukcesem. PR nie uruchamia publikacji.

W tym repozytorium Pages używa źródła GitHub Actions. Po scaleniu zmian do `main` sprawdź przebiegi **CI** i **Deploy Pages** w zakładce Actions, a następnie stronę pod adresem `https://eluyz.github.io/math-tutor-app/`. Samo otwarcie PR nie aktualizuje strony. W nowym forku właściciel musi ustawić **Settings → Pages → Build and deployment → Source: GitHub Actions**; w razie ograniczeń także dopuścić użyte akcje i wdrożenia z `main` do środowiska `github-pages`.

## Zakres i prywatność

Odpowiedzi są sprawdzane lokalnie i deterministycznie, bez `eval` i tolerancji zmiennoprzecinkowej. Nie ma backendu, kont, telemetrii ani przesyłania odpowiedzi na serwer. Generator, pierwsze oceny i podsumowanie sesji istnieją tylko w pamięci karty; odświeżenie strony je usuwa. Automatyczne zmiany poziomu, adaptacyjny dobór rodzin i trwała historia nie są częścią MT-003B.1.

Projekt jest dostępny na licencji [MIT](LICENSE). Bezpośrednie zależności używają licencji MIT lub Apache 2.0; szczegóły są w [ARCHITECTURE.md](ARCHITECTURE.md). Zobacz też [PRODUCT.md](PRODUCT.md), [ROADMAP.md](ROADMAP.md) i [CONTRIBUTING.md](CONTRIBUTING.md).

Pakiet MT-EDU-001 nie obejmuje dowolnego parsera symbolicznego, przybliżonych pierwiastków niewymiernych, Viète'a, macierzy odwrotnej, Cramera, granic, pochodnych ani całek. Nie zapisuje postępów trwale i nie zmienia zakresu adaptacji MT-003B.1.
