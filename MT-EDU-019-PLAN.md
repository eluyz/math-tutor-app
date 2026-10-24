# MT-EDU-019 — plan domykania pokrycia matematyki (aktualizowany)
    
**Stan aktualny (24.10.2026):** PR #63–#69 scalone. Po PR #69: CI i Pages PASS; `main` ma **159 rodzin / 13 341 wariantów**. Następny proponowany etap P0F2: równanie XA=B dla A 4×4, B 2×4 oraz AX=4X+B z macierzami 4×4. Docelowo 2 rodziny / 144 warianty (161 rodzin / 13 485 wariantów po ewentualnym wdrożeniu). Kod P0F2 znajduje się w otwartym PR #70, nie jest jeszcze scalony; wymaga CI, recenzji i zgody właściciela. Nie scalać bez zgody właściciela.

**Historyczny stan bazowy:** `main` po PR #61 (`fe1359e`, 23.10.2026): **145 rodzin / 12 333 warianty**, 14 kategorii, CI i GitHub Pages PASS. Źródło: [mapa 64 kompetencji](CURRICULUM_COVERAGE.md) i [ROADMAP](ROADMAP.md). Jest to plan do zatwierdzenia, **nie zgoda na implementację ani scalanie**.

## Co naprawdę oznacza mapa

Z 64 pozycji: **15 pokryte, 47 częściowo, 0 oznaczonych jako brak, 2 teoria**. Status „częściowo” obejmuje choć jedną zaimplementowaną kontrolowaną klasę zadań, a **nie** gwarantuje przygotowania do kolokwium czy egzaminu. Kluczowa jest weryfikacja reprezentatywnych umiejętności na podstawie publicznych programów nauczania i autorskich przykładów, bez publikowania cudzych materiałów. Wraz z postępem trzeba weryfikować, czy kompetencje nie zostały oznaczone zbyt optymistycznie.

## Rejestr wszystkich 47 częściowych kompetencji i kolejność rozwoju

| Fala / priorytet | Kompetencje w kolejce (kompletna lista kodów) | Liczba | Priorytet użytkownika i ograniczenia |
| --- | --- | ---: | --- |
| **P0 — algebra liniowa** | M03, M04, M05, M09, M10, M11, M12, M13, M14; U01, U03, U04, U06, U07, U08 | **15** | Podstawy algebry liniowej: wyznaczniki 4×4/5×5, operacje, Cramer; dalsze macierze i Gauss w kolejnych małych porcjach |
| **P1 — ciągi/funkcje/granice** | C02, C04, C05; F02, F03, F04, F05, F06, F07; G04, G06, G07, G08 | **13** | Zwiększyć różnorodność zadań i warunków dziedziny, wykresów i granic; unikać pozornego „pełnego” pokrycia |
| **P2 — pochodne i analiza** | D02, D03, D04, D05, D06, D07, D08, D09, D10 | **9** | Przejść od pojedynczych wzorów do wieloetapowego badania i szkicowania funkcji, stopniowo rozszerzać klasy |
| **P3 — całki** | I01, I02, I03, I04, I05, I06, I07, I08 | **8** | Wszystkie są częściowe; szersze podstawienia, części, tablice, wybrane pola i długości łuków |
| **P4 — dwie zmienne** | W01, W02 | **2** | Rozszerzyć funkcje poza kontrolowane wielomiany kwadratowe, zachować poprawną obsługę testu Hessiana D=0 |
| **SUMA** | **47 pozycji** | **47** | Kolejne priorytety zostaną potwierdzone po porównaniu z ogólnymi wymaganiami matematyki akademickiej |

**Osobny tor dydaktyczny, nie doliczany do 47:** C06 — definicje/monotoniczność/ograniczoność ciągu; W03 — granica i ciągłość funkcji dwóch zmiennych. Status „teoria” nie oznacza „zrobione”: warto opracować krótkie wyjaśnienia, rozpoznawanie pojęć i proste rachunkowe przykłady, jeśli syllabus tego wymaga.

## Pierwszy przyrost P0 — proponowany rozkład na trzy niezależne PR implementacyjne

