# Math Tutor

Otwarta aplikacja do samodzielnej nauki matematyki dla dorosłych wracających do nauki po przerwie. Zawiera 51 parametrycznych rodzin w 11 kategoriach: podstawy, algebra, równania kwadratowe, macierze i wyznaczniki oraz układy równań, funkcje i granice ciągów. Działy **Powtórka podstaw** i **Matematyka na studia** porządkują ofertę na telefonie i komputerze. Materiały są autorskie; nie są oficjalnymi materiałami ani pełnym programem UWM.

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

Wybierz kategorię, poziom (łatwy, średni, trudny, zaawansowany, ekspert) i rodzinę. **Nowy przykład** oraz dostępny po poprawnej odpowiedzi **Następny przykład** losują kolejną treść z tej samej rodziny na bieżącym poziomie. Zmiana poziomu również zachowuje rodzinę; inny rodzaj zadania wybierzesz na liście rodzin lub przez zmianę kategorii. Każda zmiana przykładu czyści odpowiedź, ocenę, wskazówki i pytanie pomocnicze. Jeśli nic jeszcze nie wybrano, **Nowy przykład** rozpoczyna ćwiczenie w bieżącej kategorii.

**Rozpocznij sesję (10 zadań)** uruchamia serię mieszającą rodziny w wybranym temacie i na wybranym poziomie; **Następne zadanie** przechodzi dalej także wtedy, gdy chcesz pominąć bieżący wariant. Licznik pokazuje numer zadania, a po dziesiątym pojawia się komunikat o zakończeniu. Przełączenie rodziny, poziomu lub kategorii podczas sesji jest zablokowane. Losowanie nie powtarza identycznej treści, dopóki pula wybranego zakresu się nie wyczerpie; po wyczerpaniu pojawia się komunikat o wznowieniu puli.

### Podsumowanie sesji — MT-003B.1

Po dziesiątym zadaniu zobaczysz liczbę pokazanych zadań, poprawnych pierwszych ważnych prób, zadań z błędną pierwszą próbą oraz pominięć bez ważnej oceny. Liczy się wyłącznie pierwsza sprawdzona odpowiedź o statusie poprawnym lub niepoprawnym. Puste i nieprawidłowe zapisy nie są ważną próbą. Powtarzanie sprawdzenia, edycja, podpowiedzi i późniejsza poprawa błędu nie zmieniają pierwszej oceny; samo wpisanie odpowiedzi bez sprawdzenia nie jest próbą.

Sugestia poziomu wymaga ważnej pierwszej próby w co najmniej 7 z 10 zadań. Przy mniejszej liczbie pojawia się „Za mało danych do sugestii poziomu” i możliwość powtórzenia obecnego poziomu. Przy wystarczających danych 8–10 poprawnych pierwszych prób sugeruje jeden poziom wyżej, 0–4 jeden poziom niżej, a 5–7 powtórzenie obecnego. Sugestia pozostaje w granicach łatwy–ekspert i uwzględnia dostępność w kategorii; progi odnoszą się do wszystkich 10 zadań, nie tylko ocenionych.

To prosty wskaźnik jednej sesji, nie diagnoza umiejętności ani pełny system adaptacyjnego doboru rodzin. Poziom i kategoria nie zmieniają się samoczynnie. Dopiero **Rozpocznij kolejną sesję na sugerowanym poziomie** rozpoczyna nową serię na proponowanym poziomie i resetuje statystyki. Możesz też zostać przy obecnym poziomie, wybrać inny ręcznie lub wrócić do swobodnego ćwiczenia. Aktywna sesja pozostaje tylko w pamięci aplikacji; odświeżenie ją usuwa. Metadane ukończonych sesji są lokalnie zapisywane przez MT-004A.

### Brudnopis i rozwiązania — MT-EDU-002A

