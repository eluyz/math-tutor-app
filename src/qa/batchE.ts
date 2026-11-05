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
  {block:"E2",skill:"I05",family:"integral-recurring",level:"expert",variants:[0,1]},
  {block:"E2",skill:"I06",family:"integral-improper-infinity",level:"expert",variants:[0,1]},
  {block:"E2",skill:"I06",family:"integral-improper-interior-power",level:"advanced",variants:[0,1]},
  {block:"E2",skill:"I06",family:"integral-improper-interior-pv",level:"advanced",variants:[0,1]},
  {block:"E2",skill:"I07",family:"integral-area-parabolas",level:"hard",variants:[0,3]},
  {block:"E2",skill:"I07",family:"integral-area-horizontal-slices",level:"hard",variants:[0,1]},
  {block:"E2",skill:"I08",family:"integral-arc-length",level:"hard",variants:[0,1]},
  {block:"E2",skill:"I08",family:"integral-arc-parametric",level:"advanced",variants:[0,3]},
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
    case "integral-improper-infinity": {
      require(sign(p.a)>0&&sign(p.k)!==0,"No finite-domain pole, nonzero coefficient");
      if(p.power===1)return limit(null,p.k,["log(T+a) tends to +infinity","one infinite endpoint; sign k controls divergence"]);
      // Antiderivative -k/((p-1)(x+a)^(p-1)); derivative is k/(x+a)^p.
      const c=div(sub(r(0),p.k),r(p.power-1));
      require(same(mul(c,r(1-p.power)),p.k),"Power-rule derivative");
      const atZero=div(c,power(p.a,p.power-1));
      return limit(sub(r(0),atZero),p.k,["negative power tends to zero at +infinity","F(infinity)-F(0); no interior pole"]);
    }
    case "integral-improper-interior-power": {
      require(sign(p.leftRoot)>0&&sign(p.rightRoot)>0&&sign(p.k)!==0,"Two nonempty sides of singularity");
      if(p.power==="half"){
        // On each side x=h±z²: k/|x-h|^(1/2)|dx| = 2k dz.
        const left=integral([mul(r(2),p.k)],r(0),p.leftRoot);
        const right=integral([mul(r(2),p.k)],r(0),p.rightRoot);
        return limit(add(left,right),p.k,["independent left limit via distance=z^2","independent right limit via distance=z^2"]);
      }
      return limit(null,p.k,[p.power==="one"?"left: -k log(epsilon) diverges":"left: k/epsilon diverges",p.power==="one"?"right: -k log(delta) diverges":"right: k/delta diverges"]);
    }
    case "integral-improper-interior-pv": {
      require(sign(p.leftLength)>0&&sign(p.rightLength)>0&&sign(p.k)!==0,"Interior pole with two sides");
      // Independent cutoffs: k(log eps-log L) and k(log R-log delta).
      // Each diverges; only imposing eps=delta gives the finite principal value.
      const ratio=div(p.rightLength,p.leftLength);
      return {input:{kind:"choice",value:same(ratio,r(1))?"divergent-pv-zero":"divergent-pv-nonzero"},basis:[],checks:["left infinity sign=-sign(k)","right infinity sign=sign(k)","ordinary integral diverges; PV=k log(R/L)"]};
    }
    case "integral-area-parabolas": {
      // Expand both ORIGINAL curves in t=x-center, subtract their coefficients.
      const top=[add(mul(p.a,power(p.shift,2)),p.offset),mul(r(-2),mul(p.a,p.shift)),p.a];
      const bottom=[add(add(mul(p.a,power(p.shift,2)),p.offset),mul(p.delta,power(p.radius,2))),mul(r(-2),mul(p.a,p.shift)),sub(p.a,p.delta)];
      const difference=top.map((x,i)=>sub(x,bottom[i]));
      require(sign(p.radius)>0&&sign(p.delta)!==0&&sign(p.a)!==0&&sign(bottom[2])!==0,"Two genuine parabolas");
      const lo=sub(p.lower,p.center),hi=sub(p.upper,p.center);
      const roots=[sub(r(0),p.radius),p.radius];
      for(const root of roots)require(same(evaluate(difference,root),r(0)),"Intersection solves original equality");
      const cuts=[lo,...roots.filter(x=>sign(sub(x,lo))>0&&sign(sub(hi,x))>0),hi];
      let total=r(0);
      for(let i=1;i<cuts.length;i++){
        const mid=div(add(cuts[i-1],cuts[i]),r(2));
        const order=sign(evaluate(difference,mid));
        const contribution=mul(r(order),integral(difference,cuts[i-1],cuts[i]));
        require(sign(contribution)>=0,"Area contribution nonnegative");total=add(total,contribution);
      }
      return scalar(total,["expanded both original curves","both roots solve f=g; all interior roots split interval","upper/lower chosen on each cell; area units squared"]);
    }
    case "integral-area-horizontal-slices": {
      require(sign(p.coefficient)>0&&sign(p.radius)>0,"Right-left width is nonnegative");
      // y=h+z²: width=2kz, dy=2z dz; integral of 4kz².
      return scalar(integral([r(0),r(0),mul(r(4),p.coefficient)],r(0),p.radius),["left/right meet only at y=h","right-left=2k sqrt(y-h)>=0","both transformed bounds 0,R; area units squared"]);
    }
    case "integral-arc-length": {
      require(p.slope>0&&p.endRoot>1,"Graph interval x>=shift");
      // y'=k sqrt(x-h); z=sqrt(1+k²(x-h)), dx=2z/k² dz.
      // Integrate speed z times dx over z=1..endRoot.
      const speedMeasure=[r(0),r(0),r(2,p.slope*p.slope)];
      return scalar(integral(speedMeasure,r(1),r(p.endRoot)),["D((2k/3)(x-h)^(3/2))=k sqrt(x-h)","graph speed sqrt(1+k²(x-h)); z bounds 1,m","speed nonnegative; length units"]);
    }
    case "integral-arc-parametric": {
      require(sign(p.scale)>0&&sign(sub(p.upper,p.lower))>0,"Positive scale, ordered parameter interval");
      const x=[p.shift,sub(r(0),p.scale),r(0),div(p.scale,r(3))],y=[p.offset,r(0),p.scale];
      const dx=derivative(x),dy=derivative(y);
      const dx2=convolution(dx,dx),dy2=convolution(dy,dy);
      const speed=[p.scale,r(0),p.scale]; // strictly positive for every t
      require(polyEqual(convolution(speed,speed),dx2.map((v,i)=>add(v,dy2[i]??r(0)))),"Exact squared norm of independent derivatives");
      return scalar(integral(speed,p.lower,p.upper),["differentiate both original coordinates","sum derivative squares equals k²(t²+1)²","speed>0 for every t; correct parameter interval; length units"]);
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
      if(p.method==="recurrence"){
        const denominator=add(power(p.a,2),power(p.b,2));
        require(sign(denominator)>0&&sign(p.b)!==0,"Nonsingular two-coefficient derivative system");
        const A=div(add(mul(p.a,p.k),mul(p.b,p.q)),denominator),B=div(sub(mul(p.a,p.q),mul(p.b,p.k)),denominator);
        require(same(sub(mul(p.a,A),mul(p.b,B)),p.k),"Restored sine coefficient");
        require(same(add(mul(p.b,A),mul(p.a,B)),p.q),"Restored cosine coefficient");
        return primitive([A,B],[`e^((${a})x)sin((${b})x)`,`e^((${a})x)cos((${b})x)`],["solve independent derivative coefficient system","both trig coefficients restored on R"]);
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
