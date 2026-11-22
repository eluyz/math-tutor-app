import { formatRational } from "../answers";
import type { Locale } from "../locales/types";
import { rational, type Rational } from "../rational";
import { summarizeFrequencyQuery, type FrequencyQuestion, type FrequencyQuery, type FrequencyRow, type FrequencyUnit } from "./frequencyTasks";
import type { TeachingCopy } from "./st101Copy";

type FrequencyTeachingCopy = TeachingCopy & Readonly<{
  options: readonly Readonly<{ id: string; label: string }>[];
  table: Readonly<{
    caption: string;
    valueHeader: string;
    frequencyHeader: string;
    rows: readonly FrequencyRow[];
  }>;
}>;

function formatFrequency(value: Rational, unit: FrequencyUnit): string {
  const text = formatRational(value);
  if (unit !== "percentage") return text;
  return value.denominator === 1n ? `${text}%` : `(${text})%`;
}

function describeQuery(query: FrequencyQuery, pl: boolean): { prompt: string; select: string } {
  switch (query.family) {
    case "frequency":
      return {
        prompt: pl ? `Ile obserwacji ma wartość ${query.value}?` : `How many observations have the value ${query.value}?`,
        select: pl ? `Znajdź wiersz z wartością ${query.value} i odczytaj jego liczebność.` : `Find the row for ${query.value} and read its frequency.`,
      };
    case "total-count":
      return {
        prompt: pl ? "Ile obserwacji jest łącznie w tabeli?" : "How many observations are in the table in total?",
        select: pl ? "Uwzględnij wszystkie wiersze." : "Include every row.",
      };
    case "relative-frequency":
      return {
        prompt: pl ? `Jaka jest częstość względna obserwacji o wartości ${query.value}?` : `What is the relative frequency of observations with the value ${query.value}?`,
        select: pl ? `Znajdź wiersz z wartością ${query.value} i odczytaj jego liczebność.` : `Find the row for ${query.value} and read its frequency.`,
      };
    case "percentage":
      return {
        prompt: pl ? `Jaki procent obserwacji ma wartość ${query.value}?` : `What percentage of observations have the value ${query.value}?`,
        select: pl ? `Znajdź wiersz z wartością ${query.value} i odczytaj jego liczebność.` : `Find the row for ${query.value} and read its frequency.`,
      };
    case "subset-relative":
      return {
        prompt: pl ? `Jaka część wszystkich obserwacji ma wartość ${query.values[0]} lub ${query.values[1]}?`
          : `What fraction of all observations have the value ${query.values[0]} or ${query.values[1]}?`,
        select: pl ? `Dodaj liczebności wierszy dla wartości ${query.values[0]} i ${query.values[1]}.`
          : `Add the frequencies for the values ${query.values[0]} and ${query.values[1]}.`,
      };
    case "cumulative-count":
      return {
        prompt: pl ? `Ile obserwacji ma wartość co najwyżej ${query.value}?` : `How many observations have a value of at most ${query.value}?`,
        select: pl ? `Dodaj liczebności wierszy o wartościach mniejszych od ${query.value} lub równych tej wartości.`
          : `Add the frequencies of rows with values less than or equal to ${query.value}.`,
      };
    case "complement-percentage":
      return {
        prompt: pl ? `Jaki procent obserwacji ma wartość inną niż ${query.value}?` : `What percentage of observations have a value other than ${query.value}?`,
        select: pl ? `Zsumuj liczebności wszystkich wierszy poza wierszem dla wartości ${query.value}.`
          : `Add the frequencies of every row except the row for ${query.value}.`,
      };
  }
}

function sumCalculation(symbol: string, rows: readonly FrequencyRow[], sum: number): string {
  return rows.length > 1 ? `${symbol} = ${rows.map(row => row.frequency).join(" + ")} = ${sum}` : `${symbol} = ${sum}`;
}

