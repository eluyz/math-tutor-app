import type { DatasetDifficulty } from "./datasets";

const categories = ["A", "B", "C", "D", "E"] as const;
const maxValue = 100;
const relations = ["<", "=", ">"] as const;

export type ChartCategory = (typeof categories)[number];
type ChartRelation = (typeof relations)[number];
type EvidenceLimit = "cause" | "future" | "population";
type Evidence = "supported" | "contradicted" | "underdetermined";
type Pair = Readonly<{ left: ChartCategory; right: ChartCategory }>;
export type ChartRow = Readonly<{ category: ChartCategory; value: number }>;

export type ChartQuery =
  | Readonly<{ family: "read"; category: ChartCategory }>
  | Readonly<{ family: "largest" | "smallest" }>
  | (Pair & Readonly<{ family: "compare" | "difference" | "sum" }>)
  | (Pair & Readonly<{ family: "supported"; focus: "comparison" | "sum" | "difference" }>)
  | (Pair & Readonly<{ family: "unsupported"; limit: EvidenceLimit }>);

export type ChartClaim =
  | Readonly<{ kind: "read" | "future"; category: ChartCategory; value: number }>
  | (Pair & Readonly<{ kind: "sum" | "difference"; value: number }>)
  | (Pair & Readonly<{ kind: "comparison"; relation: ChartRelation }>)
  | Readonly<{ kind: "cause"; category: ChartCategory }>
  | Readonly<{ kind: "population" }>;

type ChartResult =
  | Readonly<{ kind: "count"; value: number }>
  | Readonly<{ kind: "extrema"; value: number; categories: readonly ChartCategory[] }>
  | Readonly<{ kind: "relation"; value: ChartRelation }>
  | Readonly<{ kind: "evidence"; value: Exclude<Evidence, "contradicted"> }>;

type ChartAnswer =
  | Extract<ChartResult, { kind: "count" | "relation" }>
  | Readonly<{ kind: "category"; category: ChartCategory }>
  | Readonly<{ kind: "claim"; claim: ChartClaim }>;

type ChartOption = Readonly<{ id: string; answer: ChartAnswer }>;
export type ChartTask = Readonly<{
  id: string;
  difficulty: DatasetDifficulty;
  seed: number;
  rows: readonly ChartRow[];
  query: ChartQuery;
  options: readonly ChartOption[];
}>;
export type ChartAssessment = "correct" | "incorrect" | "empty" | "invalid";

function isCount(value: number, limit: number): boolean {
  return Number.isSafeInteger(value) && value >= 0 && value <= limit;
}

function indexRows(rows: readonly ChartRow[]): ReadonlyMap<ChartCategory, number> {
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > categories.length) {
    throw new RangeError("A chart needs one to five rows");
  }
  const values = new Map<ChartCategory, number>();
  for (const row of rows) {
    if (!row || !categories.includes(row.category) || values.has(row.category) || !isCount(row.value, maxValue)) {
      throw new RangeError("Chart rows need unique categories A–E and integer counts from 0 through 100");
    }
    values.set(row.category, row.value);
  }
  return values;
}

function read(values: ReadonlyMap<ChartCategory, number>, category: ChartCategory): number {
  const value = values.get(category);
  if (value === undefined) throw new RangeError("Category is absent from the chart");
  return value;
}

function readPair(values: ReadonlyMap<ChartCategory, number>, { left, right }: Pair): readonly [number, number] {
  if (left === right) throw new RangeError("Choose two distinct categories");
  return [read(values, left), read(values, right)];
}

function compare(left: number, right: number): ChartRelation {
  if (left === right) return "=";
  return left < right ? "<" : ">";
}

export function evaluateChartQuery(rows: readonly ChartRow[], query: ChartQuery): ChartResult {
  const values = indexRows(rows);
  if (!query || typeof query !== "object") throw new RangeError("Invalid chart query");
  switch (query.family) {
    case "read":
      return { kind: "count", value: read(values, query.category) };
    case "largest":
    case "smallest": {
      const value = query.family === "largest" ? Math.max(...values.values()) : Math.min(...values.values());
      return { kind: "extrema", value, categories: rows.filter(row => row.value === value).map(row => row.category).sort() };
    }
    case "compare": {
      const [left, right] = readPair(values, query);
      return { kind: "relation", value: compare(left, right) };
    }
    case "difference":
    case "sum": {
      const [left, right] = readPair(values, query);
      return { kind: "count", value: query.family === "difference" ? Math.abs(left - right) : left + right };
    }
    case "supported":
      readPair(values, query);
      if (query.focus !== "comparison" && query.focus !== "sum" && query.focus !== "difference") {
        throw new RangeError("Invalid focus for a chart conclusion");
      }
      return { kind: "evidence", value: "supported" };
    case "unsupported":
      readPair(values, query);
      if (query.limit !== "cause" && query.limit !== "future" && query.limit !== "population") {
        throw new RangeError("Invalid limit for a chart conclusion");
      }
      return { kind: "evidence", value: "underdetermined" };
    default:
      throw new RangeError("Unknown chart question family");
  }
}

