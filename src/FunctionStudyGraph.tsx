import {useId} from "react";
import type {Locale} from "./locales/types";
import type {FunctionStudyFollowupProblem} from "./university/functionStudyFollowup";
import {buildStudyPlot,type PlotPoint} from "./university/functionStudyPlot";

/** Exact landmark labels and independent non-answer-changing SVG visualization. */
export function FunctionStudyGraph({problem,locale}:{problem:FunctionStudyFollowupProblem;locale:Locale}){
 const id=useId().replace(/:/g,"");
 const plot=buildStudyPlot(problem);
 const pl=locale==="pl";
 const chartTitle=pl?"Wykres badanej funkcji":"Studied function graph";
 const explanation=pl?plot.descriptionPl:plot.descriptionEn;
 const left=42,right=462,top=17,bottom=246;
 const range=plot.zMax-plot.zMin;
 const x=(u:number)=>left+(u+3)*((right-left)/6);
 const y=(z:number)=>bottom-(z-plot.zMin)*(bottom-top)/range;
 const path=(pts:readonly PlotPoint[])=>pts.map((v,i)=>(i===0?"M":"L")+x(v.u).toFixed(2)+" "+y(v.z).toFixed(2)).join(" ");
 const titleId="study-plot-title-"+id,descId="study-plot-desc-"+id;
 const refY=y(0);
 return <figure className="function-graph function-study-graph" data-study-plot={problem.kind}>
  <svg viewBox="0 0 500 284" role="img" focusable="false" aria-labelledby={titleId+" "+descId}>
   <title id={titleId}>{chartTitle}</title>
   <desc id={descId}>{explanation}</desc>
   <defs><clipPath id={"study-clip-"+id}><rect x={left} y={top} width={right-left} height={bottom-top}/></clipPath></defs>
   <g aria-hidden="true">
    <rect x={left} y={top} width={right-left} height={bottom-top} fill="none" stroke="currentColor" strokeOpacity=".22"/>
    <line x1={left} x2={right} y1={refY} y2={refY} stroke="currentColor" strokeDasharray="3 5" strokeOpacity=".5"/>
    <line x1={x(0)} x2={x(0)} y1={top} y2={bottom} stroke="currentColor" strokeDasharray="4 4" strokeOpacity=".5"/>
    {plot.ticks.map(tick=><g key={tick.u}>
     <line x1={x(tick.u)} x2={x(tick.u)} y1={bottom} y2={bottom+5} stroke="currentColor"/>
     <text x={x(tick.u)} y={bottom+21} textAnchor="middle" fontSize="11" fill="currentColor">{tick.label}</text>
    </g>)}
    <text x={left+3} y={top+14} fontSize="11" fill="currentColor">{pl?"y=k=":"y=k="}{plot.referenceY}</text>
    <text x={right} y={bottom+32} fontSize="11" fill="currentColor" textAnchor="end">x</text>
    <g clipPath={"url(#study-clip-"+id+")"}>
     {plot.oblique&&<path data-testid="study-oblique-asymptote" d={path(plot.oblique)} fill="none" stroke="#a36f16" strokeDasharray="7 5" strokeWidth="2"/>}
     {plot.paths.map((points,i)=><path key={i} data-testid="study-curve" d={path(points)}
      fill="none" stroke="#087f70" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>)}
     {plot.critical.map((p,i)=><circle data-testid="study-critical" key={i} cx={x(p.u)} cy={y(p.z)}
      r="4.5" stroke="#053e33" strokeWidth="1.5" fill="#f4f9f5"/>)}
    </g>
   </g>
  </svg>
  <figcaption>{pl?
   "Wykres w skali dopasowanej do funkcji; linie pomocnicze oznaczają x=a i y=k, niekoniecznie osie OX i OY.":
   "Plot scaled to the function; reference lines mark x=a and y=k, not necessarily the x/y axes."}</figcaption>
  <details className="function-graph-text">
   <summary>{pl?"Dokładne punkty i opis wykresu":"Exact coordinates and graph description"}</summary>
   <p>{explanation}</p>
   <p>{pl?"Punkty stacjonarne: ":"Stationary points: "}
    {plot.critical.map(p=>"("+p.xLabel+"; "+p.yLabel+")").join("; ")}.
   </p>
   {plot.verticalAsymptote&&<p>{pl?"Asymptota pionowa":"Vertical asymptote"}: x={plot.referenceX}.</p>}
  </details>
 </figure>;
}
