import type { Locale } from "../locales/types";
import { formatRational } from "../answers";
import { summarizeIntegerDataset } from "./descriptive";

export type TeachingCopy = Readonly<{
  prompt: string;
  hints: readonly [string, string];
  steps: readonly Readonly<{ title: string; calculation: string; explanation: string }>[];
  conclusion: string;
  feedback: Readonly<{ correct: string; incorrect: string; empty: string; invalid: string }>;
}>;

/** Original, unintegrated arithmetic-mean lesson; values, not a supplied answer, drive the steps. */
export function meanCopy(values: readonly number[], locale: Locale): TeachingCopy {
  if (locale !== "pl" && locale !== "en") throw new RangeError("Unsupported teaching locale");
  const summary = summarizeIntegerDataset(values);
  const sum = values.reduce((total, value) => total + BigInt(value), 0n);
  const terms = values.map((value) => value < 0 ? `(${value})` : String(value)).join(" + ");
  const answer = formatRational(summary.mean);
  const pl = locale === "pl";
  return {
    prompt: pl
      ? `Oblicz dokładną średnią arytmetyczną obserwacji: ${values.join(", ")}. Możesz podać ułamek.`
      : `Calculate the exact arithmetic mean of these observations: ${values.join(", ")}. You may enter a fraction.`,
    hints: pl
      ? ["Policz wszystkie obserwacje, uwzględniając powtórzenia.", "Dodaj wszystkie wartości, a następnie podziel sumę przez liczbę obserwacji."]
      : ["Count every observation, including repeated values.", "Add all the values, then divide their sum by the number of observations."],
    steps: [
      { title: pl ? "Liczba obserwacji" : "Number of observations", calculation: `n = ${summary.count}`,
        explanation: pl ? "Każda podana wartość to jedna obserwacja, także gdy się powtarza." : "Each listed value is one observation, even when it is repeated." },
      { title: pl ? "Suma wartości" : "Sum of values", calculation: `Σx = ${terms} = ${sum}`,
        explanation: pl ? "Dodaj wszystkie obserwacje, zachowując znaki liczb ujemnych." : "Add every observation, retaining the signs of negative values." },
      { title: pl ? "Podziel przez liczbę obserwacji" : "Divide by the observation count", calculation: `μ = (${sum})/${summary.count} = ${answer}`,
        explanation: pl ? "Średnia to suma podzielona przez n. Zachowaj wynik dokładny; nie zaokrąglaj ułamka." : "The mean is the sum divided by n. Keep the result exact; do not round a fraction." },
    ],
    conclusion: pl ? `Średnia arytmetyczna wynosi ${answer}.` : `The arithmetic mean is ${answer}.`,
    feedback: pl ? {
      correct: "Poprawna odpowiedź. Sprawdź obliczenia w rozwiązaniu.",
      incorrect: "Wynik jest inny. Sprawdź liczbę obserwacji, sumę i dzielenie; sam wynik nie wskazuje jednoznacznie przyczyny błędu.",
      empty: "Wpisz odpowiedź, aby ją sprawdzić.",
      invalid: "Podaj liczbę całkowitą, skończony zapis dziesiętny albo ułamek z niezerowym mianownikiem.",
    } : {
      correct: "Correct answer. Check the calculations in the solution.",
      incorrect: "The result differs. Check the count, sum and division; a result alone does not identify the cause of an error.",
      empty: "Enter an answer before checking it.",
      invalid: "Enter an integer, a finite decimal or a fraction with a nonzero denominator.",
    },
  };
}