/** Chart data describe visits to the plotted rooms during one hour. */
export function evaluateChartClaim(rows: readonly ChartRow[], claim: ChartClaim): Evidence {
  const values = indexRows(rows);
  if (!claim || typeof claim !== "object") throw new RangeError("Invalid chart claim");
  switch (claim.kind) {
    case "read":
    case "future": {
      if (!isCount(claim.value, maxValue)) throw new RangeError("Invalid count in chart claim");
      const actual = read(values, claim.category);
      if (claim.kind === "future") return "underdetermined";
      return actual === claim.value ? "supported" : "contradicted";
    }
    case "sum":
    case "difference": {
      const [left, right] = readPair(values, claim);
      const actual = claim.kind === "sum" ? left + right : Math.abs(left - right);
      if (!isCount(claim.value, 2 * maxValue)) throw new RangeError("Invalid count in chart claim");
      return actual === claim.value ? "supported" : "contradicted";
    }
    case "comparison": {
      const [left, right] = readPair(values, claim);
      if (!relations.includes(claim.relation)) throw new RangeError("Invalid comparison in chart claim");
      return compare(left, right) === claim.relation ? "supported" : "contradicted";
    }
    case "cause":
      read(values, claim.category);
      return "underdetermined";
    case "population":
      return "underdetermined";
    default:
      throw new RangeError("Unknown chart claim");
  }
}

function evidenceAnswers(rows: readonly ChartRow[], query: Extract<ChartQuery, { family: "supported" | "unsupported" }>): ChartAnswer[] {
  const { left, right } = query;
  const [first, second] = readPair(indexRows(rows), query);
  const sum = first + second;
  let claims: ChartClaim[];
  if (query.family === "supported") {
    const relation = compare(first, second);
    claims = [
      { kind: "comparison", left, right, relation: query.focus === "comparison" ? relation : relation === "<" ? ">" : "<" },
      { kind: "sum", left, right, value: query.focus === "sum" ? sum : sum + 1 },
      { kind: "difference", left, right, value: Math.abs(first - second) + (query.focus === "difference" ? 0 : 1) },
    ];
  } else {
    const limit: ChartClaim = query.limit === "population" ? { kind: "population" }
      : query.limit === "cause" ? { kind: "cause", category: left } : { kind: "future", category: left, value: first };
    claims = [{ kind: "read", category: left, value: first }, { kind: "sum", left, right, value: sum }, limit];
  }
  return claims.map(claim => ({ kind: "claim", claim: Object.freeze(claim) }));
}

function buildAnswers(rows: readonly ChartRow[], query: ChartQuery): ChartAnswer[] {
  if (query.family === "supported" || query.family === "unsupported") return evidenceAnswers(rows, query);
  const result = evaluateChartQuery(rows, query);
  switch (result.kind) {
    case "relation":
      return relations.map(value => ({ kind: "relation", value }));
    case "extrema": {
      const ordered = [result.categories[0], ...rows.filter(row => row.category !== result.categories[0]).map(row => row.category)];
      return ordered.slice(0, 3).map(category => ({ kind: "category", category }));
    }
    case "count": {
      const nearby = "left" in query ? readPair(indexRows(rows), query) : rows.map(row => row.value);
      const values = new Set([result.value, ...nearby, result.value + 1, result.value + 2]);
      return [...values].slice(0, 3).map(value => ({ kind: "count", value }));
    }
    case "evidence":
      throw new RangeError("An evidence query needs claim options");
  }
}

