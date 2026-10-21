# Plan rozwoju

MT-UWM-001 (przygotowane do recenzji): panel PL/EN z bezpośrednim wyborem istniejących generatorów do powtórki wyznaczników 2×2–5×5, macierzy odwrotnych, AX=B/XA=B oraz Cramera. Dodatkowo autorska karta metod z ukrytymi rozwiązaniami i ręcznie oceniana próbna wejściówka za 7 punktów. Nie jest to oficjalny arkusz UWM ani nowy generator zadań. MT-EXAM-002 może później dodać dobór konkretnych rodzin i zautomatyzowaną punktację 7 pkt po scaleniu MT-EXAM-001. Diagnostyka ręcznych kroków pozostaje zakresem MT-DIAG-001.


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
| MT-EDU-006A | Scalone na main w PR #21 | Wstępna [mapa 64 kompetencji](UWM_COVERAGE.md); autorskie Laplace 4×4/5×5, operacje wierszowe i własności wyznaczników |
| MT-EDU-006B P0–P2 | Implementacja Issue #22 do recenzji | Odwrotności 2×2/3×3, AX=B, rząd macierzy, Capelli oraz Gauss 3×3/4×4: 9 rodzin, 624 instancje |
| MT-EDU-006B P3 | Częściowo wykonany zakres opcjonalny | Cramer 4×4 i XA=B wdrożone; układ dwóch równań macierzowych odłożony |
| MT-EDU-007 | Scalone na main w PR #25; P0–P2 ukończone, P3 częściowo | 16 rodzin / 1224 warianty: P0–P2 oraz kontrolowane badanie wielomianu i funkcji wymiernej; nonsmooth styczne, ogólne funkcje i wykresy pozostają przyszłe |
| MT-UX-001 | Scalone na main w PR #29 | Wyszukiwanie rodzin PL/EN w całym katalogu, jawny dobór kategorii i poziomu oraz krótsza lista mobilna; bez zmian w 8589 wcześniejszych zadaniach |
| MT-EDU-008 P0–P2 | Implementacja do recenzji | Całki I01–I06: 6 rodzin / 432 warianty; wielomiany, wybrane tablicowe, podstawienie, części, powracające i oznaczone, ograniczony dokładny formularz funkcji pierwotnej |
| MT-EDU-008 P3 | Przyszły etap | I07 pola między krzywymi i I08 długość łuku wymagają osobnych, w pełni zweryfikowanych generatorów |
| MT-EDU-009 | Przyszły etap | Dwie zmienne W01–W03: pochodne cząstkowe, ekstrema, granice i ciągłość |
| MT-EXAM-001 | Przyszły etap po domknięciu mapy | Tryb sprawdzianu, dobór umiejętności i powtórki |
| MT-004B / MT-004C | Możliwe kolejne etapy — poza tym PR | Dobrowolna powtórka słabszych tematów, bezpieczny import lub dalsze funkcje po osobnej decyzji |
| MT-005 | Pilotaż | Testy użyteczności z dorosłymi uczącymi się, poprawki treści i dostępności |

MathLive i Compute Engine mogą zostać ocenione w późniejszych etapach, gdy pojawi się potrzeba wprowadzania i analizy wyrażeń. Nie są wymagane do MT-003A.

MT-003B.1 jest pierwszym ograniczonym etapem adaptacji, nie pełnym systemem doboru rodzin. Nie zmienia samoczynnie poziomu ani kategorii. Aktywna sesja istnieje tylko w pamięci karty; trwałe metadane ukończeń dodaje MT-004A.

MT-UX-001 zostało scalone na `main` w PR #29. MT-EDU-007 zostało scalone, lecz jego P3 nadal obejmuje tylko dwie kontrolowane rodziny; nie deklarujemy pełnego badania dowolnej funkcji. Wyszukiwanie nie zmieniło treści ani ID wcześniejszych 8589 wariantów i obejmuje również rodziny całek dodawane przez MT-EDU-008. Nowy PR #30 wymaga własnych testów, CI, recenzji Work i zgody właściciela przed scaleniem.

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

P0: [mapa 64 kompetencji](UWM_COVERAGE.md) na podstawie indeksu Issue #20, bez dostępu do prywatnych 43 PDF-ów. P1: cztery autorskie rodziny wyznaczników 4×4/5×5, 11 par rodzina/poziom i 264 różne zadania. Katalog po tej zmianie obejmuje 67 rodzin, 6645 instancji i 13 kategorii; 59 rodzin wspiera każdy z poziomów Advanced i Expert. Dokładny audyt porównuje Laplace'a z niezależną eliminacją i zachowuje pełne 6381 instancji opublikowanego MT-EDU-005. P2: następne luki rozdzielono na MT-EDU-006B, 007, 008, 009 i MT-EXAM-001 powyżej. PR #21 został scalony na main; CI i Deploy Pages dla ea1cae4 zakończyły się sukcesem. Pełny zakres prywatnych arkuszy, fizyczny Safari oraz pozostałe tematy nie są deklarowane jako ukończone.

### MT-EDU-006B — wykonane P0–P2, P3 odłożony

P0: `inverse-two`, `inverse-three`, `inverse-existence`, `inverse-applications` — 13 par ×24 = 312 instancji. P1: `matrix-rank`, `capelli-given-ranks`, `capelli-matrices` — 6 par ×24 = 144. P2: `gauss-unique`, `gauss-classification` — 7 par ×24 = 168. Łącznie 9 rodzin i 648 nowych instancji; cały katalog 76 rodzin, 7293 instancje w 13 kategoriach. Audyt dawnych 6645 pełnych lekcji PL/EN bazuje na opublikowanym main po PR #21. Nie zmieniono schematu postępów ani brudnopisu.

Opcjonalne P3 częściowo wykonano: Cramer czterech niewiadomych (`D,D1…D4`) i `XA=B` mają 2 rodziny / 96 wariantów. Cały katalog obejmuje 78 rodzin / 7365 instancji, 68 rodzin L4 i 65 L5. Układ dwóch równań macierzowych pozostaje przyszły. M03/M04 wymagają osobnej oceny pełniejszej wykonalności mnożenia i potęg. M09–M11 nadal dotyczą kontrolowanych struktur wyznaczników. M12–M14 i U05–U08 mają opisany rzeczywisty, ograniczony zasięg w mapie UWM. 43 prywatnych PDF-ów nie udostępniono, a fizycznego Safari nie przetestowano w chmurze.
