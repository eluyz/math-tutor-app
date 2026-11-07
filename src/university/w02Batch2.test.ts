import {it,expect} from 'vitest';
import {makeUniversityTask,localizeUniversity} from './catalog';
import {w02Batch2Certificate,w02Batch2Oracle} from '../qa/w02Batch2';
import {assessAnswer,emptyAnswer,formatRational as f} from '../answers';
import {r,add,mul,sign,cmp} from '../qa/batchFMath';
import {polishLearningText} from '../../e2e/helpers/localization';
import {writeFileSync} from 'node:fs';
it('all 24 bilinear variants and all 96 existing/new stationary quadratics: exact completeness, value, Hessian, PL/EN',()=>{
 const records:unknown[]=[];let minima=0;
 for(const family of ['multivar-bilinear-extrema','multivar-stationary-point'])for(const level of (family==='multivar-bilinear-extrema'?['hard']:['easy','medium','hard','advanced']) as ('easy'|'medium'|'hard'|'advanced')[])for(let v=0;v<24;v++){
  const task=makeUniversityTask(family,v,level),p=task.university,c=w02Batch2Certificate(task),input=w02Batch2Oracle(task);
  if(p.kind==='multivar-bilinear-extrema'){
   expect(sign(add(mul(p.a,c.y),p.b))).toBe(0);expect(sign(add(mul(p.a,c.x),p.c))).toBe(0);expect(sign(c.D)).toBe(-1);expect(c.classification).toBe('saddle');
   records.push({kind:'bilinear',a:f(p.a),b:f(p.b),c:f(p.c),d:f(p.d),x:f(c.x),y:f(c.y),value:f(c.value),D:f(c.D)});
  }else if(p.kind==='multivar-stationary-point'){
   expect(sign(add(add(mul(r(2),mul(p.a,c.x)),mul(p.b,c.y)),p.d))).toBe(0);
   expect(sign(add(add(mul(p.b,c.x),mul(r(2),mul(p.c,c.y))),p.e))).toBe(0);
   expect(sign(c.D)).not.toBe(0);if(c.classification==='minimum')minima++;
   records.push({kind:'quadratic',a:f(p.a),b:f(p.b),c:f(p.c),d:f(p.d),e:f(p.e),offset:f(p.offset),x:f(c.x),y:f(c.y),value:f(c.value),D:f(c.D)});
  }else throw Error('scope');
  for(const locale of ['pl','en'] as const){
   const t=localizeUniversity(task,locale);expect(assessAnswer(t.answer,input).kind).toBe('correct');expect(assessAnswer(t.answer,emptyAnswer(t.answer)).kind).toBe('invalid');
   if(t.answer.kind==='multi-choice'&&typeof input!=='string'&&input.kind==='multi-choice'){
    for(const field of t.answer.fields){const wrong=field.options.find(o=>o.value!==input.values[field.id])!;expect(assessAnswer(t.answer,{...input,values:{...input.values,[field.id]:wrong.value}}).kind).toBe('incorrect');const missing={...input.values};delete missing[field.id];expect(assessAnswer(t.answer,{kind:'multi-choice',values:missing}).kind).toBe('invalid');}
    expect(t.answer.fields.find(x=>x.id==='conclusion')?.options.find(x=>x.value==='saddle-none')?.label).toBe(locale==='pl'?'Punkt siodłowy; brak ekstremów lokalnych':'Saddle point; no local extrema');
   }else if(typeof input!=='string'&&input.kind==='list'){
    for(let i=0;i<input.values.length;i++){
     const wrong=[...input.values];wrong[i]='99999';expect(assessAnswer(t.answer,{...input,values:wrong}).kind).toBe('incorrect');
     const missing=[...input.values];missing[i]='';expect(assessAnswer(t.answer,{...input,values:missing}).kind).toBe('invalid');
    }
   }
   const steps=t.solution?.filter(x=>x.kind==='working')??[];expect(steps.length).toBe(family==='multivar-bilinear-extrema'?6:7);
   if(p.kind==='multivar-bilinear-extrema'){
    expect(steps[0].action).toBe(`f(x,y)=(${f(p.a)})xy+(${f(p.b)})x+(${f(p.c)})y+(${f(p.d)}); D(f)=ℝ²`);
    expect(steps[1].action).toBe(`f_x=(${f(p.a)})y+(${f(p.b)}); f_y=(${f(p.a)})x+(${f(p.c)})`);
    expect(steps[2].action).toBe(`f_x=f_y=0 ⇒ x=${f(c.x)}, y=${f(c.y)}`);
    expect(steps[3].action).toBe(`H=[[0,${f(p.a)}],[${f(p.a)},0]]; D=−a²=${f(c.D)}<0`);
    expect(steps[4].action).toBe(`f(${f(c.x)},${f(c.y)})=${f(c.value)}; f−f_* = (${f(p.a)})(x−(${f(c.x)}))(y−(${f(c.y)}))`);
    expect(steps[5].action).toBe(locale==='pl'?'Punkt siodłowy; brak ekstremów lokalnych.':'Saddle point; no local extrema.');
   }else if(p.kind==='multivar-stationary-point'){
    expect(steps[0].action).toBe(`f_x=2(${f(p.a)})x+(${f(p.b)})y+(${f(p.d)})`);
    expect(steps[1].action).toBe(`f_y=(${f(p.b)})x+2(${f(p.c)})y+(${f(p.e)})`);
    expect(steps[2].action).toBe(`f_x=0; f_y=0; det=4ac−b²=${f(c.D)} ≠ 0`);
    expect(steps[3].action).toBe(`${locale==='pl'?'Współrzędne: ':'Coordinates: '}x=${f(c.x)}; y=${f(c.y)}`);
    expect(steps[4].action).toBe(`H=[[${f(c.H[0])},${f(c.H[1])}],[${f(c.H[1])},${f(c.H[2])}]]; D=${f(c.D)}`);
    expect(steps[5].action).toBe(`D=${f(c.D)}, f_xx=${f(c.H[0])} ⇒ ${c.classification}`);
    expect(steps[6].action).toBe(`f_* = f(${f(c.x)},${f(c.y)})=${f(c.value)}`);
    if(p.completeMinimum){expect(c.classification).toBe('minimum');expect(sign(c.D)).toBe(1);}
   }
   const actions=steps.map(x=>x.action).join(' ');for(const value of [f(c.x),f(c.y),f(c.D),f(c.value)])expect(actions).toContain(value);
   for(const s of steps)expect(s.reason.length).toBeGreaterThan(20);
   expect(t.hint.length).toBeGreaterThan(20);expect(t.nextHint.length).toBeGreaterThan(20);
   const final=t.solution?.at(-1);if(final?.kind!=='answer')throw Error('final');expect(assessAnswer(final.answer,input).kind).toBe('correct');
   if(locale==='en')expect(t.explanation+' '+t.hint+' '+t.nextHint).not.toMatch(polishLearningText);
  }
 }
 expect(minima).toBe(60);expect(cmp(r(minima),r(0))).toBe(1);
 writeFileSync('/tmp/w02-batch2-symbolic-input.json',JSON.stringify(records));
});