export function generateChartTask(difficulty: DatasetDifficulty, seed: number): ChartTask {
  if (difficulty !== "easy" && difficulty !== "medium" && difficulty !== "hard") {
    throw new RangeError("Unknown chart difficulty");
  }
  if (!isCount(seed, 0xffffffff)) throw new RangeError("Seed must be an unsigned 32-bit integer");

  let state = (seed ^ (difficulty === "easy" ? 0x1071 : difficulty === "medium" ? 0x1072 : 0x1073)) >>> 0;
  function pick(bound: number): number {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state >>> 8) % bound;
  }
  const size = difficulty === "easy" && seed === 0 ? 3 : 3 + pick(3);
  const counts = Array.from({ length: size }, () => pick(20));
  const chosen = pick(size);
  const other = (chosen + 1 + pick(size - 1)) % size;
  const pair = { left: categories[chosen], right: categories[other] };
  let query: ChartQuery;
  if (difficulty === "easy") {
    switch (seed % 3) {
      case 0:
        if (seed === 0) counts.fill(0);
        query = { family: "read", category: categories[chosen] };
        break;
      case 1:
        counts[chosen] = seed === 1 ? 20 : 1 + Math.max(...counts.filter((_, index) => index !== chosen));
        query = { family: "largest" };
        break;
      default:
        // Start all other values above zero so a unique minimum is always available.
        counts.forEach((value, index) => { counts[index] = value + 1; });
        counts[chosen] = Math.min(...counts.filter((_, index) => index !== chosen)) - 1;
        query = { family: "smallest" };
    }
  } else if (difficulty === "medium") {
    if (seed === 0) counts[other] = counts[chosen];
    query = { ...pair, family: (["compare", "difference", "sum"] as const)[seed % 3] };
  } else {
    const variant = Math.floor(seed / 2) % 3;
    query = seed % 2 === 0
      ? { ...pair, family: "supported", focus: (["sum", "comparison", "difference"] as const)[variant] }
      : { ...pair, family: "unsupported", limit: (["cause", "future", "population"] as const)[variant] };
  }
  const rows = Object.freeze(counts.map((value, index) => Object.freeze({ category: categories[index], value })));
  const id = `st107-${difficulty}-${seed}`;
  const answers = buildAnswers(rows, query);
  for (let index = answers.length - 1; index > 0; index--) {
    const otherIndex = pick(index + 1);
    [answers[index], answers[otherIndex]] = [answers[otherIndex], answers[index]];
  }
  const options = Object.freeze(answers.map((answer, index) => Object.freeze({ id: `${id}:${index}`, answer: Object.freeze(answer) })));
  return Object.freeze({ id, difficulty, seed, rows, query: Object.freeze(query), options });
}

function sameFields(actual: unknown, expected: object): boolean {
  if (!actual || typeof actual !== "object") return false;
  const fields = Object.entries(expected);
  const record = actual as Record<string, unknown>;
  return Object.keys(record).length === fields.length && fields.every(([key, value]) => Object.hasOwn(record, key) && record[key] === value);
}

function sameOption(actual: ChartOption, expected: ChartOption): boolean {
  if (actual?.id !== expected.id) return false;
  const answer = expected.answer;
  if (answer.kind !== "claim") return sameFields(actual.answer, answer);
  return actual.answer?.kind === "claim" &&
    sameFields(actual.answer, { kind: "claim", claim: actual.answer.claim }) && sameFields(actual.answer.claim, answer.claim);
}

export function assessChartAnswer(task: ChartTask, raw: unknown): ChartAssessment {
  if (typeof raw !== "string" || !task) return "invalid";
  let expected: ChartTask;
  try {
    expected = generateChartTask(task.difficulty, task.seed);
  } catch (error) {
    if (error instanceof RangeError) return "invalid";
    throw error;
  }
  if (task.id !== expected.id || !sameFields(task.query, expected.query) ||
      !Array.isArray(task.rows) || task.rows.length !== expected.rows.length ||
      !expected.rows.every((row, index) => sameFields(task.rows[index], row)) ||
      !Array.isArray(task.options) || task.options.length !== expected.options.length ||
      !expected.options.every((option, index) => sameOption(task.options[index], option))) return "invalid";
  if (!raw.trim()) return "empty";
  const selected = expected.options.find(option => option.id === raw)?.answer;
  if (!selected) return "invalid";

  const result = evaluateChartQuery(expected.rows, expected.query);
  let correct: boolean;
  switch (result.kind) {
    case "count": correct = selected.kind === "count" && selected.value === result.value; break;
    case "relation": correct = selected.kind === "relation" && selected.value === result.value; break;
    case "extrema": correct = selected.kind === "category" && result.categories.includes(selected.category); break;
    case "evidence": correct = selected.kind === "claim" && evaluateChartClaim(expected.rows, selected.claim) === result.value; break;
  }
  return correct ? "correct" : "incorrect";
}