**Brudnopis** jest domyślnie zwiniętym paskiem pomiędzy treścią zadania (wraz z macierzami i wskazówką wstępną) a polem odpowiedzi i przyciskiem **Sprawdź**. **Pokaż brudnopis / Show scratchpad** rozwija narzędzia, a **Schowaj brudnopis / Hide scratchpad** je ukrywa. Zwijanie zachowuje ten sam edytor, zaznaczenie, tryb, tekst, rysunki oraz Undo/Redo. Zamknięcie w ten sposób powiększonego panelu zwalnia blokadę przewijania i oddaje fokus przyciskowi. **Rysuj** obsługuje mysz, dotyk i piórko; **Pióro**, **Gumka**, **Cofnij** i **Ponów** operują na całych śladach. Gumka usuwa każdy dotknięty ślad w całości. **Pisz** to zwykły tekst, z przyciskami `x²`, `√`, `Δ`, `×`, `÷`, `±`, `→`, `≠` wstawianymi w miejscu kursora lub zamiast zaznaczenia. Przełączenie trybu zachowuje obie treści. Wpisywanie i symbole korzystają z natywnej historii edytora; przyciski historii pozwalają też cofnąć ręczne czyszczenie tekstu i rysunku razem. Historia operacji aplikacji jest ograniczona do 80 zmian.

Domyślnie **Czyść brudnopis przy nowym zadaniu** jest zaznaczone: każde nowe uruchomienie zadania (również powtórzona treść), zmiana rodziny/kategorii/poziomu i nowa sesja czyści obie treści i historię. Odznacz checkbox, aby zachować notatki także między sesjami. **Wyczyść** zawsze czyści oba tryby i można to cofnąć. **Powiększ** otwiera obszar z przyciskiem **Zamknij**, obsługą Escape i klawiatury; zmiana rozmiaru zachowuje wektory. Notatki i preferencja istnieją tylko w pamięci bieżącej karty, do odświeżenia strony.

**Pokaż rozwiązanie** odsłania pierwszy uzasadniony krok dla każdej z 51 rodzin. Dalej użyj **Następny krok** albo **Pokaż wszystkie kroki**. Ostatni etap zawiera pełny wynik, w tym macierz lub klasyfikację i wartości pierwiastków. Panel nie wymusza przejścia dalej. Nowy przykład zawsze zeruje kroki i formularz, niezależnie od ustawienia brudnopisu.

W sesji podgląd przed pierwszą ważną oceną zapisuje osobny rezultat **Rozwiązanie obejrzane przed pierwszą ważną oceną**. Późniejsze przepisanie wyniku nie podwyższa liczby samodzielnych poprawnych odpowiedzi. Podgląd po ważnej poprawnej/błędnej próbie zachowuje jej ocenę. Cztery kategorie podsumowania sumują się do 10. Do minimum 7 ocen i dotychczasowych progów sugestii wchodzą wyłącznie samodzielne poprawne/błędne próby; obejrzenie rozwiązania nie jest błędem ucznia.

Automatyczne testy Chromium obejmują desktop, telefon 375 px i tablet 768 px, prawdziwe zdarzenia dotykowe, obrót, powiększenie i klawiaturę. Safari na fizycznym iPhonie/iPadzie pozostaje osobnym testem ręcznym przed scaleniem; emulacja Chromium go nie zastępuje.

### Odpowiedzi i wskazówki

MT-EDU-001 dodaje 20 rodzin: minus przed nawiasem, jednomiany i wykładniki, iloczyn nawiasów, przekształcenia równań z ułamkiem; kwadrat sumy i różnicy, różnicę kwadratów, deltę i równania kwadratowe; wymiar i odczyt elementu macierzy, dodawanie, odejmowanie, skalar, transpozycję i mnożenie; wyznaczniki 2×2, Sarrusa dla 3×3 i własność zerowego wiersza. Każda rodzina ma poziomy łatwy/średni/trudny oraz dyskretną wskazówkę „Jak zacząć” przed odpowiedzią. Po poprawnej ocenie pojawia się dotychczasowe wyjaśnienie; niezależnie od oceny można odsłonić rozwiązanie etapami.

