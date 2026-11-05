import type { makeUniversityTask } from "../university/catalog";
import { formatRational as f, type AnswerInput } from "../answers";
import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational } from "../rational";

/** Bounded, synthetic method evidence. These IDs confer no source acceptance. */
export const batchE = [
  {block:"E1",skill:"I01",family:"integral-direct-product",level:"expert",variants:[0,1]},
  {block:"E1",skill:"I02",family:"integral-table",level:"medium",variants:[0,1]},
  {block:"E1",skill:"I02",family:"integral-table",level:"hard",variants:[0,1]},
  {block:"E1",skill:"I02",family:"integral-table-arctan",level:"expert",variants:[0,4]},
  {block:"E1",skill:"I03",family:"integral-log-substitution",level:"advanced",variants:[0,1]},
  {block:"E1",skill:"I03",family:"integral-substitution-definite",level:"advanced",variants:[0,3]},
  {block:"E1",skill:"I04",family:"integral-parts",level:"expert",variants:[0,1]},
  {block:"E1",skill:"I04",family:"integral-parts-trig-linear",level:"advanced",variants:[0,1]},
] as const;

type Task = ReturnType<typeof makeUniversityTask>;
export type Poly = readonly Rational[];
export const sign = (x:Rational) => x.numerator < 0n ? -1 : x.numerator > 0n ? 1 : 0;
export const power = (x:Rational,n:number):Rational => {
  if (!Number.isInteger(n)||n<0) throw Error("Nonnegative integer power required");
  return Array.from({length:n}).reduce<Rational>(a=>mul(a,x),r(1));
};
export const convolution = (a:Poly,b:Poly):Rational[] => {
  const out=Array.from({length:a.length+b.length-1},()=>r(0));
  a.forEach((x,i)=>b.forEach((y,j)=>out[i+j]=add(out[i+j],mul(x,y))));
  return out;
};
export const derivative = (a:Poly):Rational[] => a.slice(1).map((x,i)=>mul(r(i+1),x));
export const integrate = (a:Poly):Rational[] => [r(0),...a.map((x,i)=>div(x,r(i+1)))];
export const evaluate = (a:Poly,x:Rational):Rational => a.reduceRight((v,c)=>add(mul(v,x),c),r(0));
export const integral = (a:Poly,lo:Rational,hi:Rational):Rational => sub(evaluate(integrate(a),hi),evaluate(integrate(a),lo));
const factorial = (n:number):number => n<2?1:n*factorial(n-1);
const same = (a:Rational,b:Rational) => sign(sub(a,b))===0;
const require = (condition:boolean,message:string) => { if(!condition)throw Error(message); };
const polyEqual = (a:Poly,b:Poly) => Array.from({length:Math.max(a.length,b.length)},(_,i)=>same(a[i]??r(0),b[i]??r(0))).every(Boolean);
const scaled = (a:Poly,k:Rational) => a.map(x=>mul(x,k));
const primitive = (coefficients:Poly,basis:readonly string[],checks:readonly string[]) => ({
  input:{kind:"primitive",coefficients:coefficients.map(f),hasConstant:true} as AnswerInput,basis,checks,
});
const scalar = (value:Rational,checks:readonly string[]) => ({input:f(value) as AnswerInput,basis:[] as string[],checks});
const limit = (value:Rational|null,k:Rational,checks:readonly string[]) => ({
  input:{kind:"limit",classification:value!==null?"finite":sign(k)>0?"positive-infinity":"negative-infinity",value:value!==null?f(value):""} as AnswerInput,basis:[] as string[],checks,
});

/** Inputs only: no production solver, primitive builder, answer or answer choices.
 * Rational arithmetic is shared infrastructure; calculus identities below are independent. */
