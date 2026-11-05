import type {makeUniversityTask} from "../university/catalog";
import {formatRational as f,type AnswerInput} from "../answers";
import {wrongAcceptanceAnswer} from "./acceptance";
import {r,add,sub,mul,div,sign,cmp,demand,evaluate,pow,polyEqual,type Rational} from "./batchFMath";
import {cellDomain,abs,baseText,polyText,compose,signedPower} from "./batchGMath";

export const batchG=[
 {block:"G1",skills:["C05"],family:"sequence-euler-product",level:"expert",variants:[0,1]},
 {block:"G1",skills:["C06"],family:"sequence-monotonic-bounded",level:"advanced",variants:[2,4]},
 {block:"G2",skills:["F03"],family:"analysis-absolute",level:"medium",variants:[0,1]},
 {block:"G2",skills:["F04"],family:"function-mixed-domain",level:"medium",variants:[0,4]},
 {block:"G2",skills:["F04"],family:"function-mixed-domain",level:"hard",variants:[1,3]},
 {block:"G2",skills:["F06"],family:"function-parity",level:"hard",variants:[0,2]},
 {block:"G2",skills:["F06"],family:"function-composition",level:"expert",variants:[0,1]},
 {block:"G2",skills:["F06"],family:"function-mobius-inverse-point",level:"expert",variants:[0,1]},
 {block:"G2",skills:["F07"],family:"analysis-power-law",level:"hard",variants:[0,1]},
 {block:"G2",skills:["F07"],family:"analysis-elementary-equation",level:"hard",variants:[0,1]},
 {block:"G2",skills:["F07"],family:"analysis-log-inequality",level:"hard",variants:[0,1]},
] as const;
type Task=ReturnType<typeof makeUniversityTask>;
export type GCertificate={input:AnswerInput;anchors:readonly (readonly string[])[];facts:readonly string[];choiceLabel?:string;critical?:readonly Rational[];contains?:(x:Rational)=>boolean;classes?:string;bounds?:{lower:Rational|null;upper:Rational|null}};
const qkey=(x:Rational)=>`${x.numerator}/${x.denominator}`;
const exponent=(q:Rational):AnswerInput=>sign(q)===0?"1":{kind:"choice",value:"exp:"+qkey(q)};

