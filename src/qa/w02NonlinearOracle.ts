import type {makeUniversityTask} from '../university/catalog';
import {formatRational as f,type AnswerInput} from '../answers';
import {dx,dy,at} from './batchH';
import {r,add,sub,mul,div,pow,sign,cmp,evaluate,demand,key,type Rational} from './batchFMath';

type Task=ReturnType<typeof makeUniversityTask>;
const abs=(n:bigint)=>n<0n?-n:n;
const gcd=(a:bigint,b:bigint):bigint=>b?gcd(b,a%b):abs(a);
const divisors=(n:bigint)=>{n=abs(n);const out:bigint[]=[];for(let i=1n;i*i<=n;i++)if(n%i===0n){out.push(i);if(i*i!==n)out.push(n/i);}return out;};
/** Rational-root theorem, independently of the production quadratic formula/sqrt. */
function rationalRoots(q:readonly Rational[]){
 demand(q.length===3&&sign(q[2])!==0,'A genuine quadratic');
 const common=q.reduce((d,n)=>d*n.denominator/gcd(d,n.denominator),1n);
 const ints=q.map(n=>n.numerator*(common/n.denominator));
 const candidates=ints[0]===0n?[r(0),div(sub(r(0),q[1]),q[2])]:divisors(ints[0]).flatMap(n=>divisors(ints[2]).flatMap(d=>[r(n,d),r(-n,d)]));
 const roots=[...new Map(candidates.filter(x=>sign(evaluate(q,x))===0).map(x=>[key(x),x])).values()].sort(cmp);
 demand(roots.length===2&&cmp(roots[0],roots[1])<0,'Two distinct exact roots exhaust a quadratic');
 demand(cmp(q[0],mul(q[2],mul(roots[0],roots[1])))===0&&cmp(q[1],mul(r(-1),mul(q[2],add(roots[0],roots[1]))))===0,'Exact coefficient factorization proves completeness');
 return roots;
}
/** Read original coefficients only; never read answer, hints, solutions or stored roots. */
export function independentNonlinear(task:Task){
 const p=task.university;if(p.kind!=='multivar-quadratic-cubic-extrema')throw Error('Expected quadratic-cubic task');
 const P=[[2,0,p.a],[1,1,p.b],[0,3,p.c],[0,2,p.d],[0,1,p.e],[0,0,p.offset]] as const;
 const X=dx(P),Y=dy(P),XX=dx(X),XY=dy(X),YX=dx(Y),YY=dy(Y);
 const A=at(X,r(1),r(0)),B=at(X,r(0),r(1));demand(sign(A)!==0,'Eliminate x using a nonzero constant, no variable division');
 const factor=div(mul(r(-1),B),A),q=[r(0),r(0),r(0)];
 for(const [i,j,c]of Y)q[i+j]=add(q[i+j],mul(c,pow(factor,i)));
 const roots=rationalRoots(q),delta=sub(mul(q[1],q[1]),mul(r(4),mul(q[2],q[0])));
 demand(sign(delta)>0,'Distinct real quadratic roots');
 const points=roots.map(y=>{
  const x=mul(factor,y);demand(sign(at(X,x,y))===0&&sign(at(Y,x,y))===0,'BOTH original gradient equations');
  const xx=at(XX,x,y),xy=at(XY,x,y),yy=at(YY,x,y);demand(cmp(xy,at(YX,x,y))===0,'Mixed partial agreement');
  const D=sub(mul(xx,yy),mul(xy,xy));demand(sign(D)!==0,'Nondegenerate controlled points');
  return {x,y,xx,xy,yy,D,value:at(P,x,y),kind:sign(D)<0?'saddle':sign(xx)>0?'minimum':'maximum'};
 });
 demand(points.filter(q=>q.kind==='saddle').length===1&&points.filter(q=>q.kind!=='saddle').length===1,'Exactly one saddle and one strict local extremum');
 return {P,X,Y,XX,XY,YY,A,B,factor,q,delta,points};
}
export function nonlinearOracleInput(task:Task):AnswerInput{
 const z=independentNonlinear(task),values:Record<string,string>={};
 z.points.forEach((q,i)=>{for(const k of ['x','y','value','D'] as const)values[`p${i+1}-${k==='value'?'f':k}`]=f(q[k]);values[`p${i+1}-kind`]=q.kind;});
 return {kind:'multi-choice',values};
}
