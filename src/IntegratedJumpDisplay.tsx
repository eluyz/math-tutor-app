import {useId} from "react";
import type {Locale} from "./locales/types";
import type {IntegratedJumpProblem} from "./university/graphIntegratedJump";
const fmt=(n:number)=>String(n).replace("-","−");

export function IntegratedJumpDisplay({problem:p,locale}:{problem:IntegratedJumpProblem;locale:Locale}){
 const pl=locale==="pl",uid=useId().replace(/:/g,"");
 const [a,b]=p.left,[c,d]=p.right,L=d.x;
 const x=(v:number)=>32+(v+L+1)*334/(2*L+2),y=(v:number)=>125-v*17;
 const nodes=[a,b,c,d] as const,filled=[true,false,true,true] as const;
 const nodeDesc=nodes.map((n,i)=>
  "("+fmt(n.x)+", "+fmt(n.y)+") "+(filled[i]?(pl?"pełny":"filled"):(pl?"pusty":"hollow"))).join("; ");
 const desc=(pl?"Lewa i prawa gałąź mają różne granice przy x=0. Węzły: ":
  "The left and right branches have different limits at x=0. Nodes: ")+nodeDesc+".";
 return <figure className="function-graph" data-graph-kind="function-integrated-jump" data-jump-topology={p.topology}>
  <svg viewBox="0 0 400 275" role="img" focusable="false"
   aria-labelledby={"jump-title-"+uid+" jump-desc-"+uid}>
   <title id={"jump-title-"+uid}>{pl?"Wykres ze skokiem — pięć własności":"Discontinuous graph — five properties"}</title>
   <desc id={"jump-desc-"+uid}>{desc}</desc>
   <g aria-hidden="true">
    {[-6,-4,-2,0,2,4,6].map(v=><g key={v}>
      <line x1={21} x2={380} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={v===0?0.58:0.1}/>
      <text x={18} y={y(v)+4} fontSize={11} textAnchor="end" fill="currentColor">{fmt(v)}</text>
    </g>)}
    <line x1={x(0)} x2={x(0)} y1={13} y2={237} stroke="currentColor" strokeOpacity={0.6}/>
    {[a.x,0,d.x].map(v=><g key={v}>
     <text x={x(v)} y={259} fontSize={12} textAnchor="middle" fill="currentColor">{fmt(v)}</text>
    </g>)}
    <path data-testid="jump-left-path" d={"M "+x(a.x)+" "+y(a.y)+" L "+x(b.x)+" "+y(b.y)}
     fill="none" stroke="#087f70" strokeWidth={3.5} strokeLinecap="round"/>
    <path data-testid="jump-right-path" d={"M "+x(c.x)+" "+y(c.y)+" L "+x(d.x)+" "+y(d.y)}
     fill="none" stroke="#087f70" strokeWidth={3.5} strokeLinecap="round"/>
    {nodes.map((n,i)=><circle key={i} data-testid={"jump-node-"+i}
     data-x={n.x} data-y={n.y} data-included={String(filled[i])}
     cx={x(n.x)} cy={y(n.y)} r={6} stroke="#087f70" strokeWidth={2.4}
     fill={filled[i]?"#087f70":"#fff"}/>)}
    <text x={382} y={y(0)-9} textAnchor="end" fill="currentColor">x</text>
   </g>
  </svg>
  <figcaption>{pl
   ?"Przy tym samym x=0: pusty punkt (granica lewej gałęzi) i pełny punkt (wartość funkcji)."
   :"At the same x=0: a hollow point (left limit) and a filled point (the function value)."}
  </figcaption>
  <details className="function-graph-text">
   <summary>{pl?"Opis wykresu w tekście":"Graph described in text"}</summary><p>{desc}</p>
  </details>
 </figure>;
}
