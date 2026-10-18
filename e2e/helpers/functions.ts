import type { Page } from "@playwright/test";
import { parseAnswer, type Rational } from "../../src/rational";
import { q, a, m, s, d, neg, eq } from "../../src/university/audit";
import {
  cmp,
  directComposition,
  directValue,
  referenceRoots,
  selectedSetContains,
} from "../../src/university/functions-audit";
import { fractionText } from "./systems";

export const shownFraction = (text: string): Rational => {
  const parsed = parseAnswer(text.trim());
  if (parsed.kind !== "valid")
    throw new Error(`Unparseable displayed fraction: ${text}`);
  return parsed.value;
};
export function shownPolynomial(text: string): Rational[] {
  const coefficients: Rational[] = [q(0)];
  if (text.trim() === "0") return coefficients;
  for (const token of text.matchAll(/\(([^()]+)\)(?:·x([²³⁴]?))?/g)) {
    const power = token[0].includes("·x")
      ? token[2] === "⁴"
        ? 4
        : token[2] === "³"
          ? 3
          : token[2] === "²"
            ? 2
            : 1
      : 0;
    while (coefficients.length <= power) coefficients.push(q(0));
    coefficients[power] = a(coefficients[power], shownFraction(token[1]));
  }
  return coefficients;
}
async function fillList(page: Page, values: readonly Rational[]) {
  const fields = page.locator("form .coefficient-field input");
  if ((await fields.count()) !== values.length)
    throw new Error("Wrong coefficient field count");
  for (let i = 0; i < values.length; i++)
    await fields.nth(i).fill(fractionText(values[i]));
}
/** Derive answers from the public exercise text, never hidden task/answer state. */
export async function fillFunction(page: Page, family: string) {
  const text = await page.locator(".question").innerText(),
    lines = text.split("\n");
  if (family === "function-value" || family === "function-zeros") {
    const formula = lines
      .find((l) => l.startsWith("f(x) = "))!
      .match(/^f\(x\) = \((.*)\)\/\((.*)\)$/)!;
    const numerator = shownPolynomial(formula[1]),
      denominator = shownPolynomial(formula[2]);
    if (family === "function-value") {
      const at = shownFraction(lines[0].match(/f\(([^()]*)\)/)![1]);
      await page
        .locator("#answer")
        .fill(
          fractionText(
            d(directValue(numerator, at), directValue(denominator, at)),
          ),
        );
    } else {
      const roots = referenceRoots(numerator).filter(
        (x) => !eq(directValue(denominator, x), q(0)),
      );
      await page
        .locator("#answer")
        .selectOption(
          roots.length === 2 ? "two" : roots.length ? "double" : "none",
        );
      for (let i = 0; i < roots.length; i++)
        await page.locator(`#root-${i}`).fill(fractionText(roots[i]));
    }
  } else if (family === "function-linear") {
    const points = [...text.matchAll(/h\(([^()]*)\) = ([^;\n]+)/g)];
    const [x1, y1, x2, y2] = [
      points[0][1],
      points[0][2],
      points[1][1],
      points[1][2],
    ].map(shownFraction);
    const slope = d(s(y2, y1), s(x2, x1)),
      intercept = s(y1, m(slope, x1));
    const known = shownPolynomial(
        lines[1].split("; ")[0].replace("g(x) = ", ""),
      ),
      targetSlope = d(slope, known[1]),
      targetIntercept = s(intercept, m(targetSlope, known[0]));
    await fillList(page, [targetSlope, targetIntercept]);
  } else if (family === "function-vertex" || family === "function-range") {
    const [c, b, leading] = shownPolynomial(lines[1].replace("f(x) = ", "")),
      h = d(neg(b), m(q(2), leading)),
      k = a(a(m(leading, m(h, h)), m(b, h)), c);
    if (family === "function-vertex") await fillList(page, [h, k]);
    else {
      const options = await page
        .locator("#answer option")
        .evaluateAll((nodes) =>
          nodes.map((n) => (n as HTMLOptionElement).value).filter(Boolean),
        );
      const candidates = options.filter(
        (key) =>
          selectedSetContains(key, k) &&
          selectedSetContains(key, a(k, q(1))) === cmp(leading, q(0)) > 0 &&
          selectedSetContains(key, s(k, q(1))) === cmp(leading, q(0)) < 0,
      );
      if (candidates.length !== 1) throw new Error("Ambiguous range choices");
      await page.locator("#answer").selectOption(candidates[0]);
    }
  } else if (family === "function-composition") {
    const outer = shownPolynomial(lines[1].replace("f(x) = ", "")),
      inner = shownPolynomial(lines[2].replace("g(x) = ", ""));
    await fillList(page, [...directComposition(outer, inner)].reverse());
  } else if (family === "function-domain") {
    const critical = [...text.matchAll(/x − \(([^()]+)\)/g)].map((match) =>
      shownFraction(match[1]),
    );
    const [p, z, r] = critical,
      sign = shownFraction(text.match(/\/√\(\(([^()]+)\)·/)![1]);
    const boundaries = [...critical].sort(cmp),
      points = [
        ...boundaries,
        s(boundaries[0], q(1)),
        a(boundaries.at(-1)!, q(1)),
        d(a(boundaries[0], boundaries[1]), q(2)),
        d(a(boundaries[1], boundaries[2]), q(2)),
      ];
    const allowed = (x: Rational) =>
      cmp(m(s(x, p), s(x, z)), q(0)) >= 0 && cmp(m(sign, s(x, r)), q(0)) > 0;
    const options = await page
      .locator("#answer option")
      .evaluateAll((nodes) =>
        nodes.map((n) => (n as HTMLOptionElement).value).filter(Boolean),
      );
    const candidates = options.filter((key) =>
      points.every((x) => selectedSetContains(key, x) === allowed(x)),
    );
    if (candidates.length !== 1) throw new Error("Ambiguous domain choices");
    await page.locator("#answer").selectOption(candidates[0]);
  } else throw new Error(`Unsupported public-text test helper: ${family}`);
}