| Proponowany PR (roboczy identyfikator) | Podtypy i rzeczywisty rezultat | Wstępna wielkość | Bramka |
| --- | --- | --- | --- |
| **MT-EDU-019-P0A** | M09/M10: dwie **nowe** rodziny strategii 4×4 i 5×5 z celową redukcją/wykorzystaniem własności, zamiast powielania istniejących Laplace i „dense” | 2 rodziny × 3 poziomy × 24 = **144 warianty** | Niezależne porównanie z rozwinięciem Laplace'a i eliminacją, testy wpływu zamiany/skali/dodawania wierszy |
| **MT-EDU-019-P0B** | U01/U03: dwie nowe rodziny interpretacji i doboru Cramera oraz jego ograniczeń, w tym przypadki D=0 i osobne wyznaczniki 4×4; **nie** utożsamiać D=0 automatycznie z „brak rozwiązań” | 2 × 3 × 24 = **144 warianty**, jeśli trzy poziomy okażą się faktycznie różne | Niezależny Gauss/rząd macierzy i poprawna klasyfikacja; sprawdzenie odpowiedzi numerycznych i wyboru |
| **MT-EDU-019-P0C** | M03/M04: dwie nowe rodziny złożonych działań macierzowych, zgodności wymiarów i nawiasów (w tym przypadki „niewykonalne”), z działaniami rzeczywiście krokowymi | 2 × 3 × 24 = **144 warianty**, warunkowo | Wymiary wyników, kolejność działań, tożsamości, niedopuszczalne przypadki, kontrola duplikatów |

**Łączna wstępna propozycja P0A–C:** 6 rodzin / **do 432 wariantów**, po akceptacji specyfikacji i potwierdzeniu wykonalności poziomów. To **pierwsza iteracja**, nie obietnica osiągnięcia statusu „pokryte” dla wszystkich 15 kompetencji P0. Pozostałe M05/M11–M14 i U04/U06–U08 pozostaną jawną listą dalszych braków; nawet M09/M10/U01/U03/M03/M04 mogą nadal wymagać rozszerzeń.

## Warunki wdrożenia i kontrola postępu

1. **Przed kodowaniem**: porównać proponowane rodziny z obecnym katalogiem, ustalić jednoznaczne pytania, rodzaje odpowiedzi i przykłady; nie powtarzać istniejących generatorów.
2. **Zakres nauki**: zdefiniować poziom Łatwy/Średni/Trudny poprzez liczby, długość rachunku i faktyczne różnice; nie dokładać Expert/Advanced tylko dla marketingu.
3. **Poprawność**: dla każdej kombinacji wariantu i poziomu niezależny wynik inną metodą, warunki brzegowe (osobliwy, niewykonalny, parametryczny), walidacja pomyłek i pełne rozwiązania PL/EN.
4. **Jakość**: brak duplikatów `contentKey` w zakresie, zachowanie 12 333 dotychczasowych wariantów i 145 rodzin; pełne Vitest, TypeScript build, Playwright mobilny i desktop PL/EN, kontrola dostępności.
5. **Zasada PR**: jeden osobny PR na mały przyrost, recenzja po zielonym CI, osobna zgoda właściciela przed squash+merge, a potem CI na `main` i GitHub Pages. Brak automatycznych scaleń.
6. **Mapa kompetencji**: aktualizować wyłącznie statusy, które potwierdza działający generator i testy. Zachowywać wykaz ograniczeń i nie obiecywać automatycznie statusu „pokryte” za samo dodanie nowej rodziny.
7. **Prywatność**: żadnych cudzych skanów, danych studentów ani wewnętrznych dokumentów w publicznym repo. Wystarczą abstrakcyjne, autorskie specyfikacje zadań.

## Po P0A–C

Zweryfikować listę niedomkniętych umiejętności P0, a następnie przejść falami P1 → P4, dostosowując kolejność do kolejnych zajęć. Dla każdej fali najpierw krótka specyfikacja, potem 1–3 małe PR według rzeczywistych luk. **Nie deklarujemy na tym etapie całkowitej liczby nowych rodzin ani daty pełnego pokrycia 64 kompetencji** — zależy to od zakresu uczelni i niezależnych testów.

