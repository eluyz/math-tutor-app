import type { DatasetDifficulty } from "./datasets";

export type FrequencyRow = Readonly<{ value: number; frequency: number }>;
export type ModeSummary = Readonly<{
  rows: readonly FrequencyRow[];
  maximum: number;
  modes: readonly number[];
}>;
export type ModeChoice = Readonly<{ id: string; values: readonly number[] }>;
export type ModeQuestion = Readonly<{ values: readonly number[]; options: readonly ModeChoice[] }>;
export type ModeTask = ModeQuestion & Readonly<{ id: string; difficulty: DatasetDifficulty; seed: number }>;
export type ModeAssessment = "correct" | "incorrect" | "empty" | "invalid";

function isModeDataset(values: unknown): values is readonly number[] {
  return Array.isArray(values) && values.length >= 1 && values.length <= 100 &&
    Array.from(values).every(Number.isSafeInteger);
}

function compareValues(left: number, right: number): number {
  return left === right ? 0 : left < right ? -1 : 1;
}

/** A value is a mode only when it occurs at the highest frequency and that frequency is at least two. */
export function summarizeMode(values: readonly number[]): ModeSummary {
  if (!isModeDataset(values)) throw new RangeError("Mode requires 1–100 safe-integer observations");
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const rows = [...counts].sort(([left], [right]) => compareValues(left, right))
    .map(([value, frequency]) => Object.freeze({ value, frequency }));
  const maximum = Math.max(...counts.values());
  const modes = maximum === 1 ? [] : rows.filter(row => row.frequency === maximum).map(row => row.value);
  return Object.freeze({ rows: Object.freeze(rows), maximum, modes: Object.freeze(modes) });
}

function choiceId(values: readonly number[]): string {
  return values.length === 0 ? "no-mode" : `mode:${values.join(",")}`;
}

function makeChoices(summary: ModeSummary): readonly ModeChoice[] {
  const first = summary.modes[0] ?? summary.rows[0].value;
  const second = summary.rows.find(row => row.value !== first)?.value ??
    (first === Number.MAX_SAFE_INTEGER ? first - 1 : first + 1);
  const multiple = summary.modes.length > 1 ? summary.modes : [first, second].sort(compareValues);
  return Object.freeze([[], [first], multiple].map(values =>
    Object.freeze({ id: choiceId(values), values: Object.freeze(values) })));
}

export function createModeQuestion(values: readonly number[]): ModeQuestion {
  return Object.freeze({ values: Object.freeze([...values]), options: makeChoices(summarizeMode(values)) });
}

const frequencyPatterns = {
  easy: [[3, 1, 1], [2, 2, 1], [1, 1, 1, 1, 1]],
  medium: [[3, 2, 1, 1], [2, 2, 2, 1], [1, 1, 1, 1, 1, 1, 1]],
  hard: [[3, 2, 2, 1, 1], [3, 3, 2, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1]],
} as const;

/** Synthetic data and option ordering are reproducible from the difficulty and uint32 seed. */
export function generateModeTask(difficulty: DatasetDifficulty, seed: number): ModeTask {
  if (difficulty !== "easy" && difficulty !== "medium" && difficulty !== "hard") {
    throw new RangeError("Unknown Mode difficulty");
  }
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new RangeError("Seed must be an integer between 0 and 4294967295");
  }

  let state = (seed ^ (difficulty === "easy" ? 0x1051 : difficulty === "medium" ? 0x1052 : 0x1053)) >>> 0;
  function pick(bound: number): number {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state >>> 8) % bound;
  }
  function shuffle<T>(items: readonly T[]): T[] {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
      const other = pick(index + 1);
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  const family = seed % 3;
  const frequencies = family === 0 && seed % 18 === 9
    ? [difficulty === "easy" ? 5 : difficulty === "medium" ? 7 : 9]
    : frequencyPatterns[difficulty][family];
  const start = difficulty === "easy" ? pick(7) : -12 + pick(11);
  const gap = difficulty === "easy" ? 1 + pick(2) : 2 + pick(5);
  const distinct = frequencies.map((_, index) => start + gap * index);
  // Include exact endpoints in occasional Hard exercises without doing arithmetic on them.
  const pool = difficulty === "hard" && seed % 16 === 0
    ? [Number.MIN_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER, ...distinct.filter(value => value !== 0)].slice(0, distinct.length)
    : distinct;
  const candidates = shuffle(pool);
  const values = shuffle(frequencies.flatMap((frequency, index) => Array<number>(frequency).fill(candidates[index])));
  const question = createModeQuestion(values);
  return Object.freeze({ ...question, options: Object.freeze(shuffle(question.options)), id: `st105-${difficulty}-${seed}`, difficulty, seed });
}

/** Validate the offered choices and derive the exact answer from the displayed observations. */
export function assessModeAnswer(question: ModeQuestion, raw: unknown): ModeAssessment {
  if (typeof raw !== "string" || !isModeDataset(question.values) || !Array.isArray(question.options)) return "invalid";
  const summary = summarizeMode(question.values);
  const expected = makeChoices(summary);
  const options: readonly ModeChoice[] = question.options;
  if (options.length !== expected.length || !expected.every(choice => options.some(option =>
    option?.id === choice.id && Array.isArray(option.values) && option.values.length === choice.values.length &&
    choice.values.every((value, index) => option.values[index] === value)
  ))) return "invalid";
  if (!raw.trim()) return "empty";
  if (!expected.some(option => option.id === raw)) return "invalid";
  return raw === choiceId(summary.modes) ? "correct" : "incorrect";
}
