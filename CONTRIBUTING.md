# Współtworzenie

Dziękujemy za wkład w Math Tutor. Zgłaszaj błędy matematyczne z przykładowym zadaniem, wpisaną odpowiedzią oraz oczekiwanym wyjaśnieniem. Proponowane zmiany przygotuj na osobnej gałęzi i opisz ich wpływ na użytkownika.

Przed Pull Request uruchom:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Nowe zadania powinny mieć sprawdzony wynik, jasne wyjaśnienie i test błędnej odpowiedzi. Unikaj nazywania ręcznych reguł inteligentną diagnostyką. Nie dodawaj zewnętrznych połączeń przesyłających odpowiedzi użytkownika.

Wkład jest udostępniany na warunkach licencji [MIT](LICENSE).

## Rozwiązania i brudnopis

Dodając lub zmieniając rodzinę, uzupełnij `solutions/model.ts`: etap ma działanie i uzasadnienie, a ostatni prawdziwy `AnswerSpec`. Nie wycinaj zdań z `explanation`. Dodaj niezależne sprawdzenie rachunku; audyt musi obejmować każdy wariant i poziom, także znaki, zera, ułamki i klasyfikację pierwiastków. Testy sprawdzają również dokumentowaną sumę instancji w GENERATORS.md.

Zmiany brudnopisu sprawdzaj przy auto-clear ON i OFF: nowe uruchomienie tej samej treści, rodzina/kategoria/poziom, zakończenie i nowa sesja, clear/undo, tekst i rysunek, natywne Undo/Redo symbolu w zaznaczeniu, anulowanie wskaźnika, resize i powiększenie. Rozwiązanie resetuje się zawsze; brudnopis według checkboxa. Sprawdź klawiaturę i brak overflow na 375/768 px. Oprócz automatycznych testów Chromium przed merge ręcznie sprawdź Safari na iPhonie/iPadzie: palec/piórko, obrót, zaznaczenie i klawiaturę ekranową, Undo/Redo, fokus i przewijanie powiększonego widoku. Zanotuj urządzenie i wersję; nie deklaruj testu urządzenia na podstawie emulacji Chromium.

## Pięć poziomów i PL/EN

Poziomy i ich kolejność dodawaj wyłącznie w `src/difficulty.ts`. Rodzina deklaruje wsparcie; nie mapuj brakującego poziomu na niższy. Każda wspierana kombinacja musi mieć minimum 10 unikalnych treści, poprawną typowaną odpowiedź i pełne kroki. W nowych wzorcach preferuj 24 kontrolowane indeksy, nie niezależne losowanie każdego pola. Rozszerzenie poziomów 4/5 musi zwiększać złożoność zależnych działań. Zmianę zakresów/uzupełnień odnotuj w mapie GENERATORS.md; testy liczą rzeczywiste instancje, nie przyjmują ręcznej sumy.

Polecenia EN, tytuły, wskazówki, etykiety i diagnozy uzupełniaj w `locales/lessons-en.ts`, interfejs w `locales/ui.ts`, a komunikaty nowego silnika w `locales/math.ts`. Przy zmianie etapów starego rozwiązania sprawdź także angielskie sceny: liczba etapów, ich znaczenie i rachunki muszą się zgadzać. Nie stosuj zastępczego polskiego tekstu w EN. Nie tłumacz notatek użytkownika. Locale nigdy nie może wpływać na parametry, klucz treści, ID, losowanie ani ocenę.

Audytuj wszystkie rodziny × wspierane poziomy × warianty. Do wzorów użyj niezależnych podstawień, do wyznaczników Laplace'a, do ułamków niezależnego mnożenia krzyżowego. Sprawdzaj brak zerowych mianowników, poprawność każdego pośredniego rachunku i pełny wynik końcowy. Testuj PL→EN→PL z wpisaną i sprawdzoną odpowiedzią, diagnozą, pomocniczym krokiem, częściowym i pełnym rozwiązaniem, notatkami/rysunkiem oraz sesją. Zachowaj minimum 7 samodzielnych ocen i granice easy/expert. Zmiana języka, trybu i powiększenie nie mogą niszczyć natywnego Undo/Redo.

W Chromium sprawdzaj 375, 768 i 1280 px oraz angielski przepływ aż do podsumowania i rekomendacji. Safari na fizycznym iPhonie/iPadzie weryfikuj dodatkowo w obu językach; zanotuj urządzenie i wersję. Testy emulowanego viewportu nie są takim testem. Żaden commit ani PR nie upoważnia do merge lub deploy bez osobnej zgody użytkownika.

## Lokalna historia — MT-004A

Zapisuj jedynie zdarzenie ukończenia sesji i kanoniczne ID rodziny/poziomu oraz pierwszy wynik z `session.ts`. Nie przeliczaj historii z formularzy lub przetłumaczonego tekstu. Nie zapisuj odpowiedzi, ID/parametrów ćwiczeń, notatek, rysunków, aktywnej sesji ani języka. Walidator i numer schematu są kontraktem, a limit historii wynosi 200. Odczyt, zapis, quota, nieznana wersja i kasowanie muszą mieć testy; uszkodzone/przyszłe dane nie mogą być cicho nadpisywane.

Testy prywatności dopuszczają tylko `math-tutor.progress.v1` po ukończeniu sesji, bez innych kluczy localStorage, sessionStorage lub zewnętrznych żądań. Testuj zapis dokładnie raz, powrót do wyniku, usunięcie i reload, eksport niezależny od filtrów, procent z jawnym mianownikiem, PL/EN i powrót do nauki bez resetu.

Brudnopis ma być domyślnie zwinięty pomiędzy treścią a odpowiedzią. Nie używaj conditional mount ani klucza zależnego od zwinięcia/widoku/języka. Sprawdzaj realne wpisywanie, Backspace, Ctrl/Cmd+Z, Redo, zaznaczenie i tożsamość textarea, rysunki, auto-clear ON/OFF oraz schowanie modala bez osieroconej blokady przewijania. Tylko nowe zadanie z auto-clear ON odcina historię.
