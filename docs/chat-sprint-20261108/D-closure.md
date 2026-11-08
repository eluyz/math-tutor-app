# Chat Sprint D — pochodne i badanie funkcji (2026-11-08)

- Repozytorium: `eluyz/math-tutor-app`.
- Bazowy `main` SHA: `c44ef85531906c9179c529fdfc852eb0035a13b7`.
- Zakres: D01–D10. Powiązane: #108, #206, #214. PR #199 oraz #231 nie ingerują w pliki tej zmiany.
- Metody źródłowe P29/P32/P34 z prywatnych materiałów: **BLOCKED_SOURCE** — bez niezależnego zestawienia nie nadawać nowych SOURCE_PASS.
- Stany poniżej oznaczają *obecność metody w generatorach*, a nie wierne odtworzenie każdego ćwiczenia źródłowego.

## Mapa 10 kompetencji

| ID | Metoda już istnieje? — faktyczne family_id na main | Czy brak metody, czy dowodu? | Ważność egzaminacyjna | STATUS | Następny krok |
| --- | --- | --- | --- | --- | --- |
| D01 | Tak: `derivative-formula`, `derivative-fractional-powers`, `derivative-higher-root-powers` | Ograniczona klasa działa; historyczna mapa deklaruje scoped SOURCE_PASS, niepotwierdzony ponownie w tej sesji | wysoka | METHOD_PRESENT_BOUNDED / BLOCKED_SOURCE_RECHECK | Porównać oryginał z generatorem i niezależnym wynikiem |
| D02 | Częściowo: `derivative-product-point`, `derivative-quotient-point`, `derivative-quadratic-quotient` | Reguły iloczynu i ilorazu obecne dla kontrolowanych postaci; brak potwierdzenia wszystkich postaci źródłowych | wysoka | METHOD_PARTIAL / BLOCKED_SOURCE | P29: skontrolować wybrane formy; niezależne QA ilorazu z #214 oddzielnie |
| D03 | Częściowo: `analysis-log-exp-derivative`, `derivative-trig-chain`, `derivative-log-quadratic` | Łańcuch dla log/exp/trig i wielomianów, nie dowolne złożenia; brak porównania oryginału | wysoka | METHOD_PARTIAL / BLOCKED_SOURCE | Weryfikacja łańcucha i dokładnego pola odpowiedzi na źródłowej próbce |
| D04 | Częściowo: `analysis-lhospital`, `analysis-lhospital-infinity` | Metody 0/0 i ∞/∞ są; nie każda forma nieoznaczona ma generator | wysoka | METHOD_PARTIAL / BLOCKED_SOURCE | Sprawdzić założenia i formy oryginału P34 |
| D05 | Częściowo: `derivative-monotonicity`, `derivative-extrema`, `analysis-study-quartic`, `analysis-study-rational-shift` | Znaki f′ i klasyfikacja dla kontrolowanych funkcji; brak pokrycia dowolnych źródłowych postaci | bardzo wysoka | METHOD_PARTIAL / BLOCKED_SOURCE | Zestawić rzeczywiste znaki i ekstrema z P32 |
| D06 | Częściowo: `derivative-absolute-one-sided`, `derivative-piecewise-point`, `derivative-vertical-cusp` | Zdarzenia z pochodnymi jednostronnymi, pionową styczną i ostrym wierzchołkiem; brak ogólnego solvera | średnia/wysoka | METHOD_PARTIAL / BLOCKED_SOURCE | Porównać źródłowy przypadek braku pochodnej |
| D07 | Częściowo: `analysis-concavity`, `analysis-study-quartic`, `analysis-study-rational-shift` | f″, dwa przegięcia i wykluczony biegun działają w ograniczonych klasach; brak źródłowego świadectwa | bardzo wysoka | METHOD_PARTIAL / BLOCKED_SOURCE | Zestawić znak f″ oraz punkty przegięcia z P32 |
| D08 | Częściowo: `analysis-study-polynomial`, `analysis-study-rational`, `analysis-study-quartic`, `analysis-study-rational-shift` | Istnieją badania dziedziny, f′/f″, ekstremów, asymptot i jakościowego szkicu, ale brak ogólnego solvera i źródłowego świadectwa | najwyższa | METHOD_PARTIAL / NEEDS_SOURCE_REVIEW | Prywatnie porównać jedną pełną formę P32/3 do istniejącej rodziny; nie produkować nowej bez luki |
| D09 | Tak — ograniczony szkic papierowy: `derivative-sign-sketch`, także rodziny D08 | Rysunek samodzielnie oceniany; znaleziono błąd treści polecenia: brak zapowiadanej tabeli znaków w pytaniu | wysoka | BUG_IDENTIFIED_AND_PATCHED_IN_DRAFT / BLOCKED_SOURCE | Sprawdzić poprawkę w CI, następnie prywatnie zweryfikować zgodność P32/4a–b |
| D10 | Częściowo: `derivative-profit-maximum`, `analysis-study-polynomial`, `analysis-study-rational`, `analysis-study-quartic`, `analysis-study-rational-shift` | W kontrolowanych klasach jest porównanie wartości na końcach i w punktach krytycznych; źródłowy zakres niepotwierdzony | wysoka | METHOD_PARTIAL / BLOCKED_SOURCE | Zestawić oryginalne ekstrema na zbiorach domkniętych |

