# Współtworzenie

Dziękujemy za wkład w Math Tutor. Zgłaszaj błędy matematyczne z przykładowym zadaniem, wpisaną odpowiedzią oraz oczekiwanym wyjaśnieniem. Proponowane zmiany przygotuj na osobnej gałęzi i opisz ich wpływ na użytkownika.

Przed Pull Request uruchom:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Nowe zadania powinny mieć sprawdzony wynik, jasne wyjaśnienie i test błędnej odpowiedzi. Unikaj nazywania ręcznych reguł inteligentną diagnostyką. Nie dodawaj zewnętrznych połączeń przesyłających odpowiedzi użytkownika.

Wkład jest udostępniany na warunkach licencji [MIT](LICENSE).

## Rozwiązania i brudnopis

Dodając lub zmieniając rodzinę, uzupełnij `solutions/model.ts`: etap ma działanie i uzasadnienie, a ostatni prawdziwy `AnswerSpec`. Nie wycinaj zdań z `explanation`. Dodaj niezależne sprawdzenie rachunku; audyt musi obejmować każdy wariant i poziom, także znaki, zera, ułamki i klasyfikację pierwiastków. Testy sprawdzają również dokumentowaną sumę instancji w GENERATORS.md.

Zmiany brudnopisu sprawdzaj przy auto-clear ON i OFF: nowe uruchomienie tej samej treści, rodzina/kategoria/poziom, zakończenie i nowa sesja, clear/undo, tekst i rysunek, natywne Undo/Redo symbolu w zaznaczeniu, anulowanie wskaźnika, resize i powiększenie. Rozwiązanie resetuje się zawsze; brudnopis według checkboxa. Sprawdź klawiaturę i brak overflow na 375/768 px. Oprócz automatycznych testów Chromium przed merge ręcznie sprawdź Safari na iPhonie/iPadzie: palec/piórko, obrót, zaznaczenie i klawiaturę ekranową, Undo/Redo, fokus i przewijanie powiększonego widoku. Zanotuj urządzenie i wersję; nie deklaruj testu urządzenia na podstawie emulacji Chromium.

## Pięć poziomów i PL/EN

Poziomy i ich kolejność dodawaj wyłącznie w `src/difficulty.ts`. Rodzina deklaruje wsparcie; nie mapuj brakującego poziomu na niższy. Każda wspierana kombinacja musi mieć minimum 10 unikalnych treści, poprawną typowaną odpowiedź i pełne kroki. W nowych wzorcach preferuj 24 kontrolowane indeksy, nie niezależne losowanie każdego pola. Rozszerzenie poziomów 4/5 musi zwiększać złożoność zależnych działań. Zmianę zakresów/uzupełnień odnotuj w mapie GENERATORS.md; testy liczą rzeczywiste instancje, nie przyjmują ręcznej sumy.

Polecenia EN, tytuły, wskazówki, etykiety i diagnozy uzupełniaj w `locales/lessons-en.ts`, interfejs w `locales/ui.ts`, a komunikaty nowego silnika w `locales/math.ts`. Przy zmianie etapów starego rozwiązania sprawdź także angielskie sceny: liczba etapów, ich znaczenie i rachunki muszą się zgadzać. Nie stosuj zastępczego polskiego tekstu w EN. Nie tłumacz notatek użytkownika. Locale nigdy nie może wpływać na parametry, klucz treści, ID, losowanie ani ocenę.

Audytuj wszystkie rodziny × wspierane poziomy × warianty. Do wzorów użyj niezależnych podstawień, do wyznaczników Laplace'a, do ułamków niezależnego mnożenia krzyżowego. Sprawdzaj brak zerowych mianowników, poprawność każdego pośredniego rachunku i pełny wynik końcowy. Testuj PL→EN→PL z wpisaną i sprawdzoną odpowiedzią, diagnozą, pomocniczym krokiem, częściowym i pełnym rozwiązaniem, notatkami/rysunkiem oraz sesją. Zachowaj minimum 7 samodzielnych ocen i granice easy/expert. Zmiana języka, trybu i powiększenie nie mogą niszczyć natywnego Undo/Redo.

W Chromium sprawdzaj 375, 768 i 1280 px oraz angielski przepływ aż do podsumowania i rekomendacji. Safari na fizycznym iPhonie/iPadzie weryfikuj dodatkowo w obu językach; zanotuj urządzenie i wersję. Testy emulowanego viewportu nie są takim testem. Żaden commit ani PR nie upoważnia do merge lub deploy bez osobnej zgody użytkownika.

