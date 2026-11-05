import {describe,it,expect} from 'vitest';
import {batchH,batchHCertificate,wrongBatchH} from './batchH';
import {makeUniversityTask,localizeUniversity} from '../university/catalog';
import {assessAnswer,emptyAnswer} from '../answers';
import {auditCalculation} from '../university/audit';
import {polishLearningText} from '../../e2e/helpers/localization';
const clean=(s:string)=>s.replace(/\s/g,'').replaceAll('-','−');
describe('Batch H independent exact two-variable QA',()=>{
 it('bounds the matrix and covers every supported derivative target',()=>{
  expect(batchH.length).toBe(10);expect(new Set(batchH.map(x=>x.skill))).toEqual(new Set(['W01','W02']));
  expect(batchH.flatMap(x=>x.variants)).toHaveLength(28);
 });
 it('matches hand-derived values on already sampled IDs',()=>{
  const cases=[
   ['multivar-partial-point','hard',0,'−3'],
   ['multivar-cubic-partial','expert',3,'−2/3'],
   ['multivar-chain-gradient','expert',0,{kind:'list',values:['115/243','115/243']}],
   ['multivar-stationary-point','hard',0,{kind:'list',values:['−11/3','−1']}],
   ['multivar-hessian-classify','hard',3,{kind:'choice',value:'inconclusive'}],
   ['multivar-degenerate-quartic','expert',3,{kind:'choice',value:'maximum'}],
  ] as const;
  for(const [family,level,v,input] of cases)expect(batchHCertificate(makeUniversityTask(family,v,level)).input).toEqual(input);
 });
 it('does not instruct a first-order task to compute a second derivative',()=>{
  for(const level of ['hard','advanced','expert'] as const)for(let v=0;v<24;v++){
   const task=makeUniversityTask('multivar-cubic-partial',v,level),p=task.university;
   if(p.kind!=='multivar-cubic-partial')throw Error('cubic');
   const pl=localizeUniversity(task,'pl'),en=localizeUniversity(task,'en');
   if(p.target==='x'||p.target==='y'){
    expect(pl.nextHint).toContain('jeśli jest potrzebna');
    expect(en.nextHint).toContain('if needed');
   }
  }
 });
 for(const row of batchH)it(`${row.skill} ${row.family}/${row.level}: 24 parameters × PL/EN`,()=>{
  const keys=new Set<string>(),classes=new Set<string>(),targets=new Set<string>();
  for(let v=0;v<24;v++){
   const task=makeUniversityTask(row.family,v,row.level),cert=batchHCertificate(task);keys.add(task.contentKey);
   expect(cert.facts.length).toBeGreaterThanOrEqual(2);
   if(cert.classification)classes.add(cert.classification);
   if('target' in task.university)targets.add(task.university.target);
   for(const locale of ['pl','en'] as const){
    const view=localizeUniversity(task,locale),localized=batchHCertificate(task,locale);
    expect(assessAnswer(view.answer,cert.input),task.id).toEqual({kind:'correct'});
    expect(assessAnswer(view.answer,wrongBatchH(cert.input,task)).kind,task.id).toBe('incorrect');
    expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe('invalid');
    const steps=view.solution?.filter(x=>x.kind==='working')??[];
    expect(steps.length).toBe(localized.anchors.length);
    steps.forEach((step,i)=>{
     expect(localized.anchors[i].length).toBeGreaterThan(0);
     for(const a of localized.anchors[i])expect(clean(step.action),task.id+' step '+i).toContain(clean(a));
     expect(step.reason.length).toBeGreaterThan(15);
     for(const calculation of step.calculations)expect(auditCalculation(calculation)).toBe(true);
    });
    expect(view.hint.length).toBeGreaterThan(15);expect(view.nextHint.length).toBeGreaterThan(15);expect(view.hint).not.toBe(view.nextHint);
    expect(view.explanation.length).toBeGreaterThan(20);
    const final=view.solution?.at(-1);expect(final?.kind).toBe('answer');
    if(final?.kind==='answer')expect(assessAnswer(final.answer,cert.input)).toEqual({kind:'correct'});
    if(locale==='en')expect([view.question,view.hint,view.nextHint,view.explanation,...steps.map(s=>s.action+' '+s.reason)].join(' ')).not.toMatch(polishLearningText);
   }
  }
  expect(keys.size).toBe(24);
  if(row.family==='multivar-partial-point'||row.family==='multivar-cubic-partial')expect(targets).toEqual(new Set(['x','y','xx','xy','yy']));
  if(row.family==='multivar-hessian-classify')expect(classes).toEqual(new Set(['minimum','maximum','saddle','inconclusive']));
  if(row.family==='multivar-degenerate-quartic')expect(classes).toEqual(new Set(['minimum','maximum','saddle']));
 });
});
