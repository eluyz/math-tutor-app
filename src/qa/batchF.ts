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
] as const;
type Task=ReturnType<typeof makeUniversityTask>;
export type FCertificate={input:AnswerInput;anchors:readonly (readonly string[])[];facts:readonly string[];choiceLabel?:string;firstSigns?:readonly number[];secondSigns?:readonly number[];zeroDescription?:string};
const scalar=(value:Rational,anchors:FCertificate["anchors"],facts:readonly string[]):FCertificate=>({input:f(value),anchors,facts});
const list=(values:readonly Rational[],anchors:FCertificate["anchors"],facts:readonly string[]):FCertificate=>({input:{kind:"list",values:values.map(f)},anchors,facts});
const inf=(s:number)=>s>0?"+∞":"−∞";

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
  default:throw Error("Outside Batch F manifest: "+p.kind);
 }
}
export const batchFOracle=(task:Task)=>batchFCertificate(task).input;
export function wrongBatchF(answer:AnswerInput,task:Task):AnswerInput {
 if(typeof answer==="string")return answer==="0"?"1":"0";
 if(answer.kind==="roots")return {...answer,classification:"none",values:[]};
 return wrongAcceptanceAnswer(answer,task);
}