Format odpowiedzi zależy od pytania: liczba/ułamek, opisane pola współczynników, pełna macierz w siatce do 3×3 albo kontrolowany wybór. W równaniu kwadratowym samodzielnie wybierz liczbę pierwiastków rzeczywistych i, gdy istnieją, wpisz ich dokładne wartości. Kolejność dwóch pierwiastków jest dowolna. Nie wymagamy zaokrągleń: generowane rzeczywiste pierwiastki są wymierne. Niepełny formularz jest nieważną odpowiedzią, więc nie zużywa pierwszej ważnej próby w sesji. Zmiana przykładu czyści wszystkie pola, wybory, wskazówki i ocenę. Pola macierzy są opisane wierszem i kolumną, licząc od 1; Tab przechodzi przez nie wierszami.

Wpisz liczbę lub ułamek `a/b`. Możesz użyć minusa `-` lub `−` także w liczniku i mianowniku. Przy ułamkach można też użyć dokładnie równoważnego zapisu dziesiętnego, np. `3/4`, `0.75` i `0,75` są uznawane za tę samą wartość. `0.3333333333` nie jest dokładnie równe `1/3`. Dzielenie przez zero, zbyt długie i nieprawidłowe wejście są odrzucane.

Po błędnej odpowiedzi zobaczysz wstępną wskazówkę oraz ewentualną **hipotezę** o typie pomyłki. Kolejną wskazówkę możesz odsłonić samodzielnie. Sześć rodzin oferuje dodatkowe pytanie o pierwszy krok rozwiązania; odpowiedź na nie zmienia następną podpowiedź, ale nie ustala przyczyny wcześniejszego błędu. Zmiana odpowiedzi głównej usuwa ocenę i wskazówki poprzedniej próby. Po poprawnej odpowiedzi pojawia się wyjaśnienie; przycisk **Pokaż rozwiązanie** pozwala wcześniej odsłonić uzasadnione etapy. Próbując ponownie, pracujesz nad tym samym zadaniem.

Niepoprawność wyniku jest matematycznie potwierdzona. Przyczyna błędu pozostaje przypuszczeniem opartym na końcowej odpowiedzi. Gdy kilka pomyłek daje ten sam wynik, aplikacja pokazuje wszystkie pasujące możliwości; gdy żadna reguła nie pasuje, wyświetla „nieustalona przyczyna”. Szczegóły opisuje [ERROR_TAXONOMY.md](ERROR_TAXONOMY.md).

Automatyczny audyt zachowuje **647 różnych treści** pierwotnych 15 rodzin oraz 557 treści w dawnej próbie z ośmiu seedów. Nowe 20 rodzin ma osobny audyt wszystkich 24 kandydatów na poziom (co najmniej 10 odmiennych treści na rodzinę i poziom). Macierze nie powstają z ogromnego iloczynu dziewięciu parametrów. Szczegóły katalogu, ograniczeń i niezależnego sprawdzania są w [GENERATORS.md](GENERATORS.md).

## CI i GitHub Pages

Workflow [CI](.github/workflows/ci.yml) działa przy Pull Requestach do `main` oraz po push na `main`. Instaluje zależności przez `npm ci`, uruchamia Vitest, buduje aplikację i wykonuje testy Playwright w Chromium. Tylko udany przebieg CI po push na `main` zapisuje `dist/` jako artefakt `site-dist`. Osobny workflow [Deploy Pages](.github/workflows/pages.yml) pobiera ten konkretny artefakt i publikuje go po zakończeniu CI z sukcesem. PR nie uruchamia publikacji.

W tym repozytorium Pages używa źródła GitHub Actions. Po scaleniu zmian do `main` sprawdź przebiegi **CI** i **Deploy Pages** w zakładce Actions, a następnie stronę pod adresem `https://eluyz.github.io/math-tutor-app/`. Samo otwarcie PR nie aktualizuje strony. W nowym forku właściciel musi ustawić **Settings → Pages → Build and deployment → Source: GitHub Actions**; w razie ograniczeń także dopuścić użyte akcje i wdrożenia z `main` do środowiska `github-pages`.

