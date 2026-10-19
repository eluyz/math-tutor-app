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
| MT-EDU-004 P0–P3 | Implementacja do niezależnego przeglądu w PR #17 | Kolejność brudnopisu; układy, funkcje i granice ciągów: 16 nowych rodzin, 1728 wariantów, pełne PL/EN |
| MT-EDU-004 P4 | Granice funkcji — przyszły etap | Punkt i nieskończoność, 0/0, faktoryzacja, granice jednostronne, f(a) a granica |
| MT-EDU-004 P5 | Pochodne — przyszły etap po P4 | Dokładne współczynniki, suma/iloczyn/złożenie, styczna, monotoniczność, ekstrema i wielkości krańcowe |
| MT-EDU-004 P6 | Całki i dwie zmienne — przyszły etap po P5 | Rodzina pierwotnych z +C, całki oznaczone; wartości, dziedziny, pochodne cząstkowe i gradient |
| MT-004B / MT-004C | Możliwe kolejne etapy — poza tym PR | Dobrowolna powtórka słabszych tematów, bezpieczny import lub dalsze funkcje po osobnej decyzji |
| MT-005 | Pilotaż | Testy użyteczności z dorosłymi uczącymi się, poprawki treści i dostępności |

MathLive i Compute Engine mogą zostać ocenione w późniejszych etapach, gdy pojawi się potrzeba wprowadzania i analizy wyrażeń. Nie są wymagane do MT-003A.

MT-003B.1 jest pierwszym ograniczonym etapem adaptacji, nie pełnym systemem doboru rodzin. Nie zmienia samoczynnie poziomu ani kategorii. Aktywna sesja istnieje tylko w pamięci karty; trwałe metadane ukończeń dodaje MT-004A.

MT-EDU-001 rozszerza treści i typy odpowiedzi, zachowując granice MT-003A.1/MT-003B.1. Nie obejmuje jeszcze Viète'a, macierzy odwrotnej, Cramera, granic, pochodnych ani całek. Zatwierdzenie pakietu wymaga zielonego CI i przeglądu; implementacja lokalna nie oznacza publikacji.

MT-EDU-002A wymaga niezależnej recenzji ChatGPT Work i osobnej zgody użytkownika na merge. Lokalna weryfikacja Chromium nie zastępuje ręcznego sprawdzenia Safari na iPhonie/iPadzie. Opcjonalnej kratki nie dodano; szablony, eksport, OCR i trwały zapis pozostają poza V1.

MT-EDU-003 zostało scalone i opublikowane w PR #13: pięć poziomów, 29 rodzin na advanced i expert, 1392 wyższe warianty oraz 17 uzupełnień starych małych pul; kompletny proces nauki w PL/EN. Pozostałe sześć rodzin świadomie nie ma L4/L5. Szczegółowa mapa i audyt są w GENERATORS.md. Nie obejmuje nowych działów roadmapy, OCR, eksportu notatek ani trwałej historii. Dalsze zmiany nadal wymagają zielonego CI, niezależnej recenzji, kontroli Safari i oddzielnej zgody użytkownika na merge/deploy.

MT-004A zachowuje wyłącznie historię ukończonych sesji; aktywne zadanie, niedokończona sesja, brudnopis i język nadal znikają po odświeżeniu. Zapis jest lokalny dla przeglądarki i urządzenia, bez kont, telemetrii, backendu i synchronizacji. Wyczyszczenie danych przeglądarki może go usunąć. Eksport obejmuje metadane historii, nie notatki; import jest odłożony. PR #15 został scalony; CI i Deploy Pages dla 9499955 zakończyły się sukcesem. Nowe zmiany wymagają własnego zielonego CI dla HEAD, recenzji Work i zgody użytkownika.

### Rzeczywisty zakres PR #17

P0–P3 obejmują 16 nowych rodzin i 1728 nowych instancji, po 24 warianty dla 72 wspieranych par rodzina/poziom. Razem z niezmienionymi 3501 wcześniejszymi instancjami jest 51 rodzin i 5229 zadań. Po 43 rodziny wspierają advanced i expert. Klasyfikacja i monotoniczność liniowej nie deklarują pozornych wyższych poziomów, Cramer 3×3 zaczyna od hard, a złożenia od medium. Szczegóły i dowody audytu są w GENERATORS.

P4–P6 nie są wdrożone w tym PR. W przyszłym P4 model granicy musi rozróżnić f(a), granicę i brak granicy oraz analizować krotności i znaki jednostronne, bez zgadywania numerycznego. P5 wymaga poprawnego sprawdzania wyrażeń lub opisanych współczynników, reguł z uzasadnieniem i niezależnej kontroli symbolicznej. P6 wymaga jawnego +C, dokładnego F(górna)−F(dolna), precyzyjnej dziedziny dwóch zmiennych i uporządkowanego gradientu. Nie ma ich niegotowych przycisków w interfejsie.

Wykresy SVG pozostają opcjonalną pomocą na przyszłość; nie dodano ciężkich bibliotek. Ręczna kontrola fizycznego Safari pozostaje osobnym zadaniem przed scaleniem. Gotowość do recenzji nie oznacza zgody na merge lub publikację. Nie rozpoczęto MT-004B/004C ani nowej adaptacji.
