import { useId } from "react";
import type { Locale } from "./locales/types";
import { graphPlainText, type FunctionGraphProblem } from "./university/functionGraphs";
import type { GraphPropertyProblem } from "./university/functionGraphProperties";

/** Dependency-free graph: exact vertex coordinates, responsive viewBox, text equivalent. */
export function FunctionGraphDisplay({problem,locale}:{problem:FunctionGraphProblem|GraphPropertyProblem;locale:Locale}) {
  const id=useId().replace(/:/g,"");
  const titleId="graph-title-"+id, descId="graph-description-"+id;
  const title=locale==="pl"?"Wykres funkcji odcinkami liniowej":"Piecewise-linear function graph";
  const description=graphPlainText(problem,locale);
  const points=problem.nodes;
  const xMin=points[0].x-1, xMax=points[2].x+1;
  const px=(x:number)=>40+(x-xMin)*320/(xMax-xMin);
  const py=(y:number)=>125-y*20;
  const ticks=[...new Set(points.map(p=>p.x))];
  const visibleZero=xMin<=0&&xMax>=0;
  return <figure className="function-graph" data-graph-kind={problem.kind}>
    <svg viewBox="0 0 400 260" role="img" aria-labelledby={titleId+" "+descId} focusable="false">
      <title id={titleId}>{title}</title>
      <desc id={descId}>{description}</desc>
      <g aria-hidden="true">
        {[-4,-2,0,2,4].map(y=><g key={y}>
          <line x1={24} x2={383} y1={py(y)} y2={py(y)}
            stroke="currentColor" strokeOpacity={y===0?0.65:0.13} strokeWidth={y===0?1.5:1}/>
          <text x="20" y={py(y)+4} textAnchor="end" fontSize="11" fill="currentColor">{y}</text>
        </g>)}
        {visibleZero&&<line x1={px(0)} x2={px(0)} y1={16} y2={225}
          stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.5"/>}
        {ticks.map(x=><g key={x}>
          <line x1={px(x)} x2={px(x)} y1={16} y2={225}
            stroke="currentColor" strokeOpacity="0.12" strokeWidth="1"/>
          <text x={px(x)} y="244" textAnchor="middle" fontSize="12" fill="currentColor">{x}</text>
        </g>)}
        <text x="382" y={py(0)-8} textAnchor="end" fontSize="13" fill="currentColor">x</text>
        <text x="28" y="15" textAnchor="start" fontSize="13" fill="currentColor">y</text>
        <polyline data-testid="graph-path"
          points={points.map(point=>px(point.x)+","+py(point.y)).join(" ")}
          fill="none" stroke="#087f70" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round"/>
        {points.map((point,i)=>{
          const closed=i===1||(i===0?problem.leftClosed:problem.rightClosed);
          return <circle key={i} data-testid={i===0?"graph-left":i===1?"graph-middle":"graph-right"}
            cx={px(point.x)} cy={py(point.y)} r="5.5"
            stroke="#087f70" strokeWidth="2.5"
            fill={closed?"#087f70":"#ffffff"}/>;
        })}
      </g>
    </svg>
    <figcaption>{locale==="pl"?
      "Osie x i y; pełne kółko — punkt należy do wykresu, puste — punkt wyłączony.":
      "x and y axes; filled circle means included, hollow circle means excluded."}</figcaption>
    <details className="function-graph-text">
      <summary>{locale==="pl"?"Opis wykresu w tekście":"Graph described in text"}</summary>
      <p>{description}</p>
    </details>
  </figure>;
}