## Zakres i prywatność

Odpowiedzi są sprawdzane lokalnie i deterministycznie, bez `eval` i tolerancji zmiennoprzecinkowej. Nie ma backendu, kont, telemetrii ani przesyłania odpowiedzi na serwer. Generator i aktywna sesja istnieją tylko w pamięci karty; odświeżenie strony je usuwa. MT-004A zachowuje jedynie minimalną historię ukończeń w localStorage. Automatyczne zmiany poziomu i adaptacyjny dobór rodzin pozostają poza zakresem.

Projekt jest dostępny na licencji [MIT](LICENSE). Bezpośrednie zależności używają licencji MIT lub Apache 2.0; szczegóły są w [ARCHITECTURE.md](ARCHITECTURE.md). Zobacz też [PRODUCT.md](PRODUCT.md), [ROADMAP.md](ROADMAP.md) i [CONTRIBUTING.md](CONTRIBUTING.md).

Pakiet MT-EDU-001 nie obejmuje dowolnego parsera symbolicznego, przybliżonych pierwiastków niewymiernych, Viète'a, macierzy odwrotnej, Cramera, granic, pochodnych ani całek. Nie zapisuje postępów trwale i nie zmienia zakresu adaptacji MT-003B.1.

## MT-EDU-003 — pięć poziomów, Polski / English (scalone i opublikowane)

Nagłówek ma przełącznik **🇵🇱 Polski | 🇬🇧 English** (PL/EN na małym ekranie). Domyślnie działa polski. Cały proces nauki jest dostępny po angielsku: polecenia, rodziny, pola odpowiedzi, diagnozy i podpowiedzi, kroki z uzasadnieniami, brudnopis, sesje i rekomendacje. Zmiana języka tłumaczy także już widoczne komunikaty i kroki, zachowując wariant, odpowiedź, wynik pierwszej próby, notatki, natywne Undo/Redo i stopień odsłonięcia rozwiązania. `lang` dokumentu i tytuł karty są aktualizowane. Ustawienie pozostaje w pamięci karty; odświeżenie przywraca polski. Treść notatek użytkownika nie jest tłumaczona ani wysyłana.

Do dotychczasowych poziomów dodano **Zaawansowany / Advanced** oraz **Ekspert / Expert**. Pierwszy wymaga kilku zależnych działań, drugi planowania złożenia technik. Oba wspiera **29 z 35 rodzin**, we wszystkich ośmiu kategoriach. Każda nowa kombinacja ma 24 różne warianty. Sześć elementarnych rodzin pozostaje na poziomach 1–3; na wyższych są oznaczone jako niedostępne, z możliwością wyboru innej rodziny. Nie ma podmiany na hard. Pełna mapa różnic poziomów znajduje się w [GENERATORS.md](GENERATORS.md).

Łącznie jest **3501 instancji matematycznych**: 2092 historyczne, 17 jawnych uzupełnień małych pul niższych poziomów i 1392 nowych L4/L5. Nie dodano nowych nazw rodzin. Wszystkie wspierane kombinacje mają co najmniej 10 treści. Zachowano historyczne pytania, wyniki i formaty; techniczne ID skalarów zawiera teraz poziom, a dodanie 17 przykładów celowo poszerza niektóre niższe pule. Rekomendacja porusza się o jeden sąsiedni dostępny poziom w kategorii, od easy do expert, przy dotychczasowym minimum 7 samodzielnych ocen i progach 8/10 oraz 4/10. Podgląd przed oceną nie jest samodzielną próbą.

