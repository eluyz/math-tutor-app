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
