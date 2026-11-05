import {referenceExpand,referenceRoots} from "../university/functions-audit";
import type {makeUniversityTask} from "../university/catalog";
import {formatRational as f,type AnswerInput} from "../answers";
import {wrongAcceptanceAnswer} from "./acceptance";
import {r,add,sub,mul,div,pow,sign,cmp,demand,convolution,derivative,evaluate,scaled,polyEqual,signsOnCells,glyph,type Rational} from "./batchFMath";

export const batchF=[
 {block:"F1",skills:["D02"],family:"derivative-product-point",level:"hard",variants:[0,1]},
 {block:"F1",skills:["D02"],family:"derivative-quadratic-quotient",level:"expert",variants:[0,1]},
 {block:"F1",skills:["D03"],family:"derivative-log-quadratic",level:"expert",variants:[0,1]},
 {block:"F1",skills:["D03"],family:"analysis-log-exp-derivative",level:"hard",variants:[0,1]},
 {block:"F1",skills:["D03"],family:"derivative-trig-special-point",level:"hard",variants:[0,1]},
 {block:"F1",skills:["D04"],family:"analysis-lhospital",level:"expert",variants:[0,11]},
 {block:"F1",skills:["D04"],family:"analysis-lhospital-infinity",level:"expert",variants:[0,1]},
 {block:"F1",skills:["D06"],family:"derivative-absolute-one-sided",level:"hard",variants:[0,1]},
 {block:"F1",skills:["D06"],family:"derivative-piecewise-point",level:"hard",variants:[1,2]},
 {block:"F1",skills:["D06"],family:"derivative-vertical-cusp",level:"expert",variants:[0,3]},
 {block:"F2",skills:["D05"],family:"derivative-extrema",level:"expert",variants:[0,1]},
 {block:"F2",skills:["D07"],family:"analysis-concavity",level:"advanced",variants:[0,11]},
 {block:"F2",skills:["D07"],family:"analysis-concavity",level:"expert",variants:[0,11]},
 {block:"F2",skills:["D05","D07","D08"],family:"analysis-study-polynomial",level:"advanced",variants:[0,11]},
 {block:"F2",skills:["D05","D07","D08"],family:"analysis-study-rational",level:"advanced",variants:[0,11]},
 {block:"F2",skills:["D05","D07","D09"],family:"derivative-sign-sketch",level:"expert",variants:[0,16]},
] as const;
type Task=ReturnType<typeof makeUniversityTask>;
export type FCertificate={input:AnswerInput;anchors:readonly (readonly string[])[];facts:readonly string[];choiceLabel?:string;firstSigns?:readonly number[];secondSigns?:readonly number[];zeroDescription?:string};
const scalar=(value:Rational,anchors:FCertificate["anchors"],facts:readonly string[]):FCertificate=>({input:f(value),anchors,facts});
const list=(values:readonly Rational[],anchors:FCertificate["anchors"],facts:readonly string[]):FCertificate=>({input:{kind:"list",values:values.map(f)},anchors,facts});
const inf=(s:number)=>s>0?"+∞":"−∞";
// Rendering only. Coefficients and intervals are independently derived first.
const polyText=(cs:readonly Rational[])=>cs.map((c,i)=>sign(c)===0?"":`(${f(c)})`+(i?"·x"+(["","","²","³"][i]??`^${i}`):"")).reverse().filter(Boolean).join(" + ")||"0";
const positiveText=(cuts:readonly Rational[],signs:readonly number[])=>{
 const b=[null,...cuts,null];
 return signs.flatMap((s,i)=>s>0?[`(${b[i]===null?"−∞":f(b[i]!)}; ${b[i+1]===null?"+∞":f(b[i+1]!)})`]:[]).join(" ∪ ")||"∅";
};

/** Only original task parameters. Never imports a production derivative,
 * sign-chart, root, study or sketch solver and never reads an answer field. */
