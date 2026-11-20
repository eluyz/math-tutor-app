/** ST-104: isolated, unreleased interpretation engine. No catalog/UI registration. */
import { rational, subtractRational, type Rational } from "../rational";
import type { DatasetDifficulty } from "./datasets";
import { summarizeIntegerDataset } from "./descriptive";

export type CentreAnswer = "mean-below-median" | "mean-equals-median" | "mean-above-median";
export type ChangeAnswer = "mean-changes-less" | "median-changes-less" | "equal-change";
export type InterpretationAnswer = CentreAnswer | ChangeAnswer;
export type InterpretationDataset = Readonly<{
  values: readonly number[];
  mean: Rational;
  median: Rational;
}>;
export type CentreComparison = Readonly<{
  kind: "compare-centres";
  original: InterpretationDataset;
  options: readonly CentreAnswer[];
  answer: CentreAnswer;
}>;
export type ReplacementComparison = Readonly<{
  kind: "compare-changes";
  original: InterpretationDataset;
  modified: InterpretationDataset;
  replacement: Readonly<{ index: number; from: number; to: number }>;
  absoluteChange: Readonly<{ mean: Rational; median: Rational }>;
  options: readonly ChangeAnswer[];
  answer: ChangeAnswer;
}>;
export type InterpretationTask = Readonly<{ id: string; difficulty: DatasetDifficulty; seed: number }>
  & (CentreComparison | ReplacementComparison);
export type InterpretationAssessment = "correct" | "incorrect" | "empty" | "invalid";

const centreOptions = Object.freeze<CentreAnswer[]>(["mean-below-median", "mean-equals-median", "mean-above-median"]);
const changeOptions = Object.freeze<ChangeAnswer[]>(["mean-changes-less", "median-changes-less", "equal-change"]);

function dataset(values: readonly number[]): InterpretationDataset {
  const copy = Array.from(values);
  if (copy.length < 1 || copy.length > 100) throw new RangeError("Dataset length must be between 1 and 100");
  if (!copy.every(Number.isSafeInteger)) throw new TypeError("Observations must be safe integers");
  const summary = summarizeIntegerDataset(copy);
  return Object.freeze({ values: Object.freeze(copy), mean: Object.freeze(summary.mean), median: Object.freeze(summary.median) });
}

function compare(left: Rational, right: Rational): -1 | 0 | 1 {
  const difference = left.numerator * right.denominator - right.numerator * left.denominator;
  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
}

function absoluteDifference(left: Rational, right: Rational): Rational {
  const difference = subtractRational(left, right);
  return Object.freeze(rational(difference.numerator < 0n ? -difference.numerator : difference.numerator, difference.denominator));
}

/** Pure builders also support independent 1–100-observation edge-case witnesses. */
export function compareCentres(values: readonly number[]): CentreComparison {
  const original = dataset(values);
  const order = compare(original.mean, original.median);
  return Object.freeze({ kind: "compare-centres", original, options: centreOptions,
    answer: order < 0 ? "mean-below-median" : order > 0 ? "mean-above-median" : "mean-equals-median" });
}

export function compareReplacement(values: readonly number[], index: number, to: number): ReplacementComparison {
  const original = dataset(values);
  if (!Number.isInteger(index) || index < 0 || index >= original.values.length) throw new RangeError("Replacement index must identify an observation");
  if (!Number.isSafeInteger(to)) throw new TypeError("Replacement must be a safe integer");
  const modified = dataset(original.values.map((value, position) => position === index ? to : value));
  const absoluteChange = Object.freeze({ mean: absoluteDifference(modified.mean, original.mean), median: absoluteDifference(modified.median, original.median) });
  const order = compare(absoluteChange.mean, absoluteChange.median);
  return Object.freeze({ kind: "compare-changes", original, modified,
    replacement: Object.freeze({ index, from: original.values[index], to }), absoluteChange, options: changeOptions,
    answer: order < 0 ? "mean-changes-less" : order > 0 ? "median-changes-less" : "equal-change" });
}

