# MT-UI-003 — NIGHT BUILD

## Plan i granice

Focus Studio; React/TypeScript i istniejący CSS, bez nowych bibliotek. Generatory,
ocenianie, punktacja i format historii nie zmieniają się. Pracujemy wyłącznie
nad PR #337. Upoważnienie użytkownika obejmuje decyzje projektu i wykonanie bez
kolejnych pytań. Stash pusty; niezapisany audyt w głównym checkoutcie zachowany.

- [ ] A: zachować pracę przy logo/przedmiotach/widokach/PLEN; ostrzegać przed
  opuszczeniem dokumentu. Bez trwałego zapisu odpowiedzi. Testy powrotu i anulowania.
- [ ] B: kompaktowy start i zwijany wybór tematu/poziomu; zadanie przed katalogiem
  w aktywnym ćwiczeniu. 320/375/390/768/1280/1440, długie PL/EN.
- [ ] C: semantyka formularzy, jawne wyniki, równy pasek akcji i odporne wzory.
- [ ] D: numer pytania + jawny stan odpowiedzi; postępy z czytelną hierarchią.
- [ ] E: wspólne tokeny i wzorce ćwiczenia Matematyki/Statystyki, bez nowych treści.
- [ ] F: kontrast, focus, reduced motion, lokalizacja i kontrola wizualna.
- [ ] G: niezależny review, maks. trzy cykle napraw, końcowe testy i istniejący CI.

## Decyzje

Zachowanie stanu w pamięci zamiast nowego magazynu danych; natywne ostrzeżenie
przed reload/wyjściem informuje o utracie niedokończonej pracy. Nie implementujemy
nowego routera/history. Kompaktowy panel konfiguracji zamiast wielu nowych
sticky pasków. Focus Studio i wszystkie funkcje pozostają.

## Bazowy stan

Main: 307276a. PR przed sprintem: 61e5ad6. Zsynchronizowano zwykłym merge main,
bez konfliktów; SHA merge jest w `git log`. Wcześniejszy audyt: 6,5/10 warunkowo.
Blokada znana: systemowy Chromium nie startuje z sandboxem (SUID/crashpad).
Ponowna próba standardowego Playwright przewidziana; nie obchodzimy zabezpieczeń.

## Checkpointy

Wyniki i SHA dopisywane po każdym pakiecie. PASS tylko po wykonanym teście;
BLOCKED/NOT RUN nie oznacza zaliczenia. Log dotyczy punktów kontrolnych; dokładny
końcowy HEAD i bieżący CI podaje opis PR/raport końcowy (bez samoodwołania SHA).

### A — nawigacja i sesje

Logo zachowuje pracę; Matematyka i odwiedzona Statystyka pozostają zamontowane
podczas zmiany przedmiotu. Jeden target main; stan odpowiedzi, wskazówek,
rozwiązania i brudnopisu pozostaje w pamięci. Natywne beforeunload chroni aktywną
sesję/egzamin i niesprawdzone odpowiedzi (także w ukrytych widokach). Nie dodano
zapisu odpowiedzi ani routera. Świadomie zaakceptowany reload nadal traci pracę;
komunikat jest natywny i zależy od przeglądarki. Wstecz nie zmienia wewnętrznego
widoku; wyjście z dokumentu podlega ostrzeżeniu.

PASS: 29 testów nawigacyjnego wykrywania draftu i istniejącej Statystyki; build.
6 scenariuszy E2E dodano i odkryto przez --list, wykonanie BLOCKED.
Bazowy pełny Vitest: 2602 PASS / 1 FAIL (history-regression przekroczył 5 s przy
równoległym obciążeniu); izolowane powtórzenie i końcowa regresja poniżej.
Standardowa instalacja przeglądarki Playwright nie pobrała Chrome for Testing;
systemowy Chromium z włączonym sandboxem też jest zablokowany. Bez obejść.