/** Parameters only. No production answer, hint, solution or solver is read. */
export function batchGCertificate(task:Task,locale:"pl"|"en"="en"):GCertificate {
 const p=task.university;
 const t=(pl:string,en:string)=>locale==="pl"?pl:en;
 switch(p.kind){
  case "sequence-euler-product":{
   const contributions=p.factors.map(t=>{
    demand(sign(add(r(1),t.b))>0,"Positive shifted denominator for n>=1");
    const lower=sign(t.a)<0?add(r(1),div(t.a,add(r(1),t.b))):r(1);
    demand(sign(lower)>0&&sign(t.a)!==0&&sign(t.c)!==0,"Positive base and genuine 1^infinity factor");
    // log factor = [log(1+u)/u] * a*(cn+d)/(n+b).
    return mul(t.a,t.c);
   });
   const q=contributions.reduce(add,r(0));
   return {input:exponent(q),choiceLabel:sign(q)===0?undefined:`e^(${f(q)})`,anchors:[[t("Sprawdzamy dodatniość wszystkich podstaw.","Verify positivity of all bases.")],...p.factors.map((t,i)=>[`F${i+1}: ln(1+(${f(t.a)})/(n+${f(t.b)}))·((${f(t.c)})·n+${f(t.d)}) → ${f(contributions[i])}`]),[`ln L = ${contributions.map(f).join(" + ")} = ${f(q)}`,`L=${sign(q)===0?"1":`e^(${f(q)})`}`]],facts:["each base tends to 1 and is positive for every n>=1","nonzero c gives signed infinite exponent; log(1+u)/u tends to 1","constant shifts disappear; product logarithms add"],classes:sign(q)<0?"exponent-negative":sign(q)>0?"exponent-positive":"exponent-zero"};
  }
  case "sequence-monotonic-bounded":{
   demand(p.shift>=0&&Number.isInteger(p.shift)&&sign(p.amplitude)!==0,"Bounded catalog excludes constants");
   const s=p.amplitude,c=p.offset,k=p.shift,positive=sign(s)>0;
   const atOne=p.mode==="linear"?add(c,s):add(c,div(s,r(k+1)));
   const absS=positive?s:sub(r(0),s);
   const bounds=p.mode==="linear"?{lower:positive?atOne:null,upper:positive?null:atOne}:
    p.mode==="reciprocal"?{lower:cmp(c,atOne)<0?c:atOne,upper:cmp(c,atOne)>0?c:atOne}:
    {lower:sub(c,div(absS,r(k+1))),upper:add(c,div(absS,r(k+1)))};
   const formula=f(c)+" + ("+f(s)+")"+(p.mode==="linear"?"·n":p.mode==="reciprocal"?"/(n+"+k+")":"·(−1)ⁿ/(n+"+k+")");
   let value:string,step:string,bound:string;
   if(p.mode==="linear"){
    // Difference exactly s; n>=1 gives one finite endpoint bound and
    // growth in the other direction. Two-sided boundedness is false.
    value=positive?"increasing-unbounded":"decreasing-unbounded";step=`aₙ₊₁−aₙ=${f(s)}`;bound="|aₙ|→+∞";
    demand(cmp(sub(add(c,mul(r(2),s)),add(c,s)),s)===0,"Linear difference identity");
   }else if(p.mode==="reciprocal"){
    // Cross multiplication: 1/(n+k+1)-1/(n+k)=-1/((n+k)(n+k+1)).
    value=positive?"decreasing-bounded":"increasing-bounded";
    step=`aₙ₊₁−aₙ=−(${f(s)})/((n+${k})(n+${k+1}))`;bound=`0<1/(n+${k})≤1/${k+1}`;
   }else{
    value="neither-bounded";
    step=`a₁=${f(c)}−(${f(s)})/(1+${k}); a₂=${f(c)}+(${f(s)})/(2+${k}); a₃=${f(c)}−(${f(s)})/(3+${k})`;
    bound=`|aₙ−(${f(c)})|≤|${f(s)}|/${k+1}`;
    // Derive alternating difference for all n, not just sample terms:
    // Δ = -s*(-1)^n*(2n+2k+1)/((n+k)(n+k+1)).
    demand(sign(mul(s,r(2*k+3)))!==0,"Alternating differences change sign with parity");
   }
   const labels:Record<string,readonly [string,string]>={"increasing-bounded":["Rosnący, ograniczony","Increasing, bounded"],"decreasing-bounded":["Malejący, ograniczony","Decreasing, bounded"],"increasing-unbounded":["Rosnący, nieograniczony","Increasing, unbounded"],"decreasing-unbounded":["Malejący, nieograniczony","Decreasing, unbounded"],"neither-bounded":["Niemonotoniczny, ograniczony","Not monotonic, bounded"]};
   return {input:{kind:"choice",value},choiceLabel:t(...labels[value]),anchors:[["n≥1; aₙ="+formula],[step],[bound]],facts:["exact difference identity for every n>=1",p.mode==="linear"?"a1 bounds one side only; other side unbounded":"explicit two-sided bound via reciprocal or absolute amplitude",p.mode==="alternating"?"alternating differences have both signs":"difference sign proves strict monotonicity"],classes:value,bounds};
  }
  case "analysis-absolute":{
   demand(p.mode==="domain"&&sign(p.radius)>0,"Selected nonempty absolute-root domains");
   const contains=(x:Rational)=>cmp(abs(sub(x,p.p)),p.radius)>=0;
   const domain=cellDomain([sub(p.p,p.radius),p.p,add(p.p,p.radius)],contains);
   return {input:{kind:"choice",value:domain.key},choiceLabel:domain.text,anchors:[[`|x−${f(p.p)}|−${f(p.radius)}≥0 ⇔ |x−${f(p.p)}|≥${f(p.radius)}`],[`D=${domain.text}`]],facts:["square root requires nonnegative absolute radicand","both boundary points included; interior excluded"],critical:domain.cuts,contains,classes:domain.intervals.length+"-intervals"};
  }
  case "function-mixed-domain":{
   demand((p.mode==="product-root-log"||p.mode==="product-log")&&sign(p.base)>0&&cmp(p.base,r(1))!==0,"Selected root/log denominator");
   const threshold=add(p.boundary,r(1)),increasing=cmp(p.base,r(1))>0;
   const contains=(x:Rational)=>sign(mul(sub(x,p.p),sub(x,p.q)))>=0&&cmp(x,p.boundary)>0&&(p.mode==="product-log"?cmp(x,threshold)!==0:increasing?cmp(x,threshold)>0:cmp(x,threshold)<0);
   const domain=cellDomain([p.p,p.q,p.boundary,threshold],contains);
   return {input:{kind:"choice",value:domain.key},choiceLabel:domain.text,anchors:[[`(x−(${f(p.p)}))(x−(${f(p.q)})) ≥ 0`],[p.mode==="product-log"?`x>${f(p.boundary)}, x≠${f(threshold)}`:increasing?`x>${f(threshold)}`:`${f(p.boundary)}<x<${f(threshold)}`],[`D = ${domain.text}`]],facts:["nonnegative numerator radical, positive log argument",p.mode==="product-log"?"log denominator excludes argument 1":"denominator sqrt(log) needs log>0, not >=0","monotonicity of log reverses threshold for base<1; independent cell intersection"],critical:domain.cuts,contains,classes:domain.intervals.length===0?"empty":domain.intervals.length>1?"disconnected":"connected"};
  }
  case "function-parity":{
   const reflected=p.coefficients.map((c,i)=>mul(c,r((-1)**i))),negated=p.coefficients.map(c=>sub(r(0),c));
   const value=polyEqual(reflected,p.coefficients)?"even":polyEqual(reflected,negated)?"odd":"neither";
   return {input:{kind:"choice",value},choiceLabel:t(value==="even"?"parzysta":value==="odd"?"nieparzysta":"ani parzysta, ani nieparzysta",value),anchors:[[`f(−x) = ${polyText(reflected)}`],[`−f(x) = ${polyText(negated)}`],[value==="even"?"f(−x)=f(x)":value==="odd"?"f(−x)=−f(x)":"f(−x)≠f(x), f(−x)≠−f(x)"]],facts:["polynomial domain R is symmetric","coefficient identities establish parity for every real x"],classes:value};
  }
  case "function-composition":{
   demand(p.commutator,"Selected noncommutative composition");
   const fg=compose(p.outer,p.inner),gf=compose(p.inner,p.outer),result=fg.map((c,i)=>sub(c,gf[i]??r(0)));
   while(result.length>1&&sign(result.at(-1)!)===0)result.pop();
   for(const x of [r(-2),r(0),r(3)])demand(cmp(evaluate(result,x),sub(evaluate(p.outer,evaluate(p.inner,x)),evaluate(p.inner,evaluate(p.outer,x))))===0,"Composition order/subtraction identity");
   return {input:{kind:"list",values:[...result].reverse().map(f)},anchors:[[`(f ∘ g)(x) = ${polyText(fg)}`],[`(g ∘ f)(x) = ${polyText(gf)}`],[`(f ∘ g − g ∘ f)(x) = ${polyText(result)}`]],facts:["independent coefficient Horner/convolution for both compositions","polynomial domains R; nested point substitutions additionally verify order"]};
  }
  case "function-mobius-inverse-point":{
   const det=sub(mul(p.a,p.d),mul(p.b,p.c));demand(sign(det)!==0&&sign(p.c)!==0,"Invertible genuine fractional-linear function");
   const pole=div(sub(r(0),p.d),p.c),missing=div(p.a,p.c),den=sub(p.a,mul(p.c,p.image));demand(sign(den)!==0,"Image belongs to inverse domain");
   // Cross-multiply the target equation, then verify both projective products
   // M*adj(M)=adj(M)*M=det(M)I as coefficient identities.
   const x=div(sub(mul(p.d,p.image),p.b),den);
   const M=[[p.a,p.b],[p.c,p.d]],N=[[p.d,sub(r(0),p.b)],[sub(r(0),p.c),p.a]];
   for(const [L,R] of [[M,N],[N,M]])for(let i=0;i<2;i++)for(let j=0;j<2;j++)demand(cmp(add(mul(L[i][0],R[0][j]),mul(L[i][1],R[1][j])),i===j?det:r(0))===0,"Both inverse compositions");
   demand(cmp(x,pole)!==0&&cmp(div(add(mul(p.a,x),p.b),add(mul(p.c,x),p.d)),p.image)===0,"Exact substitution into original function");
   return {input:f(x),anchors:[[`ad−bc = ${f(det)} ≠ 0`],[`D(f)=ℝ∖{${f(pole)}}`,`W(f)=ℝ∖{${f(missing)}}`],["y(cx+d)=ax+b ⇒ x=(dy−b)/(a−cy)"],[`y=${f(p.image)}`,`f⁻¹(y)=(${f(p.d)}·${f(p.image)}−${f(p.b)})/(${f(p.a)}−${f(p.c)}·${f(p.image)}) = ${f(x)}`]],facts:["nonzero determinant proves injective/bijective on excluded-point domains","original domain R minus -d/c; range R minus a/c","inverse swaps domain/range; both compositions are exact identities"]};
  }
  case "analysis-power-law":{
   demand(p.mode==="combined"&&sign(p.base)>0&&cmp(p.base,r(1))!==0&&sign(p.argument)>0,"Real inverse log/exp laws");
   const value=add(r(p.exponent),p.argument),a=baseText(p.base);
   return {input:f(value),anchors:[`${f(p.base)}>0; ${f(p.base)}≠1; ${f(p.argument)}>0`].map(x=>[x]).concat([[`log_${a}(${a}^(${p.exponent}))=${p.exponent}`],[`${a}^(log_${a}(${f(p.argument)}))=${f(p.argument)}`],[`${p.exponent}+${f(p.argument)}=${f(value)}`]]),facts:["base positive and not 1; argument positive","log_a and a^x are inverses, also for decreasing base and negative exponent"]};
  }
  case "analysis-elementary-equation":{
   demand(p.mode==="log-product"&&sign(p.base)>0&&cmp(p.base,r(1))!==0,"Selected logarithmic product equation");
   const rhs=signedPower(p.base,p.exponent);demand(cmp(rhs,r(2))===0,"Controlled catalog equation has product 2");
   // z=x-p>0: z(z+1)=2 => (z-1)(z+2)=0. Only z=1 allowed.
   const value=add(p.p,r(1)),rejected=sub(p.p,r(2));
   demand(cmp(mul(sub(value,p.p),sub(value,sub(p.p,r(1)))),rhs)===0&&cmp(rejected,p.p)<0,"Candidate and domain rejection");
   return {input:f(value),anchors:[[`x>${f(p.p)}`,`(x−${f(p.p)})(x−${f(sub(p.p,r(1)))})=${f(rhs)}=2`],[`y=x−${f(value)}`,"(y+1)(y+2)=2 ⇔ y(y+3)=0"],[`x=${f(value)}`,`x=${f(rejected)}`],[`x=${f(value)}`]],facts:["combine logs only where both original arguments are positive","independent factored quadratic; reject second root by original log domain"]};
  }
  case "analysis-log-inequality":{
   demand(p.relation==="at-most"&&sign(p.base)>0&&cmp(p.base,r(1))!==0,"Selected non-strict log inequality");
   const power=signedPower(p.base,p.exponent),threshold=add(p.p,power),inc=cmp(p.base,r(1))>0;
   const contains=(x:Rational)=>cmp(x,p.p)>0&&(inc?cmp(x,threshold)<=0:cmp(x,threshold)>=0);
   const domain=cellDomain([p.p,threshold],contains),a=f(p.base);
   return {input:{kind:"choice",value:domain.key},choiceLabel:domain.text,anchors:[[`x−${f(p.p)}>0 ⇔ x>${f(p.p)}`],[`${baseText(p.base)}^(${p.exponent})=${f(power)}`,`x=${f(threshold)}`],[t(inc?`${a}>1 ⇒ log_a jest rosnący`:`0<${a}<1 ⇒ log_a jest malejący`,inc?`${a}>1 ⇒ log_a is increasing`:`0<${a}<1 ⇒ log_a is decreasing`)],[`S=${domain.text}`]],facts:["positive original log argument","signed integer powers computed exactly","base monotonicity determines inequality direction; equality endpoint included"],critical:domain.cuts,contains,classes:inc?"base>1":"base<1"};
  }
  default:throw Error("Outside Batch G matrix: "+p.kind);
 }
}
export const batchGOracle=(task:Task)=>batchGCertificate(task).input;
export function wrongBatchG(input:AnswerInput,task:Task):AnswerInput {
 if(typeof input==="string")return input==="0"?"1":"0";
 return wrongAcceptanceAnswer(input,task);
}
