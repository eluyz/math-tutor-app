# Chat Sprint D — pochodne i badanie funkcji (2026-11-08)

- Repozytorium: `eluyz/math-tutor-app`.
- Bazowy `main` SHA: `c44ef85531906c9179c529fdfc852eb0035a13b7`.
- Zakres: D01–D10. Powiązane: #108, #206, #214. PR #199 oraz #231 nie ingerują w pliki tej zmiany.
- Prywatne źródła P29/P32/P34 z wcześniejszego archiwum uczelnianego **były dostępne lokalnie i zostały bezpośrednio obejrzane** (karty zadań oraz część kluczy). Zidentyfikowano różnice metod; nie nadaje to automatycznie formalnego SOURCE_PASS.
- Stany poniżej oznaczają *obecność metody w generatorach*, a nie wierne odtworzenie każdego ćwiczenia źródłowego.

## Mapa 10 kompetencji

| ID | Metoda już istnieje? — faktyczne family_id na main | Czy brak metody, czy dowodu? | Ważność egzaminacyjna | STATUS | Następny krok |
| --- | --- | --- | --- | --- | --- |
| D01 | Tak: `derivative-formula`, `derivative-fractional-powers`, `derivative-higher-root-powers` | Źródłowa karta i klucz dostępne i obejrzane; exact tuple source-to-app niezweryfikowany w tej sesji | wysoka | METHOD_PRESENT_BOUNDED / SOURCE_REVIEW_PARTIAL | W osobnym QA zestawić jeden oryginał z konkretnym wariantem i niezależnym wynikiem |
| D02 | Częściowo: `derivative-product-point`, `derivative-quotient-point`, `derivative-quadratic-quotient` | Źródło obejmuje znacznie szersze wielomiany, pierwiastki i ilorazy trygonometryczne niż kontrolowane rodziny | wysoka | METHOD_PARTIAL / SOURCE_SHAPE_GAP | Porównać konkretne źródłowe postacie, potem wybrać najmniejszą nową metodę; #214 osobno |
| D03 | Częściowo: `analysis-log-exp-derivative`, `derivative-trig-chain`, `derivative-log-quadratic` | W źródle są zaawansowane złożenia wielomianowe, funkcje odwrotne i mieszane trig/exp, wykraczające poza zadania o liniowym argumencie | wysoka | METHOD_PARTIAL / SOURCE_SHAPE_GAP | Wybrać pojedynczą brakującą złożoną formę zamiast ogólnego parsera |
| D04 | Częściowo: `analysis-lhospital`, `analysis-lhospital-infinity` | Obejrzano P34: źródłowe przypadki z trygonometrią i mieszanymi wykładniczymi ilorazami nie są obsługiwane przez obecne cztery tryby LH | wysoka | METHOD_PARTIAL / SOURCE_SHAPE_GAP | Rozpisać osobno źródłowy przypadek trygonometryczny z warunkami reguły |
| D05 | Częściowo: `derivative-monotonicity`, `derivative-extrema`, `analysis-study-quartic`, `analysis-study-rational-shift` | W źródle także złożenia pierwiastkowe i wykładnicze oraz wymierne bez podobnego szablonu | bardzo wysoka | METHOD_PARTIAL / SOURCE_SHAPE_GAP | Potwierdzić 1 klasę źródłowej monotoniczności i krytycznych znaków f′ |
| D06 | Częściowo: `derivative-absolute-one-sided`, `derivative-piecewise-point`, `derivative-vertical-cusp` | Pokrewne zachowanie w punkcie bez pochodnej ma generator; dokładna źródłowa postać nadal nie jest zmapowana na wariant | średnia/wysoka | METHOD_PARTIAL / SOURCE_REVIEW_PARTIAL | Zestawić pochodne jednostronne konkretnej źródłowej formy |
| D07 | Częściowo: `analysis-concavity`, `analysis-study-quartic`, `analysis-study-rational-shift` | Źródłowe formy obejmują m.in. funkcje z czynnikiem wykładniczym i inne mianowniki; tylko część znaków f″ pokrywa obecny generator | bardzo wysoka | METHOD_PARTIAL / SOURCE_SHAPE_GAP | Wyodrębnić najmniejszy brak f″/przegięcia z P32 |
| D08 | Częściowo: `analysis-study-polynomial`, `analysis-study-rational`, `analysis-study-quartic`, `analysis-study-rational-shift` | **Potwierdzona luka źródłowa:** w P32/3 jest funkcja wymierna bez bieguna rzeczywistego, z asymptotą poziomą i dwiema infleksjami; obecne wymierne rodziny wymagają rzeczywistego bieguna i dają asymptotę ukośną bez przegięć | najwyższa | METHOD_GAP_SOURCE_CONFIRMED | Osobna mała implementacja tej metody po zakończeniu obecnego PR |
| D09 | Tak — ograniczony szkic papierowy: `derivative-sign-sketch` oraz rodziny D08 | Bezpośrednio obejrzano P32/4a–b: forma 4b ma odpowiadający wariant (a=1,s=1,v=2,e=1), ale instrukcja/ocena rysunku nie są identyczne; forma 4a wymaga współczynnika nachylenia 1/2, a generator ma jedynie ±1 | wysoka | METHOD_PARTIAL / BUG_PATCHED_IN_DRAFT / SOURCE_SHAPE_PARTIAL | Uruchomić test PL/EN; późniejsze QA porówna dwie ścieżki szkicu bez automatycznej oceny |
| D10 | Częściowo: `derivative-profit-maximum`, `analysis-study-polynomial`, `analysis-study-rational`, `analysis-study-quartic`, `analysis-study-rational-shift` | Źródło zawiera także postacie wykładnicze, trygonometryczne i pierwiastkowe na przedziałach; klasy te nie są kompletne w obecnych rodzinach globalnych | wysoka | METHOD_PARTIAL / SOURCE_SHAPE_GAP | W osobnym QA zweryfikować źródłowe punkty końcowe i wewnętrzne dla jednej brakującej formy |

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

