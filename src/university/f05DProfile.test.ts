import {describe,it,expect} from 'vitest';
import {makeUniversityTask,localizeUniversity} from './catalog';
import {assessAnswer,emptyAnswer,type AnswerInput,type AnswerSpec} from '../answers';
import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,equalRational as eq} from '../rational';
import {polishLearningText} from '../../e2e/helpers/localization';
const fmt=(n:number)=>String(n).replaceAll('-','−');
const fields=['domain','range','increasing','decreasing','injective','parity'] as const;
/** Map independently proved labels to UI option IDs; never read field.value. */
function inputFor(spec:AnswerSpec,labels:Record<string,string>):AnswerInput{
 if(spec.kind!=='multi-choice')throw Error('Six fields required');
 return {kind:'multi-choice',values:Object.fromEntries(spec.fields.map(field=>{
  const option=field.options.find(x=>x.label===labels[field.id]);
  if(!option)throw Error('Missing independent label '+field.id+': '+labels[field.id]);
  return [field.id,option.value];
 }))};
}
describe('F05-d synthetic increasing outers, decreasing middle, neither parity',()=>{
 for(const level of ['hard','advanced','expert'] as const)for(const v of [2,8,14,20])it(`${level}:${v} independently checks all six fields and teaching in PL/EN`,()=>{
  const task=makeUniversityTask('function-integrated-asymptotes',v,level),p=task.university;
  if(p.kind!=='function-integrated-asymptotes')throw Error('Wrong family');
  const a=p.center-p.radius,b=p.center+p.radius,L=p.left[0].x,R=p.right[1].x;
  expect(p.left[1].x).toBe(a);expect(p.right[0].x).toBe(b);
  const slopeL=div(r(p.left[1].y-p.left[0].y),r(p.left[1].x-L));
  const slopeR=div(r(p.right[1].y-p.right[0].y),r(R-p.right[0].x));
  expect(eq(slopeL,r(1))).toBe(true);expect(eq(slopeR,r(1))).toBe(true);
  expect(p.sign).toBe(1);expect(p.scale).toBeGreaterThan(0);expect(p.radius).toBeGreaterThan(0);
  // On |t|<radius, f'=−scale*radius*(t²+radius²)/(t²−radius²)²<0.
  // At a+ the rational term is +∞; at b− it is −∞. Continuity gives W=R.
  // Thus every interior outer height is also reached at a distinct middle x.
  expect(L+R).not.toBe(0); // finite domain extrema are not reflections: neither parity
  const expected={domain:`[${fmt(L)}; ${fmt(a)}) ∪ (${fmt(a)}; ${fmt(b)}) ∪ (${fmt(b)}; ${fmt(R)}]`,range:'ℝ',increasing:`[${fmt(L)}; ${fmt(a)}) ∪ (${fmt(b)}; ${fmt(R)}]`,decreasing:`(${fmt(a)}; ${fmt(b)})`};
  for(const locale of ['pl','en'] as const){
   const view=localizeUniversity(task,locale),labels={...expected,injective:locale==='pl'?'Nie':'No',parity:locale==='pl'?'Ani parzysta, ani nieparzysta':'Neither'};
   const input=inputFor(view.answer,labels);expect(assessAnswer(view.answer,input)).toEqual({kind:'correct'});
   if(view.answer.kind!=='multi-choice'||typeof input==='string'||input.kind!=='multi-choice')throw Error('Six fields required');
   expect(view.answer.fields.map(x=>x.id)).toEqual(fields);
   expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe('invalid');
   for(const field of view.answer.fields){
    const values={...input.values};delete values[field.id];
    expect(assessAnswer(view.answer,{kind:'multi-choice',values}).kind).toBe('invalid');
    const wrong=field.options.find(x=>x.value!==input.values[field.id])!;
    expect(assessAnswer(view.answer,{...input,values:{...input.values,[field.id]:wrong.value}}).kind).toBe('incorrect');
   }
   const steps=view.solution?.filter(x=>x.kind==='working')??[];expect(steps).toHaveLength(6);
   [expected.domain,expected.range,expected.increasing,expected.decreasing,locale==='pl'?'nie':'no',locale==='pl'?'żadna':'neither'].forEach((value,i)=>expect(steps[i].action).toContain(value));
   expect(steps[0].reason).toContain(locale==='pl'?'puste':'hollow');
   expect(steps[1].reason).toContain(locale==='pl'?'każde y':'every y');
   expect(steps[2].reason).toContain('−');
   expect(steps[3].reason).toContain(locale==='pl'?'otwarte':'open');
   expect(steps[4].reason).toContain(locale==='pl'?'inn':'another');
   expect(steps[5].reason).toContain(locale==='pl'?'symetri':'symmetry');
   expect(view.hint).toContain(locale==='pl'?'trzech':'three');expect(view.nextHint).toContain(locale==='pl'?'nachylenia':'slopes');
   const final=view.solution?.at(-1);expect(final?.kind).toBe('answer');if(final?.kind==='answer')expect(assessAnswer(final.answer,input)).toEqual({kind:'correct'});
   if(locale==='en')expect([view.question,view.hint,view.nextHint,view.explanation].join(' ')).not.toMatch(polishLearningText);
  }
 });
 it('pins authored hard:2 geometry, six exact answers and rational noninjectivity witness',()=>{
  const task=makeUniversityTask('function-integrated-asymptotes',2,'hard'),p=task.university;
  if(p.kind!=='function-integrated-asymptotes')throw Error('Wrong family');
  expect(p).toEqual({kind:'function-integrated-asymptotes',center:1,radius:2,shift:1,scale:1,sign:1,left:[{x:-3,y:-3},{x:-1,y:-1}],right:[{x:3,y:2},{x:5,y:4}]});
  // At middle x=−1/2: t=−3/2, f=1+2t/(t²−4)=19/7.
  // At right x=26/7: the independent line y=x−1 also equals 19/7.
  const t=r(-3,2),middle=add(r(1),div(mul(r(2),t),sub(mul(t,t),r(4))));
  expect(eq(middle,r(19,7))).toBe(true);expect(eq(sub(r(26,7),r(1)),middle)).toBe(true);
  const en=localizeUniversity(task,'en');
  expect(assessAnswer(en.answer,inputFor(en.answer,{domain:'[−3; −1) ∪ (−1; 3) ∪ (3; 5]',range:'ℝ',increasing:'[−3; −1) ∪ (3; 5]',decreasing:'(−1; 3)',injective:'No',parity:'Neither'}))).toEqual({kind:'correct'});
 });
});
