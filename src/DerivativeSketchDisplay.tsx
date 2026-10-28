import { useId } from "react";
import type { Locale } from "./locales/types";
import { sketchGeometry, type DerivativeSketchProblem } from "./university/derivativeSketch";

const fmt = (n: number) => String(n).replace(/-/g, "−");

export function DerivativeSketchDisplay({ problem, locale }: {
  problem: DerivativeSketchProblem; locale: Locale;
}) {
  const id = useId().replace(/:/g, ""), pl = locale === "pl";
  const g = sketchGeometry(problem);
  const { pole: a, radius: s, verticalShift: v, orientation: e } = problem;
  const outer = e === 1 ? "+" : "−", inner = e === 1 ? "−" : "+";
  const intervals = [
    "(−∞; " + fmt(g.leftX) + ")",
    "(" + fmt(g.leftX) + "; " + fmt(a) + ")",
    "(" + fmt(a) + "; " + fmt(g.rightX) + ")",
    "(" + fmt(g.rightX) + "; +∞)",
  ];
  const xMin = a - 4 * s, xMax = a + 4 * s, yMin = v - 5 * s, yMax = v + 5 * s;
  const px = (x: number) => 26 + (x - xMin) * 440 / (xMax - xMin);
  const py = (y: number) => 260 - (y - yMin) * 240 / (yMax - yMin);
  const f = (t: number) => e * (t + s * s / t) + v;
  const pts = (left: boolean) => Array.from({ length: 45 }, (_, i) => {
    const z = left ? -4 + i * 3.6 / 44 : .4 + i * 3.6 / 44;
    const t = z * s;
    return px(a + t).toFixed(2) + "," + py(f(t)).toFixed(2);
  }).join(" ");
  const refText = pl
    ? "Referencyjny kształt: dwie rozłączne gałęzie, asymptota pionowa x=" + a +
      ", asymptota ukośna y=" + e + "·(x−(" + a + "))+(" + v + "), ekstremum lewe (" +
      g.leftX + ", " + g.leftY + "), ekstremum prawe (" + g.rightX + ", " + g.rightY + ")."
    : "Reference shape: two disconnected branches, vertical asymptote x=" + a +
      ", oblique asymptote y=" + e + "·(x−(" + a + "))+(" + v + "), left extremum (" +
      g.leftX + ", " + g.leftY + "), right extremum (" + g.rightX + ", " + g.rightY + ").";
  const signRows = [
    { name: "f′", signs: [outer, inner, inner, outer] },
    { name: "f″", signs: [inner, inner, outer, outer] },
  ];
  return <figure className="sketch-sign-chart"
    data-sketch-kind={problem.kind} data-pole={a} data-radius={s}
    data-shift={v} data-orientation={e}>
    <div className="sketch-table-scroll">
      <table aria-label={pl ? "Tabela znaków pochodnych" : "Derivative sign chart"}>
        <caption>{pl ? "Tabela znaków do samodzielnego szkicu" : "Signs for your own hand-drawn sketch"}</caption>
        <thead><tr><th scope="col">x</th>{intervals.map(part=><th scope="col" key={part}>{part}</th>)}</tr></thead>
        <tbody>{signRows.map(row=><tr key={row.name}>
          <th scope="row">{row.name}</th>{row.signs.map((sign,i)=><td key={i}>{sign}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
    <p className="sketch-note">
      {pl ? "f′=0 dla x=" : "f′=0 at x="}{fmt(g.leftX)}, {fmt(g.rightX)}.
      {pl ? " Funkcja nie jest określona dla x=" : " The function is undefined at x="}{fmt(a)}.
    </p>
    <figcaption>{pl
      ? "Najpierw narysuj szkic na kartce. Aplikacja automatycznie sprawdzi współrzędne ekstremów, a nie jakość rysunku."
      : "Draw on paper first. The app automatically checks extremum coordinates, not the quality of your drawing."}</figcaption>
    <details className="sketch-reference">
      <summary>{pl ? "Odkryj szkic referencyjny po własnej próbie" : "Reveal reference sketch after your own attempt"}</summary>
      <svg viewBox="0 0 500 300" role="img" aria-labelledby={"sketch-title-"+id+" sketch-desc-"+id}>
        <title id={"sketch-title-"+id}>{pl ? "Szkic referencyjny funkcji" : "Reference function sketch"}</title>
        <desc id={"sketch-desc-"+id}>{refText}</desc>
        <g aria-hidden="true">
          <line x1={px(a)} x2={px(a)} y1={14} y2={267}
            stroke="currentColor" strokeDasharray="7 5" strokeWidth={1.5} />
          <line data-testid="sketch-oblique" x1={px(xMin)} y1={py(e*(xMin-a)+v)}
            x2={px(xMax)} y2={py(e*(xMax-a)+v)}
            stroke="currentColor" strokeDasharray="4 4" strokeWidth={1.5} />
          <polyline data-testid="sketch-branch-left" points={pts(true)}
            fill="none" stroke="#087f70" strokeWidth={3} />
          <polyline data-testid="sketch-branch-right" points={pts(false)}
            fill="none" stroke="#087f70" strokeWidth={3} />
          <circle data-testid="sketch-left-extremum" cx={px(g.leftX)} cy={py(g.leftY)}
            r={4.5} fill="#087f70"/>
          <circle data-testid="sketch-right-extremum" cx={px(g.rightX)} cy={py(g.rightY)}
            r={4.5} fill="#087f70"/>
        </g>
        <text x={px(a)+6} y={12} fill="currentColor" fontSize={12}>x={fmt(a)}</text>
        <text x={px(g.leftX)} y={280} fill="currentColor" fontSize={11} textAnchor="middle">{fmt(g.leftX)}</text>
        <text x={px(g.rightX)} y={280} fill="currentColor" fontSize={11} textAnchor="middle">{fmt(g.rightX)}</text>
      </svg>
      <p>{refText}</p>
      <p>{pl
        ? "Porównaj położenie obu gałęzi względem asymptot, rodzaje ekstremów oraz znaki f′ i f″. Rysunek pozostaje zadaniem do samooceny."
        : "Compare branch positions, both asymptotes, extremum types and signs of f′ and f″. The drawing remains self-assessed."}</p>
    </details>
  </figure>;
}
