import { useId } from "react";
import type { Locale } from "./locales/types";
import {
  integratedPoles, integratedAsymptoteValue,
  type IntegratedAsymptoteProblem,
} from "./university/graphIntegratedAsymptotes";

const fmt = (x: number) => String(x).replace(/-/g, "−");
const clamp = (x: number) => Math.max(-5, Math.min(5, x));
export function IntegratedAsymptoteDisplay({
  problem: p, locale,
}: { problem: IntegratedAsymptoteProblem; locale: Locale }) {
  const uid = useId().replace(/:/g, ""), pl = locale === "pl";
  const [a, b] = integratedPoles(p);
  const minX = p.left[0].x - 1, maxX = p.right[1].x + 1;
  const px = (x: number) => 30 + 352 * (x - minX) / (maxX - minX);
  const py = (y: number) => 125 - 20.5 * y;
  const middle = Array.from({ length: 199 }, (_unused, i) => {
    const x = a + (b - a) * (i + 1) / 200;
    return { x, y: clamp(integratedAsymptoteValue(p, x)) };
  });
  const middlePath = middle.map((v, i) =>
    (i === 0 ? "M " : "L ") + px(v.x) + " " + py(v.y)).join(" ");
  const text = (pl ? "Pionowe asymptoty " : "Vertical asymptotes ") +
    "x=" + fmt(a) + ", x=" + fmt(b) + ". " +
    (pl ? "Gałąź środkowa jest ściśle " : "The middle branch is strictly ") +
    (p.sign === 1 ? (pl ? "malejąca" : "decreasing") : (pl ? "rosnąca" : "increasing")) +
    (pl ? " i osiąga wszystkie wartości rzeczywiste. " : " and reaches every real y-value. ") +
    (pl ? "Lewy ukośny odcinek: " : "Left sloping segment: ") +
    "(" + fmt(p.left[0].x) + ", " + fmt(p.left[0].y) + ") – (" +
    fmt(p.left[1].x) + ", " + fmt(p.left[1].y) + "). " +
    (pl ? "Prawy ukośny odcinek: " : "Right sloping segment: ") +
    "(" + fmt(p.right[0].x) + ", " + fmt(p.right[0].y) + ") – (" +
    fmt(p.right[1].x) + ", " + fmt(p.right[1].y) + "). " +
    (pl ? "Wszystkie cztery końce odcinków są pełne; asymptoty są wyłączone." :
      "All four segment endpoints are filled; poles are excluded.");
  return <figure className="function-graph" data-graph-kind={p.kind}>
    <svg role="img" focusable="false" viewBox="0 0 400 260"
      aria-labelledby={"ia-title-" + uid + " ia-desc-" + uid}>
      <title id={"ia-title-" + uid}>{pl ?
        "Sześć własności wykresu z dwiema asymptotami i ukośnymi odcinkami" :
        "Six graph properties with two poles and sloping outer segments"}</title>
      <desc id={"ia-desc-" + uid}>{text}</desc>
      <g aria-hidden="true">
        {[-4, -2, 0, 2, 4].map(y => <g key={y}>
          <line x1={18} x2={386} y1={py(y)} y2={py(y)}
            stroke="currentColor" strokeOpacity={y === 0 ? 0.55 : 0.13}/>
          <text x="17" y={py(y) + 4} fontSize="10"
            textAnchor="end" fill="currentColor">{y}</text>
        </g>)}
        {minX < 0 && maxX > 0 && <line x1={px(0)} x2={px(0)}
          y1={15} y2={229} stroke="currentColor" strokeOpacity="0.35"/>}
        {[p.left[0].x, a, p.center, b, p.right[1].x].map((x, i) => <g key={i}>
          <text x={px(x)} y={244} fontSize="10" textAnchor="middle"
            fill="currentColor">{fmt(x)}</text>
        </g>)}
        {[a, b].map((x, i) => <line key={x}
          data-testid={i === 0 ? "integrated-pole-left" : "integrated-pole-right"}
          data-x={x} x1={px(x)} x2={px(x)} y1={15} y2={229}
          stroke="#9b6026" strokeWidth="2" strokeDasharray="6 5"/>)}
        <path data-testid="integrated-asymptote-middle"
          d={middlePath} stroke="#087f70" strokeWidth="3.5"
          fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        {[p.left, p.right].map((segment, i) => <g key={i}>
          <line data-testid="integrated-sloping-segment"
            data-slope={Math.sign(segment[1].y - segment[0].y)}
            x1={px(segment[0].x)} y1={py(segment[0].y)}
            x2={px(segment[1].x)} y2={py(segment[1].y)}
            stroke="#087f70" strokeWidth="3.5" strokeLinecap="round"/>
          {segment.map((v, j) => <circle key={j} r="4.5"
            data-testid="integrated-outer-point" data-x={v.x} data-y={v.y}
            cx={px(v.x)} cy={py(v.y)} fill="#087f70"/>)}
        </g>)}
        <text x="389" y={py(0) - 9} textAnchor="end" fontSize="12"
          fill="currentColor">x</text>
      </g>
    </svg>
    <figcaption>{pl ?
      "Dwie pionowe linie przerywane są asymptotami, a gałąź środkowa wykracza poza widoczny obszar. Ukośne odcinki zewnętrzne mają pełne końce." :
      "The two dashed vertical lines are asymptotes; the middle curve extends beyond the visible chart. Both sloping outer segments have filled endpoints."}</figcaption>
    <details className="function-graph-text">
      <summary>{pl ? "Opis wykresu w tekście" : "Graph described in text"}</summary>
      <p>{text}</p>
    </details>
  </figure>;
}
