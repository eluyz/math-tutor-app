import type {makeUniversityTask} from '../university/catalog';
import {formatRational as f,type AnswerInput} from '../answers';
import {r,add,sub,mul,div,sign,type Rational} from './batchFMath';
type Task=ReturnType<typeof makeUniversityTask>;
/** Generic exact elimination, including a row swap for the zero-diagonal bilinear system. */
function solve(m:Rational[][]){
 for(let j=0;j<2;j++){
  const k=m.findIndex((row,i)=>i>=j&&sign(row[j])!==0);if(k<0)throw Error('singular');[m[j],m[k]]=[m[k],m[j]];
  const pivot=m[j][j];m[j]=m[j].map(v=>div(v,pivot));
  for(let i=0;i<2;i++)if(i!==j){const c=m[i][j];m[i]=m[i].map((v,k)=>sub(v,mul(c,m[j][k])));}
 }return [m[0][2],m[1][2]] as const;
}
export function w02Batch2Certificate(task:Task){
 const p=task.university;
 if(p.kind==='multivar-bilinear-extrema'){
  const [x,y]=solve([[r(0),p.a,sub(r(0),p.b)],[p.a,r(0),sub(r(0),p.c)]]),D=sub(r(0),mul(p.a,p.a));
  const value=add(add(add(mul(p.a,mul(x,y)),mul(p.b,x)),mul(p.c,y)),p.d);
  return {x,y,D,value,classification:'saddle',H:[r(0),p.a,r(0)] as const};
 }
 if(p.kind!=='multivar-stationary-point')throw Error('scope');
 const A=mul(r(2),p.a),B=p.b,C=mul(r(2),p.c),[x,y]=solve([[A,B,sub(r(0),p.d)],[B,C,sub(r(0),p.e)]]),D=sub(mul(A,C),mul(B,B));
 const value=add(add(add(mul(p.a,mul(x,x)),mul(p.b,mul(x,y))),mul(p.c,mul(y,y))),add(add(mul(p.d,x),mul(p.e,y)),p.offset));
 return {x,y,D,value,classification:sign(D)<0?'saddle':sign(A)>0?'minimum':'maximum',H:[A,B,C] as const};
}
export function w02Batch2Oracle(task:Task):AnswerInput{
 const c=w02Batch2Certificate(task);
 if(task.university.kind==='multivar-stationary-point')return {kind:'list',values:task.university.completeMinimum?[f(c.x),f(c.y),f(c.value)]:[f(c.x),f(c.y)]};
 const spec=task.answer;if(spec.kind!=='multi-choice')throw Error('fields');
 const labels:Record<string,string>={'x_*':f(c.x),'y_*':f(c.y),'f_*':f(c.value),D:f(c.D)};
 return {kind:'multi-choice',values:Object.fromEntries(spec.fields.map(field=>[field.id,field.id==='conclusion'?'saddle-none':field.options.find(o=>o.label===labels[field.id])!.value]))};
}
