import { useId } from "react";
import type { Locale } from "../locales/types";
import { evenOpenRangeValue, type EvenOpenRangeProblem } from "./graphEvenOpenRange";

const fmt = (n: number) => String(n).replace(/-/g, "−");

/** Reusable SVG for a future catalog-integrated F05/b-like exercise.
 * Draws genuine unbounded tails, two absent arguments and four hollow endpoints.
 */
export function EvenOpenRangeDisplay({
  problem: p, locale,
}: { problem: EvenOpenRangeProblem; locale: Locale }) {
  const uid = useId().replace(/:/g, "");
  const pl = locale === "pl";
  const h = p.hole, xMax = h + 4;
  const middleEdgeY = p.floor + p.lift + 2;
  const outerEdgeY = p.floor + 4 * p.slope;
  const minY = p.floor - 1;
  const maxY = Math.max(middleEdgeY, outerEdgeY) + 1;
  const px = (x: number) => 32 + 336 * (x + xMax) / (2 * xMax);
  const py = (y: number) => 225 - 195 * (y - minY) / (maxY - minY);
  const sample = Array.from({ length: 199 }, (_unused, i) => {
    const x = -h + 2 * h * (i + 1) / 200;
    return { x, y: evenOpenRangeValue(p, x) };
  });
  const middlePath = sample.map(({ x, y }, i) =>
    (i === 0 ? "M " : "L ") + px(x) + " " + py(y)).join(" ");
  const outer = [
    { x1: -xMax, x2: -h, y1: evenOpenRangeValue(p, -xMax), y2: p.floor, side: "left" },
    { x1: h, x2: xMax, y1: p.floor, y2: evenOpenRangeValue(p, xMax), side: "right" },
  ] as const;
  const holes = [
    { x: -h, y: p.floor, branch: "left-outer" },
    { x: -h, y: middleEdgeY, branch: "left-inner" },
    { x: h, y: middleEdgeY, branch: "right-inner" },
    { x: h, y: p.floor, branch: "right-outer" },
  ] as const;
  const description = pl
    ? "Wykres parzysty, bez argumentów x=±" + fmt(h) +
      ". Dla |x|>" + fmt(h) + " funkcja ma wzór y=" + fmt(p.floor) + "+" +
      fmt(p.slope) + "·(|x|−" + fmt(h) + "), a dla |x|<" + fmt(h) + " wzór y=" +
      fmt(p.floor + p.lift) + "+2·(x/" + fmt(h) + ")². " +
      "Cztery puste kółka przy dwóch wyłączonych argumentach. Zewnętrzne ramiona biegną bez ograniczenia ku górze."
    : "Even graph excluding x=±" + fmt(h) +
      ". For |x|>" + fmt(h) + " the function is y=" + fmt(p.floor) + "+" +
      fmt(p.slope) + "·(|x|−" + fmt(h) + "), and for |x|<" + fmt(h) + " it is y=" +
      fmt(p.floor + p.lift) + "+2·(x/" + fmt(h) + ")². " +
      "Four hollow endpoints at two excluded inputs. Both outer tails are unbounded above.";
  const gridY = [...new Set([p.floor, p.floor + p.lift, middleEdgeY])];
  return <figure className="function-graph" data-graph-kind={p.kind}>
    <svg role="img" focusable="false" viewBox="0 0 400 270"
      aria-labelledby={"eor-title-" + uid + " eor-desc-" + uid}>
      <title id={"eor-title-" + uid}>
        {pl ? "Sześć właściwości parzystego wykresu z dziurami" :
          "Six properties of an even graph with holes"}
      </title>
      <desc id={"eor-desc-" + uid}>{description}</desc>
      <g aria-hidden="true">
        {gridY.map(y => <g key={y}>
          <line x1="20" x2="382" y1={py(y)} y2={py(y)}
            stroke="currentColor" strokeOpacity="0.14"/>
          <text x="18" y={py(y) + 4} fontSize="10" textAnchor="end"
            fill="currentColor">{fmt(y)}</text>
        </g>)}
        {minY <= 0 && maxY >= 0 &&
          <line x1="22" x2="382" y1={py(0)} y2={py(0)}
            stroke="currentColor" strokeOpacity="0.55"/>}
        <line x1={px(0)} x2={px(0)} y1="16" y2="228"
          stroke="currentColor" strokeOpacity="0.4"/>
        {[-h, 0, h].map(x => <g key={x}>
          <line x1={px(x)} x2={px(x)} y1="228" y2="235"
            stroke="currentColor" strokeOpacity="0.5"/>
          <text data-testid="even-open-x-tick" data-x={x}
            x={px(x)} y="248" fontSize="11" textAnchor="middle"
            fill="currentColor">{fmt(x)}</text>
        </g>)}
        {outer.map(branch => <g key={branch.side}>
          <line data-testid="even-open-outer" data-side={branch.side}
            x1={px(branch.x1)} y1={py(branch.y1)}
            x2={px(branch.x2)} y2={py(branch.y2)}
            stroke="#087f70" strokeWidth="3.5" strokeLinecap="round"/>
          <polygon data-testid="even-open-tail-arrow" data-side={branch.side}
            points={branch.side === "left"
              ? [px(-xMax) + "," + (py(outerEdgeY) - 6),
                (px(-xMax) - 8) + "," + (py(outerEdgeY) + 9),
                (px(-xMax) + 7) + "," + (py(outerEdgeY) + 7)].join(" ")
              : [px(xMax) + "," + (py(outerEdgeY) - 6),
                (px(xMax) - 7) + "," + (py(outerEdgeY) + 7),
                (px(xMax) + 8) + "," + (py(outerEdgeY) + 9)].join(" ")}
            fill="#087f70"/>
        </g>)}
        <path data-testid="even-open-inner" d={middlePath}
          stroke="#087f70" strokeWidth="3.5"
          strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {holes.map(point => <circle key={point.branch}
          data-testid="even-open-hollow" data-branch={point.branch}
          data-x={point.x} data-y={point.y}
          cx={px(point.x)} cy={py(point.y)} r="5"
          fill="var(--color-bg, white)" stroke="#087f70" strokeWidth="2.3"/>)}
        <circle data-testid="even-open-center" data-x="0" data-y={p.floor + p.lift}
          cx={px(0)} cy={py(p.floor + p.lift)} r="3.7" fill="#087f70"/>
        <text x="386" y="240" fontSize="12" fill="currentColor">x</text>
      </g>
    </svg>
    <figcaption>{pl
      ? "Dwa argumenty są wyłączone. Cztery puste końce nie są wartościami funkcji w tych punktach; strzałki oznaczają nieograniczone ramiona."
      : "Two x-values are excluded. Four hollow branch endpoints are not function values at those inputs; arrows mark unbounded tails."}
    </figcaption>
    <details className="function-graph-text">
      <summary>{pl ? "Opis wykresu w tekście" : "Graph described in text"}</summary>
      <p>{description}</p>
    </details>
  </figure>;
}