export function batchECertificate(task:Task):{input:AnswerInput;basis:readonly string[];checks:readonly string[]} {
  const p=task.university;
  switch(p.kind){
    case "integral-direct-product": {
      const expanded=convolution(p.linear,p.quadratic),anti=integrate(expanded);
      require(polyEqual(derivative(anti),expanded),"Product primitive derivative");
      return primitive(anti.slice(1),expanded.map((_,i)=>`x^${i+1}`),["independent convolution","D(F)=expanded product on R"]);
    }
    case "integral-table-arctan": {
      require(sign(p.a)!==0,"Nonzero inner derivative");
      const c=div(p.k,p.a);
      require(same(mul(c,p.a),p.k),"Arctan chain factor");
      return primitive([c],[`arctan((${f(p.a)})x+(${f(p.b)}))`],["1+(ax+b)^2>0 on R","arctan chain rule"]);
    }
    case "integral-log-substitution": {
      require(sign(p.c)>0&&sign(p.a)!==0,"Positive logarithm argument");
      const u=[add(mul(p.b,p.b),p.c),mul(r(2),mul(p.a,p.b)),mul(p.a,p.a)];
      require(polyEqual(scaled(derivative(u),p.k),[mul(r(2),mul(p.k,mul(p.a,p.b))),mul(r(2),mul(p.k,mul(p.a,p.a)))]),"Log numerator identity");
      return primitive([p.k],[`ln(((${f(p.a)})x+(${f(p.b)}))²+(${f(p.c)}))`],["u>0 on R","k*u'/u equals original integrand"]);
    }
    case "integral-substitution-definite": {
      const u=[p.c,p.b,r(1)];
      let un:Poly=[r(1)]; for(let i=0;i<p.n;i++)un=convolution(un,u);
      const original=scaled(convolution(derivative(u),un),p.k);
      const lo=evaluate(u,p.lower),hi=evaluate(u,p.upper);
      const transformed=mul(div(p.k,r(p.n+1)),sub(power(hi,p.n+1),power(lo,p.n+1)));
      const direct=integral(original,p.lower,p.upper);
      require(same(direct,transformed),"Both substituted bounds and orientation");
      require(same(integral(original,p.upper,p.lower),sub(r(0),direct)),"Reversed integration bounds");
      return scalar(direct,["continuous polynomial: Newton-Leibniz valid","expanded original integrand","both u bounds and reversed orientation"]);
    }
    case "integral-parts-trig-linear": {
      require(sign(p.a)!==0,"Nonzero trig frequency");
      const first=mul(r(p.mode==="sin"?-1:1),div(p.k,p.a)),second=div(p.k,mul(p.a,p.a));
      require(same(mul(first,mul(p.a,r(p.mode==="sin"?-1:1))),p.k),"x term after derivative");
      require(same(add(first,mul(second,mul(p.a,r(p.mode==="sin"?1:-1)))),r(0)),"Constant trig terms cancel");
      const inside=`(${f(p.a)})x+(${f(p.b)})`,other=p.mode==="sin"?"cos":"sin";
      return primitive([first,second],[`x ${other}(${inside})`,`${p.mode}(${inside})`],["product and chain rules","non-x trig terms cancel on R"]);
    }
    case "integral": {
      require(sign(p.a)!==0,"Nonzero exponential/trig coefficient");
      const a=f(p.a),b=f(p.b),inside=`(${a})x+(${b})`;
      if(p.method==="table"){
        const c=mul(r(p.mode==="sin"?-1:1),div(p.k,p.a));
        require(same(mul(c,mul(p.a,r(p.mode==="sin"?-1:1))),p.k),"Table derivative factor");
        const basis=p.mode==="sin"?`cos(${inside})`:p.mode==="cos"?`sin(${inside})`:p.mode==="exp"?`e^(${inside})`:`ln|${inside}|`;
        return primitive([c],[basis],["table derivative and chain rule",p.mode==="reciprocal"?"each connected component ax+b!=0; independent constants":"domain R"]);
      }
      if(p.method==="parts"){
        // Closed factorial coefficients, rather than the production recurrence.
        const cs=Array.from({length:p.n+1},(_,j)=>mul(p.k,div(r((-1)**(p.n-j)*factorial(p.n)/factorial(j)),power(p.a,p.n-j+1))));
        const d=derivative(cs),identity=cs.map((c,j)=>add(mul(p.a,c),d[j]??r(0)));
        require(polyEqual(identity,Array.from({length:p.n+1},(_,j)=>j===p.n?p.k:r(0))),"P'+aP=k*x^n");
        return primitive([...cs].reverse(),Array.from({length:p.n+1},(_,i)=>p.n-i?`x^${p.n-i}e^((${a})x)`:`e^((${a})x)`),["closed factorial oracle","D(e^(ax)P)=e^(ax)(P'+aP) on R"]);
      }
      throw Error("Integral method outside bounded manifest: "+p.method);
    }
    default:throw Error("Uncovered Batch E form: "+p.kind);
  }
}
export const batchEOracle = (task:Task):AnswerInput => batchECertificate(task).input;
/** Guaranteed mathematical error, without looking at production choices. */
export function wrongBatchE(answer:AnswerInput):AnswerInput {
  if(typeof answer==="string")return answer==="0"?"1":"0";
  if(answer.kind==="primitive")return {...answer,coefficients:answer.coefficients.map((x,i)=>i===0?(x==="0"?"1":"0"):x)};
  if(answer.kind==="limit")return answer.classification==="finite"?{...answer,value:answer.value==="0"?"1":"0"}:{...answer,classification:"finite",value:"0"};
  if(answer.kind==="choice")return {...answer,value:"convergent"};
  throw Error("Unexpected Batch E input");
}
