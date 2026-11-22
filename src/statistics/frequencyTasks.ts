import { equalRational, rational, type Rational } from "../rational";
import type { DatasetDifficulty } from "./datasets";

export type FrequencyRow = Readonly<{ value: number; frequency: number }>;
export type FrequencyQuery =
  | Readonly<{ family: "frequency" | "relative-frequency" | "percentage" | "cumulative-count" | "complement-percentage"; value: number }>
  | Readonly<{ family: "total-count" }>
  | Readonly<{ family: "subset-relative"; values: readonly [number, number] }>;
export type FrequencyUnit = "count" | "relative" | "percentage";
export type FrequencyChoice = Readonly<{ id: string; unit: FrequencyUnit; value: Rational }>;
export type FrequencyQuestion = Readonly<{
  id: string;
  rows: readonly FrequencyRow[];
  query: FrequencyQuery;
  options: readonly FrequencyChoice[];
}>;
export type FrequencyTask = FrequencyQuestion & Readonly<{ difficulty: DatasetDifficulty; seed: number }>;
export type FrequencyAssessment = "correct" | "incorrect" | "empty" | "invalid";
type FrequencySummary = Readonly<{
  total: number;
  selected: number;
  selectedRows: readonly FrequencyRow[];
  unit: FrequencyUnit;
  answer: Rational;
}>;

function answerFor(count: number, total: number, unit: FrequencyUnit): Rational {
  switch (unit) {
    case "count": return rational(count);
    case "relative": return rational(count, total);
    case "percentage": return rational(100n * BigInt(count), total);
  }
}

function selectRows(
  rows: readonly FrequencyRow[],
  query: FrequencyQuery,
  categories: ReadonlySet<number>,
): Pick<FrequencySummary, "selectedRows" | "unit"> {
  if (!query || typeof query !== "object") throw new RangeError("Invalid frequency query");
  switch (query.family) {
    case "total-count":
      return { selectedRows: rows, unit: "count" };
    case "subset-relative": {
      const values = query.values;
      if (!Array.isArray(values) || values.length !== 2) throw new RangeError("Select exactly two categories");
      const [left, right] = values;
      if (left === right || !categories.has(left) || !categories.has(right)) {
        throw new RangeError("Select two distinct categories present in the table");
      }
      return { selectedRows: rows.filter(row => row.value === left || row.value === right), unit: "relative" };
    }
    case "cumulative-count":
      if (!Number.isSafeInteger(query.value)) throw new RangeError("Invalid cumulative boundary");
      return { selectedRows: rows.filter(row => row.value <= query.value), unit: "count" };
    case "frequency":
    case "relative-frequency":
    case "percentage":
    case "complement-percentage": {
      if (!categories.has(query.value)) throw new RangeError("Category is absent from the table");
      const complement = query.family === "complement-percentage";
      const unit = query.family === "frequency" ? "count" : query.family === "relative-frequency" ? "relative" : "percentage";
      return { selectedRows: rows.filter(row => complement ? row.value !== query.value : row.value === query.value), unit };
    }
    default:
      throw new RangeError("Unknown frequency question family");
  }
}

/** Recompute the answer using only the displayed table and the stated selection rule. */
export function summarizeFrequencyQuery(rows: readonly FrequencyRow[], query: FrequencyQuery): FrequencySummary {
  if (!Array.isArray(rows) || rows.length < 1) throw new RangeError("Frequency tables require at least one row");
  const categories = new Set<number>();
  let total = 0;
  for (const row of rows) {
    if (!row || !Number.isSafeInteger(row.value) || !Number.isSafeInteger(row.frequency) ||
      row.frequency < 0 || categories.has(row.value)) {
      throw new RangeError("Frequency rows require unique safe-integer categories and nonnegative safe-integer counts");
    }
    categories.add(row.value);
    total += row.frequency;
  }
  if (!Number.isSafeInteger(total) || total <= 0) throw new RangeError("The frequency total must be a positive safe integer");
  const { selectedRows, unit } = selectRows(rows, query, categories);
  const selected = selectedRows.reduce((sum, row) => sum + row.frequency, 0);
  return { total, selected, selectedRows, unit, answer: answerFor(selected, total, unit) };
}

function choiceId(id: string, unit: FrequencyUnit, value: Rational): string {
  return `${id}:${unit}:${value.numerator}/${value.denominator}`;
}

function makeChoices(id: string, { answer, selected, selectedRows, total, unit }: FrequencySummary): readonly FrequencyChoice[] {
  const counts = [total - selected, total, selectedRows[0]?.frequency ?? 0, selected > 0 ? selected - 1 : selected + 1, 0];
  // A one-observation table has only two possible counts and shares.
  const fallback = unit === "count" ? rational(BigInt(total) + 1n) : rational(unit === "percentage" ? 50 : 1, unit === "percentage" ? 1 : 2);
  const candidates = [answer, ...counts.map(count => answerFor(count, total, unit)), fallback];
  const values: Rational[] = [];
  for (const value of candidates) {
    if (!values.some(existing => equalRational(existing, value))) values.push(value);
    if (values.length === 3) break;
  }
  return Object.freeze(values.map(value => Object.freeze({ id: choiceId(id, unit, value), unit, value: Object.freeze(value) })));
}

