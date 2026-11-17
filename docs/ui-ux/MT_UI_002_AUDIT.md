# MT-UI-002 — audyt Focus Studio

**Decyzja: IMPROVE. Ocena ekspercka: 6,5/10. Zachować Focus Studio, poprawić hierarchię i domknąć dostępność przed rozszerzeniem prototypu.**

Ocena dotyczy dostępnych ekranów i kodu, z umiarkowaną pewnością. Nie jest wynikiem badania z użytkownikami, certyfikacją WCAG ani akceptacją całej aplikacji. Nie stwierdzono potwierdzonego P0; nie oznacza to wykluczenia problemów w nieprzetestowanych przepływach. Największą przeszkodą nie jest paleta, lecz dominacja konfiguracji katalogu nad rozpoczęciem krótkiego zadania.

## 1. Zakres i wiarygodność

- Data: 17.11.2026. Skille odczytano z aktualnego `main` **307276a**.
- Audytowano dokładny head [PR #337](https://github.com/eluyz/math-tutor-app/pull/337): **61e5ad6859e8707dab3116abe373a76074bc3733**, w oddzielnym detached worktree. Bez aktualizacji, rebase i merge gałęzi.
- Dwie niezależne oceny: A — Product Designer/UX Researcher, bez wyników detektora; B — Frontend/Accessibility/QA, niezależna analiza kodu i detektor. Wyniki połączono dopiero po zakończeniu A. Research oznacza tu analizę heurystyczną person, nie wywiady czy test użyteczności z uczestnikami.
- `npm ci`, build produkcyjny i uruchomienie rzeczywistej aplikacji jako preview: **OK, HTTP 200**. Build zachowuje ostrzeżenie o dużym chunku. Serwer testowy zatrzymano po audycie.
- **Przeglądarka z sandboxem nie wystartowała.** Playwright uruchomiono z `chromiumSandbox: true`; błąd SUID helper/crashpad. Nie wyłączano sandboxa, nie zmieniano uprawnień systemowych. Brak narzędzia sterowania współdzielonym desktopem mimo deklarowanej zdolności środowiska. [Log próby](mt-ui-002-evidence/browser-launch-error.txt).
- Wizualnie obejrzano wszystkie 11 istniejących zrzutów z PR: przed/po, katalog/ćwiczenie i koncepcje. To **wcześniej wyrenderowany interfejs**, nie nowe screenshoty z tego audytu. Wersje „przed” są opisane przez autora jako wariant bez `redesign.css`; nie traktujemy ich jako niezależnie odtworzonego baseline'u całego main.

### Macierz pokrycia

| Szerokość | Dostępny materiał wizualny | Faktyczna interakcja w tym audycie |
| --- | --- | --- |
| 375 px | [katalog](screenshots/after-home-375.png), [ćwiczenie](screenshots/after-exercise-375.png), PL | niewykonana — sandbox |
| 390 px | [katalog](screenshots/after-home-390.png), [ćwiczenie](screenshots/after-exercise-390.png), PL | niewykonana — sandbox |
| 768 px | brak zrzutów; tylko analiza reguł CSS | **niezweryfikowane wizualnie** |
| 1280 px | [katalog](screenshots/after-home-1280.png), [ćwiczenie](screenshots/after-exercise-1280.png), PL | niewykonana — sandbox |
| 1440 px | [katalog](screenshots/after-home-1440.png), [ćwiczenie](screenshots/after-exercise-1440.png), PL | niewykonana — sandbox |

[Odziedziczone pomiary autora](mt-ui-002-evidence/inherited-viewport-checks.json) deklarują brak poziomego overflow PL/EN, focus i równe przyciski przy czterech szerokościach. Nie są nowym wynikiem tego audytu. Nie potwierdzamy runtime EN, 768 px, zoomu, czytnika ekranu ani kompletności nawigacji klawiaturą.

## 2. TOP 10 priorytetów

**Dowody:** W — zaobserwowane na zrzucie; K — potwierdzone w kodzie; O — ocena projektowa, nie obiektywny błąd. P0 blokuje zadanie; P1 istotna trudność lub problem AA; P2 utrudnienie; P3 dopracowanie. Dług istniejący przed PR nie jest przypisywany prototypowi jako regresja.

| # | Waga / dowód | Problem, wpływ i konkretna rekomendacja |
| --- | --- | --- |
| 1 | **P1 · W/K + O** | **Start zadania przegrywa z katalogiem.** Na [375 px](screenshots/after-home-375.png) lista rodzin zaczyna się około y1232, a CTA „Zacznij…” około y1905; na desktopie panel zaczyna się około y763. Pierwszy ekran telefonu pokazuje głównie nawigację i konfigurację. Umieścić wyraźne rozpoczęcie jednego zadania blisko tytułu; po wyborze zadania zwinąć konfigurację do „Zmień temat/poziom”. Zachować równe przyciski w obrębie grup. |
| 2 | **P1 · W/K** | **Zbyt słaby kontrast drobnej stopki.** `styles.css:358–360`: 12 px, `#718276` na `#f5f7f8` daje **3,79:1**, poniżej 4,5:1 dla zwykłego tekstu (WCAG 1.4.3). [Widok](screenshots/after-home-1440.png). To odziedziczony kolor; wynik obliczony z CSS, nie pomiar pikseli live. Użyć odpowiedniego tokenu muted — tu 5,81:1 — i sprawdzić wynik w przeglądarce. |
| 3 | **P2 · K** | **Logo bez ostrzeżenia porzuca aktywną sesję nauki.** `App.tsx:308–312` zeruje zadanie, odpowiedź i `updateSession(null)`. Możliwa utrata niedokończonej sesji po przypadkowym kliknięciu. Zachować bieżącą pracę lub potwierdzać porzucenie. Zachowanie istniejące; nie wykonano scenariusza live. |
| 4 | **P2 · K** | **Sprawdzian słabo komunikuje „udzielono odpowiedzi”.** `ExamMode.tsx:239–244` daje numer zadania w nazwie dostępnej, a `exam.css:30` zmienia tylko grubość obramowania. Dodać widoczny znacznik i tekst odpowiedziano/bez odpowiedzi w nazwie dostępnej. Stan bieżącego zadania zachować osobno. Dług istniejący; bez sesji czytnika ekranu. |
| 5 | **P2 · K** | **Reduced motion nie obejmuje jawnego JS smooth scroll.** `App.tsx:312` ustawia `behavior: "smooth"`; redukcja z `redesign.css:106–107` dotyczy CSS. Dostosować tę akcję do preferencji ruchu. To pozostałość istniejącej akcji, nie deklaracja naruszenia AA ani obserwacja animacji live. |
| 6 | **P2 · W + O** | **Powtarzane poziomy utrudniają skanowanie.** Trzy rodziny na [desktopie](screenshots/after-home-1280.png) każda powtarza pięć poziomów, choć ich wybór jest już nad listą. Pokazywać skrót bieżącego poziomu, a pełne listy tylko przy wyjątkach; nazwać grupę „Poziom”. Zmniejszać redundancję, nie cele dotykowe. |
| 7 | **P2 · W/K + O** | **Język wyszukiwarki zakłada znajomość katalogu.** „Rodzina zadań”, M03/D09/W03 (`locales/ui.ts:39–40`) są mniej bezpośrednie niż nazwa tematu; na telefonie końcówka placeholdera nie mieści się w widoku. Użyć „Szukaj tematu”, np. „ułamki, granice, macierze”; wyszukiwanie kodów zachować jako dodatkową możliwość. Teksty odziedziczone. |
| 8 | **P3 · W/K** | **Angielski status w polskim interfejsie.** „Work in progress” jest widoczny przy Statystyce na wszystkich zrzutach PL. Zlokalizować status, np. „W rozwoju”; zachować jawne rozróżnienie od pozycji planowanych. Nie jest to dowód niedostępności samej Statystyki. |
| 9 | **P3 · W/K + O** | **Mikrotypografia dodaje szumu.** Slogan marki ma 8 px (`redesign.css:27`), etykiety statusu 11 px. Na [mobile](screenshots/after-home-390.png) mają małą wartość informacyjną względem miejsca zajętego przez nagłówek. Usunąć zbędny slogan lub zwiększyć czytelność; ograniczyć kapitaliki. Nie ma ogólnej normy WCAG nakazującej font 16 px — to ocena czytelności. |
| 10 | **P2 · W + O** | **Powierzchnie pomocnicze mają inny język wizualny.** W [ćwiczeniu](screenshots/after-exercise-1440.png) chłodna karta i szmaragdowy wzór sąsiadują z kremowym brudnopisem i dawnymi obrysami rozwiązania. W przyszłym etapie ujednolicić ich tokeny i warianty przycisków, bez zmiany funkcji. To świadomie odłożony zakres prototypu, nie nieudana implementacja zadeklarowanej migracji. |

**Ważne zastrzeżenie do #1:** pełnostronicowy zrzut pokazuje kolejność treści, nie faktyczną pozycję viewportu po wyborze. `App.tsx:132–137` przenosi focus do odpowiedzi lub tytułu po wyszukiwaniu. Nie twierdzimy, że użytkownik musi ręcznie przewijać trzy ekrany po każdym zadaniu; ewentualny skok pomijający wzór wymaga testu live.

## 3. Mocne i słabe strony

| Mocne — zachować | Słabe / ryzyka |
| --- | --- |
| Spokojna paleta, bez gradientów i niepotrzebnych efektów; stosowna dla dorosłych. | Gęstość decyzji na poziomie całego ekranu, mimo czytelnego lokalnego panelu. |
| Równe kategorie i przedmioty, zawijanie nazw zamiast ukrywania działów w poziomym pasku. | Równe komórki nie muszą oznaczać jednakowej wysokości/przewagi wszystkich grup; na mobile układ się wydłuża. |
| Czytelne krótkie wzory: matematyczny serif odróżniony od sans-serif interfejsu. | Brak wizualnego materiału dla długich wzorów, macierzy i formularzy wielopolowych. `overflow-wrap:anywhere` wymaga testu takich treści, samo nie dowodzi błędu. |
| Widoczny focus odpowiedzi na zrzutach; globalny focus, skip link, pressed/current w kodzie. | Brak świeżego sprawdzenia klawiatury, zoomu i ogłaszania statusów. |
| Życzliwa informacja o nauce na błędach; dostęp do brudnopisu, podpowiedzi i rozwiązania. | Pozostałości dawnych tokenów i semantyki stanu w innych przepływach. |

Focus Studio wygląda bardziej uporządkowanie od wersji „przed”. Zestaw białych kart i szmaragd jest dość uniwersalny, ale dla narzędzia do pracy nie stanowi to wady samo w sobie. „Wygląda jak AI” nie jest mierzalną diagnozą; realnym problemem jest zbędna ekspozycja konfiguracji i niedokończona spójność, nie sam zaokrąglony narożnik.

## 4. Pokrycie ekranów i stanów

| Obszar | Ustalenie i granica dowodu |
| --- | --- |
| Home i nagłówek | Wizualnie ocenione: osie i równe karty są lepsze; start zadania zbyt nisko. |
| Przedmioty | Wizualnie zachowane cztery pozycje i statusy. Przejścia analizowane w kodzie; bez klikania. |
| Działy i trudności | Wizualnie oceniona „Powtórka podstaw”, pięć poziomów. Większy katalog studiów i długie EN wymagają testu. |
| Ćwiczenie matematyczne | Prosta arytmetyka czytelna przy czterech szerokościach. Nie rozszerzać wniosku na wszystkie rodziny. |
| Odpowiedzi i komunikaty | Etykiety, tekstowe wyniki i `role=status` w `App.tsx:667–704`; macierze mają etykiety wierszy/kolumn. Brak świeżych stanów invalid/incorrect/correct. |
| Podpowiedzi i rozwiązania | Kod zachowuje stopniowe ujawnianie i przenoszenie focus do nowych nagłówków (`solutions/SolutionPanel.tsx:103`). Brak zrzutów rozwiniętych stanów. |
| Statystyka | `StatisticsPractice.tsx:62–84`: etykieta, `aria-invalid`, stały region live oraz expanded/controls. Brak zrzutu; wizualna spójność z matematyką niepotwierdzona. Zachowanie własnych stylów jest jawną granicą prototypu. |
| Postępy | Kod zawiera modalne potwierdzenie usunięcia i powrót focus (`ProgressDashboard.tsx:235–277`). Puste/zapisane/filtrowane stany wymagają renderowania. |
| Sprawdzian | Stan answered wymaga poprawy semantyki; obsługa timera i trybu bez wskazówek zachowana w kodzie. Start, nawigacja, oddanie i wynik nieprzetestowane live. |
| Mobile / typografia | Cztery odziedziczone szerokości obejrzane; 768 px, zoom, dotyk, klawiatura ekranowa i długie treści pozostają otwarte. |

## 5. Kierunek wizualny

[Porównanie koncepcji](screenshots/concepts.png) to statyczna makieta, nie test dwóch działających aplikacji.

| Kryterium | Focus Studio | Editorial Academy |
| --- | --- | --- |
| Charakter | Spokojne narzędzie edukacyjne, wyraźny podział UI/wzory. | Cieplejszy, książkowy; papier, terakota i szeryfy. |
| Gęsty katalog | Spójny sans-serif jest rozsądnym wyborem operacyjnym. | Wymaga dopracowania gęstości nagłówków; nie dowiedziono, że szeryfy są wolniejsze w użyciu. |
| Potwierdzona dojrzałość | Istniejący prototyp, zrzuty czterech szerokości. | Wyłącznie uproszczona statyczna koncepcja. |
| Decyzja | **Kontynuować, poprawiając strukturę.** | Zachować jako alternatywę, nie migrować bez wyraźnej korzyści. |

Trzeci kierunek nie ma obecnie uzasadnienia. Zmiana palety nie rozwiąże nadmiaru decyzji przed zadaniem. Obie makiety pomijają znaczną część obciążenia rzeczywistego katalogu.

## 6. Plan — maksymalnie trzy etapy, bez implementacji w tym zadaniu

1. **Hierarchia i bezpieczne rozpoczęcie.** Skrócić wejście na mobile, wyeksponować jedno krótkie zadanie, ograniczyć redundancję poziomów i uprościć język wyszukiwarki. Zachować dostęp do wszystkich przedmiotów i tematów. Uzgodnić zachowanie katalogu po wejściu w ćwiczenie; nie utracić istniejącego focus ani stanu pracy.
2. **Dostępność i spójne komponenty.** Naprawić kontrast stopki, komunikowanie answered, reduced motion i ochronę niedokończonej sesji. Stopniowo przenieść brudnopis, rozwiązania i pozostałe ekrany na zatwierdzone tokeny. Nie przebudowywać matematyki ani statystyki i nie dodawać biblioteki UI dla samego wyglądu.
3. **Brama akceptacji.** W działającej przeglądarce z sandboxem sprawdzić 375/390/768/1280/1440 w PL/EN: home, katalog studiów, krótki i długi wzór, macierz, puste/błędne/poprawne odpowiedzi, wskazówki, rozwiązania, brudnopis, Statystykę, postępy, egzamin. Dołączyć screenshoty, 200%/400% reflow, Tab/Shift+Tab/Enter/Escape, skip/focus, czytnik, kontrast wszystkich stanów i brak dokumentowego overflow. Przeprowadzić wymagane testy i krótki test zadaniowy z dorosłymi/powracającymi użytkownikami. Przed spełnieniem tej bramy nie nadawać ACCEPT całej aplikacji.

Kryterium odbioru hierarchii: osoba rozpoczynająca naukę odnajduje akcję pierwszego zadania bez przeglądania całego katalogu; po wyborze widzi kontekst pytania, odpowiedź i pomoc bez skoku dezorientującego. Dokładną miarę czasu/kliknięć ustalić w teście, nie wyprowadzać jej ze screenshotu.

## 7. Wykorzystane skille i kontrola dowodów

- **UI UX Pro Max:** przeczytany `SKILL.md`, checklista review, lokalne wyszukiwania „focus not obscured”, „error summary validation”, „minimalism functional workspace”. Zastosowano kryteria interakcji, hierarchii i zgodności z zatwierdzonym systemem; automatycznej propozycji stylistycznej nie przyjęto jako decyzji projektowej.
- **Impeccable:** przeczytane instrukcje, `context` dla checkoutu PR, critique/rubric i audit; niezależne Assessment A/B; detektor źródłowy. **5 warnings, 0 errors**, exit 2: cztery `side-tab` i Arial w dawnym `styles.css`. Arial jest nadpisany, a obramowania pytań/feedbacku pełnią funkcję. Nie uznajemy tych ostrzeżeń za dowód „AI design” ani blocker. [Wynik detektora](mt-ui-002-evidence/impeccable-detector.json).
- **Vercel Web Design Guidelines:** przeczytany skill, pobrane [aktualne reguły użyte do audytu](mt-ui-002-evidence/vercel-guidelines-used.md); zastosowane do kontrastu, nawigacji, stanu, ruchu i formularzy.
- **Superpowers:** dostępne w hoście; zastosowano `using-superpowers` i zasadę verification-before-completion: niezależne dowody, oddzielenie zakresów, brak deklaracji testów, które nie zostały wykonane.
- Kontrast tokenów przeliczono niezależnie: tekst/biel 14,65:1, muted/tło 5,81:1, accent/biel 7,18:1, focus/biel 6,00:1. To wybrane pary, nie audyt wszystkich stanów.

Wyniki wcześniejszych 78+15 testów i 2603 testów jednostkowych z opisu PR są deklaracją autora; nie raportujemy ich jako własnego przebiegu. W tym zadaniu wykonano instalację, build, test startu sandboxowanej przeglądarki, preview HTTP, detektor, analizę źródeł i zrzutów. Nie było nowego testu E2E, overlay ani pomiarów live. [Build](mt-ui-002-evidence/audit-build.log), [źródłowe zrzuty PR](screenshots/).

Źródła kodu odnoszą się do [niezmiennego drzewa PR](https://github.com/eluyz/math-tutor-app/tree/61e5ad6859e8707dab3116abe373a76074bc3733/src). Numery linii w raporcie dotyczą tej rewizji. Pierwotny raport MT-UI-002 powstał lokalnie bez zmian GitHub; został zachowany jako punkt odniesienia w sprincie MT-UI-003. Nie rozpoczęto implementacji poprawek.