## Dowód z prywatnego źródła (bez publikowania treści)

Karty zadań P29/P32/P34 i dostępne klucze zostały obejrzane lokalnie 2026-11-08. D08: znaleziono źródłową rodzinę wymierną bez biegunów rzeczywistych i z dwoma punktami przegięcia, której nie obejmują aktualne szablony. D09: jedna z dwóch tabel ma ten sam parametryczny przebieg co dostępny wariant; druga wymaga współczynnika asymptoty o module 1/2, obecnie niegenerowanego. Zgodność pojedynczego wzorca matematycznego nie jest równoznaczna z pełną akceptacją SOURCE_PASS ani z automatyczną oceną szkicu. Nie kopiowano równań, kluczy ani skanów do repo.

## Znane ograniczenia i dalszy audyt

- D08: bezpośrednia kontrola P32/3 wykazała konkretną klasę wymierną bez rzeczywistego bieguna, której nie ma w czterech istniejących rodzinach. Nie wprowadzać generatora w tym PR: jedna dozwolona poprawka D09 jest już gotowa.
- D09: rysunek papierowy nie podlega automatycznemu gradingowi. Nowe sprawdzenia testowe potrzebują wykonania w CI oraz weryfikacji pytania na stronie w obu językach.
- D02–D04: porównanie kart źródłowych wskazuje rzeczywiste niepokryte formy (wyższe złożenia i mieszane trig/exp); klasy już zaimplementowane pozostają przydatne do ćwiczenia.

**Jeden kolejny krok:** niezależna weryfikacja w CI i interfejsie PL/EN tego PR przy dokładnym HEAD; dopiero potem decyzja właściciela o scaleniu. Osobna implementacja wykrytej luki D08 jest przyszłym etapem, nie warunkiem tej poprawki.

Refs #108
