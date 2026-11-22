import type { Locale } from "../locales/types";
import { evaluateChartClaim, evaluateChartQuery, type ChartCategory, type ChartClaim, type ChartTask } from "./chartTasks";
import type { TeachingCopy } from "./st101Copy";

type ChartTeachingCopy = TeachingCopy & Readonly<{
  options: readonly Readonly<{ id: string; label: string }>[];
  chart: Readonly<{
    title: string;
    description: string;
    categoryAxis: string;
    countAxis: string;
  }>;
  table: Readonly<{
    caption: string;
    valueHeader: string;
    frequencyHeader: string;
    rows: readonly Readonly<{ value: ChartCategory; frequency: number }>[];
  }>;
}>;

type LessonCopy = Pick<TeachingCopy, "prompt" | "hints" | "steps" | "conclusion">;
type Reading = (category: ChartCategory) => number;
type Comparison = Extract<ChartClaim, { kind: "comparison" }>;
const visits = (count: number) => `${count} ${count === 1 ? "visit" : "visits"}`;

function comparisonLabel({ left, right, relation }: Comparison, pl: boolean): string {
  if (relation === "=") return pl ? `W salach ${left} i ${right} było tyle samo wizyt.` : `Rooms ${left} and ${right} had the same number of visits.`;
  if (pl) return `W sali ${left} było ${relation === "<" ? "mniej" : "więcej"} wizyt niż w sali ${right}.`;
  return `Room ${left} had ${relation === "<" ? "fewer" : "more"} visits than room ${right}.`;
}

function claimLabel(claim: ChartClaim, pl: boolean): string {
  switch (claim.kind) {
    case "comparison":
      return comparisonLabel(claim, pl);
    case "read":
      return pl ? `Liczba wizyt w sali ${claim.category} wyniosła ${claim.value}.` : `Room ${claim.category} had ${visits(claim.value)}.`;
    case "sum":
      return pl ? `Łączna liczba wizyt w salach ${claim.left} i ${claim.right} wyniosła ${claim.value}.`
        : `Rooms ${claim.left} and ${claim.right} had ${visits(claim.value)} in total.`;
    case "difference":
      return pl ? `Wartość bezwzględna różnicy między liczbami wizyt w salach ${claim.left} i ${claim.right} wyniosła ${claim.value}.`
        : `The absolute difference between the visit counts for rooms ${claim.left} and ${claim.right} was ${visits(claim.value)}.`;
    case "cause":
      return pl ? `Plakat w sali ${claim.category} wpłynął na liczbę wizyt w tej sali.`
        : `A poster in room ${claim.category} changed the number of visits to that room.`;
    case "future":
      return pl ? `We wtorek od 9:00 do 10:00 sala ${claim.category} będzie miała dokładnie ${claim.value} wizyt.`
        : `Room ${claim.category} will have exactly ${visits(claim.value)} on Tuesday, 9–10 a.m.`;
    case "population":
      return pl ? "Wszystkie wizyty w salach budynku w tej godzinie odbyły się w salach pokazanych na wykresie."
        : "The rooms shown account for all room visits in the building during that hour.";
  }
}

function readingStep(categories: readonly ChartCategory[], read: Reading, pl: boolean): TeachingCopy["steps"][number] {
  return {
    title: pl ? "Odczytaj wartości" : "Read the counts",
    calculation: categories.map(category => `${category} = ${read(category)}`).join(", "),
    explanation: pl ? "Etykieta nad słupkiem podaje liczbę wizyt w danej sali." : "The label above each bar gives that room’s visit count.",
  };
}

function operationCalculation(
  family: "comparison" | "difference" | "sum",
  left: number,
  right: number,
): string {
  switch (family) {
    case "comparison": return `${left} ${left === right ? "=" : left < right ? "<" : ">"} ${right}`;
    case "difference": return `|${left} − ${right}| = ${Math.abs(left - right)}`;
    case "sum": return `${left} + ${right} = ${left + right}`;
  }
}

function evidenceStep(rows: ChartTask["rows"], claim: ChartClaim, read: Reading, pl: boolean): TeachingCopy["steps"][number] {
  const truth = evaluateChartClaim(rows, claim);
  switch (claim.kind) {
    case "cause":
      return {
        title: pl ? "Brakuje danych" : "Evidence is missing",
        calculation: claimLabel(claim, pl),
        explanation: pl ? "Wykres podaje liczbę wizyt. Nie ma w nim informacji o plakacie ani o powodach wizyt."
          : "The chart counts visits. It gives no information about a poster or why people visited.",
      };
    case "future":
      return {
        title: pl ? "Brakuje danych" : "Evidence is missing",
        calculation: claimLabel(claim, pl),
        explanation: pl ? "Wykres obejmuje tylko poniedziałek, więc brak danych z wtorku."
          : "The chart covers one hour on Monday. It contains no observations from Tuesday.",
      };
    case "population":
      return {
        title: pl ? "Brakuje danych" : "Evidence is missing",
        calculation: claimLabel(claim, pl),
        explanation: pl ? "Wykres obejmuje tylko wybrane sale. Nie podaje liczby wizyt w pozostałych salach w budynku."
          : "The chart covers only the selected rooms. It gives no counts for the other rooms in the building.",
      };
    default:
      return {
        title: truth === "supported" ? pl ? "Potwierdzają to liczby" : "Supported by the counts"
          : pl ? "Liczby temu przeczą" : "Contradicted by the counts",
        calculation: claim.kind === "read" ? `${claim.category} = ${read(claim.category)}`
          : "left" in claim ? operationCalculation(claim.kind, read(claim.left), read(claim.right)) : claimLabel(claim, pl),
        explanation: pl ? `Sprawdź stwierdzenie „${claimLabel(claim, pl)}” na podstawie tego odczytu.`
          : `Use this calculation to check “${claimLabel(claim, pl)}”`,
      };
  }
}

