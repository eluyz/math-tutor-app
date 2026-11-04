# Batch B — Automated Acceptance QA

Data wykonania: 2026-11-04 (Europe/Warsaw). Issue: [#151](https://github.com/eluyz/math-tutor-app/issues/151). Baza: `8db9ca714932e04f19e60fa4b88d22217d08efd6`, aktualny `origin/main` przy rozpoczęciu pracy, po PR #169. Gałąź: `qa/batch-b-automated-acceptance`.

## Zakres i znaczenie wyników

Pakiet obejmuje wyłącznie C01, C03, F01, G01, G02, G03, G05 i D01. Katalog pozostaje na poziomie **231 rodzin / 18 093 warianty**. Nie uruchomiono audytu #106, nie zmieniono #151, formalnych checkboxów, Batch A, F05 ani innych PR.

- `METHOD_PASS`: zweryfikowana matematyka, metoda i przepływ aplikacji w opisanym zakresie syntetycznych przykładów.
- `NEEDS_FIX`: odtworzony, konkretny błąd; po naprawie wymagane ponowne testy.
- `BLOCKED_SOURCE`: brak bezpośredniego porównania z prywatnym oryginałem w tej sesji.
- `SOURCE_PASS_CANDIDATE`: metoda gotowa do porównania z oryginałem i końcowej recenzji; nie zastępuje `SOURCE_PASS`.

**W tej sesji nie udostępniono prywatnych PDF-ów ani kluczy.** Historyczny zapis bezpośredniego odczytu źródeł w `SOURCE_ACCEPTANCE_BATCH_B_METHODS.md` jest kontekstem, a nie nowym dowodem uzyskanym przez ten pakiet. Nie skopiowano prywatnych zadań, współczynników, kluczy ani obrazów. Każdy poniższy wiersz pozostaje `BLOCKED_SOURCE` w wymiarze formalnej akceptacji. Liczniki: Batch A 6/6, Batch B **0/8 SOURCE_PASS**, łącznie 6/14 w #151; 6/64 formalnie zaakceptowane.

## Powtarzalna macierz

Manifest: `src/qa/batchB.ts`. Zapis `family:level:v` oznacza dokładne ID zadania. Testy jednostkowe obejmują **wszystkie 0..23** dla każdego z 16 zestawów rodzina–poziom, razem **384 zadania / 768 lokalizacji PL/EN**. Kolumna wariantów wskazuje dodatkowo **33 konkretne zadania** obowiązkowo odwiedzane przez Playwright w każdej kombinacji języka i szerokości, razem 132 świadectwa UI w 64 testach.

| Kompetencja | Rodzina : poziom : warianty UI | Niezależna kontrola i przypadki brzegowe | Status metody | Bramka źródłowa |
| --- | --- | --- | --- | --- |
| C01 | `sequence-rational:medium:1,7` | Rozwinięcie przez splot współczynników, porównanie stopni i współczynników wiodących; ilorazy z granicą zerową i niezerową | METHOD_PASS | BLOCKED_SOURCE |
| C03 | `sequence-conjugate:medium:1`; `sequence-conjugate:hard:12` | Sprzężenie, iloraz współczynnika liniowego przez podwojoną skalę pierwiastka; testy bazowe obejmują także resztę dopełnienia kwadratu | METHOD_PASS | BLOCKED_SOURCE |
| F01 | `function-radical-over-linear-domain:medium:0,1,2`; `function-domain:hard:0`; `function-domain:expert:0,1` | Osobno znak radikandu, biegun i krańce; biegun poza/promieniem/na brzegu; pierwiastek w mianowniku wymaga ścisłej dodatniości; każdy punkt graniczny i każda otwarta komórka osi | METHOD_PASS | BLOCKED_SOURCE |
| G01 | `limit-point:easy:1` | Bezpośrednie podstawienie do niezależnie rozwiniętych wielomianów przy niezerowym mianowniku | METHOD_PASS | BLOCKED_SOURCE |
| G02 | `limit-point:medium:1` | Dokładny rząd zera licznika i mianownika po przesunięciu do a; skracanie tylko dla x≠a, wartość granicy odrębna od wartości w dziurze | METHOD_PASS | BLOCKED_SOURCE |
| G03 | `limit-point:hard:0,1,2`; `limit-cancelled-pole:hard:0,1` | Lewa, prawa i obustronna granica; przeciwne nieskończoności; dodatkowo 0/0 z licznikiem rzędu 1 i mianownikiem rzędu 2 | METHOD_PASS | BLOCKED_SOURCE |
| G05 | `limit-conjugate:advanced:0`; `limit-root-infinity-conjugates:advanced:0,1,2,3`; `limit-radical-infinity:hard:0,1,2,3` | Punkt skończony i drugi rząd; pary pierwiastków i składnik liniowy przy ±∞; √(x²)=\|x\|, znak kierunku, wzrost jak √x; skończone i nieskończone wyniki | METHOD_PASS | BLOCKED_SOURCE |
| D01 | `derivative-formula:easy:2`; `derivative-fractional-powers:medium:0,1,2,3`; `derivative-higher-root-powers:hard:0,1` | Niezależna reguła potęgowa; pierwiastki 2/3/4/5/6 stopnia, ujemne i ułamkowe potęgi, iloraz po uproszczeniu; jawne x>0; kontrola numeryczna pochodnej oryginalnych wyrażeń w istniejących testach | METHOD_PASS | BLOCKED_SOURCE |

Granice: to ograniczone klasy generatorów, nie ogólny parser symboliczny, nie pełna reprezentacja każdego prywatnego podpunktu. D01 nie oznacza dowolnych ilorazów i dziedzin poza zadeklarowanym x>0. Zera, stałe i pozostałe 23 warianty każdego wybranego zestawu są sprawdzane jednostkowo.

## Niezależność i zawartość testów

`batchBOracle` nie korzysta z produkcyjnych solverów granic, pochodnych ani dziedzin i nie odczytuje poprawnych wartości `answer.value` / `answer.values`. Korzysta z odrębnego referencyjnego rozwijania i przesuwania współczynników (`functions-audit.ts`) oraz podstawowej arytmetyki wymiernej. Dla wyboru dziedziny odczytuje wyłącznie dostępne opcje i dekoduje ich zbiory; dopasowanie musi być jednoznaczne na wszystkich punktach granicznych i otwartych komórkach. Wykładniki pochodnych są zapisane niezależnie od tabel produkcyjnych. Istniejące testy uzupełniają te kontrole o obliczenia na oryginalnych postaciach syntetycznych funkcji i różnice centralne.

Każdy wariant jednostkowy sprawdza odpowiedź poprawną obliczoną przez oracle, błędną i pustą, dwie różne podpowiedzi, wyjaśnienie i wszystkie rachunki kroków w PL i EN. Niezależny wynik jest porównywany z rzeczywistym ocenianiem aplikacji. Audyt rachunków dodatkowo sprawdza arytmetykę zapisanych kroków; sam ten audyt nie stanowi dowodu semantycznego całego uzasadnienia.

Playwright uruchamia rzeczywisty **produkcyjny `dist` przez `vite preview`** na osobnym porcie 4273. Zamraża wyłącznie ziarno generatora (`Date.now = 151169`), wybiera rodzinę przez UI i przechodzi skończoną pulę do wymaganych ID; brak interfejsu testowego w kodzie aplikacji. Każdą wyświetloną treść dopasowuje jednoznacznie do wariantu. Sprawdza kolejno pustą, błędną i poprawną odpowiedź, rzeczywiste teksty obu podpowiedzi, wszystkie akcje i uzasadnienia rozwiązania, końcową odpowiedź, brak polskich fraz w EN, brak poziomego przewijania po podpowiedziach i pełnym rozwiązaniu. Rejestruje `pageerror`, `console.error`, błędy żądań oraz HTTP ≥400 bez wyciszania favicon. Każdy test zapisuje screenshot rozwiązania i JSON z odwiedzonymi ID, językiem, szerokością i listą błędów.

## Naprawy

1. **G05 / NEEDS_FIX → naprawione:** pierwszy krok `limit-root-infinity-conjugates` dla `linear-pair` mówił o radikandzie kwadratowym s²x² i skali s\|x\|. Dla wyświetlanej pary liniowych radikandów jest to błędne uzasadnienie, choć wynik 0 był poprawny. Rozdzielono uzasadnienie: dodatnia półoś, składniki s²x i x, wzrost obu składników jak s√x po uwzględnieniu współczynnika. Osobna regresja PL/EN sprawdza właściwy stopień i brak starej kwadratowej argumentacji.
2. **Błąd konsoli produkcyjnego UI / NEEDS_FIX → naprawione:** Chromium pobierał `/favicon.ico`, otrzymując 404. Dodano własną lokalną ikonę SVG i link oparty na `%BASE_URL%`, zgodny z podścieżką Pages. Test produkcyjny wykrył błąd przed naprawą i wymaga zerowej listy błędów po naprawie.

Nie zmieniano matematycznych wyników ani reguł oceniania. Liczba rodzin i wariantów pozostaje stała.

## Wykonanie i dowody

```bash
npm_config_cache=/tmp/math-tutor-npm npm ci
npm run test:batch-b
npm test -- --maxWorkers=2
npm run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e:batch-b
```

`package.json` udostępnia `test`, `build`, `test:e2e` oraz nowe `test:batch-b` i `test:e2e:batch-b`. Osobna konfiguracja produkcyjna jest wyłączona z zwykłej konfiguracji dev; CI uruchamia ją oddzielnym krokiem po pełnym dotychczasowym Playwright. CI zachowuje JSON, HTML, screenshoty i ślady błędów jako `batch-b-browser-evidence` przez 14 dni. Zapisana skrócona ewidencja lokalna (64 werdykty, 132 dokładne ID i hashe testowanych plików): [`qa-batch-b/local-results.json`](qa-batch-b/local-results.json). Lokalnie: `test-results/batch-b-results.json`, `test-results/batch-b/`, `playwright-report/batch-b/index.html`; te pliki są celowo ignorowane przez Git.

| Kontrola | Wynik |
| --- | --- |
| `npm ci` | PASS |
| `npm run test:batch-b` | PASS — 13 plików, 83 testy |
| Nowa macierz jednostkowa | PASS — 17 testów, 384 warianty × PL/EN |
| Pełny `npm test -- --maxWorkers=2` | PASS — 123 pliki, 1572 testy |
| Produkcyjny build | PASS — TypeScript + Vite; ostrzeżenie o istniejącym dużym chunku JS |
| Produkcyjny Chromium PL/EN × 375/1280 | PASS — 64/64 testy, 132 świadectwa, 0 skipped/flaky, 0 błędów konsoli/HTTP/pageerror |
| Dotychczasowe odpowiednie Playwright | PASS — 60 testów z 10 plików; cały `sequences.spec.ts` 12/12 PASS po ponownym uruchomieniu własnego serwera |

Pierwsze pełne uruchomienie `npm test` przy automatycznej liczbie workerów: 1571 PASS / 1 timeout — historyczny test 5229 opublikowanych zadań przekroczył domyślne 5000 ms (6184 ms przy współbieżnym obciążeniu). Nie wystąpiła niezgodność snapshotów ani asercji matematycznej; nie podniesiono limitu ani nie zmieniano fixture. Wynik powtórki z kontrolowanym obciążeniem podano powyżej.

Regresyjny Playwright obejmował `sequences`, `functions`, `function-limits`, `derivatives`, `rootPoleDomain`, `cancelledPoleSource`, `limitFollowup`, `infinityRootConjugation`, `fractionalPowerDerivatives` i `higherRootDerivatives` przez `npm run test:e2e -- <pliki> --workers=2`. Pierwszy przebieg: 53 PASS, 7 `ERR_CONNECTION_REFUSED` w `sequences.spec.ts` po zatrzymaniu wcześniej istniejącego serwera dev. Powtórka całego tego pliku z `CI=true` (własny serwer Playwright): 12/12 PASS. To błąd infrastruktury uruchomienia, bez zmiany aplikacji ani testów. Łącznie wszystkie 60 testów uzyskało PASS; nie ukryto wcześniejszych przerwań. Zwykła konfiguracja nadal odkrywa 877 dotychczasowych testów w 93 plikach, a konfiguracja produkcyjna osobno 64 testy Batch B.

Bazowa rewizja `8db9ca714932e04f19e60fa4b88d22217d08efd6`: [CI PASS](https://github.com/eluyz/math-tutor-app/actions/runs/41914558492), [Pages PASS](https://github.com/eluyz/math-tutor-app/actions/runs/41916496149), odczytane bezpośrednio z GitHub API. Te przebiegi dowodzą stanu **bazy**, nie zmian tego PR. Bieżące przebiegi pakietu: [CI gałęzi Batch B](https://github.com/eluyz/math-tutor-app/actions/workflows/ci.yml?query=branch%3Aqa%2Fbatch-b-automated-acceptance). Ostateczny werdykt i SHA należy odczytać z tego przebiegu oraz Checks Draft PR; lokalny PASS nie jest deklaracją wyniku zdalnego CI. Pages dla nowego HEAD nie jest uruchamiane przed scaleniem do main; nie deklarujemy go na podstawie produkcyjnego builda lokalnego.

## Pozostałe bramki właściciela

1. Bezpośrednie porównanie każdego wybranego oryginału i klucza lub niezależnie wyprowadzonego wyniku z dokładnym family/level/variant i końcowym SHA. Prywatne materiały pozostają prywatne; zapis publiczny może ograniczać się do anonimowego wskaźnika, topologii i werdyktu.
2. Końcowa recenzja zakresu i napraw, akceptacja kandydata oraz osobna zgoda na scalenie przy końcowym HEAD. Ten pakiet nie scala PR.
3. Po autoryzowanym scaleniu: CI i Pages PASS na identycznym SHA main oraz potwierdzenie wdrożonego UI przed aktualizacją formalnych pól w #151.
4. Fizyczne Safari / iOS pozostaje NOT_VERIFIED; testy Chromium nie są dowodem Safari. Szerokości 375 i 1280 px nie stanowią pełnej certyfikacji wszystkich urządzeń ani pełnego audytu dostępności.

Żaden zielony test nie nadaje automatycznie `SOURCE_PASS`. Po przejściu kontroli metody osiem kompetencji jest kandydatami do formalnej kontroli (`SOURCE_PASS_CANDIDATE`) przy utrzymanej blokadzie `BLOCKED_SOURCE` w tej sesji.
