import {useId} from "react";
import type {Locale} from "./locales/types";
import type {GraphIntegratedProblem} from "./university/graphIntegratedProperties";

const fmt=(n:number)=>String(n).replace("-","−");
export function IntegratedGraphDisplay({problem:p,locale}:{problem:GraphIntegratedProblem;locale:Locale}){
 const uid=useId().replace(/:/g,""),pl=locale==="pl",nodes=p.nodes,L=nodes[2].x;
 const px=(x:number)=>32+(x+L+1)*336/(2*L+2);
 const py=(y:number)=>130-y*19;
 const desc=(pl?"Łamana przez: ":"Piecewise-linear graph through: ")+nodes.map((n,i)=>
  "("+fmt(n.x)+", "+fmt(n.y)+") "+(p.included[i]?(pl?"pełny":"filled"):(pl?"pusty":"hollow"))).join("; ")+".";
 return <figure className="function-graph" data-graph-kind={p.kind}>
  <svg viewBox="0 0 400 260" role="img" focusable="false" aria-labelledby={"ip-title-"+uid+" ip-desc-"+uid}>
   <title id={"ip-title-"+uid}>{pl?"Jeden wykres — pięć własności":"One graph — five properties"}</title>
   <desc id={"ip-desc-"+uid}>{desc}</desc>
   <g aria-hidden="true">
    {[-4,-2,0,2,4].map(y=><g key={y}><line x1={18} x2={385} y1={py(y)} y2={py(y)} stroke="currentColor" strokeOpacity={y===0?0.62:0.12}/>
      <text x={16} y={py(y)+4} fontSize="11" textAnchor="end" fill="currentColor">{y}</text></g>)}
    <line x1={px(0)} x2={px(0)} y1={17} y2={225} stroke="currentColor" strokeOpacity=".5"/>
    {nodes.map((n,i)=><g key={i}>
      <line x1={px(n.x)} x2={px(n.x)} y1={17} y2={225} stroke="currentColor" strokeOpacity=".10"/>
      <text x={px(n.x)} y={244} fontSize="12" textAnchor="middle" fill="currentColor">{fmt(n.x)}</text>
    </g>)}
    <polyline data-testid="integrated-path" points={nodes.map(n=>px(n.x)+","+py(n.y)).join(" ")}
      fill="none" stroke="#087f70" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"/>
    {nodes.map((n,i)=><circle key={i} data-testid={"integrated-node-"+i} data-x={n.x} data-y={n.y}
      data-included={p.included[i]?"true":"false"} cx={px(n.x)} cy={py(n.y)} r={5.6}
      stroke="#087f70" strokeWidth={2.5} fill={p.included[i]?"#087f70":"#fff"}/>)}
    <text x={384} y={py(0)-8} textAnchor="end" fill="currentColor">x</text>
   </g>
  </svg>
  <figcaption>{pl?"Punkt pełny należy do wykresu, pusty jest wyłączony.":"A filled point is included; a hollow point is excluded."}</figcaption>
  <details className="function-graph-text">
   <summary>{pl?"Opis wykresu w tekście":"Graph described in text"}</summary><p>{desc}</p>
  </details>
 </figure>;
}