function describeExercise(task: ChartTask, read: Reading, pl: boolean): LessonCopy {
  const { query, rows } = task;
  const result = evaluateChartQuery(rows, query);
  switch (query.family) {
    case "read": {
      const category = query.category;
      return {
        prompt: pl ? `Ile wizyt odnotowano w sali ${category}?` : `How many visits were recorded in room ${category}?`,
        hints: [
          pl ? `Znajdź salę ${category} na osi poziomej.` : `Find room ${category} on the horizontal axis.`,
          pl ? "Odczytaj liczbę nad tym słupkiem. Słupek o wysokości zero oznacza zero wizyt."
            : "Read the number above that bar. A bar of height zero means zero visits.",
        ],
        steps: [readingStep([category], read, pl)],
        conclusion: pl ? `Liczba wizyt w sali ${category} wyniosła ${read(category)}.`
          : `Room ${category} had ${visits(read(category))}.`,
      };
    }
    case "largest":
    case "smallest": {
      if (result.kind !== "extrema" || result.categories.length !== 1) throw new RangeError("A singular question needs a unique extremum");
      const [category] = result.categories;
      const largest = query.family === "largest";
      const direction = largest ? (pl ? "najwyższą" : "highest") : (pl ? "najniższą" : "lowest");
      return {
        prompt: pl ? `W której sali odnotowano ${largest ? "najwięcej" : "najmniej"} wizyt?`
          : `Which room had the ${largest ? "most" : "fewest"} visits?`,
        hints: [
          pl ? "Odczytaj liczby nad wszystkimi słupkami." : "Read the numbers above all the bars.",
          pl ? `Znajdź ${direction} liczbę i odczytaj oznaczenie sali pod jej słupkiem.`
            : `Find the ${direction} count and read the room label below its bar.`,
        ],
        steps: [readingStep(rows.map(row => row.category), read, pl), {
          title: pl ? "Porównaj wartości" : "Compare the counts",
          calculation: `${category} = ${result.value}`,
          explanation: pl ? `Sala ${category} ma ${direction} liczbę wizyt na wykresie.`
            : `Room ${category} has the ${direction} count on the chart.`,
        }],
        conclusion: pl ? `Sala ${category} ma ${direction} liczbę wizyt (${result.value}).`
          : `Room ${category} has the ${direction} count with ${visits(result.value)}.`,
      };
    }
    case "compare":
    case "difference":
    case "sum": {
      const { left, right } = query;
      const pair = readingStep([left, right], read, pl);
      const kind = query.family === "compare" ? "comparison" : query.family;
      const calculation = operationCalculation(kind, read(left), read(right));
      const firstHint = pl ? `Odczytaj liczby wizyt w salach ${left} i ${right}.` : `Read the visit counts for rooms ${left} and ${right}.`;
      let prompt: string;
      let operation: string;
      let conclusion: string;
      if (result.kind === "relation") {
        prompt = pl ? `Jak porównać liczbę wizyt w sali ${left} z liczbą wizyt w sali ${right}?`
          : `How does the visit count for room ${left} compare with room ${right}?`;
        operation = pl ? "Sprawdź, która liczba jest większa, lub czy obie są równe."
          : "Check which count is greater or whether both counts are equal.";
        conclusion = comparisonLabel({ kind: "comparison", left, right, relation: result.value }, pl);
      } else if (result.kind === "count" && kind === "difference") {
        prompt = pl ? `Jaka jest wartość bezwzględna różnicy między liczbami wizyt w salach ${left} i ${right}?`
          : `What is the absolute difference between the visit counts for rooms ${left} and ${right}?`;
        operation = pl ? "Odejmij mniejszą liczbę od większej. Jeśli liczby są równe, różnica wynosi zero."
          : "Subtract the smaller count from the larger count. Equal counts give a difference of zero.";
        conclusion = claimLabel({ kind, left, right, value: result.value }, pl);
      } else if (result.kind === "count") {
        prompt = pl ? `Ile wizyt odnotowano łącznie w salach ${left} i ${right}?`
          : `How many visits were recorded in rooms ${left} and ${right} in total?`;
        operation = pl ? "Dodaj liczbę wizyt w pierwszej sali do liczby wizyt w drugiej." : "Add the two room counts.";
        conclusion = claimLabel({ kind: "sum", left, right, value: result.value }, pl);
      } else {
        throw new RangeError("A comparison or calculation needs two rooms");
      }
      return {
        prompt,
        hints: [firstHint, operation],
        steps: [pair, { title: pl ? "Zastosuj regułę" : "Apply the rule", calculation, explanation: operation }],
        conclusion,
      };
    }
    case "supported":
    case "unsupported": {
      const supported = query.family === "supported";
      const claims = task.options.map(({ answer }) => {
        if (answer.kind !== "claim") throw new RangeError("An evidence question needs claim options");
        return answer.claim;
      });
      const correct = claims.find(claim => evaluateChartClaim(rows, claim) === (supported ? "supported" : "underdetermined"));
      if (!correct) throw new RangeError("No matching conclusion");
      const statement = claimLabel(correct, pl);
      return {
        prompt: supported
          ? pl ? "Które stwierdzenie potwierdzają dane na wykresie?" : "Which statement is supported by the chart?"
          : pl ? "Którego stwierdzenia nie da się ustalić na podstawie wykresu?" : "Which statement cannot be determined from the chart?",
        hints: [
          pl ? "Zwróć uwagę na sale i godzinę, których dotyczą dane." : "Notice which rooms and hour the data cover.",
          supported
            ? pl ? "Sprawdź porównanie, sumę i różnicę, korzystając z dokładnych liczb." : "Check the comparison, sum and difference using the exact counts."
            : pl ? "Sprawdź dwa stwierdzenia liczbowe. Zastanów się, jakich danych wymaga trzecie."
              : "Verify the two numerical statements. Think about what evidence the remaining claim would need.",
        ],
        steps: [readingStep([query.left, query.right], read, pl), ...claims.map(claim => evidenceStep(rows, claim, read, pl))],
        conclusion: supported ? statement
          : pl ? `Wykres nie rozstrzyga stwierdzenia „${statement}”.` : `The chart leaves “${statement}” undetermined.`,
      };
    }
  }
}

