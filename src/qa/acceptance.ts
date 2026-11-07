import { localizeUniversity, type makeUniversityTask } from "../university/catalog";
import type { AnswerInput } from "../answers";
type Task = ReturnType<typeof makeUniversityTask>;

export function wrongAcceptanceAnswer(correct: AnswerInput, task: Task): AnswerInput {
  if (typeof correct === "string") throw Error("Unexpected scalar input");
  if (correct.kind === "limit") return { kind: "limit", classification: correct.classification === "finite" ? "positive-infinity" : "finite", value: "0" };
  if (correct.kind === "list") return { kind: "list", values: ["999999", ...correct.values.slice(1)] };
  if (correct.kind === "choice") {
    const spec = localizeUniversity(task, "pl").answer;
    if (spec.kind === "choice") return { kind: "choice", value: spec.options.find(o => o.value !== correct.value)!.value };
  }
  throw Error("Unexpected acceptance input");
}
