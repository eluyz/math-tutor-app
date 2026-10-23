# Plan rozwoju

| Etap | Cel | Przykładowy rezultat |
| --- | --- | --- |
| MT-001 | Fundament i działający prototyp — ukończony | React, TypeScript, Vite, trzy ćwiczenia, testy, dokumentacja |
| MT-002 | Pierwsza diagnostyka typowych błędów — ukończona | 15 referencyjnych zadań, jawna taksonomia, dokładne ułamki, stopniowe podpowiedzi i pytania pomocnicze |
| MT-003A | Generator ćwiczeń — ukończony | 15 rodzin, trzy ręcznie wybierane poziomy, sesja 10 zadań i brak powtórek do wyczerpania puli |
| MT-003A.1 | Nawigacja swobodnej praktyki — ukończona | Kolejne przykłady i zmiana poziomu zachowują świadomie wybraną rodzinę |
| MT-003B.1 | Podsumowanie sesji i opcjonalna sugestia poziomu | Pierwsze ważne oceny i pominięcia w 10 zadaniach; sugestia na kolejną sesję po co najmniej 7 ocenach, przyjmowana świadomie przez użytkownika |
| MT-003B.2 | Dalszy dobór adaptacyjny — przyszły etap | Ostrożny dobór rodziny zadań; poza zakresem MT-003B.1, bez przypisywania pewnej diagnozy |
| MT-EDU-001 | Pakiet edukacyjny — scalony i opublikowany | 20 nowych rodzin (łącznie 35): algebra, wzory i kwadratowe, macierze do 3×3, wyznaczniki 2×2 i Sarrus; dokładne odpowiedzi i krokowe wyjaśnienia |
| MT-EDU-002A | Brudnopis i rozwiązania — scalone i opublikowane | Rysuj/Pisz, wektorowa historia i powiększenie; uzasadnione etapy wszystkich 35 rodzin; osobne statystyki podglądu przed oceną |
| MT-EDU-003 | Pięć poziomów i PL/EN — scalone i opublikowane | 29 rodzin L4/L5, pełna angielska nauka, niezmienna tożsamość i stan przy zmianie języka |
| MT-004A | Moje postępy i składany brudnopis — scalone i opublikowane w PR #15 | Lokalna historia do 200 ukończeń, dashboard PL/EN, jawne mianowniki, filtry, eksport JSON i potwierdzone kasowanie; zwinięty brudnopis bez utraty Undo/Redo |
| MT-EDU-004 P0–P3 | Scalone i opublikowane w PR #17 | Kolejność brudnopisu; układy, funkcje i granice ciągów: 16 nowych rodzin, 1728 wariantów, pełne PL/EN |
| MT-EDU-005 P0/P1 | Scalone w PR #19 | Granice funkcji i pochodne: 12 rodzin, 1152 wariantów; łącznie 63 rodziny i 6381 wariantów |
| MT-EDU-006A | Scalone na main w PR #21 | Wstępna [mapa 64 kompetencji](CURRICULUM_COVERAGE.md); autorskie Laplace 4×4/5×5, operacje wierszowe i własności wyznaczników |
| MT-EDU-006B P0–P2 | Implementacja Issue #22 do recenzji | Odwrotności 2×2/3×3, AX=B, rząd macierzy, Capelli oraz Gauss 3×3/4×4: 9 rodzin, 624 instancje |
| MT-EDU-006B P3 | Wdrożone na `main` (uzupełnione przez PR #37) | Cramer 4×4 i XA=B oraz układ dwóch równań macierzowych dla X i Y w kontrolowanym wariancie 2×2 |
| MT-EDU-007 | Scalone na main w PR #25; P0–P2 ukończone, P3 częściowo | 16 rodzin / 1224 warianty: P0–P2 oraz kontrolowane badanie wielomianu i funkcji wymiernej; nonsmooth styczne, ogólne funkcje i wykresy pozostają przyszłe |
| MT-UX-001 | Scalone na main w PR #29 | Wyszukiwanie rodzin PL/EN w całym katalogu, jawny dobór kategorii i poziomu oraz krótsza lista mobilna; bez zmian w 8589 wcześniejszych zadaniach |
| MT-EDU-008 P0–P2 | Scalone na main w PR #30 | Całki I01–I06: 6 rodzin / 432 warianty; wielomiany, wybrane tablicowe, podstawienie, części, powracające i oznaczone, ograniczony dokładny formularz funkcji pierwotnej |
| MT-EDU-008 P3 | Przeniesione do planu MT-EDU-017 | I07 pola między krzywymi i I08 długość łuku wymagają osobnych, w pełni zweryfikowanych generatorów; nie są jeszcze wdrożone |
| MT-EDU-009 | Scalone w PR #37 | 3 rodziny / 216 wariantów: dwa równania macierzowe 2×2 i gęste wyznaczniki 4×4 oraz 5×5 |
| MT-EDU-010 | Scalone i opublikowane w PR #39 | 4 rodziny / 384 warianty: potęgi A²/A³, działania złożone, zgodność wymiarów A+B/AB/BA oraz łańcuchy |
| MT-EDU-011 | Zakres przeniesiony do MT-EDU-018 | Dwie zmienne W01–W03: pochodne cząstkowe, gradient, ekstrema, granice i ciągłość; bez ukończonych generatorów |
| MT-EDU-012 | Scalone na `main` w PR #40 (22.10.2026) | Dwie rodziny / 120 wariantów: samodzielne obliczanie D,D1…D4 Cramera w 3×3 i 4×4, oceniane osobno; bez nowych sprawdzianów |
| MT-EDU-013 | P0 i P1 opublikowane (#43, #44), w zakresie 2×2 | Cztery autorskie rodziny równań 2×2: AX=4X+B, AXB=C, (A+4X)⁻¹=B i 3X+A=BX (336 wariantów). Nadal brak ogólnych większych rozmiarów i dodatkowych typów przekształceń |
| MT-EDU-014 | P0/P1/P2 scalone (#45/#46/#47) | P0: parametryzacje kwadratowe. P1: łańcuch pięciu równości i klasyfikacja 3×2/4×3 (192 warianty). P2: pełne rozwiązania parametryczne 3×2/4×3/2×3 (3 rodziny, 144 warianty). Pozostają dowolne rozmiary, dowolny zapis symboliczny i bardziej złożony Cramer |
| MT-EDU-015 | P0 scalone w PR #48; P1 w osobnym PR do kontroli | MT-EDU-015A: granice ciągów (288 wariantów). MT-EDU-015B P1: parzystość i odwrotność liniowa (144 warianty). P2: dziedziny z tg i odczytywanie funkcji z wykresu; nadal niepełne F04–F06 |
| MT-EDU-016 | Plan P3 — granice i pochodna jednej zmiennej | Szersze asymptoty i granice jednostronne, pochodne trygonometryczne/złożone i ilorazy symboliczne, punkty bez pochodnej, pełne badanie funkcji i szkice |
| MT-EDU-017 | Plan P4 — całki i zastosowania | Uzupełnienie tablicowych/podstawienia/przez części; oznaczone z exp/ln/trig; pola między krzywymi z podziałem przedziału (I07) i długość łuku (I08) |
| MT-EDU-018 | Plan P5 — funkcje dwóch zmiennych | Pochodne cząstkowe 1./2. rzędu i mieszane, gradient, stacjonarność i klasyfikacja Hessianem, proste granice/ciągłość 2D jako moduł pojęciowo-rachunkowy |
| MT-EXAM-001/002 | Scalone na `main` — rozwój sprawdzianów wstrzymany | Obecny sprawdzian 5/10/20 zadań, historia, czas, wybór rodzin i kilku poziomów (PR #36); nowych funkcji sprawdzianów teraz nie planujemy |
| MT-DIAG-001 | Scalone w PR #35 | „Znajdź mój błąd”, kontrola konkretnych kroków i trzy zadania naprawcze; bez OCR |
| MT-UI-REMOVE-FREE | Scalone w PR #38 | Usunięto napis „ZA DARMO / FREE” z nagłówka i wdrożono na GitHub Pages |
| MT-004B / MT-004C | Możliwe kolejne etapy — poza tym PR | Dobrowolna powtórka słabszych tematów, bezpieczny import lub dalsze funkcje po osobnej decyzji |
| MT-005 | Pilotaż | Testy użyteczności z dorosłymi uczącymi się, poprawki treści i dostępności |

## Audyt pokrycia programu matematyki — 8 działów (22.10.2026)

**Zakres:** osiem działów matematyki: macierze i wyznaczniki, układy równań, granice ciągów, podstawy funkcji, granice funkcji, pochodne, całki oraz funkcje dwóch zmiennych. Punktem odniesienia jest pełna lista umiejętności i typów zadań potrzebnych na kursie matematyki. Zestawienie jest robocze: opisuje aktualną implementację, a nie gwarancję gotowości do dowolnego egzaminu. Generatory i objaśnienia muszą być autorskie; nie kopiujemy zewnętrznych arkuszy ani kluczy odpowiedzi.

**Stan mapy 64 kompetencji:** 15 „pokryte”, 41 „częściowo”, 6 „brak”, 2 „teoria”; to liczba zdefiniowanych kompetencji, **nie** procent pokrycia egzaminu. Aktualny katalog w tym PR: **126 rodzin / 10965 wariantów**.

| Dział matematyki | Co już ćwiczymy | Najistotniejsze luki do uzupełnienia |
| --- | --- | --- |
| 1. Macierze i wyznaczniki | Działania, potęgi A²/A³, transpozycja, wyznaczniki 2×2–5×5, odwrotność 2×2/3×3, rząd, AX=B, XA=B i kontrolowany układ równań macierzowych; w PR P1 także (A+4X)⁻¹=B i 3X+A=BX dla 2×2 | Po zatwierdzeniu P1: dalsze rozmiary i kombinacje równań; inne strategie wyznaczników |
| 2. Układy równań | Cramer 2×2/3×3/4×4, D i D_i, Gauss i klasyfikacja; P0 pełna parametryzacja wybranych 3×3/4×4; P1 łańcuch pięciu równości i klasyfikacja 3×2/4×3; P2 pełna parametryzacja 3×2/4×3/2×3 | Dalsze rozmiary i swobodny zapis symboliczny, trudniejsze przypadki rang i Cramera |
| 3. Granice ciągów | Ilorazy wielomianów, różnica pierwiastków/sprzężenie, geometryczne, wybrane formy Eulera | Większa różnorodność pierwiastków i funkcji wykładniczych, porównywanie wzrostu, rozpoznanie monotoniczności/ograniczoności |
| 4. Funkcje: podstawy | Dziedzina pierwiastka/ilorazu/logarytmu, moduł, złożenie, wybrane równania i nierówności exp/log | Odczytywanie własności z wykresu, parzystość, odwrotność, dziedzina tg, pełniejsze przecięcia warunków |
| 5. Granice funkcji | Granice w punkcie i jednostronne, 0/0, sprzężenie, w nieskończoności, wybrane asymptoty, Euler | Rozszerzenie klas zadań, szersze granice i asymptoty, ciągłość jako osobny typ sprawdzenia |
| 6. Pochodna | Wzory, iloczyn/łańcuch, wybrane ilorazy w punkcie, ln/exp, L’Hospital, monotoniczność, ekstrema, wypukłość/przegięcia, kontrolowane badanie wielomianu/wymiernej | Pochodne trig i pełniejsze symboliczne ilorazy, brak pochodnej w punkcie, rysowanie/odczyt szkicu, pełne badanie i ekstrema globalne w innych klasach |
| 7. Całki | Wielomian/tablicowe, kontrolowane podstawienie, części, powracające, oznaczone dla wielomianów | Szerzej exp/ln/trig i części wielokrotne; **brak generatorów pól między krzywymi i długości łuku** |
| 8. Funkcje dwóch zmiennych | Brak dedykowanych rodzin W01–W03 | **Pochodne cząstkowe/mieszane, gradient, punkty stacjonarne, Hessian/ekstrema, podstawowe granice/ciągłość 2D** |

### Cel: kompletne pokrycie programu — bez specjalnego trybu
Każdy z ośmiu działów musi mieć wszystkie wymagane typy zadań w zwykłym katalogu, także zadania wieloetapowe. Sama obecność nazwy tematu, opisu teorii lub jednego łatwego wariantu nie oznacza pokrycia. Mapa kompetencji jest listą kontrolną: **każda pozycja ma osiągnąć status „pokryte”** albo otrzymać jawne uzasadnienie, dlaczego jest wyłącznie teoretyczna. Weryfikujemy podtypy, poziomy trudności, kompletność rozwiązania krok po kroku, równoważne warianty PL/EN, poprawność oceniania, brak duplikatów oraz niezależne testy. Ostatnim etapem jest przegląd braków po MT-EDU-018 i domknięcie wszystkich wykrytych luk, nawet jeżeli wymagają dodatkowych pakietów.

### Kolejność wdrażania: MT-EDU-013 → MT-EDU-018

1. **P0 / MT-EDU-013 — natychmiastowy priorytet pod najbliższe wejściówki:** rozszerzyć równania macierzowe i operacje występujące w arkuszach; zachować obecne rodziny Cramera oraz wyznaczników bez regresji.
2. **P1 / MT-EDU-014 — algebra liniowa:** P0/P1 scalone; P2 rozszerza pełną parametryzację Gaussa na 3×2/4×3/2×3. Dalsze luki: inne rozmiary, trudniejsze przypadki rang i Cramera, dowolny zapis symboliczny.
3. **P2 / MT-EDU-015 — przygotowanie do kolejnych zajęć:** granice ciągów oraz funkcje, dziedziny, odwrotność, parzystość i odczyt wykresów. Wykresy tylko wtedy, gdy możliwe są testowane, dostępne SVG; nie dodawać ciężkiej biblioteki dla samego wyglądu.
4. **P3 / MT-EDU-016 — granice i pochodne:** rozszerzyć rachunek bez wymogu dowolnego parsera symbolicznego; osobne zadania na pochodną i na całe badanie funkcji.
5. **P4 / MT-EDU-017 — ukończyć całki:** najpierw braki w metodach, potem dedykowane generatory I07 i I08 z niezależnie policzonymi polami/łukami.
6. **P5 / MT-EDU-018 — funkcje dwóch zmiennych:** rozdzielić pochodne cząstkowe/mieszane od ekstremów, wyraźnie obsłużyć przypadek nierozstrzygający wyznacznika Hessianu.

**Zasady wykonania każdego pakietu:** osobny mały PR, autorskie PL/EN, dostępne poziomy tylko tam, gdzie istnieją poprawne i faktycznie różne warianty; kroki obliczeń, poprawna interpretacja dziedziny/warunków i punktów brzegowych, niezależny test matematyczny, kontrola odpowiedzi błędnych oraz nieważnych, Vitest/Playwright/build, audyt Work i osobna zgoda właściciela przed Squash and merge. Aktualizować GENERATORS.md i CURRICULUM_COVERAGE.md po rzeczywistym wdrożeniu. Nie deklarować pełnego pokrycia programu, dopóki każda wymagana umiejętność nie ma działającego generatora i niezależnego testu, a zadania referencyjne nie zostały zweryfikowane. **Wstrzymany rozwój MT-EXAM pozostaje wstrzymany**: priorytetem są zadania w zwykłym katalogu, nie nowy panel wejściówek.

MathLive i Compute Engine mogą zostać ocenione w późniejszych etapach, gdy pojawi się potrzeba wprowadzania i analizy wyrażeń. Nie są wymagane do MT-003A.

MT-003B.1 jest pierwszym ograniczonym etapem adaptacji, nie pełnym systemem doboru rodzin. Nie zmienia samoczynnie poziomu ani kategorii. Aktywna sesja istnieje tylko w pamięci karty; trwałe metadane ukończeń dodaje MT-004A.

MT-UX-001 scalono w PR #29, MT-EDU-008 w PR #30, a MT-EDU-009 w PR #37. MT-EDU-010 opublikowano po PR #39 (wtedy **107 rodzin i 9621 wariantów**). MT-EDU-012 przeszedł niezależny przegląd kodu i zielone CI dla HEAD `8714b456`, a następnie został scalony zatwierdzonym **Squash and merge PR #40**, commit `db99a35a2d21bb54e38bc4a813d6b979452584d3`. Aktualny katalog: **109 rodzin, 9741 wariantów**. Stare zadania zachowują treść i tożsamość. MT-EDU-007 P3 nadal obejmuje dwie kontrolowane rodziny. Diagnostykę MT-DIAG-001 wdrożono w PR #35. Sprawdziany MT-EXAM-001/002 działają po PR #36, ale **wstrzymujemy rozwój nowych funkcji sprawdzianów**: priorytet to zwiększenie pokrycia matematyki, różnorodność zadań i nauka krokowa.

MT-EDU-001 rozszerza treści i typy odpowiedzi, zachowując granice MT-003A.1/MT-003B.1. Nie obejmuje jeszcze Viète'a, macierzy odwrotnej, Cramera, granic, pochodnych ani całek. Zatwierdzenie pakietu wymaga zielonego CI i przeglądu; implementacja lokalna nie oznacza publikacji.

MT-EDU-002A wymaga niezależnej recenzji ChatGPT Work i osobnej zgody użytkownika na merge. Lokalna weryfikacja Chromium nie zastępuje ręcznego sprawdzenia Safari na iPhonie/iPadzie. Opcjonalnej kratki nie dodano; szablony, eksport, OCR i trwały zapis pozostają poza V1.

MT-EDU-003 zostało scalone i opublikowane w PR #13: pięć poziomów, 29 rodzin na advanced i expert, 1392 wyższe warianty oraz 17 uzupełnień starych małych pul; kompletny proces nauki w PL/EN. Pozostałe sześć rodzin świadomie nie ma L4/L5. Szczegółowa mapa i audyt są w GENERATORS.md. Nie obejmuje nowych działów roadmapy, OCR, eksportu notatek ani trwałej historii. Dalsze zmiany nadal wymagają zielonego CI, niezależnej recenzji, kontroli Safari i oddzielnej zgody użytkownika na merge/deploy.

MT-004A zachowuje wyłącznie historię ukończonych sesji; aktywne zadanie, niedokończona sesja, brudnopis i język nadal znikają po odświeżeniu. Zapis jest lokalny dla przeglądarki i urządzenia, bez kont, telemetrii, backendu i synchronizacji. Wyczyszczenie danych przeglądarki może go usunąć. Eksport obejmuje metadane historii, nie notatki; import jest odłożony. PR #15 został scalony; CI i Deploy Pages dla 9499955 zakończyły się sukcesem. Nowe zmiany wymagają własnego zielonego CI dla HEAD, recenzji Work i zgody użytkownika.

### Opublikowany zakres MT-EDU-004 / PR #17

P0–P3 obejmują 16 nowych rodzin i 1728 nowych instancji, po 24 warianty dla 72 wspieranych par rodzina/poziom. Razem z niezmienionymi 3501 wcześniejszymi instancjami jest 51 rodzin i 5229 zadań. Po 43 rodziny wspierają advanced i expert. Klasyfikacja i monotoniczność liniowej nie deklarują pozornych wyższych poziomów, Cramer 3×3 zaczyna od hard, a złożenia od medium. Szczegóły i dowody audytu są w GENERATORS.

PR #17 został scalony i opublikowany, squash `afcb24886e80ddf06b6cee95a274c5237ef4e752`. Dawne dodatkowe P4/P5 są realizowane jako osobny MT-EDU-005. P6 pozostaje osobnym przyszłym projektem: wymaga jawnego +C, dokładnego F(górna)−F(dolna), precyzyjnej dziedziny dwóch zmiennych i uporządkowanego gradientu. Całek, funkcji wielu zmiennych ani egzaminu próbnego nie dodajemy w MT-EDU-005.

### MT-EDU-005 — opublikowane w PR #19

P0: 3 rodziny / 336 wariantów granic funkcji — punkt i strony, skracanie 0/0, dziedzina i f(a), sprzężenia pierwszego/drugiego rzędu, oba kierunki nieskończoności. P1: 9 rodzin / 816 wariantów — potęgowa, suma, iloczyn, łańcuch, iloraz w punkcie, styczna, znaki/monotoniczność, punkty stacjonarne z ekstremami i bez, wielkości krańcowe oraz maksimum zysku w ograniczonym przedziale produkcji.

Razem 12 nowych rodzin, 1152 instancji w 48 wspieranych parach po 24. Cały katalog: 63 rodziny / 6381 instancji / 13 kategorii, po 55 rodzin L4/L5. Zachowano wszystkie 5229 wcześniejszych lekcji PL/EN i ich kanoniczną tożsamość. PR #19 został scalony w `69452a655178ed073050bdf1b7dfe9e64dd15ebe`; ten stan jest punktem wyjścia dla MT-EDU-006A. Aplikacja nie ma backendu, nowych zależności ani dowolnego parsera symbolicznego.

Wykresy SVG pozostają opcjonalną pomocą na przyszłość; nie dodano ciężkich bibliotek. Ręczna kontrola fizycznego Safari pozostaje osobnym zadaniem przed scaleniem. Gotowość do recenzji nie oznacza zgody na merge lub publikację. Nie rozpoczęto MT-004B/004C ani nowej adaptacji.

### MT-EDU-006A — scalone na main w PR #21

P0: [mapa 64 kompetencji](CURRICULUM_COVERAGE.md) na podstawie indeksu Issue #20, bez dostępu do prywatnych 43 PDF-ów. P1: cztery autorskie rodziny wyznaczników 4×4/5×5, 11 par rodzina/poziom i 264 różne zadania. Katalog po tej zmianie obejmuje 67 rodzin, 6645 instancji i 13 kategorii; 59 rodzin wspiera każdy z poziomów Advanced i Expert. Dokładny audyt porównuje Laplace'a z niezależną eliminacją i zachowuje pełne 6381 instancji opublikowanego MT-EDU-005. P2: następne luki rozdzielono na MT-EDU-006B, 007, 008, 009, 010 i 011 oraz istniejący MT-EXAM-001 powyżej. PR #21 został scalony na main; CI i Deploy Pages dla ea1cae4 zakończyły się sukcesem. Pełny zakres prywatnych arkuszy, fizyczny Safari oraz pozostałe tematy nie są deklarowane jako ukończone.

### MT-EDU-006B — wykonane P0–P2, P3 odłożony

P0: `inverse-two`, `inverse-three`, `inverse-existence`, `inverse-applications` — 13 par ×24 = 312 instancji. P1: `matrix-rank`, `capelli-given-ranks`, `capelli-matrices` — 6 par ×24 = 144. P2: `gauss-unique`, `gauss-classification` — 7 par ×24 = 168. Łącznie 9 rodzin i 648 nowych instancji; cały katalog 76 rodzin, 7293 instancje w 13 kategoriach. Audyt dawnych 6645 pełnych lekcji PL/EN bazuje na opublikowanym main po PR #21. Nie zmieniono schematu postępów ani brudnopisu.

Opcjonalne P3 częściowo wykonano: Cramer czterech niewiadomych (`D,D1…D4`) i `XA=B` mają 2 rodziny / 96 wariantów. Cały katalog obejmuje 78 rodzin / 7365 instancji, 68 rodzin L4 i 65 L5. Układ dwóch równań macierzowych pozostaje przyszły. M03/M04 wymagają osobnej oceny pełniejszej wykonalności mnożenia i potęg. M09–M11 nadal dotyczą kontrolowanych struktur wyznaczników. M12–M14 i U05–U08 mają opisany rzeczywisty, ograniczony zasięg w mapie kompetencji. 43 prywatnych PDF-ów nie udostępniono, a fizycznego Safari nie przetestowano w chmurze.

## MT-DIAG-001 — etap realizowany oddzielnym PR

- P0: analiza błędnej odpowiedzi na żądanie w ćwiczeniu i po oddaniu sprawdzianu, bez fałszywej pewności diagnozy. Wspierane są dotychczasowe wzorce wyniku oraz pewny brak `+C`.
- P1 (pierwsza wersja): dobrowolne sprawdzanie istniejących pytań o krok pośredni i trzy inne zadania z tej samej rodziny/poziomu, odseparowane od wyniku sprawdzianu.
- P1 (wybrane sondy): zaimplementowano weryfikację pojedynczych kroków det 2×2, Sarrusa 3×3, pierwszej komórki AB, głównego D w Cramerze 2×2/3×3 i minora Laplace’a 4×4/5×5. Dalsze sondy rachunków algebry i macierzy pozostają do rozbudowy; obecna funkcja **nie** analizuje dowolnych kroków ani rysunku z brudnopisu.
- P2 (odłożone): lokalna statystyka potwierdzonych typów pomyłek i powtórki według kompetencji; brak danych oznacza brak wniosku.

Wdrożenie wymaga CI, niezależnej recenzji i osobnej zgody właściciela; PR nie jest automatycznie scalany. Nie powstaje osobny panel dla konkretnej uczelni.