## Lokalna historia — MT-004A

Zapisuj jedynie zdarzenie ukończenia sesji i kanoniczne ID rodziny/poziomu oraz pierwszy wynik z `session.ts`. Nie przeliczaj historii z formularzy lub przetłumaczonego tekstu. Nie zapisuj odpowiedzi, ID/parametrów ćwiczeń, notatek, rysunków, aktywnej sesji ani języka. Walidator i numer schematu są kontraktem, a limit historii wynosi 200. Odczyt, zapis, quota, nieznana wersja i kasowanie muszą mieć testy; uszkodzone/przyszłe dane nie mogą być cicho nadpisywane.

Testy prywatności dopuszczają tylko `math-tutor.progress.v1` po ukończeniu sesji, bez innych kluczy localStorage, sessionStorage lub zewnętrznych żądań. Testuj zapis dokładnie raz, powrót do wyniku, usunięcie i reload, eksport niezależny od filtrów, procent z jawnym mianownikiem, PL/EN i powrót do nauki bez resetu.

Brudnopis ma być domyślnie zwinięty pomiędzy treścią a odpowiedzią. Nie używaj conditional mount ani klucza zależnego od zwinięcia/widoku/języka. Sprawdzaj realne wpisywanie, Backspace, Ctrl/Cmd+Z, Redo, zaznaczenie i tożsamość textarea, rysunki, auto-clear ON/OFF oraz schowanie modala bez osieroconej blokady przewijania. Tylko nowe zadanie z auto-clear ON odcina historię.

## Modele i audyty MT-EDU-004 P0–P3

Rozszerzając istniejące rodziny uniwersyteckie, używaj `university/schema.ts`, właściwego prezentera i rejestru `university/catalog.ts`. Zachowuj jawne poziomy, 24 rzeczywiste warianty i autorskie parametryczne teksty PL/EN. Nie importuj testowych `audit.ts` / `functions-audit.ts` do produkcji. Oczekiwane wyniki testów mają wynikać z niezależnego algorytmu.

Układ oznaczony wymaga wszystkich niewiadomych także po klasyfikacji. Testuj D=0, elementy główne równe zero, rząd i podstawienie do każdego równania. Przy granicach odróżniaj dokładną liczbę, oba znaki nieskończoności i brak granicy; oscylacji nie weryfikuj kilkoma przybliżeniami. Dziedziny sprawdzaj we wszystkich komórkach stałego znaku i końcach. Swobodnego porównania tekstów symbolicznych, `eval` i zaokrągleń nie zastępują testowane typy odpowiedzi.

Utrzymuj rzeczywiste liczby rodzin, wspieranych par i instancji w GENERATORS/README. Audyt zachowuje 3501 poprzednich zadań oraz sprawdza globalne ID, treści nowych wariantów, rachunki i zgodność PL/EN. Testuj nowe formularze jako correct/incorrect/invalid, z pierwszą oceną w sesji i zmianą języka. W E2E wyliczaj wynik z publicznego polecenia zamiast ukrytego stanu. W testach tabelarycznych wybieraj przypadki po rodzaju odpowiedzi, nie po indeksie zmieniającym znaczenie po dodaniu typu.

PR #17 obejmował P0–P3 i został scalony oraz opublikowany. MT-EDU-005 realizuje granice funkcji i pochodne w osobnym PR; całki i dwie zmienne pozostają poza nim.

## MT-EDU-005 — reguły audytu

Zachowaj wszystkie 5229 opublikowanych lekcji z afcb248. Fixture `src/university/fixtures/mtedu004-baseline.json` pochodzi z archiwum tego commita: SHA-256 JSON pełnych task+solution dla PL/EN, z BigInt zamienionym na napisy, zadania sortowane po ID. Test porównuje każdy skrót i wsparcie poziomów. Nie regeneruj fixture z nowej gałęzi, aby ukryć regresję; zamierzona zmiana starej lekcji wymaga osobnego uzasadnienia i przeglądu.

