import { assessAnswer, emptyAnswer, type AnswerInput } from "../answers";
import { getAnswerSpec, type CategoryId } from "../exercises";
import { allTemplates, seededRandom, taskPool, type Difficulty, type GeneratedTask } from "../generators";

export type ExamCount = 5 | 10 | 20;
export type ExamMinutes = 0 | 15 | 30;
export type ExamConfig = Readonly<{
  categories: readonly CategoryId[];
  difficulty: Difficulty;
  /** Optional multi-level selection. Omitted means the legacy single difficulty. */
  difficulties?: readonly Difficulty[];
  /** Optional exact family whitelist. Omitted/empty means all families in the categories. */
  families?: readonly string[];
  count: ExamCount;
  minutes: ExamMinutes;
}>;
export type ExamOutcome = "correct" | "incorrect" | "invalid" | "skipped";
export type ExamEntry = Readonly<{ task: GeneratedTask; answer: AnswerInput; outcome: ExamOutcome }>;
export type ExamState = Readonly<{
  id: string;
  config: ExamConfig;
  tasks: readonly GeneratedTask[];
  answers: readonly AnswerInput[];
  index: number;
  startedAt: number;
  deadline: number | null;
  submittedAt: number | null;
  timedOut: boolean;
  entries: readonly ExamEntry[] | null;
}>;

export const examLevels = (config: ExamConfig): readonly Difficulty[] =>
  config.difficulties === undefined ? [config.difficulty] : config.difficulties;

export function examCandidates(config: ExamConfig, category: CategoryId): GeneratedTask[] {
  const chosen = new Set(config.families ?? []);
  return examLevels(config).flatMap((level) => taskPool(category, level))
    .filter((task) => !chosen.size || chosen.has(task.templateId));
}

export function examCapacity(config: ExamConfig): number {
  return new Set(config.categories.flatMap((category) =>
    examCandidates(config, category).map((task) => task.contentKey))).size;
}

export function examConfigError(config: ExamConfig): "categories" | "unavailable" | "capacity" | null {
  if (!config.categories.length || new Set(config.categories).size !== config.categories.length ||
      config.categories.some((category) => !allTemplates.some((family) => family.category === category))) return "categories";
  const levels = examLevels(config);
  if (!levels.length || new Set(levels).size !== levels.length ||
      levels.some((level) => !["easy", "medium", "hard", "advanced", "expert"].includes(level))) return "unavailable";
  if (config.families?.length && (new Set(config.families).size !== config.families.length ||
      config.families.some((id) => !allTemplates.some((family) =>
        family.id === id && config.categories.includes(family.category) &&
        levels.some((level) => family.supportedDifficulties.includes(level)))))) return "unavailable";
  if (![5, 10, 20].includes(config.count) || ![0, 15, 30].includes(config.minutes)) return "capacity";
  if (config.categories.some((category) => !examCandidates(config, category).length)) return "unavailable";
  return examCapacity(config) < config.count ? "capacity" : null;
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Round robin categories, then the least-used family within each category. */
export function selectExamTasks(config: ExamConfig, seed: number): GeneratedTask[] {
  if (examConfigError(config)) throw new Error("Invalid exam configuration");
  const random = seededRandom(seed);
  const categories = shuffle(config.categories, random);
  const pools = new Map(categories.map((category) => {
    const families = new Map<string, { tasks: GeneratedTask[]; used: number }>();
    for (const task of shuffle(examCandidates(config, category), random)) {
      // Rotate both families and levels, rather than concentrating one level first.
      const key = `${task.templateId}:${task.difficulty}`;
      const bucket = families.get(key) ?? { tasks: [], used: 0 };
      bucket.tasks.push(task);
      families.set(key, bucket);
    }
    return [category, families] as const;
  }));
  const selected: GeneratedTask[] = [], seen = new Set<string>();
  while (selected.length < config.count) {
    let progressed = false;
    for (const category of categories) {
      if (selected.length === config.count) break;
      const families = pools.get(category)!;
      const available = shuffle([...families.values()].filter((bucket) =>
        bucket.tasks.some((task) => !seen.has(task.contentKey))), random)
        .sort((a, b) => a.used - b.used);
      if (!available.length) continue;
      const bucket = available[0];
      let task = bucket.tasks.pop();
      while (task && seen.has(task.contentKey)) task = bucket.tasks.pop();
      if (!task) continue;
      bucket.used++;
      seen.add(task.contentKey);
      selected.push(task);
      progressed = true;
    }
    if (!progressed) throw new Error("Exam pool exhausted unexpectedly");
  }
  return selected;
}

export function startExam(config: ExamConfig, seed: number, now: number, id: string): ExamState {
  const tasks = selectExamTasks(config, seed);
  return { id, config, tasks, answers: tasks.map((task) => emptyAnswer(getAnswerSpec(task))),
    index: 0, startedAt: now, deadline: config.minutes ? now + config.minutes * 60_000 : null,
    submittedAt: null, timedOut: false, entries: null };
}

export function isBlankAnswer(input: AnswerInput): boolean {
  if (typeof input === "string") return !input.trim();
  switch (input.kind) {
    case "primitive": return !input.hasConstant && input.coefficients.every((value) => !value.trim());
    case "system": return !input.classification && input.values.every((value) => !value.trim());
    case "limit": return !input.classification && !input.value.trim();
    case "roots": return !input.classification && input.values.every((value) => !value.trim());
    case "choice": return !input.value;
    case "list": return input.values.every((value) => !value.trim());
    case "matrix": return input.values.every((row) => row.every((value) => !value.trim()));
  }
}

export function scoreExam(state: ExamState): readonly ExamEntry[] {
  return state.tasks.map((task, index) => {
    const answer = state.answers[index];
    const outcome = isBlankAnswer(answer) ? "skipped" : assessAnswer(getAnswerSpec(task), answer).kind;
    return { task, answer, outcome };
  });
}

export function examTotals(entries: readonly ExamEntry[]) {
  const count = (outcome: ExamOutcome) => entries.filter((entry) => entry.outcome === outcome).length;
  const correct = count("correct"), incorrect = count("incorrect"), invalid = count("invalid"), skipped = count("skipped");
  return { correct, incorrect, invalid, skipped, total: entries.length,
    percent: entries.length ? Math.round(100 * correct / entries.length) : 0 };
}

export function submitExam(state: ExamState, now: number): ExamState {
  if (state.submittedAt !== null) return state;
  return { ...state, submittedAt: now, timedOut: state.deadline !== null && now >= state.deadline,
    entries: scoreExam(state) };
}

export function editExamAnswer(state: ExamState, answer: AnswerInput, now: number): ExamState {
  if (state.submittedAt !== null || (state.deadline !== null && now >= state.deadline)) return submitExam(state, now);
  const answers = [...state.answers];
  answers[state.index] = answer;
  return { ...state, answers };
}

export function moveExam(state: ExamState, index: number, now: number): ExamState {
  if (state.submittedAt !== null || (state.deadline !== null && now >= state.deadline)) return submitExam(state, now);
  return { ...state, index: Math.max(0, Math.min(state.tasks.length - 1, index)) };
}
