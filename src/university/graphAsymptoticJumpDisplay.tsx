import { useId } from "react";
import type { Locale } from "../locales/types";
import {
  checkAsymptoticJump, asymptoticJumpValue, type AsymptoticJumpProblem,
} from "./graphAsymptoticJump";

const fmt=(n:number)=>String(n).replace(/-/g,"−");

/** Responsive PUBLIC synthetic curved graph, not a worksheet digitization. */
export function AsymptoticJumpDisplay({
  problem:p,locale,
}:{problem:AsymptoticJumpProblem;locale:Locale}){
  const uid=useId().replace(/:/g,"");
  const pl=locale==="pl";
  checkAsymptoticJump(p);
  const low=p.A-p.k-1, high=p.B+p.h+1;
  const px=(x:number)=>25+(x+12.5)*350/25;
  const py=(y:number)=>233-(y-low)*203/(high-low);
  const xsLeft=[...Array.from({length:60},(_,i)=>-12+12*i/60),-0.001];
  const xsRight=Array.from({length:61},(_,i)=>12*i/60);
  const path=(xs:readonly number[])=>xs.map((x,i)=>
    (i===0?"M ":"L ")+px(x).toFixed(3)+" "+py(asymptoticJumpValue(p,x)).toFixed(3)
  ).join(" ");
  // The hollow circle at 0 is intentionally separate from the left path:
  // left-hand limit is not included, the right value at 0 is filled.
  const leftPath=path(xsLeft);
  const rightPath=path(xsRight);
  const desc=pl
    ?"Lewa gałąź dla x<0 ściśle maleje od poziomej asymptoty y="+fmt(p.A)+
      " do pustego punktu (0, "+fmt(p.A-p.k)+"). Prawa gałąź zaczyna się pełnym "+
      "punktem (0, "+fmt(p.B)+"), rośnie i zbliża do poziomej asymptoty y="+
      fmt(p.B+p.h)+". Oba obrazy nie mają części wspólnej, więc funkcja jest różnowartościowa."
    :"For x<0 the left branch strictly decreases from horizontal asymptote y="+fmt(p.A)+
      " to a hollow point (0, "+fmt(p.A-p.k)+"). The right branch starts at "+
      "the filled point (0, "+fmt(p.B)+"), increases and approaches "+
      "horizontal asymptote y="+fmt(p.B+p.h)+
      ". The branch images are disjoint, making the function injective.";
  return <figure className="function-graph" data-graph-kind={p.kind}>
    <svg viewBox="0 0 400 280" role="img" focusable="false"
      aria-labelledby={"iaj-title-"+uid+" iaj-desc-"+uid}>
      <title id={"iaj-title-"+uid}>{pl?
        "Różnowartościowa funkcja z dwiema asymptotami i skokiem":
        "Injective graph with a jump and two horizontal asymptotes"}</title>
      <desc id={"iaj-desc-"+uid}>{desc}</desc>
      <g aria-hidden="true">
        {[
          {role:"left",y:p.A},
          {role:"right",y:p.B+p.h},
        ].map(item=><g key={item.role}>
          <line data-testid="asymptotic-jump-asymptote"
            data-side={item.role} data-y={item.y}
            x1="18" x2="383" y1={py(item.y)} y2={py(item.y)}
            stroke="currentColor" strokeOpacity=".56" strokeDasharray="5 5"/>
          <text x="18" y={py(item.y)-5} fontSize="10"
            fill="currentColor">{"y="+fmt(item.y)}</text>
        </g>)}
        <line data-testid="asymptotic-jump-x-zero" x1={px(0)} x2={px(0)}
          y1="13" y2="242" stroke="currentColor" strokeOpacity=".38" />
        <path data-testid="asymptotic-jump-left" d={leftPath}
          stroke="#087f70" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path data-testid="asymptotic-jump-right" d={rightPath}
          stroke="#087f70" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <polygon data-testid="asymptotic-jump-left-arrow"
          points={[
            px(-12)+","+py(asymptoticJumpValue(p,-12)),
            (px(-12)+12)+","+(py(asymptoticJumpValue(p,-12))-6),
            (px(-12)+13)+","+(py(asymptoticJumpValue(p,-12))+5)
          ].join(" ")} fill="#087f70"/>
        <polygon data-testid="asymptotic-jump-right-arrow"
          points={[
            px(12)+","+py(asymptoticJumpValue(p,12)),
            (px(12)-12)+","+(py(asymptoticJumpValue(p,12))-5),
            (px(12)-12)+","+(py(asymptoticJumpValue(p,12))+6)
          ].join(" ")} fill="#087f70"/>
        <circle data-testid="asymptotic-jump-hollow" data-x="0" data-y={p.A-p.k}
          cx={px(0)} cy={py(p.A-p.k)} r="5.8"
          fill="var(--color-bg, white)" stroke="#087f70" strokeWidth="2.5"/>
        <circle data-testid="asymptotic-jump-filled" data-x="0" data-y={p.B}
          cx={px(0)} cy={py(p.B)} r="5.2" fill="#087f70" stroke="#087f70"/>
        <text x={px(0)} y="259" fontSize="11" textAnchor="middle"
          fill="currentColor">0</text>
        <text x="384" y="245" fontSize="12" fill="currentColor">x</text>
      </g>
    </svg>
    <figcaption>{pl?
      "Puste kółko to nieosiągnięta granica z lewej, pełne jest wartością f(0). Linie przerywane to nieosiągane asymptoty poziome.":
      "The hollow circle is the excluded left limit, the filled point is f(0). Dashed lines mark unattained horizontal asymptotes."}</figcaption>
    <details className="function-graph-text">
      <summary>{pl?"Opis wykresu w tekście":"Graph described in text"}</summary>
      <p>{desc}</p>
    </details>
  </figure>;
}
