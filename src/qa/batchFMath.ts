/** Test-only exact polynomial arithmetic, independent of the application calculus. */
import {rational,addRational,subtractRational,multiplyRational,divideRational,type Rational} from "../rational";
export {type Rational};
export const r=rational,add=addRational,sub=subtractRational,mul=multiplyRational,div=divideRational;
export type Poly=readonly Rational[];
export const sign=(x:Rational)=>x.numerator<0n?-1:x.numerator>0n?1:0;
export const cmp=(a:Rational,b:Rational)=>sign(sub(a,b));
export function demand(ok:boolean,why:string):asserts ok {if(!ok)throw Error(why);}
export const pow=(a:Rational,n:number):Rational=>{demand(Number.isInteger(n)&&n>=0,"Nonnegative integer power");let p=r(1);for(let i=0;i<n;i++)p=mul(p,a);return p;};
export const convolution=(a:Poly,b:Poly):Rational[]=>{
 const out=Array.from({length:a.length+b.length-1},()=>r(0));
 a.forEach((x,i)=>b.forEach((y,j)=>out[i+j]=add(out[i+j],mul(x,y))));return out;
};
export const derivative=(a:Poly):Rational[]=>a.slice(1).map((x,i)=>mul(x,r(i+1)));
export const evaluate=(a:Poly,x:Rational):Rational=>a.reduceRight((s,c)=>add(mul(s,x),c),r(0));
export const scaled=(a:Poly,c:Rational):Rational[]=>a.map(x=>mul(x,c));
export const polyEqual=(a:Poly,b:Poly)=>Array.from({length:Math.max(a.length,b.length)},(_,i)=>cmp(a[i]??r(0),b[i]??r(0))===0).every(Boolean);
/** All polynomial roots used in rational sign charts are explicitly accounted
 * for by degree and factor multiplicity, then signs are evaluated on open cells. */
export function signsOnCells(fn:(x:Rational)=>Rational,cuts:readonly Rational[]):number[]{
 demand(cuts.every((x,i)=>i===0||cmp(x,cuts[i-1])>0),"Sorted distinct cuts");
 const bounds=[null,...cuts,null];
 return bounds.slice(0,-1).map((lo,i)=>{
  const hi=bounds[i+1],x=lo===null?sub(hi!,r(1)):hi===null?add(lo,r(1)):div(add(lo,hi),r(2));
  const s=sign(fn(x));demand(s!==0,"Cell sample cannot be a zero/pole");return s;
 });
}
export const glyph=(s:number)=>s>0?"+":"−";
export const key=(x:Rational)=>`${x.numerator}/${x.denominator}`;
