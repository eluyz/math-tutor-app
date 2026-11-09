import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EvenOpenRangeDisplay } from "./graphEvenOpenRangeDisplay";
import { makeEvenOpenRange } from "./graphEvenOpenRange";

/** Structural, accessible SVG witness; NOT a running-browser screenshot. */
describe("F05/b-like: isolated SVG with two missing x values", () => {
  for (const difficulty of ["hard", "advanced", "expert"] as const)
    for (const locale of ["pl", "en"] as const)
      it(difficulty + "/" + locale + " has 4 distinct hollow marks and 2 real tails", () => {
        const p = makeEvenOpenRange(2, difficulty);
        const html = renderToStaticMarkup(createElement(EvenOpenRangeDisplay, {
          problem: p, locale,
        }));
        expect(html).toContain('data-graph-kind="function-even-open-range"');
        expect(html).toContain('role="img"');
        expect(html).toContain('viewBox="0 0 400 270"');
        expect(html).toContain("aria-labelledby=");
        expect(html.match(/data-testid="even-open-hollow"/g)).toHaveLength(4);
        expect(html.match(/data-testid="even-open-tail-arrow"/g)).toHaveLength(2);
        expect(html.match(/data-testid="even-open-outer"/g)).toHaveLength(2);
        expect(html.match(/data-testid="even-open-inner"/g)).toHaveLength(1);
        expect(html.match(/data-testid="even-open-x-tick"/g)).toHaveLength(3);
        expect(html).toContain('data-branch="left-outer"');
        expect(html).toContain('data-branch="left-inner"');
        expect(html).toContain('data-branch="right-inner"');
        expect(html).toContain('data-branch="right-outer"');
        expect(html).toContain('data-x="' + -p.hole + '"');
        expect(html).toContain('data-x="' + p.hole + '"');
        expect(html).toContain('data-y="' + p.floor + '"');
        expect(html).toContain('data-y="' + (p.floor + p.lift + 2) + '"');
        expect(html).toContain('fill="var(--color-bg, white)"');
        expect(html).toContain('data-testid="even-open-center"');
        expect(html).toContain('class="function-graph-text"');
        if (locale === "pl") expect(html).toContain("Opis wykresu w tekście");
        else expect(html).toContain("Graph described in text");
      });
});
