import {formatRational as f} from "../answers";
import {r,add,sub,mul,div,cmp,pow,sign,convolution,type Rational,type Poly} from "./batchFMath";
export const qkey=(x:Rational)=>`${x.numerator}/${x.denominator}`;
export const abs=(x:Rational)=>sign(x)<0?sub(r(0),x):x;
export const signedPower=(x:Rational,k:number)=>k<0?div(r(1),pow(x,-k)):pow(x,k);
export const baseText=(x:Rational)=>x.denominator===1n?f(x):`(${f(x)})`;
export const polyText=(cs:Poly)=>cs.map((c,i)=>sign(c)===0?"":`(${f(c)})`+(i?"·x"+(["","","²","³","⁴","⁵","⁶"][i]??`^${i}`):"")).reverse().filter(Boolean).join(" + ")||"0";
export function compose(outer:Poly,inner:Poly):Rational[]{
 let out=[r(0)];for(const c of [...outer].reverse()){out=convolution(out,inner);out[0]=add(out[0],c);}
 while(out.length>1&&sign(out.at(-1)!)===0)out.pop();return out;
}
type Interval={lo:Rational|null;hi:Rational|null;lc:boolean;hc:boolean};
/** Independent atomic-cell construction: open cells and boundary points are
 * tested separately, then joined only through included boundary points. */
export function cellDomain(points:readonly Rational[],allows:(x:Rational)=>boolean){
 const cuts=[...points].sort(cmp).filter((x,i,a)=>i===0||cmp(x,a[i-1])!==0),b=[null,...cuts,null];
 const atoms:Interval[]=[];
 for(let i=0;i<b.length-1;i++){
  const lo=b[i],hi=b[i+1],sample=lo===null?sub(hi!,r(1)):hi===null?add(lo,r(1)):div(add(lo,hi),r(2));
  if(allows(sample))atoms.push({lo,hi,lc:false,hc:false});
  if(hi!==null&&allows(hi))atoms.push({lo:hi,hi,lc:true,hc:true});
 }
 const intervals:Interval[]=[];
 for(const item of atoms){
  const last=intervals.at(-1);
  if(last&&last.hi!==null&&item.lo!==null&&cmp(last.hi,item.lo)===0&&(last.hc||item.lc)) {last.hi=item.hi;last.hc=item.hc;}
  else intervals.push({...item});
 }
 const key="set:"+JSON.stringify(intervals.map(i=>[i.lo===null?null:qkey(i.lo),i.hi===null?null:qkey(i.hi),i.lc,i.hc]));
 const text=intervals.length===1&&intervals[0].lo===null&&intervals[0].hi===null?"ℝ":intervals.map(i=>i.lo&&i.hi&&cmp(i.lo,i.hi)===0?`{${f(i.lo)}}`:`${i.lc?"[":"("}${i.lo===null?"−∞":f(i.lo)}; ${i.hi===null?"+∞":f(i.hi)}${i.hc?"]":")"}`).join(" ∪ ")||"∅";
 return {key,text,cuts,intervals};
}
