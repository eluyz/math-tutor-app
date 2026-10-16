# Architektura

Statyczna aplikacja React + TypeScript zbudowana przez Vite. `src/App.tsx` obsługuje nawigację między ćwiczeniami i stan formularza. `src/exercises.ts` zawiera typy i czystą funkcję `checkAnswer`; funkcja nie korzysta z `eval` ani połączeń sieciowych. `src/locales/pl.ts` zawiera dane trzech zadań, komunikaty sprawdzania i część tekstów interfejsu. `src/styles.css` odpowiada za układ responsywny. Dodanie angielskiego wymaga analogicznego katalogu, przeniesienia pozostałych tekstów interfejsu i przełącznika języka.

Odpowiedź jest parsowana jako pojedyncza liczba, z obsługą przecinka dziesiętnego. Prawidłowość wyniku jest porównywana z wartością przypisaną do zadania. Wybrane błędne wyniki mają ręcznie napisane wskazówki; pozostałe dostają ogólną podpowiedź. Teksty wyjaśnień są stałe i można je recenzować matematycznie.

Vitest testuje logikę sprawdzania, a Playwright główną ścieżkę interfejsu i widok telefonu. `vite.config.ts` ustawia bazową ścieżkę pod przyszłe GitHub Pages. Aplikacja nie ma backendu, telemetrii ani zewnętrznych zasobów podczas działania.

Główne ograniczenie: pojedynczy wynik liczbowy nie pozwala wiarygodnie ustalić procesu myślenia użytkownika. Pełniejsza diagnostyka jest zakresem MT-002.

Bezpośrednie zależności są zgodne z użytym Node 24: React, Vite, Vitest i wtyczka React dla Vite mają licencję MIT, a TypeScript i Playwright Apache 2.0. Obie licencje pozwalają na użycie w projekcie MIT; tekst licencji projektu pozostaje w `LICENSE`.