function makeQuestion(rows: readonly FrequencyRow[], query: FrequencyQuery, id?: string): FrequencyQuestion {
  const summary = summarizeFrequencyQuery(rows, query);
  const table = Object.freeze(rows.map(({ value, frequency }) => Object.freeze({ value, frequency })));
  const selection = query.family === "subset-relative"
    ? Object.freeze({ family: query.family, values: Object.freeze([...query.values] as const) })
    : Object.freeze({ ...query });
  const operand = selection.family === "subset-relative" ? selection.values : "value" in selection ? selection.value : null;
  const questionId = id ?? `st106-table-${JSON.stringify([table, selection.family, operand])}`;
  return Object.freeze({ id: questionId, rows: table, query: selection, options: makeChoices(questionId, summary) });
}

export function createFrequencyQuestion(rows: readonly FrequencyRow[], query: FrequencyQuery): FrequencyQuestion {
  return makeQuestion(rows, query);
}

/** Uint32 seeds select both hand-checkable data and a stable option permutation. */
export function generateFrequencyTask(difficulty: DatasetDifficulty, seed: number): FrequencyTask {
  if (difficulty !== "easy" && difficulty !== "medium" && difficulty !== "hard") {
    throw new RangeError("Unknown frequency table difficulty");
  }
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new RangeError("Seed must be an integer between 0 and 4294967295");
  }

  let state = (seed ^ (difficulty === "easy" ? 0x1061 : difficulty === "medium" ? 0x1062 : 0x1063)) >>> 0;
  function pick(bound: number): number {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state >>> 8) % bound;
  }

  const negative = -2 - pick(4);
  const positive = 1 + pick(4);
  const values = difficulty === "hard" ? [negative, -1, 0, positive, positive + 1 + pick(3)] : [negative, 0, positive];
  const frequencies = values.map((_, index) => (index === 1 ? 2 : 0) + pick(5));
  const target = seed < 5 ? values[0] : values[pick(values.length)];
  let query: FrequencyQuery;
  if (difficulty === "easy") {
    if (seed === 0) frequencies[0] = 0;
    query = seed % 2 === 0 ? { family: "frequency", value: target } : { family: "total-count" };
  } else if (difficulty === "medium") {
    // The first variants expose thirds, reduction, zero and an all-selected table.
    const introductoryCounts = [[1, 2, 0], [2, 1, 1], [0, 1, 3], null, [3, 0, 0]][seed];
    if (introductoryCounts) frequencies.splice(0, frequencies.length, ...introductoryCounts);
    query = { family: seed % 2 === 0 ? "percentage" : "relative-frequency", value: target };
  } else {
    switch (seed % 3) {
      case 0: query = { family: "subset-relative", values: [values[0], values[3]] }; break;
      case 1: query = { family: "cumulative-count", value: values[2 + pick(2)] }; break;
      default: query = { family: "complement-percentage", value: target }; break;
    }
  }
  const rows = values.map((value, index) => ({ value, frequency: frequencies[index] }));
  const question = makeQuestion(rows, query, `st106-${difficulty}-${seed}`);
  const options = [...question.options];
  for (let index = options.length - 1; index > 0; index--) {
    const other = pick(index + 1);
    [options[index], options[other]] = [options[other], options[index]];
  }
  return Object.freeze({ ...question, options: Object.freeze(options), difficulty, seed });
}

function matchesChoice(actual: FrequencyChoice, expected: FrequencyChoice): boolean {
  return actual?.id === expected.id && actual.unit === expected.unit &&
    typeof actual.value?.numerator === "bigint" && typeof actual.value.denominator === "bigint" &&
    actual.value.denominator !== 0n && equalRational(rational(actual.value.numerator, actual.value.denominator), expected.value);
}

export function assessFrequencyAnswer(question: FrequencyQuestion, raw: unknown): FrequencyAssessment {
  if (typeof raw !== "string" || !question || typeof question.id !== "string" || !question.id ||
    !Array.isArray(question.options) || question.options.length !== 3) return "invalid";
  let summary: FrequencySummary;
  try {
    summary = summarizeFrequencyQuery(question.rows, question.query);
  } catch (error) {
    if (error instanceof RangeError) return "invalid";
    throw error;
  }
  const expected = makeChoices(question.id, summary);
  if (!expected.every(choice => question.options.some(option => matchesChoice(option, choice)))) return "invalid";
  if (!raw.trim()) return "empty";
  if (!expected.some(choice => choice.id === raw)) return "invalid";
  return raw === choiceId(question.id, summary.unit, summary.answer) ? "correct" : "incorrect";
}
