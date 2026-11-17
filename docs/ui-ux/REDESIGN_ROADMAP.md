# MT-UI-001 — plan i granice

## Cel i architektura

Pierwszy prototyp premium dla dorosłych i studentów. React + istniejący CSS, bez nowych zależności. Design: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Zachować generatory, schematy, lokalizację, postępy, egzamin i istniejące komponenty.

## Plan wykonania

- [x] Audyt kodu i materiałów, zrzuty przed zmianą 375/1440 dla aktualnej bazy.
- [x] Porównanie dwóch kierunków i wybór Focus Studio.
- [x] Nagłówek i nawigacja; skip link; style szczegółowe ograniczone do workspace nauki; wspólne tokeny i shell obejmują otoczenie innych widoków.
- [x] Wybór istniejących poziomów i działów, równe siatki przycisków.
- [x] Reprezentatywny ekran kolejności działań we wspólnym rendererze, bez zmian matematyki.
- [x] Weryfikacja 375/390/1280/1440, PL/EN, focus, reflow, wzory, istniejące testy i build.
- Dostarczenie: jeden Draft PR; bez merge i wdrożenia.

## Punkty szczególnej kontroli

Długie nazwy działów PL/EN; siatki przy powiększeniu; tabele macierzy we własnym regionie; focus przy przejściu na zadanie; blokady sesji i egzaminu. Nie zmieniać stanu ani handlerów nawigacji.

## Po akceptacji prototypu (nie wdrażać teraz)

1. Zaplanować osobny redesign istniejącego ekranu Statystyki; Ekonometria i Matematyka finansowa pozostają jawnymi roadmapami.
2. Osobno zaprojektować postępy, egzamin, rozwiązania i notatnik według zatwierdzonych tokenów.
3. Uporządkować długi katalog, rozważyć filtrowanie i adresowalne URL; wymaga osobnego zadania dotyczącego zachowania.
4. Audyt wszystkich typów odpowiedzi, czytniki ekranu i testy użyteczności z dorosłymi uczącymi się.
