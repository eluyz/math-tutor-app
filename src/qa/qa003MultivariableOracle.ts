/** QA-003 visible-question oracle: no university data, answer keys or production limit helpers. */
import {parseAnswer,type Rational} from '../rational';
import {r,add,mul,div,sign,cmp,type Poly} from './batchFMath';
import type {AnswerInput} from '../answers';
export const qa003Families=[
 {family:'multivar-path-limit',levels:['medium','hard','advanced']},
 {family:'multivar-continuity-point',levels:['medium','hard','advanced']},
 {family:'multivar-polar-homogeneous-limit',levels:['hard','advanced','expert']},
 {family:'multivar-angular-continuity',levels:['hard','advanced','expert']},
] as const;
export const qa003Reviews:Readonly<Record<string,readonly string[]>>={
 'multivar-path-limit':['medium:0','medium:1','hard:1','advanced:0'],
 'multivar-continuity-point':['medium:0','medium:1','medium:2','hard:1','advanced:2'],
 'multivar-polar-homogeneous-limit':['hard:0','hard:1','advanced:2','expert:3'],
 'multivar-angular-continuity':['hard:0','hard:1','hard:2','advanced:1','expert:5'],
};
const q=(s:string)=>{const x=parseAnswer(s);if(x.kind!=='valid')throw Error('Visible rational: '+s);return x.value;};
export const ascii=(x:Rational)=>x.denominator===1n?String(x.numerator):`${x.numerator}/${x.denominator}`;
function pathAtZero(n:Poly,d:Poly){
 const i=n.findIndex(x=>sign(x)!==0),j=d.findIndex(x=>sign(x)!==0);
 if(j<0||i>=0&&i<j)throw Error('Unexpected path pole');
 return i<0||i>j?r(0):div(n[i],d[j]);
}
export function qa003VisibleCertificate(question:string){
 const origin=/u=x−\(([^)]+)\), v=y−\(([^)]+)\)/.exec(question);if(!origin)throw Error('Missing visible translation');
 const atX=q(origin[1]),atY=q(origin[2]),point=`(${origin[1]}, ${origin[2]})`;
 if(!question.includes('(x,y)≠'+point))throw Error('Missing punctured-domain condition');
 const assigned=/; f\([^)]*\)=([^;\n]+)$/.exec(question)?.[1];
 const angular=/g\(x,y\)=\(([^)]+)\)\+\(\(([^)]+)\)u²\+\(([^)]+)\)v²\)\/\(u²\+v²\)/.exec(question);
 let base:Rational,k:Rational|undefined,c:Rational|undefined,a:Rational|undefined,C:Rational|undefined;
 let method:string,paths:readonly Rational[],finite:Rational|undefined;
 if(angular){
  base=q(angular[1]);a=q(angular[2]);C=q(angular[3]);paths=[add(base,a),add(base,C)];
  finite=cmp(a,C)===0?paths[0]:undefined;method=finite?'constant-quotient':'unequal-axes';
 }else{
  const m=/g\(x,y\)=\(([^)]+)\)\+\(([^)]+)\)(u²v\/\(u⁴\+v²\)|u²v²\/\(u²\+v²\)(?:²)?)/.exec(question);if(!m)throw Error('Unknown visible formula');
  base=q(m[1]);k=q(m[2]);if(sign(k)===0)throw Error('Audit branch requires nonzero coefficient');
  if(m[3]==='u²v/(u⁴+v²)'){
   // Use the fixed independently chosen parabola v=u², not production curve data.
   c=r(1);const fractional=pathAtZero([r(0),r(0),r(0),r(0),c],[r(0),r(0),r(0),r(0),add(r(1),mul(c,c))]);
   paths=[base,add(base,mul(k,fractional))];method='parabola-counterexample';
  }else if(m[3].endsWith(')²')){
   paths=[base,add(base,mul(k,pathAtZero([r(0),r(0),r(0),r(0),r(1)],[r(0),r(0),r(0),r(0),r(4)])))];method='axis-diagonal-counterexample';
  }else{finite=base;paths=[base];method='uniform-square-bound';}
 }
 const valueAt=assigned?q(assigned):undefined;
 const classification=valueAt===undefined?(finite?'finite':'does-not-exist'):finite?(cmp(valueAt,finite)===0?'continuous':'removable'):'nonremovable';
 const input:AnswerInput=valueAt===undefined?{kind:'limit',classification,value:finite?ascii(finite):''}:{kind:'choice',value:classification};
 return {atX,atY,base,k,c,a,C,method,paths,finite,valueAt,classification,input};
}
export function qa003Wrong(input:AnswerInput):AnswerInput{
 if(typeof input==='string')throw Error('structured');
 if(input.kind==='choice')return {kind:'choice',value:input.value==='continuous'?'removable':'continuous'};
 if(input.kind==='limit')return {kind:'limit',classification:input.classification==='finite'?'does-not-exist':'finite',value:'99999'};
 throw Error('scope');
}
