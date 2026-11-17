/** Unintegrated ST-101 synthetic teaching data; Statistics remains work in progress. */
import { type Rational } from "../rational";
import { summarizeIntegerDataset } from "./descriptive";

export type DatasetDifficulty = "easy" | "medium" | "hard";

export type MeanDataset = Readonly<{
  difficulty: DatasetDifficulty;
  seed: number;
  values: readonly number[];
  mean: Rational;
}>;

/**
 * Stateless across calls. Seeds are unsigned 32-bit integers, including zero.
 * See ST101_DATASET_NOTES.md for bounds, the stable stream policy and its limits.
 * The stream is for reproducible exercises, not statistical/cryptographic sampling.
 */
export function generateMeanDataset(difficulty: DatasetDifficulty, seed: number): MeanDataset {
  if (difficulty !== "easy" && difficulty !== "medium" && difficulty !== "hard") {
    throw new RangeError("Unknown dataset difficulty");
  }
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new RangeError("Seed must be an integer between 0 and 4294967295");
  }

  const salt = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
  let state = ((seed ^ salt) >>> 0) || 0x6d2b79f5;
  const pick = (bound: number): number => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state % bound;
  };

  let values: number[];
  if (difficulty === "easy") {
    // Two balanced pairs and a centre ensure an integral, small mean.
    const centre = 2 + pick(9);
    const radius = Math.min(centre, 12 - centre);
    const left = pick(radius + 1);
    const right = pick(radius + 1);
    values = [centre + left, centre - right, centre, centre - left, centre + right];
  } else {
    const count = (difficulty === "medium" ? 6 : 7) + pick(3);
    values = Array.from({ length: count }, () => (
      difficulty === "medium" ? pick(21) : pick(41) - 20
    ));
    if (difficulty === "medium") values[1] = values[0];
    else values[0] = -1 - pick(20);
  }

  const mean = summarizeIntegerDataset(values).mean;
  return Object.freeze({ difficulty, seed, values: Object.freeze(values), mean: Object.freeze(mean) });
}
