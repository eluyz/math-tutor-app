import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { generateInventory } from "../src/qa/inventory.ts";

type Format = "json" | "ndjson";

function parseArgs(argv: readonly string[]): {
  output?: string;
  format: Format;
  sha?: string;
} {
  let output: string | undefined;
  let format: Format = "json";
  let sha: string | undefined;

  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index];
    if (flag === "--output") output = argv[++index];
    else if (flag === "--format") {
      const value = argv[++index];
      if (value !== "json" && value !== "ndjson")
        throw new Error(`Unsupported format: ${String(value)}`);
      format = value;
    } else if (flag === "--inventory-sha") sha = argv[++index];
    else if (flag === "--help") {
      process.stdout.write(
        "Usage: node --experimental-strip-types scripts/qa-inventory.ts [--format json|ndjson] [--output path] [--inventory-sha sha]\n",
      );
      process.exit(0);
    } else throw new Error(`Unknown flag: ${flag}`);
  }

  return { output, format, sha };
}

function serialize(format: Format, report: ReturnType<typeof generateInventory>): string {
  if (format === "json") return JSON.stringify(report, null, 2) + "\n";
  return report.tuples.map((row) => JSON.stringify(row)).join("\n") + "\n";
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const report = generateInventory(args.sha);
  const body = serialize(args.format, report);

  if (args.output) {
    const absolute = resolve(args.output);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, body, "utf8");
    process.stderr.write(
      `QA inventory saved to ${absolute} (${args.format}, tuples=${report.summary.tuples}, sha=${report.inventory_sha})\n`,
    );
    return;
  }

  process.stdout.write(body);
}

main();
