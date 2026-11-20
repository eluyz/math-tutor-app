import type { Locale } from "../locales/types";
import { summarizeMode, type FrequencyRow, type ModeQuestion } from "./modeTasks";
import type { TeachingCopy } from "./st101Copy";

export type ModeTeachingCopy = TeachingCopy & Readonly<{
  options: readonly Readonly<{ id: string; label: string }>[];
  table: Readonly<{
    caption: string;
    valueHeader: string;
    frequencyHeader: string;
    rows: readonly FrequencyRow[];
  }>;
}>;

function modeSet(values: readonly number[]): string {
  return `{${values.join(", ")}}`;
}

export function modeCopy(question: ModeQuestion, locale: Locale): ModeTeachingCopy {
  if (locale !== "pl" && locale !== "en") throw new RangeError("Unsupported teaching locale");
  const { rows, maximum, modes } = summarizeMode(question.values);
  const data = `[${question.values.join(", ")}]`;
  const pl = locale === "pl";
  const noMode = pl ? "Brak dominanty" : "No mode";
  const conclusion = modes.length === 0
    ? pl ? "Brak dominanty. Każda wartość występuje tylko raz." : "No mode. Each value occurs only once."
    : modes.length === 1
      ? pl ? `Dominanta: ${modeSet(modes)}.` : `Mode: ${modeSet(modes)}.`
      : pl ? `Zbiór dominant: ${modeSet(modes)}. Dane są wielomodalne.` : `Set of modes: ${modeSet(modes)}. The data are multimodal.`;

  return {
    prompt: pl
      ? `Wskaż pełny zbiór dominant obserwacji ${data}. Dominantami są wszystkie wartości o największej liczebności, jeśli wynosi ona co najmniej 2. Jeśli każda wartość występuje raz, wybierz „Brak dominanty”.`
      : `Choose the complete set of modes for the observations ${data}. The modes are all values with the highest frequency if that frequency is at least 2. If each value occurs once, choose “No mode”.`,
    options: question.options.map(option => ({ id: option.id, label: option.values.length ? modeSet(option.values) : noMode })),
    hints: pl
      ? ["Policz, ile razy pojawia się każda różna wartość, także zero i liczby ujemne.", "Znajdź największą liczebność. Jeśli wynosi 1, nie ma powtórzeń i odpowiedź to brak dominanty. W przeciwnym razie wybierz wszystkie wartości o tej liczebności."]
      : ["Count how many times each distinct value appears, including zero and negative numbers.", "Find the highest frequency. If it is 1, there are no repeats and the answer is no mode. Otherwise, choose every value with that frequency."],
    table: {
      caption: pl ? "Tabela liczebności" : "Frequency table",
      valueHeader: pl ? "Wartość" : "Value",
      frequencyHeader: pl ? "Liczebność" : "Frequency",
      rows,
    },
    steps: [
      {
        title: pl ? "Policz wystąpienia każdej wartości" : "Count occurrences of each value",
        calculation: `n = ${question.values.length}`,
        explanation: pl
          ? "Każdy wiersz tabeli pokazuje jedną wartość i liczbę jej wystąpień w danych."
          : "Each row in the table gives one distinct value and its number of occurrences.",
      },
      {
        title: pl ? "Znajdź największą liczebność" : "Find the highest frequency",
        calculation: `fₘₐₓ = ${maximum}`,
        explanation: pl
          ? "Porównaj liczebności w tabeli. Największa z nich musi wynosić co najmniej 2, aby istniała dominanta."
          : "Compare the frequencies in the table. The highest must be at least 2 for a mode to exist.",
      },
      {
        title: pl ? "Wybierz wszystkie dominanty" : "Select all modes",
        calculation: modes.length === 0 ? "∅" : modeSet(modes),
        explanation: modes.length === 0
          ? pl ? "Największa liczebność wynosi 1, więc wybieramy pusty zbiór dominant."
            : "The highest frequency is 1, so the set of modes is empty."
          : pl ? "Wybierz każdą wartość, której liczebność jest równa największej. Remis oznacza, że każda z tych wartości jest dominantą."
            : "Select every value whose frequency equals the maximum. If several values tie at that frequency, each is a mode.",
      },
    ],
    conclusion,
    feedback: pl ? {
      correct: "Poprawna odpowiedź. W rozwiązaniu możesz sprawdzić liczebności.",
      incorrect: "Odpowiedź jest inna. Sprawdź największą liczebność i wszystkie wartości, które ją osiągają.",
      empty: "Wybierz odpowiedź, aby ją sprawdzić.",
      invalid: "Wybierz jedną z odpowiedzi podanych w tym pytaniu.",
    } : {
      correct: "Correct answer. You can check the frequencies in the solution.",
      incorrect: "The answer differs. Check the highest frequency and every value that reaches it.",
      empty: "Choose an answer before checking it.",
      invalid: "Choose one of the answers offered for this question.",
    },
  };
}
