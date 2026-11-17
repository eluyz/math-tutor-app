# MT-UI-003 — NIGHT BUILD

## Plan i granice

Focus Studio; React/TypeScript i istniejący CSS, bez nowych bibliotek. Generatory,
ocenianie, punktacja i format historii nie zmieniają się. Pracujemy wyłącznie
nad PR #337. Upoważnienie użytkownika obejmuje decyzje projektu i wykonanie bez
kolejnych pytań. Stash pusty; niezapisany audyt w głównym checkoutcie zachowany.

- [x] A: zachować pracę przy logo/przedmiotach/widokach/PLEN; ostrzegać przed
  opuszczeniem dokumentu. Bez trwałego zapisu odpowiedzi. Testy powrotu i anulowania.
- [x] B: kompaktowy start i zwijany wybór tematu/poziomu; zadanie przed katalogiem
  w aktywnym ćwiczeniu. 320/375/390/768/1280/1440, długie PL/EN.
- [x] C: semantyka formularzy, jawne wyniki, równy pasek akcji i odporne wzory.
- [x] D: numer pytania + jawny stan odpowiedzi; postępy z czytelną hierarchią.
- [x] E: wspólne tokeny i wzorce ćwiczenia Matematyki/Statystyki, bez nowych treści.
- [x] F: kontrast, focus, reduced motion, lokalizacja i kontrola wizualna.
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

### B — zadanie przed katalogiem

Commit A: 3189cd5. Izolowane powtórzenie history-regression: 2/2 PASS,
bez zmian limitów testów. Pakiet B: szybki start/kontynuacja blisko tytułu,
aktywne ćwiczenie przed konfiguracją w DOM, lista rodzin po panelu zadania,
zwijany natywny details z konfiguracją. Domyślnie otwarty dla odkrywalności i
zgodności dotychczasowych przepływów. Zrezygnowano z pustej karty marketingowej.
Nagłówek i przedmioty kompaktowe; bez sticky i bez nowych bibliotek.

PASS: build/TypeScript. Dodano 12 scenariuszy layout PL/EN przy sześciu
szerokościach. Wykonanie wizualne i zachowanie przy klawiaturze telefonu BLOCKED;
nie ogłaszamy PASS kryterium wizualnego. Dotychczasowe selektory/funkcje zachowane.

### C — formularze i ekran ćwiczenia

Commit B: 2e0fa09. Formularze łączą pomoc z trwałym regionem feedback;
aria-invalid znika podczas edycji, nie zmieniając oceny matematycznej.
Formularze strukturalne oznaczają błąd grupy, bez fałszywego przypisywania go
każdemu polu. Enter i dotychczasowe etykiety zachowane. Długie wzory przewijają
się lokalnie; przyciski pomocy mają wspólną geometrię.

PASS: 20 testów SSR komponentu (10 przypadków wcześniej RED, potem GREEN),
20 testów wykrywania draftu; TypeScript/build. Cztery scenariusze E2E PL/EN
powiązania feedback i przejść invalid/incorrect/correct dodano; runtime BLOCKED.
Szybki start skupia nagłówek zadania, nie otwiera od razu klawiatury telefonu.

### D — egzamin i postępy

Commit C: 58d9500. Oddzielny komponent prezentacyjny nawigacji egzaminu pokazuje
numer i stan „Wpisano odpowiedź / Brak odpowiedzi” w PL/EN, niezależnie od
aria-current. Nie przyjmuje poprawności ani punktów, więc nie ujawnia oceny.
Postępy i egzamin otrzymały tokeny Focus Studio, zawijanie filtrów i czytelną
hierarchię wartości. Modele historii i egzaminu oraz usuwanie danych bez zmian.

PASS: sześć SSR testów nawigacji PL/EN i istniejące testy historii/modelu;
TypeScript/build. Cztery E2E scenariusze z włączonym sandboxem dodano, runtime
BLOCKED. Dokładne końcowe liczby wspólnej regresji zapisane poniżej.

### E — spójność Matematyki i Statystyki

Commit D: 66950d1. Statystyka korzysta z istniejących wspólnych klas nauki,
kontrolek, feedbacku i tokenów Focus Studio. Własne warianty obejmują tylko
układ pilotażu trzech poziomów. Bez zmian danych, generatorów, porównań wyników
lub zakresu merytorycznego. Statusy planowanych działów pozostają bez zmian.

PASS: 29 testów istniejącej Statystyki i draftów; build/TypeScript wspólnej
integracji. Dodano 12 E2E kontroli wspólnego wyglądu/przycisków/feedbacku przy
sześciu szerokościach PL/EN; wykonanie BLOCKED. Nie deklarujemy potwierdzenia
wizualnego bez renderowania. W repo nie dodano nowych bibliotek.

### F — dostępność i dopracowanie

Commit E: 2f72864. Stopka używa muted zamiast #718276 (obliczeniowo 5,81:1
zamiast 3,79:1). JS przewijania respektuje reduced motion; focus globalny i
regiony lokalnego scroll zachowane. Polski status „W rozwoju” zachowuje znaczenie
in-progress, a placeholder podaje tematy zamiast kodów. Mały nagłówek ma miejsce
na etykiety języków przy 320 px, bez obcinania funkcji. Brudnopis/rozwiązania
korzystają ze wspólnych tokenów. Wymaga potwierdzenia w renderowaniu.

Dodatkowa poprawka A: zmiana zadania z niewysłanym draftem w Matematyce lub
Statystyce wymaga potwierdzenia; anulowanie zatrzymuje handler przed resetem.
Notatki brudnopisu chronione przed opuszczeniem dokumentu. Nie zapisujemy ich
trwale. Dodano E2E anulowania/akceptacji zmiany i anulowania reload.

PASS: 42 ukierunkowane testy jednostkowe/SSR (w tym RED→GREEN lokalizacji),
build/TypeScript. Dodano testy Tab/skip, obliczanego kontrastu, reduced motion,
reflow i powiększenia tekstu. Test powiększenia tekstu nie zastępuje ręcznego
zoomu przeglądarki 200%. Runtime i nowe screenshoty BLOCKED. Ponowna standardowa
instalacja Chromium także z jawnym dostępem sieciowym nadal daje 403 Domain forbidden.
Bez wyłączania sandboxa ani zmian polityki sieci.
