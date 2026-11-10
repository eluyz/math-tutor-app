# U07 — pełne ocenianie nadokreślonego układu Gaussa 4×3

Data: 2026-11-09. Zakres: wyłącznie U07, jedna nowa rodzina `gauss-overdetermined-4x3-unique`, 24 × 3 poziomy = **72 syntetyczne warianty**. Bazowy main: `d942b0f1ec77feb7b83a228502b562df005cde14`.

## Zweryfikowana luka
Oryginalne prywatne materiały mają zadania z 4 równaniami i 3 niewiadomymi, w tym przypadki z jednoznacznym rozwiązaniem. Istniejące `system-rectangular-4x3` ocenia jedynie klasę (0/1/nieskończenie wiele); nie ocenia `(x,y,z)`. `gauss-unique` ocenia pełne rozwiązanie, ale dotychczas oferował tylko kwadratowe 3×3 i 4×4. Nie publikujemy prywatnej treści, macierzy ani klucza.

## Nowa rodzina
- Publiczny typ `linear-system` z metodą `gauss`; istniejący renderer i formularz `AnswerSpec: system` ocenia **klasyfikację i x,y,z**, nie tylko wybór jednej odpowiedzi.
- Dokładnie cztery równania i trzy niewiadome, pełny rząd 3, zgodność, czwarty zależny wiersz. Pierwszy współczynnik jest 0 — eliminacja wymaga zamiany wierszy. Parametry są zróżnicowane, expert obejmuje wymierne dane.
- Rozwiązanie exact; po wyznaczeniu niewiadomych weryfikacja **każdego z czterech oryginalnych równań**. Wariant ze sprzecznością nie jest tu generowany, bo obecna rodzina służy pełnemu ocenianiu unikalnego rozwiązania.
- Dotychczasowe `gauss-unique`, `gauss-classification`, `system-rectangular-4x3` nie zmieniają ID, liczby wariantów ani schematów oceniania.
- `gaussFamilies` było już rejestrowane w katalogu, więc dodanie rodziny nie wymaga edycji `src/university/catalog.ts` ani schematu.
- Dokumenty i liczniki: z początkowych 263 rodzin / 19 989 wariantów do kandydata **264 rodzin / 20 061 wariantów**. U07 nadal `coverage:partial`; brak formalnego nowego SOURCE_PASS.

## Niezależne testy
- Jednostkowy oracle znajduje niezerowy minor 3×3 spośród wierszy wyświetlanej macierzy 4×3, stosuje dokładny Cramer do trzech niewiadomych i potwierdza **wszystkie cztery** oryginalne równania. Testowane 24 warianty × 3 poziomy, PL/EN oraz prawidłowe, błędne, puste i niepełne odpowiedzi.
- Playwright odczytuje wyłącznie widoczną macierz 4×4 rozszerzoną na ekranie (cztery wiersze, trzy kolumny A + b). Niezależnie wybiera minor 3×3 i sprawdza wszystkie równania, 375/1280 px, PL/EN, hard/advanced/expert.
- Odrębna kontrola bazowych 3×3/4×4 i wymuszonego pivot swap.
- Finalne CI, Batch B–G, Pages oraz niezależny review oznaczyć na dokładnym SHA. **Nie utożsamiać testu kandydata z wdrożeniem.**

## Release gate
Jeden PR, bez auto-merge. Przed scaleniem: pełny exact-HEAD CI SUCCESS i kontrola konfliktów z aktywnym main, niezależne QA oraz świadoma zgoda właściciela. Po merge: main CI i Pages na faktycznym scalonym SHA. Formalny U07 SOURCE_PASS wymaga osobnego source-to-app QA, nie jest przyznany za syntetyczne warianty.

Refs #108.


## FINAL FREEZE 2026-11-10
- Integracja wyłącznie U07, bez nowych rodzin poza wcześniej utworzoną 4×3. Innych działów nie modyfikujemy merytorycznie.
- Ponowna integracja na main@`d942b0f1ec77feb7b83a228502b562df005cde14` zachowuje aktualne M04/M05/M14 oraz W01–W03.
- Rozmiar aktualnego main to 263 rodzin/19 989 wariantów; kandydat U07: 264/20 061.
- PR #284: **bez merge**. Formalne U07 SOURCE_PASS nadal NOT_VERIFIED. CI poprzednich HEAD `success`, ale exact-head CI po rebase wymaga osobnego potwierdzenia.
- Po odbiorze i ewentualnym merge przez PM wymagane są także powdrożeniowe CI i Pages na faktycznym main.