Testy obejmują wszystkie wspierane rodziny/poziomy/warianty oraz obie wersje językowe. Playwright obejmuje PL/EN na 375/768/1280 px, zmiany języka w zadaniu i sesji, nowe typowane odpowiedzi, górną granicę rekomendacji, brudnopis i wszystkie wcześniejsze regresje. Kontrole lokalne nie oznaczają zatwierdzenia przez niezależnego recenzenta ani testu fizycznego Safari. Przed merge nadal wymagane są zielone CI, przegląd ChatGPT Work i zgoda użytkownika.

### English

Use **English** in the header to learn with fully authored English questions, hints, explanations, scratchpad controls and session feedback. Changing language keeps the same exercise and your work. Five difficulty levels are available; Advanced and Expert now cover 43 families each; every new supported pair has 24 variants. Elementary families clearly show their supported levels. Everything runs locally. Completed-session metadata is saved in this browser; refreshing clears the active exercise, unfinished session, notes and language preference. Use **My progress** to review or export history, or delete it after confirmation.

## MT-004A — Moje postępy / My progress (scalone i opublikowane w PR #15)

Nawigacja pozwala wrócić z pulpitu do tej samej pracy: odpowiedzi, sesji, odsłoniętych kroków i brudnopisu. Historia zapisuje się dopiero po zakończeniu 10. zadania, dokładnie raz dla ID sesji. Zawiera czas ukończenia według zegara urządzenia (JSON: ISO UTC, widok: lokalny czas), kategorię, poziom, cztery liczniki oraz `templateId` i pierwszy rezultat każdego zadania. Nie zawiera treści odpowiedzi, technicznych ID ćwiczeń, parametrów, tekstu, rysunków ani języka.

Pulpit pokazuje sumy, rozbicie kategorii i poziomów, ostatnie sesje oraz filtry kategorii, poziomu i ostatnich 30 dni. Procent to jawnie **poprawne / samodzielnie ocenione** (`correct / (correct + incorrect)`). Przy zerowym mianowniku nie ma procentu; przy mniej niż 7 samodzielnych ocenach jest informacja o małej ilości danych. Pominięcia i podgląd przed oceną mają osobne liczniki; podgląd po ocenie i późniejsze poprawki jej nie zmieniają. To historia pracy, nie ocena wiedzy.

Zapis używa jednego klucza `math-tutor.progress.v1`, schematu `version: 1` i maksymalnie **200 ostatnich ukończeń**. Starsze sesje są usuwane. Brak miejsca lub dostępu nie przerywa nauki: nowe wyniki pozostają w pamięci i pojawia się komunikat. Uszkodzone dane lub nieznana wersja nie są nadpisywane; można wyeksportować nowe wyniki z pamięci lub świadomie usunąć historię.

**Eksportuj historię (.json) / Export history (.json)** pobiera całą dostępną historię, niezależnie od filtrów. **Usuń historię / Delete history** wymaga potwierdzenia, usuwa wyłącznie klucz aplikacji i wyniki z pamięci; ponowne wyświetlenie ukończonej sesji ich nie odtwarza. Przy błędzie kasowania dane pozostają i komunikat nie obiecuje sukcesu. Import jest poza V1.

Dane istnieją tylko w danej przeglądarce i na tym urządzeniu, bez kont, synchronizacji, cookies śledzących, backendu ani telemetrii. Wyczyszczenie danych Safari lub innej przeglądarki może usunąć historię bez możliwości odzyskania; eksport jest ręczną kopią. Notatki, aktywne zadanie, niedokończona sesja i język nie są utrwalane.

Testy Chromium obejmują PL/EN i 375/768/1280 px, rzeczywiste wpisywanie, Backspace, Undo/Redo, zwijanie bez remountu i błędy storage. Fizyczny iPhone/iPad Safari nadal wymaga testu ręcznego przed merge; automatyczne stuby ograniczeń storage i emulacja dotyku go nie zastępują. MT-004A jest na main od PR #15 (9499955); CI i Deploy Pages dla tego commita zakończyły się sukcesem. MT-EDU-004 pozostaje osobnym PR do przeglądu, bez merge ani deploy.

