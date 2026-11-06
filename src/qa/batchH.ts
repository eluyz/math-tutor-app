import type {makeUniversityTask} from '../university/catalog';
import {formatRational as f,type AnswerInput} from '../answers';
import {r,add,sub,mul,div,pow,cmp,sign,demand,type Rational} from './batchFMath';
import {wrongAcceptanceAnswer} from './acceptance';
export const batchH=[
 {skill:'W01',family:'multivar-partial-point',level:'hard',variants:[0,1,2,3,4]},
 {skill:'W01',family:'multivar-gradient-point',level:'hard',variants:[0]},
 {skill:'W01',family:'multivar-cubic-partial',level:'expert',variants:[0,1,2,3,4]},
 {skill:'W01',family:'multivar-chain-gradient',level:'expert',variants:[0,1]},
 {skill:'W02',family:'multivar-stationary-point',level:'hard',variants:[0,1,2]},
 {skill:'W02',family:'multivar-hessian-classify',level:'hard',variants:[0,1,2,3]},
 {skill:'W02',family:'multivar-degenerate-quartic',level:'expert',variants:[0,1,3]},
 {skill:'W02',family:'multivar-rectangle-extrema',level:'hard',variants:[0,3]},
 {skill:'W02',family:'multivar-disk-linear-extrema',level:'expert',variants:[0]},
 {skill:'W02',family:'multivar-diagonal-quadratic-disk',level:'expert',variants:[0,1]},
] as const;
type Task=ReturnType<typeof makeUniversityTask>;
type Term=readonly [number,number,Rational];
type Poly=readonly Term[];
const plus=(...ps:Poly[]):Poly=>ps.flat();
const scale=(p:Poly,k:Rational):Poly=>p.map(([i,j,c])=>[i,j,mul(c,k)]);
const product=(a:Poly,b:Poly):Poly=>a.flatMap(([i,j,c])=>b.map(([u,v,d])=>[i+u,j+v,mul(c,d)] as const));
const power=(p:Poly,n:number):Poly=>Array.from({length:n}).reduce<Poly>(v=>product(v,p),[[0,0,r(1)]]);
export const dx=(p:Poly):Poly=>p.filter(([i])=>i>0).map(([i,j,c])=>[i-1,j,mul(c,r(i))]);
export const dy=(p:Poly):Poly=>p.filter(([,j])=>j>0).map(([i,j,c])=>[i,j-1,mul(c,r(j))]);
export const at=(p:Poly,x:Rational,y:Rational):Rational=>p.reduce((s,[i,j,c])=>add(s,mul(c,mul(pow(x,i),pow(y,j)))),r(0));
const equal=(a:Poly,b:Poly)=>{
 const diff=plus(a,scale(b,r(-1))),keys=new Set(diff.map(([i,j])=>i+','+j));
 return [...keys].every(key=>sign(diff.filter(([i,j])=>key===i+','+j).reduce((s,[,,c])=>add(s,c),r(0)))===0);
};
const point=(x:Rational,y:Rational)=>`(${f(x)}, ${f(y)})`;
const scalar=(x:Rational):AnswerInput=>f(x);
const list=(xs:readonly Rational[]):AnswerInput=>({kind:'list',values:xs.map(f)});
const sq=(x:Rational)=>mul(x,x);
export type HCertificate={input:AnswerInput;anchors:readonly (readonly string[])[];facts:readonly string[];classification?:string;derivatives?:readonly Rational[]};
/** Original parameters only; no answer/solution/hint or production calculus helper. */
export function batchHCertificate(task:Task,locale:'pl'|'en'='en'):HCertificate{
 const p=task.university,t=(pl:string,en:string)=>locale==='pl'?pl:en;
 if(p.kind==='multivar-partial-point'||p.kind==='multivar-gradient-point'||p.kind==='multivar-cubic-partial'||p.kind==='multivar-chain-gradient'){
  let P:Poly;
  if(p.kind==='multivar-chain-gradient')P=plus(scale(power([[1,0,p.a],[0,1,p.b],[0,0,p.c]],3),p.k),[[1,1,p.d]]);
  else if(p.kind==='multivar-cubic-partial')P=[[3,0,p.a],[2,1,p.b],[1,2,p.c],[0,3,p.d],[1,1,p.e],[1,0,p.g],[0,1,p.h]];
  else P=[[2,0,p.a],[1,1,p.b],[0,2,p.c],[1,0,p.d],[0,1,p.e],[0,0,p.constant]];
  const X=dx(P),Y=dy(P),XX=dx(X),XY=dy(X),YX=dx(Y),YY=dy(Y);
  demand(equal(XY,YX),'Mixed partial coefficient identities');
  const values=[X,Y,XX,XY,YY].map(poly=>at(poly,p.x,p.y)),q=point(p.x,p.y);
  const facts=['differentiate independent monomial exponents, not production derivative formulas','all functions are polynomials on R², hence C∞ and mixed partials agree'];
  if(p.kind==='multivar-chain-gradient'){
   const u=add(add(mul(p.a,p.x),mul(p.b,p.y)),p.c);
   // Independent expansion above versus chain identity for the displayed steps.
   const U:Poly=[[1,0,p.a],[0,1,p.b],[0,0,p.c]];
   demand(equal(X,plus(scale(power(U,2),mul(r(3),mul(p.k,p.a))),[[0,1,p.d]])),'Chain x factor');
   demand(equal(Y,plus(scale(power(U,2),mul(r(3),mul(p.k,p.b))),[[1,0,p.d]])),'Chain y factor');
   return {input:list(values.slice(0,2)),derivatives:values,facts,anchors:[['f(x,y)='],[`u=(${f(p.a)})x+(${f(p.b)})y+(${f(p.c)})`,`u_x=${f(p.a)}`,`u_y=${f(p.b)}`],[`f_x=3(${f(p.k)})u²(${f(p.a)})+(${f(p.d)})y`],[`f_y=3(${f(p.k)})u²(${f(p.b)})+(${f(p.d)})x`],[`u${q}=${f(u)}`,`∇f${q}=(${f(values[0])}, ${f(values[1])})`]]};
  }
  const cubic=p.kind==='multivar-cubic-partial';
  const fx=cubic?`f_x=3(${f(p.a)})x²+2(${f(p.b)})xy+(${f(p.c)})y²+(${f(p.e)})y+(${f(p.g)})`:`∂f/∂x=2(${f(p.a)})x+(${f(p.b)})y+(${f(p.d)})`;
  const fy=cubic?`f_y=(${f(p.b)})x²+2(${f(p.c)})xy+3(${f(p.d)})y²+(${f(p.e)})x+(${f(p.h)})`:`∂f/∂y=(${f(p.b)})x+2(${f(p.c)})y+(${f(p.e)})`;
  const second=cubic?`f_xx=6(${f(p.a)})x+2(${f(p.b)})y; f_xy=2(${f(p.b)})x+2(${f(p.c)})y+(${f(p.e)}); f_yy=2(${f(p.c)})x+6(${f(p.d)})y`:`f_xx=2(${f(p.a)}); f_xy=${f(p.b)}; f_yy=2(${f(p.c)})`;
  if(p.kind==='multivar-gradient-point')return {input:list(values.slice(0,2)),derivatives:values,facts,anchors:[['f(x,y)='],[fx],[fy],[`∇f${q}=(${f(values[0])}, ${f(values[1])})`]]};
  const value=values[(['x','y','xx','xy','yy'] as const).indexOf(p.target)];
  return {input:scalar(value),derivatives:values,facts,anchors:[['f(x,y)='],[fx],[fy],[second],[`f_${p.target}${q}=${f(value)}`]]};
 }
 if(p.kind==='multivar-stationary-point'||p.kind==='multivar-hessian-classify'){
  const A=mul(r(2),p.a),B=p.b,C=mul(r(2),p.c),D=sub(mul(A,C),sq(B));
  if(p.kind==='multivar-stationary-point'){
   demand(sign(A)!==0&&sign(D)!==0,'Unique stationary system');
   const factor=div(B,A),y=div(sub(mul(factor,p.d),p.e),sub(C,mul(factor,B))),x=div(sub(sub(r(0),p.d),mul(B,y)),A);
   demand(sign(add(add(mul(A,x),mul(B,y)),p.d))===0&&sign(add(add(mul(B,x),mul(C,y)),p.e))===0,'Substitution into BOTH original gradient equations');
   return {input:list([x,y]),facts:['independent row elimination, not stored h/k or Cramer helper','nonzero determinant gives the only stationary point'],anchors:[[`f_x=2(${f(p.a)})x+(${f(p.b)})y+(${f(p.d)})`],[`f_y=(${f(p.b)})x+2(${f(p.c)})y+(${f(p.e)})`],[`det=4ac−b²=${f(D)} ≠ 0`],[`x=${f(x)}; y=${f(y)}`],[`H=[[${f(A)},${f(B)}],[${f(B)},${f(C)}]]; D=${f(D)}`],[`D=${f(D)}, f_xx=${f(A)} ⇒ ${sign(D)<0?'saddle':sign(A)>0?'minimum':'maximum'}`],[`f(${f(x)},${f(y)})=${f(add(add(add(mul(p.a,sq(x)),mul(p.b,mul(x,y))),mul(p.c,sq(y))),add(add(mul(p.d,x),mul(p.e,y)),p.offset)))}`]]};
  }
  const U:Poly=[[1,0,r(1)],[0,0,sub(r(0),p.h)]],V:Poly=[[0,1,r(1)],[0,0,sub(r(0),p.k)]];
  const P=plus(scale(power(U,2),p.a),scale(product(U,V),p.b),scale(power(V,2),p.c),p.degenerate?power(V,4):[]);
  demand(sign(at(dx(P),p.h,p.k))===0&&sign(at(dy(P),p.h,p.k))===0,'Stationarity from displayed centered polynomial');
  demand(cmp(at(dx(dx(P)),p.h,p.k),A)===0&&cmp(at(dy(dx(P)),p.h,p.k),B)===0&&cmp(at(dy(dy(P)),p.h,p.k),C)===0,'Hessian from independent polynomial differentiation');
  const classification=sign(D)<0?'saddle':sign(D)===0?'inconclusive':sign(A)>0?'minimum':'maximum';
  const facts=['D=AC−B² at a stationary C² point','A u²+Buv+C v²=(A/2)(u+Bv/A)²+(D/(2A))v² when A≠0'];
  if(sign(D)===0){demand(p.degenerate&&sign(p.a)>0&&sign(p.b)===0&&sign(p.c)===0,'Catalog degenerate case a u²+v⁴ has actual strict minimum');facts.push('actual strict minimum by nonnegative a u²+v⁴; Hessian test answer remains inconclusive');}
  return {input:{kind:'choice',value:classification},classification,facts,anchors:[[`f_x(${f(p.h)},${f(p.k)})=0; f_y(${f(p.h)},${f(p.k)})=0`],[`f_xx=${f(A)}; f_xy=${f(B)}; f_yy=${f(C)}`],[`D=f_xx·f_yy−(f_xy)²=${f(D)}`],[`D=${f(D)}, f_xx=${f(A)} ⇒ ${classification}`]]};
 }
 if(p.kind==='multivar-degenerate-quartic'){
  demand(sign(p.a)!==0&&sign(p.b)!==0,'Genuine two-variable quartic');
  const U:Poly=[[1,0,r(1)],[0,0,sub(r(0),p.h)]],V:Poly=[[0,1,r(1)],[0,0,sub(r(0),p.k)]];
  const P=plus(scale(power(U,4),p.a),scale(power(V,4),p.b));
  for(const poly of [dx(P),dy(P),dx(dx(P)),dy(dx(P)),dy(dy(P))])demand(sign(at(poly,p.h,p.k))===0,'Zero gradient and Hessian');
  const classification=sign(p.a)===sign(p.b)?sign(p.a)>0?'minimum':'maximum':'saddle';
  return {input:{kind:'choice',value:classification},classification,facts:['fourth powers nonnegative and vanish together only at origin','opposite coefficient signs exhibit opposite signs on axes arbitrarily near origin','zero Hessian is inconclusive; actual classification uses fourth-order terms'],anchors:[[`u=x−(${f(p.h)}); v=y−(${f(p.k)})`],[`f−(${f(p.c)})=(${f(p.a)})u⁴+(${f(p.b)})v⁴`],[`f_x=4(${f(p.a)})u³; f_y=4(${f(p.b)})v³; ∇f${point(p.h,p.k)}=(0,0)`],[`f_xx=12(${f(p.a)})u²; f_xy=0; f_yy=12(${f(p.b)})v²`],['D=f_xx f_yy−f_xy²=0'],[`v=0: f−c=(${f(p.a)})u⁴; u=0: f−c=(${f(p.b)})v⁴`],[t(classification==='minimum'?'ścisłe minimum':classification==='maximum'?'ścisłe maksimum':'punkt siodłowy',classification==='minimum'?'strict minimum':classification==='maximum'?'strict maximum':'saddle point')]]};
 }
 type Point=readonly [Rational,Rational];
 const extremize=(points:readonly Point[],value:(x:Rational,y:Rational)=>Rational)=>{
  const sorted=[...points].sort((a,b)=>cmp(a[0],b[0])||cmp(a[1],b[1])).map(point=>({point,value:value(...point)}));
  const min=sorted.reduce((a,b)=>cmp(a.value,b.value)<=0?a:b),max=sorted.reduce((a,b)=>cmp(a.value,b.value)>=0?a:b);
  return {min,max,minPoints:sorted.filter(x=>cmp(x.value,min.value)===0).map(x=>point(...x.point)),maxPoints:sorted.filter(x=>cmp(x.value,max.value)===0).map(x=>point(...x.point))};
 };
 if(p.kind==='multivar-rectangle-extrema'){
  const xs=[p.x0,p.x1,...(cmp(p.h,p.x0)>0&&cmp(p.h,p.x1)<0?[p.h]:[])],ys=[p.y0,p.y1,...(cmp(p.k,p.y0)>0&&cmp(p.k,p.y1)<0?[p.k]:[])];
  const e=extremize(xs.flatMap(x=>ys.map(y=>[x,y] as const)),(x,y)=>add(p.c,add(mul(p.a,sq(sub(x,p.h))),mul(p.b,sq(sub(y,p.k))))));
  return {input:list([...e.min.point,e.min.value,...e.max.point,e.max.value]),facts:['separable quadratics attain all extrema at endpoints or allowed vertex','Cartesian candidate enumeration includes edges/corners/interior; lexicographic ties'],anchors:[[`f_x=2(${f(p.a)})(x−(${f(p.h)})); f_y=2(${f(p.b)})(y−(${f(p.k)}))`],[`x∈[${f(p.x0)},${f(p.x1)}]; y∈[${f(p.y0)},${f(p.y1)}]`],['f(x,y)=a(x−h)²+b(y−k)²+c'],e.minPoints,e.maxPoints,[`f_min=${f(e.min.value)}; f_max=${f(e.max.value)}`]]};
 }
 if(p.kind==='multivar-disk-linear-extrema'){
  demand(sign(p.norm)>0&&cmp(sq(p.norm),add(sq(p.u),sq(p.v)))===0,'Exact positive norm verified, not assumed');
  const X=div(mul(p.radius,p.u),p.norm),Y=div(mul(p.radius,p.v),p.norm),lo=[sub(p.h,X),sub(p.k,Y)] as const,hi=[add(p.h,X),add(p.k,Y)] as const;
  const center=add(add(mul(p.u,p.h),mul(p.v,p.k)),p.c),low=sub(center,mul(p.radius,p.norm)),high=add(center,mul(p.radius,p.norm));
  return {input:list([...lo,low,...hi,high]),facts:['Cauchy–Schwarz gives center value ±radius*norm bounds','equality points attain both bounds; nonzero gradient excludes interior extrema'],anchors:[[`∇f=(${f(p.u)}, ${f(p.v)}) ≠ (0,0)`],[`(x−(${f(p.h)}))²+(y−(${f(p.k)}))²=${f(sq(p.radius))}`],['λ∇g=∇f; ∇g=(2(x−h), 2(y−k))'],[`||∇f||=√(u²+v²)=${f(p.norm)}`],[point(...lo),point(...hi)],[`f_min=${f(low)}; f_max=${f(high)}`]]};
 }
 if(p.kind==='multivar-diagonal-quadratic-disk'){
  const e=extremize([[p.h,p.k],[sub(p.h,p.radius),p.k],[add(p.h,p.radius),p.k],[p.h,sub(p.k,p.radius)],[p.h,add(p.k,p.radius)]],(x,y)=>add(p.c,add(mul(p.a,sq(sub(x,p.h))),mul(p.b,sq(sub(y,p.k))))));
  return {input:list([...e.min.point,e.min.value,...e.max.point,e.max.value]),facts:['squared coordinates form a simplex s>=0,t>=0,s+t<=R²','linear objective on simplex has vertex extrema; ties have lexicographically minimal negative-axis point'],anchors:[[`u=x−(${f(p.h)}); v=y−(${f(p.k)}); u²+v²≤${f(sq(p.radius))}`],[`f−(${f(p.c)})=(${f(p.a)})u²+(${f(p.b)})v²`],['m=min(0,a,b); M=max(0,a,b)'],[`f_min=c+R²m=${f(e.min.value)}; f_max=c+R²M=${f(e.max.value)}`],[point(...e.min.point),point(...e.max.point)],[t('Przy remisie wybierz najmniejszy punkt leksykograficznie.','For ties choose the lexicographically smallest point.')],[`f(${f(e.min.point[0])},${f(e.min.point[1])})=${f(e.min.value)}`,`f(${f(e.max.point[0])},${f(e.max.point[1])})=${f(e.max.value)}`]]};
 }
 throw Error('Outside Batch H: '+p.kind);
}
export const batchHOracle=(task:Task)=>batchHCertificate(task).input;
export const wrongBatchH=(input:AnswerInput,task:Task):AnswerInput=>typeof input==='string'?(input==='0'?'1':'0'):wrongAcceptanceAnswer(input,task);