/** Stateless uint32 replay, including seed zero. Synthetic exercises, not sampling. */
export function generateInterpretationTask(difficulty: DatasetDifficulty, seed: number): InterpretationTask {
  if (difficulty !== "easy" && difficulty !== "medium" && difficulty !== "hard") throw new RangeError("Unknown interpretation difficulty");
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError("Seed must be an integer between 0 and 4294967295");
  let state = ((seed ^ (difficulty === "easy" ? 0x1041 : difficulty === "medium" ? 0x1042 : 0x1043)) >>> 0) || 0x6d2b79f5;
  const pick = (bound: number) => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5; state >>>= 0;
    return state % bound;
  };
  const shuffle = <T,>(items: readonly T[]): T[] => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = pick(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const family = seed % 6;
  let count = difficulty === "easy" ? 5 : (difficulty === "medium" ? 6 : 7) + pick(3);
  // An odd-count rank threshold supplies an explicit counterexample to the
  // false rule "the median always changes less in every finite replacement".
  if (family === 4 && count % 2 === 0) count = 7;
  let centre = difficulty === "hard" ? -6 - pick(7) : difficulty === "easy" ? 2 + pick(7) : 8 + pick(9);
  const sign = difficulty === "hard" && pick(2) === 0 ? -1 : 1;
  let values: number[];
  let replacedIndex = 0;
  let to = 0;

  if (family === 0 || family === 3) {
    const constant = family === 0 && seed % 18 === 0;
    if (constant && difficulty === "easy") centre = 0;
    values = Array.from({ length: count }, () => centre);
    for (let i = 0; i < Math.floor(count / 2); i++) {
      const radius = constant || i === 0 ? 0 : pick(3);
      values[i] = centre - radius;
      values[count - i - 1] = centre + radius;
    }
    const extreme = sign === 1 ? Math.max(...values) : Math.min(...values);
    replacedIndex = values.indexOf(extreme);
    to = extreme + sign * count * (3 + pick(4));
  } else if (family === 1 || family === 2) {
    // Easy centres remain integral; later levels deliberately include fractions.
    const offset = count * (1 + pick(3)) + (difficulty === "easy" ? 0 : 1);
    if (family === 2 && difficulty !== "hard") centre = 24 + pick(9);
    values = Array.from({ length: count }, () => centre);
    values[0] = centre + (family === 1 ? offset : -offset);
  } else {
    const gap = difficulty === "easy" ? 5 : 2 + pick(4);
    values = Array.from({ length: count }, (_, index) => index < Math.ceil(count / 2) ? centre : centre + sign * gap);
    // Replace exactly one repeated centre, retaining the observation count.
    const displacement = family === 4 ? 3 * gap : count * gap / (count % 2 === 0 ? 2 : 1);
    to = centre + sign * displacement;
  }

  const orderedEntries = shuffle(values.map((value, index) => ({ value, selected: index === replacedIndex })));
  values = orderedEntries.map(entry => entry.value);
  replacedIndex = orderedEntries.findIndex(entry => entry.selected);
  const metadata = { id: `st104-${difficulty}-${seed}`, difficulty, seed };
  // All three positions can contain the right answer; IDs never depend on PL/EN.
  if (family < 3) {
    const comparison = compareCentres(values);
    return Object.freeze({ ...comparison, options: Object.freeze(shuffle(comparison.options)), ...metadata });
  }
  const comparison = compareReplacement(values, replacedIndex, to);
  return Object.freeze({ ...comparison, options: Object.freeze(shuffle(comparison.options)), ...metadata });
}

/** Standalone token assessment only; no changes to shared application grading. */
export function assessInterpretationAnswer(task: InterpretationTask, raw: string): InterpretationAssessment {
  if (typeof raw !== "string") return "invalid";
  const token = raw.trim();
  if (!token) return "empty";
  // Derive truth from the question's data, not a cached answer/summary field.
  const comparison = task.kind === "compare-centres" ? compareCentres(task.original.values)
    : compareReplacement(task.original.values, task.replacement.index, task.replacement.to);
  if (!(comparison.options as readonly string[]).includes(token)) return "invalid";
  return token === comparison.answer ? "correct" : "incorrect";
}
