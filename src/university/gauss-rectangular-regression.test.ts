import { it, expect } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  allTemplates,
  difficulties,
  taskPool,
} from "../generators";
import { localizeTask } from "../locales/catalog";
import { solutionFor } from "../solutions/model";

// Independently captured from the archive of merged main f585218.
const baseline = JSON.parse(
  readFileSync(
    new URL("./fixtures/mtedu014p1-baseline.json", import.meta.url),
    "utf8",
  ),
) as {
  source: string;
  families: {
    id: string;
    category: string;
    levels: string[];
    count: number;
    sha256: string;
  }[];
};
// Batch G only parenthesizes the fractional log/power base. Preserve the
// original archive bytes for these four families; current notation is tested
// independently by Batch G. No answers, coefficients or exclusions are exempt.
const archiveBaseNotation=(text:string,family:string)=>
  ["analysis-log-domain","analysis-power-law","analysis-elementary-equation","analysis-log-inequality"].includes(family)
    ? text.replaceAll("log_(1/2)","log_1/2").replaceAll("(1/2)^","1/2^") : text;
// U08 teaching-text migration, version 1 (2026-11-08): only the example
// in the QUESTION for the published gauss-parameters-one family changed.
// Reconstruct the original question before comparing against the immutable
// f585218 archive. Keep every original SHA-256 and all solution/grading bytes.
// Fail closed if the corrected phrase is absent, duplicated or already legacy.
function archivedGaussOneQuestion(question:string, locale:"pl"|"en") {
  const current=locale==="pl"?"np. x=c+at1.":"e.g. x=c+at1.";
  const historical=locale==="pl"?"np. x=c+at1+bt2.":"e.g. x=c+at1+bt2.";
  expect(question).not.toContain(historical);
  expect(question.split(current)).toHaveLength(2);
  return question.replace(current,historical);
}
// contentKey is derived from the Polish question at task creation, then
// reused for EN. This identity changes with the corrected wording too.
// Reconstruct only this known historic question-derived key for archive SHA.
function archivedGaussOneContentKey(contentKey:string) {
  const current="np. x=c+at1.",historical="np. x=c+at1+bt2.";
  expect(contentKey).toMatch(/^university:Rozwiąż metodą Gaussa:/);
  expect(contentKey).not.toContain(historical);
  expect(contentKey.split(current)).toHaveLength(2);
  return contentKey.replace(current,historical);
}
it("preserves all 10389 previously published PL/EN exercises and complete solutions", () => {
  expect(baseline.source).toBe("f585218e3ce87bcf963a725aabbf056ba1e486fa");
  expect(baseline.families).toHaveLength(118);
  expect(baseline.families.reduce((sum, f) => sum + f.count, 0)).toBe(10389);
  for (const saved of baseline.families) {
    const family = allTemplates.find((f) => f.id === saved.id)!;
    expect(family).toBeDefined();
    expect(family.category).toBe(saved.category);
    expect(family.supportedDifficulties).toEqual(saved.levels);
    const tasks = difficulties
      .flatMap((level) =>
        taskPool(family.category, level).filter(
          (task) => task.templateId === saved.id,
        ),
      )
      .sort((a, b) => a.id.localeCompare(b.id));
    let migratedQuestions=0;
    const contents = tasks.map((task) =>
      (["pl", "en"] as const).map((locale) => {
        const localized = localizeTask(task, locale);
        // Only reconstruct a known historical question example for the
        // frozen hash. All other fields and all other families stay untouched.
        const archivedTask=saved.id==="gauss-parameters-one"
          ? {...localized,
              question:archivedGaussOneQuestion(localized.question,locale),
              contentKey:archivedGaussOneContentKey(localized.contentKey)}
          : localized;
        if(saved.id==="gauss-parameters-one")migratedQuestions++;
        return { task: archivedTask, solution: solutionFor(localized) };
      }),
    );
    expect(migratedQuestions).toBe(saved.id==="gauss-parameters-one"?saved.count*2:0);
    const hash = createHash("sha256")
      .update(
        JSON.stringify(contents, (_, v) =>
          typeof v === "bigint" ? v.toString() : typeof v === "string" ? archiveBaseNotation(v, saved.id)
            // Batch E corrects this teaching sentence, including occurrences in
            // the explanation. Restore only those exact words for the archive
            // hash; current signed reasoning is checked by Batch E acceptance.
            .replaceAll("Powtarzamy całkowanie przez części, aż pochodna wielomianu zniknie; każdy kolejny współczynnik mnożymy przez −stopień/a, zachowując znak a.",
              "Powtarzamy całkowanie przez części, aż pochodna wielomianu zniknie; znaki współczynników zmieniają się naprzemiennie.")
            .replaceAll("Repeat integration by parts until the polynomial derivative vanishes; multiply each successive coefficient by −degree/a, preserving the sign of a.",
              "Repeat integration by parts until the polynomial derivative vanishes; coefficient signs alternate.") : v,
        ),
      )
      .digest("hex");
    expect(tasks, saved.id).toHaveLength(saved.count);
    expect(hash, saved.id).toBe(saved.sha256);
  }
}, 40_000);
