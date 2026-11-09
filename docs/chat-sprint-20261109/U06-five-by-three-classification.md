# U06 — źródłowa luka klasyfikacji 5 równań / 3 niewiadome

2026-11-09 — odizolowany zakres: `system-rectangular-5x3-classification`.

## Dlaczego
W prywatnym arkuszu U06 występuje pięć równań z trzema niewiadomymi. Standardowy silnik `linearAlgebraMath.checkMatrix` dopuszcza do czterech wierszy, więc istniejąca rodzina `system-rectangular-4x3` nie jest pełną repliką tego układu. Nie publikujemy współczynników ani odpowiedzi oryginalnego zadania.

## Rozwiązanie
- Jedna nowa rodzina: **72 publiczne warianty** (24 × hard/advanced/expert), pięć równań i trzy niewiadome. Poprawne przypadki r(A)=r([A|b])=3 (jedno), r(A)=r([A|b])=2 (wiele), r(A)=2 < r([A|b])=3 (brak). Przypadki są autorskie, nie kopiują danych uczelni.
- Osobny, ograniczony do 5×3, algorytm redukcji exact rational. Nie zwiększamy globalnego limitu w `checkMatrix`, nie ruszamy starych generatorów.
- Pokazujemy rzeczywiste odwracalne działania na pięciu wierszach, macierz po redukcji, wyliczone rzędy i uzasadnienie; quiz ocenia wybór liczby rozwiązań.
- UI używa istniejącej wizualizacji macierzy `linear-rectangular`. Rozgałęzienie wyłącznie dla pięciu wierszy; 3×2/4×3 bez zmian.
- Niezależne QA jednostkowe: minory dla r(A) i r([A|b]), przypadki 0/1/∞, dla układów jednoznacznych osobny oracle Cramera z niezależnego niezerowego minora 3×3 i sprawdzenie wszystkich pięciu oryginalnych równań, PL/EN puste/błędne/poprawne odpowiedzi.
- E2E: rank z pięciu widocznych wierszy 5×4, 375/1280 px, PL/EN i trzy poziomy. Bez dostępu do funkcji prezentera/originalnego klucza.
- Formalny `SOURCE_PASS` U06 nie jest przyznany samym QA syntetycznych wariantów. Oryginalna karta/klucz pozostają prywatne.

## QA / merge gate
Kandydat bazowany na main@713e231a16a85dba12f07476a4e9e0cf848aeebf (257 rodzin / 19 533 warianty) → 258 / 19 605. Ten branch **nie** zawiera oczekującego U07 PR #284. U07 po merge wymaga uzgodnienia tego PR, ponownego exact-head CI i zatwierdzenia merge. Żadnego automatycznego scalania. Refs #108.
