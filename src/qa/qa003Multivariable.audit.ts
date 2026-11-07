import {it,expect} from 'vitest';
import {writeFileSync,mkdirSync} from 'node:fs';
import {makeUniversityTask,localizeUniversity} from '../university/catalog';
import {allTemplates,difficulties,taskPool} from '../generators';
import {assessAnswer,emptyAnswer,type AnswerInput} from '../answers';
import {qa003Families,qa003Reviews,qa003VisibleCertificate as certificate,qa003Wrong,ascii} from './qa003MultivariableOracle';
const main='11d80cc022b30e0be8381fe712392f14d0769590';
const records:unknown[]=[];
it('QA-003: 4 previously unlisted families, every level/variant and independent visible-formula grading',()=>{
 expect(allTemplates).toHaveLength(240);
 const cats=new Set(allTemplates.map(x=>x.category));expect([...cats].reduce((n,c)=>n+difficulties.reduce((m,d)=>m+taskPool(c,d).length,0),0)).toBe(18333);
 const keys=new Set<string>();let grading=0,localized=0;
 for(const row of qa003Families)for(const level of row.levels)for(let v=0;v<24;v++){
  const task=makeUniversityTask(row.family,v,level);keys.add(task.id);const views=[];
  for(const locale of ['pl','en'] as const){
   const view=localizeUniversity(task,locale),cert=certificate(view.question),spec=view.answer;
   const invalid:AnswerInput[]=spec.kind==='limit'?[
    {kind:'limit',classification:'finite',value:'1/0'},
    {kind:'limit',classification:'finite',value:'not-a-number'},
   ]:[{kind:'choice',value:'unknown-choice'},{kind:'matrix',values:[['0']]}];
   const scenarios:[string,AnswerInput,string][]=[['correct',cert.input,'correct'],['wrong',qa003Wrong(cert.input),'incorrect'],['empty',emptyAnswer(spec),'invalid'],['malformed',invalid[0],'invalid'],['invalid-format',invalid[1],'invalid'],['wrong-structure','__bad_structure__','invalid']];
   for(const [name,input,expected]of scenarios){expect(assessAnswer(spec,input).kind,task.id+locale+name).toBe(expected);grading++;}
   const final=view.solution?.at(-1);if(final?.kind!=='answer')throw Error('Missing final');expect(assessAnswer(final.answer,cert.input).kind).toBe('correct');
   const steps=view.solution?.filter(s=>s.kind==='working')??[];
   expect(steps.some(s=>s.action.includes('(u,v)→(0,0)'))).toBe(true);
   if(cert.method==='uniform-square-bound')expect(steps.some(s=>s.action.includes('≤')&&s.action.includes('→0'))).toBe(true);
   const assignedValue=cert.valueAt;
   if(assignedValue!==undefined)expect(steps.some(s=>s.action.includes(ascii(assignedValue).replaceAll('-','−')))).toBe(true);
   localized++;
   views.push({locale,question:view.question,hint:view.hint,next_hint:view.nextHint,steps:view.solution,
    certificate:{...cert,input:cert.input},grading:scenarios.map(([name,,expected])=>({name,result:'PASS',expected}))});
  }
  records.push({main_sha:main,family_id:row.family,difficulty:level,variant_index:v,source_reference:'BLOCKED_SOURCE — authored app only',oracle_kind:'visible-formula exact TS plus independent SymPy proof',answer_result:'PASS',grading_result:'PASS',semantic_sample:qa003Reviews[row.family].includes(`${level}:${v}`),views});
 }
 expect(keys.size).toBe(288);expect(localized).toBe(576);expect(grading).toBe(3456);
 mkdirSync('test-results',{recursive:true});
 writeFileSync('test-results/qa003-multivariable-export.json',JSON.stringify({main_sha:main,revision:'review2-explicit-function-definition',supersedes:'ace2e815b33320c60dc6e1573c9ad927000f11c2',tuples:288,localized,grading,records},(_,v)=>typeof v==='bigint'?v.toString():v,2));
});
