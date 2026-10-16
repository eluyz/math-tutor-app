import type { Exercise, FeedbackCopy } from "../exercises";

// Polish UI copy. Add a matching en.ts catalog when English is introduced.
export const ui = {
  start: "Rozpocznij ćwiczenia",
  answer: "Twoja odpowiedź",
  answerPlaceholder: "Wpisz liczbę",
  check: "Sprawdź",
  correct: "Brawo!",
  incorrect: "Spróbuj jeszcze raz",
  invalid: "Sprawdź odpowiedź",
  completed: "Ukończone",
  open: "Otwórz",
} as const;

export const feedback: FeedbackCopy = {
  invalidNumber: "Wpisz jedną liczbę, np. 5 lub −2.",
  correctPrefix: "Dobrze!",
  incorrectPrefix: "Jeszcze nie.",
  hintPrefix: "Wskazówka:",
};

export const exercises: Exercise[] = [
  {
    id: "order",
    topic: "Kolejność działań",
    title: "Najpierw mnożenie",
    question: "3 + 4 × 2 = ?",
    hint: "Najpierw wykonaj mnożenie, potem dodawanie.",
    answer: 11,
    explanation: "Najpierw 4 × 2 = 8. Następnie 3 + 8 = 11.",
    commonMistakes: {
      14: "Wygląda na to, że najpierw dodano 3 + 4. Mnożenie ma pierwszeństwo przed dodawaniem.",
    },
  },
  {
    id: "negative",
    topic: "Liczby ujemne",
    title: "Przejście przez zero",
    question: "−7 + 12 = ?",
    hint: "Od −7 przesuń się o 12 miejsc w prawo na osi liczbowej.",
    answer: 5,
    explanation:
      "Od −7 do zera jest 7 kroków. Z pozostałych 5 kroków otrzymujemy wynik 5.",
    commonMistakes: {
      [-19]:
        "Dodanie liczby dodatniej przesuwa wynik w prawo na osi liczbowej, a nie dalej w stronę liczb ujemnych.",
      19: "Liczby mają różne znaki. Odejmij 7 od 12 i zachowaj znak większej wartości bezwzględnej.",
    },
  },
  {
    id: "algebra",
    topic: "Podstawowa algebra",
    title: "Znajdź niewiadomą",
    question: "2x + 3 = 11. Ile wynosi x?",
    hint: "Odejmij 3 od obu stron, a potem podziel przez 2.",
    answer: 4,
    explanation:
      "2x + 3 = 11, więc 2x = 8. Po podzieleniu obu stron przez 2 otrzymujemy x = 4.",
    commonMistakes: {
      8: "To wartość 2x. Aby znaleźć samo x, podziel 8 przez 2.",
      7: "Najpierw odejmij 3 od 11, dopiero potem podziel wynik przez 2.",
    },
  },
];