**Decyzja wymagana od właściciela:** zatwierdzić lub zmienić kolejność P0–P4 oraz zakres P0A, P0B i P0C. Dopiero po tej decyzji tworzyć kod.

## Status wdrożenia (po akceptacji planu)

- P0A: opracowanie dwóch rodzin strategii wyznaczników 4×4/5×5 w izolowanym PR, 144 warianty Łatwy/Średni/Trudny. Bez scalania przed pełnym CI i recenzją.
- P0B: przygotowany w osobnym PR; 2 nowe rodziny / 144 warianty, mieszające D≠0, D=0 zgodny i D=0 sprzeczny. Bez scalenia przed nową, osobną zgodą właściciela.
- P0C: scalony w PR #65; 2 rodziny / 144 warianty: obliczenia na macierzach prostokątnych i wykonalność wyrażeń z transpozycją. CI i Pages na main PASS.
- P0D: dwa nowe typy dokładnych równań 3×3: `matrix-ax-shift-three` — `AX=4X+B` na poziomach medium/hard/advanced (72), i `matrix-axb-three` — `AXB=C` na hard/advanced/expert (72). Wymagana nieosobliwość, weryfikacja obu stron, 24 różne warianty na poziom, PL/EN, Vitest i Playwright. M05/M13 pozostają częściowe. **Oddzielny PR bez scalenia przed ponowną zgodą właściciela.**

- P0E1 (implementacja w osobnym PR): 4×4 i 5×5, każda rodzina 3 poziomy × 24 warianty. Nowa umiejętność: dynamiczny wybór niezerowego pivota, zamiany wierszy, eliminacja z ułamkami i przypadki zerowego wyznacznika. Warunki odbioru: 144 unikalne warianty, niezależny Laplace i kontrola niezmienników operacji, pełne PL/EN, Vitest/Playwright, neutralność wobec uczelni, zgoda właściciela przed merge.

- P0E2 (w odrębnym PR): 4×4 i 4×5, po 3 poziomy × 24 warianty na rodzinę (144). Rzędy od 0 do 4, niezerowe pivoty, wiersze zależne, brakujące kolumny pivotów, ułamki i dokładna redukcja. Kryteria: niezależne wyznaczniki minorów, pełny rejestr 144 treści, testy poprawnych i błędnych odpowiedzi, PL/EN, mobilny/desktop Playwright, recenzja, ponowna zgoda przed merge. W kolejnych etapach pozostają większe macierze i przypadki parametryczne.

- P0F1 (osobny PR): 2 rodziny po 3 poziomy × 24 warianty. Odwrotność 4×4 metodą Gaussa–Jordana, w tym D=0 (brak odwrotności), oraz AX=B przy A 4×4 i B 4×2. Testy niezależne przez dopełnienia algebraiczne, obustronne mnożenie, sprawdzanie AX=B, każdy wariant, PL/EN, Vitest/Playwright. M12/M13 pozostają częściowe. Osobna zgoda przed scaleniem.

## P0F2 — następny krok po scaleniu PR #69

- `inverse-four-xa-equation`: dla odwracalnej A 4×4 i B 2×4 wylicz X=BA⁻¹, sprawdzając XA=B. 3 poziomy hard/advanced/expert, 24 warianty na poziom.
- `matrix-ax-shift-four`: AX=4X+B, A i B 4×4; sprowadź do (A−4I)X=B i sprawdź pierwotne równanie. 3 poziomy hard/advanced/expert, 24 warianty na poziom.
- Implementacja w osobnym PR, niezależne obliczenia wyznacznika i odwrotności (dopełnienia/minory), sprawdzanie poprawnych/błędnych/pustych odpowiedzi, PL/EN, Vitest, build, Playwright desktop/mobile. Bez merge przed osobną zgodą.
- M05, M12, M13 pozostają częściowe; kolejne luki to układy U01/U03/U06/U07/U08 oraz następnie granice ciągów i funkcje.