Granice punktowe audytuj niezależnym rozwinięciem P(a+h), z krotnościami i znakami obu stron. Sprzężenia wymagają dokładnego sprawdzenia tożsamości i dodatniego otoczenia. Pochodne rozwijaj osobnym splotem/algorytmem współczynników, sprawdzaj wszystkie pokazane wzory pośrednie i Calculation. Dla ekstremum nie wystarcza f′=0; dla maksimum ekonomicznego sprawdź dziedzinę i końce przedziału. Nie używaj próbek float jako dowodu. Pomocniki parsujące kontrolowane polecenia E2E są wyłącznie testowe, nie są walidatorem swobodnej odpowiedzi użytkownika.

Uruchamiaj nowe audyty, testy wyczerpania pul, sesji/postępów, pełne Vitest/build/Playwright. Nowe kategorie testuj w PL/EN na 375/768/1280 px z invalid/incorrect/correct, zmianą języka, krokami, rysunkiem i natywnym Undo/Redo, zapisem oraz odczytem historii. Faktyczny stan fizycznego Safari zawsze zgłaszaj osobno; emulacja Chromium nie jest testem iPhone/iPad.

## MT-EDU-006A — utrzymanie wyznaczników i mapy pokrycia

Nie rozszerzaj globalnego `matrixShape` ani siatki odpowiedzi na 4×4/5×5 przy dodawaniu wyznaczników. Oddzielny `SquareDeterminantMatrix` ma jedną odpowiedź skalarną. Każda zmiana rozwinięcia Laplace'a wymaga sprawdzenia znaku `(-1)^(i+j)`, poprawnego usunięcia wiersza i kolumny oraz dokładnego wyniku niezależną eliminacją. Sarrus jest dozwolony tylko dla 3×3. W operacjach wierszowych zamiana odwraca znak, skala mnoży det, dodanie wielokrotności innego wiersza go zachowuje. Nie przepisuj wyników generatora do jego audytu.

Fixture `mtedu005-baseline.json` powstał z archiwum scalonego `main` 69452a6. Nie aktualizuj go z gałęzi roboczej dla pozornego zaliczenia regresji; świadoma zmiana dawnej lekcji wymaga osobnego uzasadnienia. Mapa [UWM_COVERAGE.md](UWM_COVERAGE.md) opisuje tematy na podstawie publicznego indeksu Issue #20, bez prywatnych PDF-ów. Przy zmianie zakresu zmieniaj status tylko wtedy, gdy istnieje rzeczywista rodzina generatora i matematyczny audyt. Oryginalne arkusze i dane studentów nie trafiają do repozytorium.

## MT-EDU-006B — zmiany solvera

Nowe macierze i układy sprawdzaj niezależnie: odwrotność przez dopełnienia i oba iloczyny jednostkowe; rząd przez minory, a nie drugi przebieg tej samej redukcji; układy przez rzędy, wyznaczniki i podstawienie do każdego oryginalnego równania. Zwracaj uwagę na zerowe pivoty, zamiany wierszy, dokładność ułamków i bezpieczne oznaczenie parametrów. Przed zmianą starych rodzin porównaj archiwum 6645 opublikowanych lekcji `mtedu006a-baseline.json`; nie regeneruj fixture z gałęzi roboczej. Przypadki `AX=B` i `XA=B` wymagają osobnych dowodów kolejności mnożenia.

Dla Cramera 4×4 sprawdzaj D i wszystkie cztery Dⱼ inną metodą niż produkcyjny Laplace (obecny audyt używa wzoru Leibniza). Przy D=0 sprawdź rzędy i nie twórz ilorazów; przy D≠0 podstaw wszystkie cztery wyniki do oryginalnych równań. Pokazaną parametryzację testuj dla zera i wektorów bazowych parametrów, co w dokładnym modelu afinicznym sprawdza całą rodzinę.

## Recenzja po zakończeniu CI

Dla PR do `main` poczekaj na ukończenie najnowszej próby workflow `CI` dla dokładnego HEAD SHA. Po wdrożeniu MT-AUTO-001 na gałąź domyślną komentarz `math-tutor-ci-gate:v1` będzie raportował historyczny wynik konkretnej próby, bez potwierdzania aktualnego statusu CI ani oceny Work. Przed decyzją sprawdź najnowsze CI i niezależną recenzję; wymagane pozostają ewentualny test fizycznego Safari i zgoda właściciela. Zobacz [instrukcję automatyzacji](docs/WORK_REVIEW_AUTOMATION.md).