export function chartCopy(task: ChartTask, locale: Locale): ChartTeachingCopy {
  if (locale !== "pl" && locale !== "en") throw new RangeError("Unsupported teaching locale");
  const pl = locale === "pl";
  const read = (category: ChartCategory) => task.rows.find(row => row.category === category)!.value;
  const lesson = describeExercise(task, read, pl);
  const categoryAxis = pl ? "Sala" : "Room";
  const countAxis = pl ? "Liczba wizyt" : "Number of visits";
  const context = pl ? "Wykres pokazuje liczbę wizyt w wybranych salach w poniedziałek od 9:00 do 10:00."
    : "The chart shows recorded visits to selected rooms on Monday, 9–10 a.m.";
  return {
    ...lesson,
    prompt: `${context} ${lesson.prompt}`,
    options: task.options.map(({ id, answer }) => {
      switch (answer.kind) {
        case "count": return { id, label: String(answer.value) };
        case "category": return { id, label: answer.category };
        case "claim": return { id, label: claimLabel(answer.claim, pl) };
        case "relation": {
          const query = task.query;
          if (query.family !== "compare") throw new RangeError("A comparison option needs a comparison question");
          return { id, label: comparisonLabel({ kind: "comparison", left: query.left, right: query.right, relation: answer.value }, pl) };
        }
      }
    }),
    chart: {
      title: pl ? "Wykres słupkowy wizyt według sali" : "Bar chart of visits by room",
      description: pl ? "Słupki zaczynają się od zera. Dokładne liczby wizyt są nad słupkami i w tabeli."
        : "Bars start at zero. Exact visit counts appear above each bar and in the table.",
      categoryAxis,
      countAxis,
    },
    table: {
      caption: pl ? "Liczba wizyt w każdej sali" : "Visit counts by room",
      valueHeader: categoryAxis,
      frequencyHeader: countAxis,
      rows: task.rows.map(({ category, value }) => ({ value: category, frequency: value })),
    },
    feedback: pl ? {
      correct: "Poprawna odpowiedź. Rozwiązanie pokazuje, jak odczytać dane i je uzasadnić.",
      incorrect: "Odpowiedź jest inna. Sprawdź liczby nad słupkami i zakres danych.",
      empty: "Wybierz odpowiedź, aby ją sprawdzić.",
      invalid: "Wybierz jedną z odpowiedzi podanych w tym pytaniu.",
    } : {
      correct: "Correct answer. The solution shows how the data lead to it.",
      incorrect: "The answer differs. Check the values above the bars and what the chart measures.",
      empty: "Choose an answer before checking it.",
      invalid: "Choose one of the answers offered for this question.",
    },
  };
}
