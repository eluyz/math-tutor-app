import { useId } from "react";
import type { Locale } from "../locales/types";
import { singleHoleGeometry, singleHoleRecoveryValue,
  type SingleHoleRecoveryProblem } from "./graphSingleHoleRecovery";

const fmt = (n: number) => String(n).replace(/-/g, "−");

/** Isolated, accessible F05/e-like PUBLIC SYNTHETIC SVG.
 * No original graph coordinates or private keys are reproduced.
 */
export function SingleHoleRecoveryDisplay({
  problem: p, locale,
}: { problem: SingleHoleRecoveryProblem; locale: Locale }) {
  const uid = useId().replace(/:/g, "");
  const pl = locale === "pl";
  const { c, A, B, H, t, R, E } = singleHoleGeometry(p);
  const leftStart = c - 4, leftValue = singleHoleRecoveryValue(p, leftStart);
  const minX = leftStart - 1, maxX = R + 1;
  const minY = leftValue - 2, maxY = H + 2;
  const px = (x: number) => 35 + (x - minX) * 330 / (maxX - minX);
  const py = (y: number) => 230 - (y - minY) * 200 / (maxY - minY);
  const text = pl ?
    "Wykres nie jest zdefiniowany przy x=" + fmt(c) +
    ". Z lewej strony tego argumentu gałąź rosnąca ma pusty punkt (" +
    fmt(c) + ", " + fmt(A) + ") i biegnie w dół bez ograniczeń. " +
    "Z prawej strony ma inny pusty punkt (" + fmt(c) + ", " + fmt(B) + ")" +
    ", potem rośnie do pełnego maksimum (" + fmt(t) + ", " + fmt(H) + ")" +
    " i maleje do pełnego końca (" + fmt(R) + ", " + fmt(E) + "). " +
    "Obie puste wysokości są osiągane gdzie indziej w dziedzinie." :
    "The graph is undefined at x=" + fmt(c) +
    ". Its increasing left tail has a hollow limit (" +
    fmt(c) + ", " + fmt(A) + ") and extends downward without bound. " +
    "Its right branch has a distinct hollow limit (" + fmt(c) + ", " + fmt(B) +
    "), rises to an included maximum (" + fmt(t) + ", " + fmt(H) +
    "), then falls to an included endpoint (" + fmt(R) + ", " + fmt(E) + "). " +
    "Both missing endpoint heights are attained elsewhere on the graph.";
  const levels = [...new Set([B, A, H, E])].sort((a, b) => a - b);
  const left = {x1:leftStart, y1:leftValue, x2:c, y2:A};
  const rise = {x1:c,y1:B,x2:t,y2:H};
  const fall = {x1:t,y1:H,x2:R,y2:E};
  return <figure className="function-graph" data-graph-kind={p.kind}>
    <svg viewBox="0 0 400 275" role="img" focusable="false"
      aria-labelledby={"shr-title-" + uid + " shr-desc-" + uid}>
      <title id={"shr-title-" + uid}>{pl ?
        "Sześć własności wykresu z dwoma pustymi końcami przy jednym argumencie" :
        "Six properties of a graph with two hollow endpoints at one excluded input"}</title>
      <desc id={"shr-desc-" + uid}>{text}</desc>
      <g aria-hidden="true">
        {levels.map(y => <g key={y}>
          <line x1="20" x2="380" y1={py(y)} y2={py(y)}
            stroke="currentColor" strokeOpacity="0.12"/>
          <text x="18" y={py(y)+4} fontSize="10" textAnchor="end"
            fill="currentColor">{fmt(y)}</text>
        </g>)}
        {minY < 0 && maxY > 0 &&
          <line x1="20" x2="381" y1={py(0)} y2={py(0)}
            stroke="currentColor" strokeOpacity="0.35"/>}
        {minX < 0 && maxX > 0 &&
          <line x1={px(0)} x2={px(0)} y1="17" y2="234"
            stroke="currentColor" strokeOpacity="0.35"/>}
        {[c, t, R].map(x=><g key={x}>
          <line x1={px(x)} x2={px(x)} y1="232" y2="240"
            stroke="currentColor" strokeOpacity="0.5"/>
          <text data-testid="single-hole-x-tick" data-x={x}
            x={px(x)} y="253" textAnchor="middle" fontSize="11"
            fill="currentColor">{fmt(x)}</text>
        </g>)}
        <line data-testid="single-hole-left-tail" data-x-end={c}
          x1={px(left.x1)} y1={py(left.y1)} x2={px(left.x2)} y2={py(left.y2)}
          stroke="#087f70" strokeWidth="3.5" strokeLinecap="round"/>
        <polygon data-testid="single-hole-tail-arrow"
          points={[
            px(leftStart)+","+py(leftValue),
            (px(leftStart)+5)+","+(py(leftValue)-10),
            (px(leftStart)+13)+","+(py(leftValue)+1),
          ].join(" ")} fill="#087f70"/>
        <line data-testid="single-hole-rise" data-x-start={c}
          x1={px(rise.x1)} y1={py(rise.y1)} x2={px(rise.x2)} y2={py(rise.y2)}
          stroke="#087f70" strokeWidth="3.5" strokeLinecap="round"/>
        <line data-testid="single-hole-fall"
          x1={px(fall.x1)} y1={py(fall.y1)} x2={px(fall.x2)} y2={py(fall.y2)}
          stroke="#087f70" strokeWidth="3.5" strokeLinecap="round"/>
        {[
          {branch:"left",y:A},
          {branch:"right",y:B},
        ].map(point=><circle key={point.branch}
          data-testid="single-hole-hollow" data-x={c} data-y={point.y}
          data-branch={point.branch} cx={px(c)} cy={py(point.y)} r="5.6"
          stroke="#087f70" strokeWidth="2.5"
          fill="var(--color-bg, white)"/>)}
        {[
          {role:"maximum",x:t,y:H},
          {role:"endpoint",x:R,y:E},
        ].map(point=><circle key={point.role}
          data-testid="single-hole-filled" data-role={point.role}
          data-x={point.x} data-y={point.y}
          cx={px(point.x)} cy={py(point.y)} r="4.8"
          fill="#087f70" stroke="#087f70"/>)}
        <text x="383" y="243" fontSize="12" fill="currentColor">x</text>
      </g>
    </svg>
    <figcaption>{pl
      ? "Dwa puste kółka przy tym samym argumencie nie tworzą dwóch wartości funkcji. Obie wysokości istnieją gdzie indziej; strzałka pokazuje nieograniczoną gałąź."
      : "Two hollow marks at the same input do not define two function values. Both heights occur elsewhere; the arrow marks an unbounded branch."}</figcaption>
    <details className="function-graph-text">
      <summary>{pl ? "Opis wykresu w tekście" : "Graph described in text"}</summary>
      <p>{text}</p>
    </details>
  </figure>;
}
