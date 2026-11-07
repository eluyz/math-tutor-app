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
/** Refuse an under-specified extension: the visible task must define f, not just g. */
export function qa003VisibleDefinition(question:string){
 const origin=/u=x−\(([^)]+)\), v=y−\(([^)]+)\)/.exec(question);if(!origin)throw Error('Missing visible translation');
 const atX=q(origin[1]),atY=q(origin[2]);
 const samePoint=(x:string,y:string)=>cmp(q(x),atX)===0&&cmp(q(y),atY)===0;
 const header=/\(([^,()]+),\s*([^()]+)\)\.$/.exec(question.split('\n')[0]);
 if(!header||!samePoint(header[1],header[2]))throw Error('Question target differs from translation');
 const asksContinuity=/ciągłość|continuity/i.test(question.split('\n')[0]);
 const assigned=/f\(([−+\-\d./]+),\s*([−+\-\d./]+)\)=([^;\n]+)$/.exec(question);
 const links=[...question.matchAll(/f\(x,y\)=g\(x,y\)\s+(?:dla|for)\s+\(x,y\)≠\(([^,()]+),\s*([^()]+)\)/g)];
 if(asksContinuity||assigned||links.length){
  if(links.length!==1)throw Error('Missing explicit off-point relation f=g');
  if(!samePoint(links[0][1],links[0][2]))throw Error('Off-point definition target mismatch');
  if(!assigned)throw Error('Missing assigned value of f at target');
  if(!samePoint(assigned[1],assigned[2]))throw Error('Assigned function value target mismatch');
 }
 const point=`(${origin[1]}, ${origin[2]})`;
 if(!question.includes('(x,y)≠'+point))throw Error('Missing punctured-domain condition');
 return {atX,atY,asksContinuity,valueAt:assigned?q(assigned[3]):undefined};
}
export function qa003VisibleCertificate(question:string){
 const {atX,atY,asksContinuity,valueAt}=qa003VisibleDefinition(question);
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
 const classification=valueAt===undefined?(finite?'finite':'does-not-exist'):finite?(cmp(valueAt,finite)===0?'continuous':'removable'):'nonremovable';
 const input:AnswerInput=valueAt===undefined?{kind:'limit',classification,value:finite?ascii(finite):''}:{kind:'choice',value:classification};
 return {atX,atY,asksContinuity,base,k,c,a,C,method,paths,finite,valueAt,classification,input};
}
export function qa003Wrong(input:AnswerInput):AnswerInput{
 if(typeof input==='string')throw Error('structured');
 if(input.kind==='choice')return {kind:'choice',value:input.value==='continuous'?'removable':'continuous'};
 if(input.kind==='limit')return {kind:'limit',classification:input.classification==='finite'?'does-not-exist':'finite',value:'99999'};
 throw Error('scope');
}
