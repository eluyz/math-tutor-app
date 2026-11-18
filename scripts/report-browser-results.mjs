import { readFileSync } from "node:fs";

// GitHub limits error annotations per step. A separate bounded notice keeps
// aggregate results inspectable through the Checks API as well as artifacts.
const paths = process.argv.slice(2);
if (!paths.length) paths.push("test-results/e2e-results.json",
  ...["b", "c", "d", "e", "f", "g"].map(batch => `test-results/batch-${batch}-results.json`));

for (const path of paths) {
  let summary;
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
    summary = { path, stats: report.stats,
      globalErrors: (report.errors ?? []).slice(0, 3).map(error => (error.message ?? "").slice(0, 2000)),
      failedFiles: files.map(file => ({
      file, count: failures.filter(failure => failure.file === file).length,
    })), failures: failures.slice(0, 60).map(({ file, title }) => ({ file, title })),
      omittedFailures: Math.max(0, failures.length - 60),
      samples: files.slice(0, 8).map(file => ({ file, error: failures.find(failure => failure.file === file).error
        .split("\n").filter(line => !line.includes("<launching>")).join("\n").slice(0, 2000) })),
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    summary = { path, status: "UNAVAILABLE: report not produced" };
  }
  const message = JSON.stringify(summary).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
  console.log(`::notice title=Browser validation results::${message}`);
}
