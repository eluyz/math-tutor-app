import type { Locale } from "./types";

const pl = {
  title: "ST-101 — Średnia arytmetyczna",
  difficulty: "Poziom trudności", answer: "Twoja odpowiedź", check: "Sprawdź",
  next: "Następne zadanie", hint1: "Pokaż podpowiedź", hint2: "Pokaż drugą podpowiedź",
  hintsDone: "Obie podpowiedzi pokazane", show: "Pokaż rozwiązanie", hide: "Ukryj rozwiązanie",
  solution: "Rozwiązanie krok po kroku",
  format: "Podaj dokładny wynik: liczbę całkowitą, skończony zapis dziesiętny lub ułamek. Nie zaokrąglaj. Limit: 100 znaków.",
  memory: "Te ćwiczenia nie zapisują postępów i nie zmieniają wyników Matematyki. Podczas przełączania działów zachowujemy bieżące zadanie i odpowiedź. Odświeżenie lub zamknięcie strony je usuwa.",
};
export const statisticsPracticeCopy: Record<Locale, typeof pl> = {
  pl,
  en: {
    title: "ST-101 — Arithmetic mean",
    difficulty: "Difficulty", answer: "Your answer", check: "Check", next: "Next exercise",
    hint1: "Show hint", hint2: "Show second hint", hintsDone: "Both hints shown",
    show: "Show solution", hide: "Hide solution", solution: "Step-by-step solution",
    format: "Enter an exact result: an integer, a finite decimal or a fraction. Do not round. Limit: 100 characters.",
    memory: "These exercises do not save progress or change Mathematics results. Switching subjects keeps the current task and answer. Refreshing or closing the page clears them.",
  },
};
