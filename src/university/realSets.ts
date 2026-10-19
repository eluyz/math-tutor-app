import { formatRational as f, type AnswerSpec } from "../answers";
import type { Rational } from "../rational";
export type Interval = Readonly<{
  lower: Rational | null;
  upper: Rational | null;
  lowerClosed: boolean;
  upperClosed: boolean;
}>;
export type RealSet = readonly Interval[];
export const compare = (a: Rational, b: Rational) => {
  const n = a.numerator * b.denominator - b.numerator * a.denominator;
  return n < 0n ? -1 : n > 0n ? 1 : 0;
};
export const allReals: RealSet = [
  { lower: null, upper: null, lowerClosed: false, upperClosed: false },
];
export const rightRay = (at: Rational, closed: boolean): RealSet => [
  { lower: at, upper: null, lowerClosed: closed, upperClosed: false },
];
export const leftRay = (at: Rational, closed: boolean): RealSet => [
  { lower: null, upper: at, lowerClosed: false, upperClosed: closed },
];
export function normalize(input: RealSet): RealSet {
  const intervals = input
    .filter(
      (i) =>
        !i.lower ||
        !i.upper ||
        compare(i.lower, i.upper) < 0 ||
        (compare(i.lower, i.upper) === 0 && i.lowerClosed && i.upperClosed),
    )
    .map((i) => ({
      ...i,
      lowerClosed: i.lower !== null && i.lowerClosed,
      upperClosed: i.upper !== null && i.upperClosed,
    }))
    .sort((a, b) =>
      a.lower === null
        ? b.lower === null
          ? 0
          : -1
        : b.lower === null
          ? 1
          : compare(a.lower, b.lower) ||
            Number(b.lowerClosed) - Number(a.lowerClosed),
    );
  const result: Interval[] = [];
  for (const interval of intervals) {
    const previous = result.at(-1);
    if (!previous) {
      result.push(interval);
      continue;
    }
    const relation =
      previous.upper === null || interval.lower === null
        ? 1
        : compare(previous.upper, interval.lower);
    if (
      relation > 0 ||
      (relation === 0 && (previous.upperClosed || interval.lowerClosed))
    ) {
      const upperComparison =
        previous.upper === null
          ? 1
          : interval.upper === null
            ? -1
            : compare(previous.upper, interval.upper);
      result[result.length - 1] = {
        ...previous,
        upper: upperComparison < 0 ? interval.upper : previous.upper,
        upperClosed:
          upperComparison < 0
            ? interval.upperClosed
            : upperComparison === 0
              ? previous.upperClosed || interval.upperClosed
              : previous.upperClosed,
      };
    } else result.push(interval);
  }
  return result;
}
export function intersection(a: RealSet, b: RealSet): RealSet {
  const result: Interval[] = [];
  for (const left of a)
    for (const right of b) {
      const lo =
        left.lower === null
          ? 1
          : right.lower === null
            ? -1
            : compare(right.lower, left.lower);
      const hi =
        left.upper === null
          ? 1
          : right.upper === null
            ? -1
            : compare(left.upper, right.upper);
      result.push({
        lower: lo > 0 ? right.lower : left.lower,
        lowerClosed:
          lo > 0
            ? right.lowerClosed
            : lo < 0
              ? left.lowerClosed
              : left.lowerClosed && right.lowerClosed,
        upper: hi > 0 ? right.upper : left.upper,
        upperClosed:
          hi > 0
            ? right.upperClosed
            : hi < 0
              ? left.upperClosed
              : left.upperClosed && right.upperClosed,
      });
    }
  return normalize(result);
}
export function excludePoints(
  set: RealSet,
  points: readonly Rational[],
): RealSet {
  let result = set;
  for (const point of points)
    result = intersection(result, [
      ...leftRay(point, false),
      ...rightRay(point, false),
    ]);
  return normalize(result);
}
export const outside = (a: Rational, b: Rational, closed: boolean): RealSet => [
  ...leftRay(a, closed),
  ...rightRay(b, closed),
];
export function setKey(set: RealSet): string {
  return `set:${JSON.stringify(normalize(set).map((i) => [i.lower ? `${i.lower.numerator}/${i.lower.denominator}` : null, i.upper ? `${i.upper.numerator}/${i.upper.denominator}` : null, i.lowerClosed, i.upperClosed]))}`;
}
export function setText(set: RealSet): string {
  const intervals = normalize(set);
  if (!intervals.length) return "∅";
  if (
    intervals.length === 1 &&
    intervals[0].lower === null &&
    intervals[0].upper === null
  )
    return "ℝ";
  return intervals
    .map((i) =>
      i.lower && i.upper && compare(i.lower, i.upper) === 0
        ? `{${f(i.lower)}}`
        : `${i.lowerClosed ? "[" : "("}${i.lower ? f(i.lower) : "−∞"}; ${i.upper ? f(i.upper) : "+∞"}${i.upperClosed ? "]" : ")"}`,
    )
    .join(" ∪ ");
}
export function setAnswer(actual: RealSet, pivot: Rational): AnswerSpec {
  const candidates = [
    actual,
    allReals,
    [],
    leftRay(pivot, true),
    rightRay(pivot, false),
    leftRay(pivot, false),
    rightRay(pivot, true),
    excludePoints(allReals, [pivot]),
  ];
  const options = [
    ...new Map(
      candidates.map((set) => [
        setKey(set),
        { value: setKey(set), label: setText(set) },
      ]),
    ).values(),
  ].slice(0, 4);
  const shift = Number(
    (pivot.numerator < 0n ? -pivot.numerator : pivot.numerator) % 4n,
  );
  return {
    kind: "choice",
    value: setKey(actual),
    options: [...options.slice(shift), ...options.slice(0, shift)],
  };
}