## MT-EDU-004 — P0–P3 (implementacja do niezależnego przeglądu)

Zachowano 3501 wcześniejszych instancji i dodano **16 rodzin**, **1728 nowych wariantów** w 72 wspieranych parach rodzina/poziom, po 24 warianty. Łącznie: **54 rodzin**, **5565 instancji**, 11 kategorii. Advanced i Expert wspierają po 43 rodziny łącznie z historycznymi. Pełna mapa poziomów i niezależnego audytu jest w [GENERATORS.md](GENERATORS.md).

| Checkpoint | Rzeczywisty zakres | Nowe rodziny / warianty |
| --- | --- | --- |
| P0 | Powiększ → Schowaj / Expand → Hide w DOM, Tab i układzie; zwinięty Pokaż/Show | 0 / 0 |
| P1 | Podstawianie, eliminacja, klasyfikacja, Cramer 2×2/3×3; ułamki, nawiasy i odwracalne zmiany niewiadomych | 5 / 504 |
| P2 | Wartości, dziedziny, zera, liniowe współczynniki i monotoniczność, wierzchołek, oś, zbiór wartości i złożenia | 8 / 888 |
| P3 | Ilorazy wielomianów, granice wymierne i ±∞, ciągi geometryczne, oscylacje, redukcja i sprzężenia | 3 / 336 |

Układ oznaczony wymaga wszystkich niewiadomych, także po wybraniu klasyfikacji „jedno rozwiązanie”. Pozostałe klasy mają jednoznaczny wybór bez pozornych pól x/y. Rozwiązania używają dokładnych ułamków i weryfikują każde oryginalne równanie. Cramer nigdy nie dzieli przez zerowy wyznacznik. Zera funkcji mają osobny wybór liczby 0/1/2, bez ujawnienia oczekiwanej liczby; skrócenie nie przywraca punktu wykluczonego z dziedziny. Dziedziny i zbiory wartości są kontrolowanymi, dokładnymi zbiorami przedziałów, a odpowiedzi wielomianowe opisanymi współczynnikami.

Granice ciągów rozróżniają skończoną liczbę, +∞, −∞ i brak granicy. Skończona liczba wymaga poprawnego zapisu przed ważną oceną. Dominacja jest dowodzona z potęg i współczynników; ciągi geometryczne mają osobną analizę parzystych i nieparzystych indeksów. Nie zgadujemy wyniku z kilku wyrazów i nie nazywamy oscylacji nieskończonością.

Nowe zadania mają pełne polecenia, wskazówki i uzasadnione rozwiązania PL/EN. Korzystają z dotychczasowych sesji 10 zadań, pierwszej samodzielnej oceny i lokalnej historii. Język nie zmienia zadania, odpowiedzi, notatek, wyników ani odsłoniętych kroków. Rozwijanie i powiększanie brudnopisu zachowuje ten sam edytor i Undo/Redo.

**P4–P6 są przyszłym zakresem:** granice funkcji, pochodne, całki i funkcje dwóch zmiennych nie są częścią PR #17. Nie dodano ich przycisków, parsera swobodnych wyrażeń, przybliżonych odpowiedzi ani wykresów. Wszystko działa lokalnie, bez nowych zależności, backendu i zewnętrznych tłumaczeń. Automatyczne testy Chromium PL/EN obejmują 375/768/1280 px; fizycznego Safari nie testowano. Przed scaleniem wymagane są CI dla HEAD, niezależna recenzja Work i decyzja użytkownika.

### Systems, functions and sequence limits in English

Choose **English**, then **University mathematics**. Systems require every unknown for a unique solution; singular systems use an explicit classification. Functions include domains, zeros, linear reconstruction, quadratic vertices/ranges and compositions. Sequence limits distinguish finite values, both signs of infinity and nonexistence. Every supported new family/level has 24 variants, authored hints and step-by-step reasoning. Changing language preserves your work. Function limits, derivatives, integrals and two-variable calculus remain future stages.