export function frequencyCopy(question: FrequencyQuestion, locale: Locale): FrequencyTeachingCopy {
  if (locale !== "pl" && locale !== "en") throw new RangeError("Unsupported teaching locale");
  const pl = locale === "pl";
  const { total, selected, selectedRows, unit, answer } = summarizeFrequencyQuery(question.rows, question.query);
  const { prompt, select } = describeQuery(question.query, pl);
  const result = formatFrequency(answer, unit);
  const share = `${selected}/${total}`;
  const fractionHint = pl
    ? "Dodaj liczebności wszystkich wierszy, aby obliczyć N. Podziel wybraną liczebność k przez N."
    : "Add the frequencies of all rows to find N. Divide the selected count k by N.";
  const percentHint = pl
    ? "Pomnóż k/N przez 100 i dopisz znak %. Zapis (100/3)% oznacza dokładnie 100/3 procent."
    : "Multiply k/N by 100 and attach the percent sign. The notation (100/3)% means exactly 100/3 percent.";
  const steps: FrequencyTeachingCopy["steps"][number][] = [
    {
      title: pl ? "Oblicz łączną liczebność N" : "Find the total frequency N",
      calculation: sumCalculation("N", question.rows, total),
      explanation: pl ? "Dodaj liczebności wszystkich wierszy tabeli." : "Add the frequencies of all rows in the table.",
    },
    {
      title: pl ? "Oblicz wybraną liczebność k" : "Find the selected count k",
      calculation: sumCalculation("k", selectedRows, selected),
      explanation: select,
    },
  ];
  if (unit !== "count") steps.push({
    title: unit === "percentage"
      ? pl ? "Oblicz udział procentowy" : "Find the percentage share"
      : pl ? "Oblicz częstość względną" : "Find the relative frequency",
    calculation: unit === "percentage" ? `(100 × ${share})% = ${result}` : `k/N = ${share} = ${result}`,
    explanation: unit === "percentage" ? percentHint : fractionHint,
  });

  return {
    prompt,
    options: question.options.map(({ id, unit, value }) => ({ id, label: formatFrequency(rational(value.numerator, value.denominator), unit) })),
    hints: [
      select,
      unit === "count"
        ? pl ? "Liczebność to liczba obserwacji. Odczytaj lub dodaj liczebności, zostawiając wynik jako liczbę całkowitą."
          : "A frequency is a count of observations. Read or add the frequencies and keep the result as a whole number."
        : unit === "percentage" ? `${fractionHint} ${percentHint}` : fractionHint,
    ],
    table: {
      caption: pl ? "Tabela liczebności" : "Frequency table",
      valueHeader: pl ? "Wartość" : "Value",
      frequencyHeader: pl ? "Liczebność" : "Frequency",
      rows: question.rows,
    },
    steps,
    conclusion: unit === "count"
      ? pl ? `Liczba obserwacji spełniających warunek wynosi ${result}.` : `The count of observations matching the question is ${result}.`
      : unit === "percentage"
        ? pl ? `Dokładny udział procentowy wynosi ${result}.` : `The exact percentage share is ${result}.`
        : pl ? `Częstość względna wynosi ${result}.` : `The relative frequency is ${result}.`,
    feedback: pl ? {
      correct: "Poprawna odpowiedź. W rozwiązaniu możesz sprawdzić obliczenia.",
      incorrect: "Odpowiedź jest inna. Sprawdź wybrane wiersze i jednostkę wyniku.",
      empty: "Wybierz odpowiedź, aby ją sprawdzić.",
      invalid: "Wybierz jedną z odpowiedzi podanych w tym pytaniu.",
    } : {
      correct: "Correct answer. You can check the calculations in the solution.",
      incorrect: "The answer differs. Check the rows you selected and the unit of the result.",
      empty: "Choose an answer before checking it.",
      invalid: "Choose one of the answers offered for this question.",
    },
  };
}
