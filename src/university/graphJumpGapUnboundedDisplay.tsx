import { useId } from "react";
import type { Locale } from "../locales/types";
import {
  jumpGapGeometry, jumpGapValue, type JumpGapUnboundedProblem,
} from "./graphJumpGapUnbounded";

const show = (n: number) => String(n).replace(/-/g, "−");

/** Original public synthetic SVG; it is not a digitization of a private worksheet. */
export function JumpGapUnboundedDisplay({
  problem: p, locale,
}: { problem: JumpGapUnboundedProblem; locale: Locale }) {
  const key = useId().replace(/:/g, "");
  const pl = locale === "pl";
  jumpGapGeometry(p);
  const leftStart = p.a - 4, rightEnd = p.t + 4;
  const leftY = jumpGapValue(p, leftStart), rightY = jumpGapValue(p, rightEnd);
  const minX = leftStart - 1, maxX = rightEnd + 1;
  const minY = Math.min(leftY, p.rightMin, p.lower, p.rightStart) - 2;
  const maxY = Math.max(rightY, p.upper, p.secondEnd, p.rightStart) + 2;
  const px = (x: number) => 28 + 340 * (x - minX) / (maxX - minX);
  const py = (y: number) => 236 - 208 * (y - minY) / (maxY - minY);
  const description = pl
    ? "Lewa gałąź rośnie od minus nieskończoności do pustego punktu (" +
      show(p.a) + ", " + show(p.upper) + "). W tym samym x jest pełny punkt (" +
      show(p.a) + ", " + show(p.lower) + "); drugi odcinek rośnie do pustego końca (" +
      show(p.b) + ", " + show(p.secondEnd) + "). Brak wykresu dla x od " +
      show(p.b) + " do " + show(p.c) + " włącznie. Od pustego punktu (" +
      show(p.c) + ", " + show(p.rightStart) + ") wykres maleje do pełnego minimum (" +
      show(p.t) + ", " + show(p.rightMin) + "), potem rośnie bez ograniczeń."
    : "The left tail rises from negative infinity to a hollow point (" +
      show(p.a) + ", " + show(p.upper) + "). At the same x a filled point (" +
      show(p.a) + ", " + show(p.lower) + ") begins a rising segment ending at a hollow point (" +
      show(p.b) + ", " + show(p.secondEnd) + "). There is no graph between x=" +
      show(p.b) + " and x=" + show(p.c) + ", including the endpoints. From a hollow (" +
      show(p.c) + ", " + show(p.rightStart) + ") the graph falls to the filled minimum (" +
      show(p.t) + ", " + show(p.rightMin) + "), then rises without bound.";
  const segments = [
    {key: "left", from: [leftStart, leftY], to: [p.a, p.upper]},
    {key: "middle", from: [p.a, p.lower], to: [p.b, p.secondEnd]},
    {key: "down", from: [p.c, p.rightStart], to: [p.t, p.rightMin]},
    {key: "right", from: [p.t, p.rightMin], to: [rightEnd, rightY]},
  ] as const;
  const hollow = [
    {id: "jump", x: p.a, y: p.upper},
    {id: "gap-left", x: p.b, y: p.secondEnd},
    {id: "gap-right", x: p.c, y: p.rightStart},
  ] as const;
  const filled = [
    {id: "jump", x: p.a, y: p.lower},
    {id: "minimum", x: p.t, y: p.rightMin},
  ] as const;
  return <figure className="function-graph" data-graph-kind={p.kind}>
    <svg viewBox="0 0 400 280" role="img" focusable="false"
      aria-labelledby={"jgu-title-" + key + " jgu-desc-" + key}>
      <title id={"jgu-title-" + key}>{pl ?
        "Sześć własności: skok, luka w dziedzinie i dwie nieograniczone gałęzie" :
        "Six properties: jump, domain gap and two unbounded branches"}</title>
      <desc id={"jgu-desc-" + key}>{description}</desc>
      <g aria-hidden="true">
        {minY < 0 && maxY > 0 && <line x1="18" x2="380" y1={py(0)} y2={py(0)}
          stroke="currentColor" strokeOpacity="0.26" />}
        {minX < 0 && maxX > 0 && <line x1={px(0)} x2={px(0)} y1="14" y2="240"
          stroke="currentColor" strokeOpacity="0.26" />}
        {[p.a,p.b,p.c,p.t].map((x,i) => <g key={i}>
          <line x1={px(x)} x2={px(x)} y1="241" y2="247"
            stroke="currentColor" strokeOpacity="0.45" />
          <text data-testid="jump-gap-x-label" data-x={x} x={px(x)} y="261"
            textAnchor="middle" fontSize="11" fill="currentColor">{show(x)}</text>
        </g>)}
        {segments.map(s => <line key={s.key} data-testid={"jump-gap-segment-" + s.key}
          x1={px(s.from[0])} y1={py(s.from[1])}
          x2={px(s.to[0])} y2={py(s.to[1])}
          stroke="#087f70" strokeWidth="3.5" strokeLinecap="round" />)}
        <polygon data-testid="jump-gap-left-arrow" points={[
          px(leftStart) + "," + py(leftY),
          (px(leftStart)+5) + "," + (py(leftY)-10),
          (px(leftStart)+13) + "," + (py(leftY)+2),
        ].join(" ")} fill="#087f70" />
        <polygon data-testid="jump-gap-right-arrow" points={[
          px(rightEnd) + "," + py(rightY),
          (px(rightEnd)-12) + "," + (py(rightY)+4),
          (px(rightEnd)-4) + "," + (py(rightY)+12),
        ].join(" ")} fill="#087f70" />
        {hollow.map(pt => <circle key={pt.id} data-testid="jump-gap-hollow"
          data-role={pt.id} data-x={pt.x} data-y={pt.y} cx={px(pt.x)} cy={py(pt.y)}
          r="5.4" fill="var(--color-bg, white)" stroke="#087f70" strokeWidth="2.5" />)}
        {filled.map(pt => <circle key={pt.id} data-testid="jump-gap-filled"
          data-role={pt.id} data-x={pt.x} data-y={pt.y} cx={px(pt.x)} cy={py(pt.y)}
          r="4.8" fill="#087f70" stroke="#087f70" />)}
        <text x="382" y="246" fontSize="12" fill="currentColor">x</text>
      </g>
    </svg>
    <figcaption>{pl ?
      "Puste kółka nie należą do wykresu, pełne należą. Dwie strzałki oznaczają gałęzie nieograniczone." :
      "Hollow circles are excluded, filled circles are included; both arrows mark unbounded tails."}</figcaption>
    <details className="function-graph-text">
      <summary>{pl ? "Opis wykresu w tekście" : "Graph described in text"}</summary>
      <p>{description}</p>
    </details>
  </figure>;
}
