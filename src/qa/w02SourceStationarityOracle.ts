/** Test-only independent mathematical oracle for advanced W02.
 * Reads coefficients, not production stationary points, options, hints or solutions.
 * Uses independent monomial calculus plus exact gradient-factor branching.
 */
import type {makeUniversityTask} from '../university/catalog';
import {formatRational as f,type AnswerInput} from '../answers';
import {dx,dy,at} from './batchH';
import {r,add,sub,mul,div,cmp,sign,demand,type Rational} from './batchFMath';
type Task=ReturnType<typeof makeUniversityTask>;
const sq=(x:Rational)=>mul(x,x);
const neg=(x:Rational)=>sub(r(0),x);
const exactSqrt=(q:Rational):Rational=>{
 const n=Number(q.numerator),d=Number(q.denominator);
 demand(Number.isSafeInteger(n)&&Number.isSafeInteger(d)&&n>=0&&d>0,'Bounded nonnegative exact square');
 const x=Math.trunc(Math.sqrt(n)),y=Math.trunc(Math.sqrt(d));
 demand(x*x===n&&y*y===d,'Exact rational square witness');
 return r(x,y);
};
export function independentW02Source(task:Task){
 const p=task.university;
 demand(p.kind==='multivar-quadratic-cubic-extrema'&&(p.mode==='three'||p.mode==='four'),'Advanced W02 task');
 const three=p.mode==='three';
 const P=three
  ?[[2,0,p.a],[0,2,p.b],[1,2,neg(p.c)],[0,0,p.offset]] as const
  :[[3,0,p.a],[2,0,p.b],[0,2,p.c],[1,2,neg(p.d)],[0,0,p.offset]] as const;
 const X=dx(P),Y=dy(P),XX=dx(X),XY=dy(X),YX=dx(Y),YY=dy(Y);
 demand(sign(p.a)>0&&sign(p.b)>0&&sign(p.c)>0,'Positive stationary witnesses');
 let locations:{x:Rational;y:Rational}[];
 if(three){
  // f_y=2y(b-cx); case y=0 gives x=0, case x=b/c gives ±sqrt(2ab)/c.
  const x=div(p.b,p.c),rad=div(mul(r(2),mul(p.a,p.b)),sq(p.c)),y=exactSqrt(rad);
  locations=[{x:r(0),y:r(0)},{x,y},{x,y:neg(y)}];
 }else{
  // f_y=2y(c-dx); y=0 gives x=0 and x=-2b/(3a).
  // x=c/d gives ±sqrt((3ax²+2bx)/d) from f_x=0.
  demand(sign(p.d)>0,'Positive cross coefficient');
  const x=div(p.c,p.d);
  const y=exactSqrt(div(add(mul(r(3),mul(p.a,sq(x))),mul(r(2),mul(p.b,x))),p.d));
  locations=[{x:r(0),y:r(0)},{x:div(neg(mul(r(2),p.b)),mul(r(3),p.a)),y:r(0)},{x,y},{x,y:neg(y)}];
 }
 const pts=locations.map(({x,y})=>{
  demand(sign(at(X,x,y))===0&&sign(at(Y,x,y))===0,'Both original gradient equations vanish');
  const xx=at(XX,x,y),xy=at(XY,x,y),yx=at(YX,x,y),yy=at(YY,x,y);
  demand(cmp(xy,yx)===0,'Clairaut mixed partial identity');
  const D=sub(mul(xx,yy),sq(xy));
  demand(sign(D)!==0,'No degenerate stationary point');
  const kind=sign(D)<0?'saddle':sign(xx)>0?'minimum':'maximum';
  return {x,y,xx,xy,yy,D,kind,value:at(P,x,y)};
 }).sort((a,b)=>cmp(a.y,b.y)||cmp(a.x,b.x));
 demand(pts.length===(three?3:4)&&
  new Set(pts.map(z=>f(z.x)+'/'+f(z.y))).size===pts.length,'Complete distinct stationary set');
 demand(pts.filter(z=>z.kind==='minimum').length===1&&
  pts.filter(z=>z.kind==='saddle').length===(three?2:3),'Exact Hessian-sign pattern');
 return {P,X,Y,XX,XY,YX,YY,points:pts};
}
export function sourceW02OracleInput(task:Task):AnswerInput{
 const result=independentW02Source(task),values:Record<string,string>={};
 result.points.forEach((point,i)=>{
  for(const [key,value] of [['x',point.x],['y',point.y],['f',point.value],['fxx',point.xx],['D',point.D]] as const)
   values[`p${i+1}-${key}`]=f(value);
  values[`p${i+1}-kind`]=point.kind;
 });
 return {kind:'multi-choice',values};
}
