import {useId} from "react";
import type {Locale} from "./locales/types";
import {asymptotes,middleValue,outerHeight,type GraphAsymptoteRangeProblem} from "./university/graphAsymptoteRange";

const fmt=(x:number)=>String(x).replace("-","−");
const clamp=(y:number)=>Math.max(-4.75,Math.min(4.75,y));
export function AsymptoteRangeDisplay({problem:p,locale}:{problem:GraphAsymptoteRangeProblem;locale:Locale}){
 const uid=useId().replace(/:/g,""),pl=locale==="pl",[a,b]=asymptotes(p);
 const xmin=a-5,xmax=b+5,px=(x:number)=>34+(x-xmin)*341/(xmax-xmin),py=(y:number)=>128-20.7*y;
 const series=Array.from({length:159},(_,i)=>{
  const x=a+(b-a)*(i+1)/160;
  return {x,y:clamp(middleValue(p,x))};
 });
 const path=series.map((v,i)=>(i===0?"M ":"L ")+px(v.x)+" "+py(v.y)).join(" ");
 const [leftOuter,rightOuter]=[[a-4,a-2],[b+2,b+4]];
 const text=(pl?"Pionowe asymptoty x = ":"Vertical asymptotes at x = ")+fmt(a)+", "+fmt(b)+". "+
  (pl?"Środkowa gałąź ciągła między asymptotami; strzałkowy kierunek jest widoczny na krańcach rysunku. "
     :"Middle branch continuous between the poles; its direction is shown near the chart edges. ")+
  (pl?"Dwa zewnętrzne domknięte poziome odcinki na wysokości y = ":"Two closed horizontal outer segments at y = ")+
  fmt(outerHeight(p))+".";
 return <figure className="function-graph" data-graph-kind={p.kind}>
  <svg role="img" viewBox="0 0 400 260" aria-labelledby={"ar-title-"+uid+" ar-desc-"+uid} focusable="false">
   <title id={"ar-title-"+uid}>{pl?"Wykres funkcji z dwiema asymptotami":"Graph with two vertical asymptotes"}</title>
   <desc id={"ar-desc-"+uid}>{text}</desc>
   <g aria-hidden="true">
    {[-4,-2,0,2,4].map(y=><g key={y}>
     <line x1={21} x2={387} y1={py(y)} y2={py(y)} stroke="currentColor" strokeOpacity={y===0?0.65:0.13}/>
     <text x="18" y={py(y)+4} fontSize="11" textAnchor="end" fill="currentColor">{y}</text>
    </g>)}
    {xmin<=0&&xmax>=0&&<line x1={px(0)} x2={px(0)} y1={12} y2={226} stroke="currentColor" strokeOpacity="0.4"/>}
    {[a-4,a,a+p.radius,b,b+4].map((x,i)=><g key={i}>
     <line x1={px(x)} x2={px(x)} y1={15} y2={225} stroke="currentColor" strokeOpacity="0.08"/>
     <text x={px(x)} y={242} fontSize="11" textAnchor="middle" fill="currentColor">{fmt(x)}</text>
    </g>)}
    {[a,b].map((x,i)=><g key={i}>
      <line data-testid={i===0?"asymptote-left":"asymptote-right"}
       data-x={x} x1={px(x)} x2={px(x)} y1={18} y2={226}
       stroke="#9b6026" strokeWidth="2" strokeDasharray="6 5"/>
    </g>)}
    <path data-testid="asymptote-middle-path" d={path} stroke="#087f70"
      strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    {[leftOuter,rightOuter].map(([x0,x1],i)=><g key={i}>
      <line data-testid="asymptote-outer-segment"
       x1={px(x0)} y1={py(outerHeight(p))} x2={px(x1)} y2={py(outerHeight(p))}
       stroke="#087f70" strokeWidth="3.5" strokeLinecap="round"/>
      {[x0,x1].map((x,j)=><circle key={j} r="4.6" cx={px(x)} cy={py(outerHeight(p))}
       fill="#087f70"/>)}
    </g>)}
    <text x="384" y={py(0)-8} textAnchor="end" fontSize="12" fill="currentColor">x</text>
   </g>
  </svg>
  <figcaption>{pl?
   "Gałąź środkowa biegnie poza obszar wykresu ku nieskończoności. Linie przerywane są wyłączone z dziedziny; dwa odcinki zewnętrzne są domknięte.":
   "The middle curve continues beyond the viewport toward infinity. Dashed poles are excluded from the domain; both outer segments have filled endpoints."}</figcaption>
  <details className="function-graph-text">
    <summary>{pl?"Opis wykresu w tekście":"Graph described in text"}</summary>
    <p>{text}</p>
  </details>
 </figure>;
}
