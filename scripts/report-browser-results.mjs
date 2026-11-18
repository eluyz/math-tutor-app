import { readFileSync } from "node:fs";

// GitHub limits error annotations per step. A separate bounded notice keeps
// aggregate results inspectable through the Checks API as well as artifacts.
// Keep each notice small: GitHub can truncate long messages and sanitize ANSI.
const short = (value, bytes) => Buffer.from(String(value ?? "")
  .replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "")
  .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, ""))
  .subarray(0, bytes).toString("utf8").replace(/\ufffd$/, "");
function notice(value, title = "Browser validation results") {
  const message = JSON.stringify(value).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
  console.log(`::notice title=${title}::${message}`);
}
const paths = process.argv.slice(2);
if (!paths.length) paths.push("test-results/e2e-results.json",
  ...["b", "c", "d", "e", "f", "g"].map(batch => `test-results/batch-${batch}-results.json`));

for (const path of paths) {
  try {
    const report = JSON.parse(readFileSync(path, "utf8"));
    const failures = [];
    function visit(suites) {
      for (const suite of suites ?? []) {
        for (const spec of suite.specs ?? []) for (const test of spec.tests ?? []) {
          if (test.status === "unexpected") failures.push({
            file: spec.file, title: spec.title,
            error: test.results?.flatMap(result => result.errors ?? []).map(error => error.message ?? "").join("\n"),
          });
        }
        visit(suite.suites);
      }
    }
    visit(report.suites);
    const files = [...new Set(failures.map(failure => failure.file))];
    notice({ path, stats: report.stats,
      globalErrors: (report.errors ?? []).slice(0, 3).map(error => short(error.message, 200)),
      failedFiles: files.slice(0, 12).map(file => ({
        file: short(file, 120), count: failures.filter(failure => failure.file === file).length,
      })), omittedFailedFiles: Math.max(0, files.length - 12),
    });
    for (const file of files.slice(0, 8)) {
      const group = failures.filter(failure => failure.file === file);
      notice({ path, file: short(file, 120), count: group.length,
        titles: group.slice(0, 3).map(failure => short(failure.title, 120)),
        omittedTitles: Math.max(0, group.length - 3),
        error: short(group[0].error.split("\n").filter(line => !line.includes("<launching>")).join("\n"), 1100),
      }, "Browser validation failure details");
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    notice({ path, status: "UNAVAILABLE: report not produced" });
  }
}
