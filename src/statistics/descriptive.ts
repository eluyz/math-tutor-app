/**
 * Statistics S1 foundation: exact descriptive statistics for small integer datasets.
 *
 * This pure module is NOT connected to the public exercise catalog yet.
 * "Population variance" deliberately divides by n, not n - 1.
 */
import { rational, type Rational } from "../rational";

export type DescriptiveSummary = Readonly<{
  count: number;
  mean: Rational;
  median: Rational;
  populationVariance: Rational;
}>;

export function summarizeIntegerDataset(values: readonly number[]): DescriptiveSummary {
  if (values.length < 1 || values.length > 100) {
    throw new RangeError("Dataset length must be between 1 and 100");
  }
  if (!values.every((value) => Number.isSafeInteger(value))) {
    throw new TypeError("All dataset values must be safe integers");
  }

  // BigInt prevents overflow when summing otherwise safe integer observations.
  const observations = values.map((value) => BigInt(value));
  const count = BigInt(observations.length);
  const sum = observations.reduce((total, value) => total + value, 0n);
  const ordered = [...observations].sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
  const middle = Math.floor(values.length / 2);
  const median = values.length % 2 === 1
    ? rational(ordered[middle])
    : rational(ordered[middle - 1] + ordered[middle], 2n);

  // Exact identity: (1/n) Σ(x_i - mean)^2 = Σ(n*x_i - sum)^2 / n^3.
  const scaledSquaredDeviations = observations.reduce((total, value) => {
    const difference = count * value - sum;
    return total + difference * difference;
  }, 0n);

  return {
    count: values.length,
    mean: rational(sum, count),
    median,
    populationVariance: rational(scaledSquaredDeviations, count * count * count),
  };
}