## Wybrany problem i minimalna poprawka

**D09:** polecenie mówiło, aby szkicować „na podstawie tabeli znaków f′ i f″ poniżej”, ale same znaki były tylko w rozwiązaniu. Student bez ujawnienia rozwiązania nie widział danych, od których miał zacząć.

Zmiana dotyczy jedynie `src/university/derivativeSketch.ts` i `src/university/derivativeSketch.test.ts`. W pytaniu PL/EN umieszczono jawne cztery przedziały znaków f′, dwa przedziały f″, zera f′ i wykluczenie bieguna. Test obejmuje wszystkie 72 krotki rodzin/poziomów/wariantów i oba języki. Klucz, grading, generator, zakres wariantów i rozwiązanie pozostały bez zmian; rysunek nadal jest oceniany samodzielnie na kartce.

**Kontrola matematyczna:** dla `f(x)=e[(x-a)+s²/(x-a)]+v`, `s>0`, `e=±1`, zachodzi `f′=e[1-s²/(x-a)²]` oraz `f″=2es²/(x-a)³`. Znak f′ w czterech przedziałach wynosi `e,−e,−e,e`; znak f″ po obu stronach wykluczonego `x=a` wynosi `−e,e`. Odrębny lokalny skrypt Node sprawdził 288 par znaków dla 72 krotek; PASS. Test Vitest/kompilacja/Playwright **NOT_RUN** lokalnie (środowisko bez dostępu sieciowego do repozytorium); konieczne zielone Actions przypięte do SHA PR. Nie deklarować CI PASS bez końcowego SUCCESS.

## STUDENT_READY — kolejność ćwiczeń

1. `derivative-formula` — wzory i potęgi (D01).
2. `derivative-log-quadratic` — reguła łańcuchowa (D03).
3. `derivative-trig-chain` — trygonometryczna reguła łańcuchowa (D03).
4. `derivative-extrema` — pierwsza pochodna i ekstremum (D05).
5. `analysis-concavity` — druga pochodna i przegięcia (D07).
6. `analysis-study-quartic` — wielomian czwartego stopnia, f′/f″, klasyfikacje (D05/D07/D08).
7. `analysis-study-rational-shift` — biegun, asymptota, ekstrema, brak przegięcia w biegunie (D08).
8. `derivative-sign-sketch` — szkic na kartce (D09; poprawiony wykres znaków po wdrożeniu tego PR).

W aplikacji szukaj kategorii „Pochodne” i ID kompetencji D01–D10 w wyszukiwarce. Rzeczywiste nazwy rodzin znajdują się w `src/competencyIndex.ts` i katalogu produkcyjnym.

## Znane ograniczenia i dalszy audyt

- D08: żadne z czterech generatorów nie jest uniwersalnym badaniem dowolnej funkcji; porównanie P32/3 jest wstrzymane brakiem prywatnego źródła.
- D09: rysunek papierowy nie podlega automatycznemu gradingowi. Nowe sprawdzenia testowe potrzebują wykonania w CI oraz weryfikacji pytania na stronie w obu językach.
- D02–D04: istnieją klasy ograniczone; brak dowodu, że wszystkie źródłowe formy wymagające reguły iloczynu, ilorazu, łańcucha i de l’Hospitala są obsłużone.

**Jeden kolejny krok:** niezależna weryfikacja w CI i interfejsie PL/EN tego PR przy dokładnym HEAD; dopiero potem decyzja właściciela o scaleniu. Osobne źródłowe QA D08 jest kolejnym etapem, nie warunkiem obecnej poprawki.

Refs #108
