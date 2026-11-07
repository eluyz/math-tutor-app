import type {makeUniversityTask} from '../university/catalog';
import {formatRational as f} from '../answers';
import {r,add,mul,div,type Rational} from './batchFMath';
type P=Map<string,Rational>;
const poly=(terms:readonly (readonly [number,number,Rational])[]):P=>{const out:P=new Map();for(const [i,j,c] of terms){const k=i+','+j;out.set(k,add(out.get(k)??r(0),c));}return out;};
const scale=(p:P,c:Rational):P=>new Map([...p].map(([k,v])=>[k,mul(v,c)]));
const plus=(a:P,b:P):P=>{const o=new Map(a);for(const [k,v]of b)o.set(k,add(o.get(k)??r(0),v));return o;};
const product=(a:P,b:P):P=>{let o:P=new Map();for(const [k,c]of a)for(const [l,d]of b){const [i,j]=k.split(',').map(Number),[u,v]=l.split(',').map(Number);o=plus(o,poly([[i+u,j+v,mul(c,d)]]));}return o;};
const D=(p:P,axis:string):P=>poly([...p].flatMap(([k,c])=>{const ij=k.split(',').map(Number),n=ij[axis==='x'?0:1];if(!n)return [];ij[axis==='x'?0:1]--;return [[ij[0],ij[1],mul(c,r(n))] as const];}));
export function independentElementary(task:ReturnType<typeof makeUniversityTask>){
 const p=task.university;if(p.kind!=='multivar-elementary-partial')throw Error('scope');
 const u=poly([[2,0,r(p.a)],[1,1,r(p.b)],[0,2,r(p.c)],[0,0,r(p.d)]]),i=p.target[0],j=p.target[1],ui=D(u,i);
 // Implicit identities exp(f)=u or f²=u; no production chain-rule solver.
 if(!j)return {kind:'list' as const,values:[ui.get('1,0')??r(0),ui.get('0,1')??r(0)].map(v=>f(div(v,r(p.mode==='root'?2:1))))};
 const numerator=p.mode==='log'?plus(product(u,D(ui,j)),scale(product(ui,D(u,j)),r(-1))):scale(plus(scale(product(u,D(ui,j)),r(2)),scale(product(ui,D(u,j)),r(-1))),r(1,4));
 const k=div(numerator.get('0,0')??r(0),r(p.d)),rest=plus(numerator,scale(u,mul(r(-1),k)));
 return {kind:'list' as const,values:[k,rest.get('2,0')??r(0),rest.get('1,1')??r(0),rest.get('0,2')??r(0)].map(f)};
}