export function batchFCertificate(task:Task):FCertificate {
 const p=task.university;
 switch(p.kind){
  case "derivative-product-point":{
   const expanded=convolution([p.b,p.a],[p.d,r(0),p.c]);
   const value=evaluate(derivative(expanded),p.at),u=add(mul(p.a,p.at),p.b),v=add(mul(p.c,pow(p.at,2)),p.d),dv=mul(r(2),mul(p.c,p.at));
   demand(cmp(value,add(mul(p.a,v),mul(u,dv)))===0,"Expansion and product rule agree");
   const h=f(p.at);
   return scalar(value,[[`u(x)=(${f(p.a)})x+(${f(p.b)})`,`v(x)=(${f(p.c)})x²+(${f(p.d)})`],[`u′(x)=${f(p.a)}`,`v′(x)=(2)(${f(p.c)})x`],[`u(${h})=${f(u)}`,`v(${h})=${f(v)}`,`v′(${h})=${f(dv)}`],[`f′(${h})=(${f(p.a)})(${f(v)})+(${f(u)})(${f(dv)})=${f(value)}`]],["domain R","differentiate independently expanded polynomial"]);
  }
  case "derivative-quadratic-quotient":{
   const n=evaluate([p.c,p.b,p.a],p.at),dn=evaluate(derivative([p.c,p.b,p.a]),p.at),d=evaluate([p.e,p.d],p.at),pole=div(sub(r(0),p.e),p.d);
   demand(sign(d)!==0&&cmp(p.at,pole)!==0,"Target excludes denominator pole");
   // Centered series division N(h+t)=D(h+t)*(c0+c1*t)+O(t²).
   const c0=div(n,d),c1=div(sub(dn,mul(c0,p.d)),d);
   demand(cmp(add(mul(c1,d),mul(c0,p.d)),dn)===0,"Linear series coefficient identity");
   const h=f(p.at);
   return scalar(c1,[[`N(x)=(${f(p.a)})x²+(${f(p.b)})x+(${f(p.c)})`,`D(x)=(${f(p.d)})x+(${f(p.e)})`],[`N′(x)=2(${f(p.a)})x+(${f(p.b)})`,`D′(x)=${f(p.d)}`],[`N(${h})=${f(n)}`,`N′(${h})=${f(dn)}`,`D(${h})=${f(d)}≠0`],["(N′(h)D(h)−N(h)D′(h))/(D(h))²"],[`f′(${h})=((${f(dn)})(${f(d)})−(${f(n)})(${f(p.d)}))/(${f(d)})²=${f(c1)}`]],[`excluded x=${f(pole)}`,"independent formal series division"]);
  }
  case "derivative-log-quadratic":{
   const u=evaluate([p.c,p.b,p.a],p.at),du=evaluate(derivative([p.c,p.b,p.a]),p.at),h=f(p.at),value=div(du,u);
   demand(sign(u)>0,"Log argument positive at target; continuity gives a neighborhood");
   return scalar(value,[["u(x)=",`(${f(p.a)})x²+(${f(p.b)})x+(${f(p.c)})`],[`u(${h})=${f(u)}>0`],[`u′(x)=2(${f(p.a)})x+(${f(p.b)})`,`u′(${h})=${f(du)}`],["u′(x)/u(x)"],[`f′(${h})=(${f(du)})/(${f(u)})=${f(value)}`]],["domain u(x)>0","derivative of log via independent polynomial coefficients"]);
  }
  case "analysis-log-exp-derivative":{
   demand(p.mode==="exp","Only bounded exp row");
   const m=f(p.coefficient),h=f(p.at);
   return scalar(p.coefficient,[[`u=(${m})(x−(${h}))`,`u'=${m}`,"f'=u'e^u"],[`u(${h})=0`,`f'(${h})=${m}e^0=${m}`]],["domain R","coefficient of t in exp(m*t) is m"]);
  }
  case "derivative-trig-special-point":{
   const angles={"0":[0,1],"π":[0,-1],"π/2":[1,0],"3π/2":[-1,0]} as const;
   const [s,c]=angles[p.phase];demand(p.mode!=="tan"||c!==0,"Tangent target excludes cos=0");
   const factor=p.mode==="sin"?c:p.mode==="cos"?-s:1/(c*c),value=add(mul(p.coefficient,r(p.innerSlope*factor)),p.linearSlope),h=f(p.at);
   return scalar(value,[[`u(${h}) = ${p.phase}`,`u′(x) = ${p.innerSlope}`],[`${p.mode==="sin"?"cos":p.mode==="cos"?"−sin":"1/cos²"}(${p.phase}) = ${factor}`],[`f′(${h}) = (${f(p.coefficient)})·(${p.innerSlope})·(${factor}) + (${f(p.linearSlope)}) = ${f(value)}`],[f(value)]],["exact unit-circle table","chain factor plus derivative of linear term",p.mode==="tan"?"domain cos(u)!=0":"domain R"]);
  }
  case "analysis-lhospital":{
   demand(p.mode==="exponential-two"&&sign(p.coefficient)!==0,"Bounded second-order exponential remainder");
   const m=p.coefficient,mm=mul(m,m),value=div(mm,r(2)),h=`(x−(${f(p.at)}))`;
   return scalar(value,[["N(a)=D(a)=0",`N'=${f(m)}(e^((${f(m)})${h})−1)`,`D'=2${h}`],[`N''=${f(mm)}e^((${f(m)})${h})`,`D''=2`],[`lim N''/D''=${f(value)}`]],["Taylor coefficient m²/2 independently gives limit","analytic numerator and denominator; original and first quotient 0/0","D'=2t!=0 on punctured neighborhood; D''=2!=0"]);
  }
  case "analysis-lhospital-infinity":{
   demand(p.mode==="log-power"&&sign(p.coefficient)>0&&p.power>0,"Positive log parameters on x>1");
   const m=f(p.coefficient),k=p.power,value=r(1,k);
   return scalar(value,[["x>1: N→+∞, D→+∞",`N'=${m}/(1+(${m})x)`,`D'=${k}x^${k-1}/(1+x^${k})`],[`N'/D'=(${m})(1+x^${k})/(${k}x^${k-1}(1+(${m})x))→${f(value)}`]],["log numerator=log x+bounded remainder","log denominator=k log x+vanishing remainder","both differentiable on x>1; denominator derivative strictly positive"]);
  }
  case "derivative-absolute-one-sided":{
   const left=sub(p.b,p.a),right=add(p.b,p.a),h=f(p.h);demand(cmp(left,right)!==0,"Genuine absolute-value corner");
   return {input:{kind:"choice",value:"slope:0"},choiceLabel:`f′₋(${h}) = ${f(left)}; f′₊(${h}) = ${f(right)}`,anchors:[["|x−h|=−(x−h)"],[`f′₋(${h}) = (${f(p.b)}) − (${f(p.a)}) = ${f(left)}`],[`f′₊(${h}) = (${f(p.b)}) + (${f(p.a)}) = ${f(right)}`],[`f′₋(${h}) ≠ f′₊(${h})`]],facts:["continuous absolute-value function","two exact finite difference quotient limits differ"]};
  }
  case "derivative-piecewise-point":{
   const continuous=sign(p.jump)===0,equal=cmp(p.leftSlope,p.rightSlope)===0,state=!continuous?2:equal?0:1,h=f(p.h);
   return {input:{kind:"choice",value:`derivative:${state}`},anchors:[[`f(${h}) = ${f(p.at)}`,`lim x→${h}⁻ f(x) = ${f(p.at)}`],[`lim x→${h}⁺ f(x) = ${f(add(p.at,p.jump))}`],...(!continuous?[[`lim x→${h}⁺ f(x) ≠ f(${h})`]]:[[`f′₋(${h}) = ${f(p.leftSlope)}`,`f′₊(${h}) = ${f(p.rightSlope)}`],[`f′₋(${h}) ${equal?"=":"≠"} f′₊(${h})`]])],facts:[continuous?"left and right limits equal f(h)":"right quotient jump/t+rightSlope has infinite limit; discontinuity",equal?"slopes agree":"slopes differ"]};
  }
  case "derivative-vertical-cusp":{
   const s=sign(p.coefficient);demand(s!==0,"Nonzero singular term");
   const left=p.mode==="vertical"?s:-s,right=s,h=f(p.at),k=f(p.coefficient),b=f(p.linear);
   const quotient=p.mode==="vertical"?`(${k})/|t|^(2/3)+(${b})`:`(${k})·sgn(t)/|t|^(1/3)+(${b})`;
   return {input:{kind:"choice",value:left===right?"vertical":"cusp"},anchors:[[`t=x−(${h})`,`f(${h})=${f(p.constant)}`],[`(f(${h}+t)−f(${h}))/t=${quotient}`],[`t→0⁻: ${inf(left)}`,`t→0⁺: ${inf(right)}`],[`f′(${h})`]],facts:["both functions continuous at h","derive signed difference quotient from root/absolute-power input","infinite one-sided quotients are not finite derivatives"]};
  }
  case "derivative-analysis":{
   demand(p.target==="classification","Classification row only");
   const coefficients=referenceExpand(p.formula),d=derivative(coefficients),dd=derivative(d);
   const roots=referenceRoots(d).sort(cmp),signs=signsOnCells(x=>evaluate(d,x),roots);
   demand(d.length===3&&roots.length>=1,"Bounded cubic derivative has one/two rational roots");
   const types=roots.map((_,i)=>signs[i]===signs[i+1]?"none":signs[i]<signs[i+1]?"min":"max");
   const anchors:string[][]=[];
   if(p.formula.kind==="composition"){
    const outer=p.formula.outer,inner=p.formula.inner;
    anchors.push([`F(x) = ${polyText(outer)}`,`g(x) = ${polyText(inner)}`,"f(x) = F(g(x))"],[`F′(x) = ${polyText(derivative(outer))}`],[`g′(x) = ${polyText(derivative(inner))}`],[`f′(x) = F′(g(x))·g′(x) = ${polyText(d)}`]);
   }else {demand(p.formula.kind==="polynomial","Bounded noncomposite polynomial");anchors.push([`f′(x) = ${polyText(d)}`]);}
   const [c,b,a]=d,delta=sub(pow(b,2),mul(r(4),mul(a,c)));
   // Sum/difference of exact roots supplies sqrt(delta), avoiding production sqrt.
   const root=mul(a,sub(roots.at(-1)!,roots[0]));
   const nonnegativeRoot=sign(root)<0?sub(r(0),root):root;
   demand(cmp(pow(nonnegativeRoot,2),delta)===0,"Exact discriminant certificate");
   anchors.push([`Δ = (${f(b)})² − 4·(${f(a)})·(${f(c)}) = ${f(delta)}`,`√Δ = ${f(nonnegativeRoot)}`],[`f′(x) = 0 ⇔ x ∈ {${roots.map(f).join("; ")}}`]);
   roots.forEach((x,i)=>{
    demand(sign(evaluate(d,x))===0,"Stationary root substitution");
    const curvature=evaluate(dd,x);demand(types[i]==="none"?sign(curvature)===0:types[i]==="min"?sign(curvature)>0:sign(curvature)<0,"Curvature consistent with actual sign change");
    anchors.push([`(${f(x)}; ${f(evaluate(coefficients,x))}): f″(${f(x)}) = ${f(curvature)}`]);
   });
   anchors.push([`{x: f′(x)>0} = ${positiveText(roots,signs)}`]);
   return {input:{kind:"choice",value:"ext:"+types.join("-")},anchors,firstSigns:signs,facts:["independent reference AST expansion","all derivative roots certified by quadratic degree/discriminant","extrema from actual derivative sign transitions, including stationary nonextremum"]};
  }
  case "analysis-concavity":{
   demand(p.mode==="quartic"||p.mode==="mixed","Selected quartic/mixed modes");
   const cs=[p.shift,r(0),r(0),p.mode==="mixed"?p.cubic:r(0),p.coefficient],d=derivative(cs),dd=derivative(d);
   const ts=referenceRoots(dd).sort(cmp),xs=ts.map(t=>add(p.at,t)),signs=signsOnCells(t=>evaluate(dd,t),ts);
   const changes=ts.filter((_,i)=>signs[i]!==signs[i+1]);
   const m=f(p.coefficient),a=f(p.at),h=`(x−(${a}))`;
   if(p.mode==="quartic"){
    demand(changes.length===0,"Double zero is not an inflection");
    return {input:{kind:"choice",value:"inflection-none"},anchors:[[`f'=4(${m})${h}³`,`f''=12(${m})${h}²`],[`f''(${a})=0`,`x<${a}: ${glyph(signs[0])}`,`x>${a}: ${glyph(signs[1])}`]],secondSigns:signs,facts:["independent second derivative polynomial","same sign across double zero; no inflection"]};
   }
   demand(changes.length===2,"Two distinct simple inflections");
   const lo=f(xs[0]),hi=f(xs[1]),c=f(p.cubic);
   return {input:{kind:"roots",classification:"two",values:xs.map(f)},anchors:[[`f'=4(${m})${h}³+3(${c})${h}²`],[`f''=12(${m})${h}²+6(${c})${h}=6${h}(2(${m})${h}+(${c}))`],[`x=${lo}`,`x=${hi}`,`(−∞,${lo}): ${glyph(signs[0])}`,`(${lo},${hi}): ${glyph(signs[1])}`,`(${hi},+∞): ${glyph(signs[2])}`]],secondSigns:signs,facts:["independent second differentiation and exact roots","sign change at both simple zeros; both lie in R"]};
  }
  case "analysis-study-polynomial":
  case "analysis-study-rational":{
   demand(p.target==="stationary"&&sign(p.coefficient)!==0,"Selected original complete-study slice");
   const m=p.coefficient,a=p.at,left=sub(a,r(1)),right=add(a,r(1)),h=`(x−(${f(a)}))`,sgn=sign(m);
   if(p.kind==="analysis-study-polynomial"){
    const original=[r(0),mul(r(-3),m),r(0),m],d=derivative(original),dd=derivative(d);
    demand(polyEqual(d,scaled([r(-1),r(0),r(1)],mul(r(3),m))),"Cubic derivative factorization");
    const first=signsOnCells(t=>evaluate(d,t),[r(-1),r(1)]),second=signsOnCells(t=>evaluate(dd,t),[r(0)]);
    const vals=[left,evaluate(original,r(-1)),right,evaluate(original,r(1))];
    const cert=list(vals,[["D=R", "f(a+t)=m(t³−3t)","f(a−t)=−f(a+t)"],[`t(t²−3)=0 ⇔ x=${f(a)}−√3, ${f(a)}, ${f(a)}+√3`],[`x→+∞: f→${inf(sgn)}`,`x→−∞: f→${inf(-sgn)}`,`f(x)/x→${inf(sgn)}`],[`f'=3(${f(m)})(${h}²−1)`,`x=${f(left)}`,`x=${f(right)}`],[`(−∞,${f(left)}): ${glyph(first[0])}`,`(${f(left)},${f(right)}): ${glyph(first[1])}`,`(${f(right)},+∞): ${glyph(first[2])}`],[`f(${f(left)})=${f(vals[1])}`,`f(${f(right)})=${f(vals[3])}`],[`f''=6(${f(m)})${h}`,`x<${f(a)}: ${glyph(second[0])}`,`x>${f(a)}: ${glyph(second[1])}`,`(${f(a)},0)`]],["domain R; exact zeros a,a±sqrt(3) from factorization","cubic dominance proves both limits and no linear asymptote","all first/second derivative signs; extrema and inflection by sign changes"]);
    return {...cert,firstSigns:first,secondSigns:second,zeroDescription:"a, a−sqrt(3), a+sqrt(3)"};
   }
   const original=(t:Rational)=>mul(m,add(t,div(r(1),t))),d=(t:Rational)=>mul(m,sub(r(1),div(r(1),pow(t,2)))),dd=(t:Rational)=>div(mul(r(2),m),pow(t,3));
   const first=signsOnCells(d,[r(-1),r(0),r(1)]),second=signsOnCells(dd,[r(0)]),vals=[left,original(r(-1)),right,original(r(1))];
   const cert=list(vals,[[`D=R\\{${f(a)}}`,"f(a+t)=m(t+1/t)","f(a−t)=−f(a+t)"],["f=0 ⇔ t²+1=0 (t≠0)"],[`x→${f(a)}⁻: f→${inf(-sgn)}`,`x→${f(a)}⁺: f→${inf(sgn)}`,`x=${f(a)}`],[`f(x)−(${f(m)})${h}=(${f(m)})/${h}→0`],[`f'=(${f(m)})(1−1/${h}²)`,`x=${f(left)}`,`x=${f(right)}`],[`(−∞,${f(left)}): ${glyph(first[0])}`,`(${f(left)},${f(a)}): ${glyph(first[1])}`,`(${f(a)},${f(right)}): ${glyph(first[2])}`,`(${f(right)},+∞): ${glyph(first[3])}`],[`f(${f(left)})=${f(vals[1])}`,`f(${f(right)})=${f(vals[3])}`],[`f''=2(${f(m)})/${h}³`,`x<${f(a)}: ${glyph(second[0])}`,`x>${f(a)}: ${glyph(second[1])}`]],["domain t!=0; t²+1>0 proves no real zeros","Laurent differentiation gives both derivatives exactly","pole limits opposite; residual m/t tends to zero at both infinities","no inflection at excluded pole; extrema from signs"]);
   return {...cert,firstSigns:first,secondSigns:second,zeroDescription:"no real zeros"};
  }
  case "derivative-sign-sketch":{
   const a=r(p.pole),s=r(p.radius),e=r(p.orientation),v=r(p.verticalShift);demand(p.radius>0,"Positive radius");
   const original=(t:Rational)=>add(mul(e,add(t,div(pow(s,2),t))),v),d=(t:Rational)=>mul(e,sub(r(1),div(pow(s,2),pow(t,2)))),dd=(t:Rational)=>div(mul(r(2),mul(e,pow(s,2))),pow(t,3));
   const first=signsOnCells(d,[sub(r(0),s),r(0),s]),second=signsOnCells(dd,[r(0)]),left=sub(a,s),right=add(a,s),yl=original(sub(r(0),s)),yr=original(s),A=f(a),S=f(pow(s,2)),E=f(e),V=f(v);
   const cert=list([left,yl,right,yr],[[`D = ℝ \\ {${A}}`,`x = ${A}`],[`y = ${E}·(x−(${A})) + (${V})`],[`f′(x) = ${E}·[1−${S}/(x−(${A}))²]`,`x=${f(left)}`,f(right)],[`f′: ${glyph(first[0])}, ${glyph(first[1])}`,`| x=${A}`,`| ${glyph(first[2])}, ${glyph(first[3])}`],[`f(${f(left)})=${f(yl)}`,`f(${f(right)})=${f(yr)}`],[`f″(x) = ${f(mul(r(2),mul(e,pow(s,2))))}/(x−(${A}))³`,`f″: ${glyph(second[0])} (x<${A}), ${glyph(second[1])} (x>${A})`],[`x=${A}`,`(${f(left)}, ${f(yl)})`,`(${f(right)}, ${f(yr)})`]],["original Laurent function; pole excluded","exact derivative signs classify both extrema and concavity","oblique residual e*s²/t vanishes; no inflection at pole","only extremum coordinates graded; paper sketch self-assessed"]);
   return {...cert,firstSigns:first,secondSigns:second};
  }
  default:throw Error("Outside Batch F manifest: "+p.kind);
 }
}
export const batchFOracle=(task:Task)=>batchFCertificate(task).input;
export function wrongBatchF(answer:AnswerInput,task:Task):AnswerInput {
 if(typeof answer==="string")return answer==="0"?"1":"0";
 if(answer.kind==="roots")return {...answer,classification:"none",values:[]};
 return wrongAcceptanceAnswer(answer,task);
}
