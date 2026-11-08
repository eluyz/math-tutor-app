import {describe,it,expect} from 'vitest';
import {makeUniversityTask} from './catalog';
import {w02NonlinearFamilies,presentW02Nonlinear,sourceStationaryPoints,nonlinearCriticalPoints,nonlinearValue} from './w02NonlinearExtrema';
import {rational as r} from '../rational';
import {assessAnswer,emptyAnswer,formatRational as f} from '../answers';
import {polishLearningText} from '../../e2e/helpers/localization';

const num=(z:{numerator:bigint;denominator:bigint})=>Number(z.numerator)/Number(z.denominator);
const numeric=(s:string)=>{const t=s.replace(/−/g,'-');return t.includes('/')?Number(t.split('/')[0])/Number(t.split('/')[1]):Number(t);};

describe('W02 advanced source-shaped stationarity: three and four complete points',()=>{
 it('24 authored cases; independent gradient, Hessian and answer/grading PL/EN',()=>{
  const ids=new Set<string>(),counts=new Map<number,number>(),zeroX= new Set<number>();
  for(let v=0;v<24;v++){
   const p=w02NonlinearFamilies[0].create(v,'advanced');
   if(p.kind!=='multivar-quadratic-cubic-extrema')throw Error('wrong generator');
   expect(p.mode).toBe(v%2===0?'three':'four');
   ids.add([p.mode,f(p.a),f(p.b),f(p.c),f(p.d),f(p.offset)].join(':'));
   const points=sourceStationaryPoints(p),three=p.mode==='three',count=three?3:4;
   counts.set(count,(counts.get(count)??0)+1);
   expect(points).toHaveLength(count);
   expect(points.filter(q=>q.kind==='minimum')).toHaveLength(1);
   expect(points.filter(q=>q.kind==='saddle')).toHaveLength(count-1);
   for(let i=1;i<points.length;i++){
    expect(num(points[i].y)).toBeGreaterThanOrEqual(num(points[i-1].y));
    if(num(points[i].y)===num(points[i-1].y))expect(num(points[i].x)).toBeGreaterThan(num(points[i-1].x));
   }
   for(const z of points){
    const x=num(z.x),y=num(z.y),a=num(p.a),b=num(p.b),c=num(p.c),d=num(p.d),k=num(p.offset);
    if(x===0)zeroX.add(v);
    const fx=three?2*a*x-c*y*y:3*a*x*x+2*b*x-d*y*y;
    const fy=three?2*y*(b-c*x):2*y*(c-d*x);
    const xx=three?2*a:6*a*x+2*b;
    const xy=three?-2*c*y:-2*d*y;
    const yy=three?2*(b-c*x):2*(c-d*x);
    const D=xx*yy-xy*xy;
    const value=three?a*x*x+(b-c*x)*y*y+k:a*x**3+b*x*x+(c-d*x)*y*y+k;
    expect(fx).toBeCloseTo(0,9);
    expect(fy).toBeCloseTo(0,9);
    expect(num(z.xx)).toBeCloseTo(xx,9);
    expect(num(z.xy)).toBeCloseTo(xy,9);
    expect(num(z.yy)).toBeCloseTo(yy,9);
    expect(num(z.D)).toBeCloseTo(D,9);
    expect(num(z.value)).toBeCloseTo(value,9);
    expect(z.kind).toBe(D<0?'saddle':D>0&&xx>0?'minimum':'inconclusive');
   }
   for(const locale of ['pl','en'] as const){
    const view=presentW02Nonlinear(p,locale),spec=view.answer;
    expect(view.question).toContain('f(x,y)=');
    expect(view.question).toContain('x');
    expect(view.hint.length).toBeGreaterThan(20);
    expect(view.nextHint.length).toBeGreaterThan(20);
    expect(spec.kind).toBe('multi-choice');
    if(spec.kind!=='multi-choice')throw Error('missing multi-choice grading');
    expect(spec.fields).toHaveLength(6*count);
    const expected=Object.fromEntries(spec.fields.map(field=>[field.id,field.value]));
    expect(assessAnswer(spec,{kind:'multi-choice',values:expected}).kind).toBe('correct');
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe('invalid');
    for(let i=0;i<count;i++){
     const pt=points[i];
     for(const [key,value] of [['x',num(pt.x)],['y',num(pt.y)],['f',num(pt.value)],['fxx',num(pt.xx)],['D',num(pt.D)]] as const){
      const field=spec.fields.find(q=>q.id===`p${i+1}-${key}`);
      if(!field)throw Error('missing field: '+key);
      expect(numeric(field.value)).toBeCloseTo(value,9);
     }
     expect(spec.fields.find(q=>q.id===`p${i+1}-kind`)?.value).toBe(pt.kind);
    }
    for(const field of spec.fields){
     expect(new Set(field.options.map(q=>q.value)).size).toBe(field.options.length);
     expect(field.options.some(q=>q.value===field.value)).toBe(true);
     const wrong=field.options.find(q=>q.value!==field.value);
     if(!wrong)throw Error('no negative option');
     expect(assessAnswer(spec,{kind:'multi-choice',values:{...expected,[field.id]:wrong.value}}).kind).toBe('incorrect');
     const missing={...expected};delete missing[field.id];
     expect(assessAnswer(spec,{kind:'multi-choice',values:missing}).kind).toBe('invalid');
    }
    const swapped={...expected};
    for(const suffix of ['x','y','f','fxx','D','kind']){
      swapped['p1-'+suffix]=expected['p2-'+suffix];
      swapped['p2-'+suffix]=expected['p1-'+suffix];
    }
    expect(assessAnswer(spec,{kind:'multi-choice',values:swapped}).kind).not.toBe('correct');
    const steps=view.solution?.filter(step=>step.kind==='working')??[];
    expect(steps.length).toBe(7+2*count);
    expect(steps[2].action).toContain('y=0');
    expect(steps[4].action).toContain('∇f=0');
    expect(steps[5].action).toContain('f_xy=f_yx');
    for(const step of steps)expect(step.reason.length).toBeGreaterThan(20);
    const final=view.solution?.at(-1);
    if(final?.kind!=='answer')throw Error('missing final');
    expect(assessAnswer(final.answer,{kind:'multi-choice',values:expected}).kind).toBe('correct');
    if(locale==='en')for(const s of [view.question,view.hint,view.nextHint,view.explanation,...steps.map(z=>z.action+' '+z.reason)])
      expect(s).not.toMatch(polishLearningText);
   }
  }
  expect(ids.size).toBe(24);
  expect(Object.fromEntries(counts)).toEqual({'3':12,'4':12});
  expect(zeroX.size).toBe(24);
 });
 it('legacy hard cases remain two-point problems and advanced rejects invalid coefficients',()=>{
  for(let v=0;v<24;v++){
   const p=makeUniversityTask('multivar-quadratic-cubic-extrema',v,'hard').university;
   if(p.kind!=='multivar-quadratic-cubic-extrema')throw Error('legacy regression');
   expect(p.mode).toBeUndefined();
  }
  const p=w02NonlinearFamilies[0].create(0,'advanced');
  if(p.kind!=='multivar-quadratic-cubic-extrema')throw Error('scope');
  expect(()=>sourceStationaryPoints({...p,a:r(0)})).toThrow('Positive');
  expect(()=>sourceStationaryPoints({...p,b:r(-1)})).toThrow('Positive');
  const q=w02NonlinearFamilies[0].create(1,'advanced');
  if(q.kind!=='multivar-quadratic-cubic-extrema')throw Error('scope');
  expect(()=>sourceStationaryPoints({...q,d:r(0)})).toThrow('Positive');
  expect(()=>sourceStationaryPoints({...q,b:r(1)})).toThrow('exact');
  expect(()=>nonlinearCriticalPoints(p)).toThrow('Use sourceStationaryPoints');
  expect(()=>nonlinearValue(p,r(0),r(0))).toThrow('Use sourceStationaryPoints');
  expect(()=>w02NonlinearFamilies[0].create(-1,'advanced')).toThrow('Invalid advanced W02 variant');
  expect(()=>w02NonlinearFamilies[0].create(24,'advanced')).toThrow('Invalid advanced W02 variant');
 });
});
