import {describe,it,expect} from 'vitest';
import {writeFileSync} from 'node:fs';
import {makeUniversityTask,localizeUniversity} from './catalog';
import {nonlinearCriticalPoints} from './w02NonlinearExtrema';
import {independentNonlinear,nonlinearOracleInput} from '../qa/w02NonlinearOracle';
import {assessAnswer,emptyAnswer,formatRational as f} from '../answers';
import {r,mul,div,sign,cmp} from '../qa/batchFMath';
import {polishLearningText} from '../../e2e/helpers/localization';

describe('W02 nonlinear elimination — complete two-point analysis',()=>{
 it('all 24 authored variants: independent derivatives, completeness, all steps and grading in PL/EN',()=>{
  const records:unknown[]=[],keys=new Set<string>(),outcomes=new Map<string,number>();let zero=0;
  for(let v=0;v<24;v++){
   const task=makeUniversityTask('multivar-quadratic-cubic-extrema',v,'hard'),p=task.university;
   if(p.kind!=='multivar-quadratic-cubic-extrema')throw Error('scope');
   const z=independentNonlinear(task),input=nonlinearOracleInput(task);if(typeof input==='string'||input.kind!=='multi-choice')throw Error('input');
   keys.add(task.contentKey);expect(z.points).toHaveLength(2);expect(sign(z.delta)).toBe(1);
   expect(cmp(z.points[0].y,z.points[1].y)).toBe(-1);expect(sign(mul(z.points[0].D,z.points[1].D))).toBe(-1);
   for(const q of z.points){outcomes.set(q.kind,(outcomes.get(q.kind)??0)+1);if(sign(q.y)===0)zero++;}
   records.push({variant:v,coefficients:Object.fromEntries(['a','b','c','d','e','offset'].map(k=>[k,f(p[k as 'a'])])),points:z.points.map(q=>({...Object.fromEntries(['x','y','xx','xy','yy','D','value'].map(k=>[k,f(q[k as 'x'])])),kind:q.kind}))});
   for(const locale of ['pl','en'] as const){
    const t=localizeUniversity(task,locale),spec=t.answer,steps=t.solution?.filter(s=>s.kind==='working')??[];
    if(spec.kind!=='multi-choice')throw Error('fields');expect(spec.fields.map(q=>q.id)).toEqual(Object.keys(input.values));expect(spec.fields).toHaveLength(10);
    expect(assessAnswer(spec,input).kind).toBe('correct');expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe('invalid');
    for(const field of spec.fields){
     const wrong=field.options.find(o=>o.value!==input.values[field.id])!.value;
     expect(assessAnswer(spec,{kind:'multi-choice',values:{...input.values,[field.id]:wrong}}).kind).toBe('incorrect');
     const missing={...input.values};delete missing[field.id];expect(assessAnswer(spec,{kind:'multi-choice',values:missing}).kind).toBe('invalid');
    }
    const swapped=Object.fromEntries(Object.entries(input.values).map(([k,value])=>[k.startsWith('p1-')?k.replace('p1-','p2-'):k.replace('p2-','p1-'),value]));
    const selectable=spec.fields.every(field=>field.options.some(o=>o.value===swapped[field.id]));
    expect(assessAnswer(spec,{kind:'multi-choice',values:swapped}).kind).toBe(selectable?'incorrect':'invalid');
    expect(steps).toHaveLength(12);
    const kind=(k:string)=>k==='minimum'?(locale==='pl'?'minimum lokalne':'local minimum'):k==='maximum'?(locale==='pl'?'maksimum lokalne':'local maximum'):(locale==='pl'?'punkt siodłowy':'saddle point');
    const pt=(q:typeof z.points[number])=>`(${f(q.x)},${f(q.y)})`;
    expect(steps[0].action).toBe(`f(x,y)=(${f(p.a)})x²+(${f(p.b)})xy+(${f(p.c)})y³+(${f(p.d)})y²+(${f(p.e)})y+(${f(p.offset)}); D(f)=ℝ²; f∈C∞(ℝ²)`);
    expect(steps[1].action).toBe(`f_x=(${f(z.A)})x+(${f(z.B)})y; f_y=(${f(p.b)})x+(${f(z.q[2])})y²+(${f(mul(r(2),p.d))})y+(${f(z.q[0])})`);
    expect(steps[2].action).toBe(`f_x=0 ⇔ x=(${f(z.factor)})y; 2a=${f(z.A)}≠0`);
    expect(steps[3].action).toBe(`f_y=0 ⇔ q(y)=(${f(z.q[2])})y²+(${f(z.q[1])})y+(${f(z.q[0])})=0`);
    expect(steps[4].action).toBe(`Δ=(${f(z.q[1])})²−4(${f(z.q[2])})(${f(z.q[0])})=${f(z.delta)}>0; y=(−(${f(z.q[1])})±√(${f(z.delta)}))/(2(${f(z.q[2])}))∈{${z.points.map(q=>f(q.y)).join(',')}}`);
    expect(steps[5].action).toBe(`∇f=0 ⇔ {P₁=${pt(z.points[0])}, P₂=${pt(z.points[1])}}; y₁<y₂`);
    expect(steps[6].action).toBe(`H(x,y)=[[${f(z.A)},${f(z.B)}],[${f(z.B)},(${f(mul(r(2),z.q[2]))})y+(${f(mul(r(2),p.d))})]]; f_xy=f_yx`);
    z.points.forEach((q,i)=>{
     const label=i===0?'P₁':'P₂';
     expect(steps[7+2*i].action).toBe(`H(${label})=[[${f(q.xx)},${f(q.xy)}],[${f(q.xy)},${f(q.yy)}]]; D${i+1}=(${f(q.xx)})(${f(q.yy)})−(${f(q.xy)})²=${f(q.D)} ⇒ ${kind(q.kind)}`);
     expect(steps[8+2*i].action).toBe(`f${pt(q)}=${f(q.value)}; ${label}: ${kind(q.kind)}`);
     expect(spec.fields.find(a=>a.id===`p${i+1}-kind`)?.options.find(a=>a.value===q.kind)?.label).toBe(kind(q.kind));
    });
    expect(steps[11].action).toBe(locale==='pl'?'Dokładnie jedno ścisłe ekstremum lokalne i jeden punkt siodłowy.':'Exactly one strict local extremum and one saddle point.');
    for(const step of steps){expect(step.action.length).toBeGreaterThan(8);expect(step.reason.length).toBeGreaterThan(20);}
    expect(t.hint).toBe(locale==='pl'?'Z równania f_x=0 wyznacz x przez y, dzieląc tylko przez stałą 2a≠0. Nie dziel przez zmienną.':'Use f_x=0 to express x in terms of y, dividing only by the constant 2a≠0. Do not divide by a variable.');
    expect(t.nextHint).toBe(locale==='pl'?'Rozwiąż otrzymane równanie kwadratowe w y, zachowaj oba pierwiastki i zbadaj Hessian w obu punktach. Uporządkuj punkty według y.':'Solve the resulting quadratic in y, retain both roots and examine the Hessian at both points. Order the points by y.');
    const final=t.solution?.at(-1);if(final?.kind!=='answer')throw Error('final');expect(assessAnswer(final.answer,input).kind).toBe('correct');
    if(locale==='en')for(const text of [t.title,t.question,t.hint,t.nextHint,t.explanation,...spec.fields.flatMap(a=>[a.label,...a.options.map(o=>o.label)]),...steps.map(s=>s.reason+' '+s.action)])expect(text).not.toMatch(polishLearningText);
   }
  }
  expect(keys.size).toBe(24);expect(Object.fromEntries(outcomes)).toEqual({saddle:24,minimum:12,maximum:12});expect(zero).toBeGreaterThan(0);
  writeFileSync('/tmp/w02-batch3-symbolic-input.json',JSON.stringify(records));
 });
 it('rejects parameters outside the controlled nondegenerate two-root contract without calling D=0 no extremum',()=>{
  const task=makeUniversityTask('multivar-quadratic-cubic-extrema',0,'hard');if(task.university.kind!=='multivar-quadratic-cubic-extrema')throw Error('scope');const p=task.university;
  for(const k of ['a','b','c'] as const)expect(()=>nonlinearCriticalPoints({...p,[k]:r(0)})).toThrow('nonzero');
  const d=div(mul(p.b,p.b),mul(r(4),p.a));
  expect(()=>nonlinearCriticalPoints({...p,d,e:r(0)})).toThrow('D=0 is not a no-extremum verdict');
 });
});
