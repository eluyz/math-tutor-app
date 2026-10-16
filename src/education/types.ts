import type { CategoryId, TypedExercise } from "../exercises";
import { isLegacyDifficulty, type Difficulty, type LegacyDifficulty } from "../difficulty";
import type { AnswerSpec } from "../answers";

export const VARIANTS_PER_LEVEL = 24;
export type EducationDetails = Omit<TypedExercise, "id" | "category" | "title"> & { parameters: Readonly<Record<string, number>> };
export type EducationTemplate = {
  id: string; category: CategoryId; title: string;
  create: (variant: number, difficulty: LegacyDifficulty) => EducationDetails;
};
export type EducationInstance = TypedExercise & {
  templateId: string; difficulty: Difficulty; parameters: Readonly<Record<string, number>>; contentKey: string;
};
export const levelIndex = (level: LegacyDifficulty) => ({ easy: 0, medium: 1, hard: 2 })[level];
export const number = (value: number) => String(value).replace(/-/g, "−");
export const signed = (value: number) => `${value < 0 ? "−" : "+"} ${Math.abs(value)}`;
export const polynomial = (a: number, b: number, c: number) => `${number(a)}x² ${signed(b)}x ${signed(c)}`;
export function lesson(parameters: Readonly<Record<string, number>>, question: string, answer: AnswerSpec,
  explanation: string, startingHint: string, nextHint: string): EducationDetails {
  return { parameters, question, answer, explanation, startingHint, hint: startingHint, nextHint, errorRules: [] };
}
export function makeEducationInstance(template: EducationTemplate, variant: number, difficulty: Difficulty): EducationInstance {
  if (!Number.isInteger(variant) || variant < 0 || variant >= VARIANTS_PER_LEVEL || !isLegacyDifficulty(difficulty))
    throw new Error("Invalid education variant");
  const details = template.create(variant, difficulty);
  const contentKey = `${details.question} ${details.matrices?.map((m) => `${m.label}:${m.values.map((row) => row.map((v) => `${v.numerator}/${v.denominator}`).join(",")).join(";")}`).join(" ") ?? ""}`.trim();
  return { ...details, parameters: { variant, ...details.parameters }, id: `${template.id}:${difficulty}:${variant}`,
    category: template.category, title: template.title, templateId: template.id, difficulty, contentKey };
}
