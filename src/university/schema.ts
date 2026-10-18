import type { Matrix } from "../matrices";
import type { Rational } from "../rational";
import type { Difficulty } from "../difficulty";
import type { CategoryId } from "../exercises";
import type { Locale } from "../locales/types";

export type SystemProblem = Readonly<{
  kind: "system";
  coefficients: Matrix;
  rhs: readonly Rational[];
  method: "substitution" | "elimination" | "classification" | "cramer";
  coordinates?: "sum-difference" | "triangular";
  shifts?: readonly Rational[];
}>;
export type UniversityProblem = SystemProblem;
export type UniversityFamily = Readonly<{
  id: string;
  category: CategoryId;
  titles: Record<Locale, string>;
  supportedDifficulties: readonly Difficulty[];
  create: (variant: number, difficulty: Difficulty) => UniversityProblem;
}>;
