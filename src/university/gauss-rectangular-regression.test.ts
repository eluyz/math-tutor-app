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
    const contents = tasks.map((task) =>
      (["pl", "en"] as const).map((locale) => {
        const localized = localizeTask(task, locale);
        return { task: localized, solution: solutionFor(localized) };
      }),
    );
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
