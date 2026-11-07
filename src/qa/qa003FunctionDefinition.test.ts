import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {makeUniversityTask,localizeUniversity} from '../university/catalog';
import {qa003VisibleCertificate,qa003Families} from './qa003MultivariableOracle';
const digest=(value:unknown)=>createHash('sha256').update(JSON.stringify(value,(_,v)=>typeof v==='bigint'?v.toString():v)).digest('hex');
const missingRelation=(question:string)=>question.replace('f(x,y)=g(x,y)','');
it('QA003-MV-02: all 72 angular variants define f in PL/EN and preserve task identities, parameters and answers',()=>{
 const before=JSON.parse(readFileSync(new URL('../../docs/qa003-multivariable-20261107/review2/pre-review-invariants.json',import.meta.url),'utf8'));
 expect(before.head).toBe('ace2e815b33320c60dc6e1573c9ad927000f11c2');expect(before.rows).toHaveLength(72);
 for(const row of before.rows){
  const [,level,variant]=row.id.split(':');const task=makeUniversityTask('multivar-angular-continuity',Number(variant),level);
  expect(task.id).toBe(row.id);expect(digest(task.parameters)).toBe(row.parameters_sha256);expect(digest(task.university)).toBe(row.university_sha256);
  for(const locale of ['pl','en']as const){
   const view=localizeUniversity(task,locale);expect(digest(view.answer)).toBe(row[locale+'_answer_sha256']);
   const cert=qa003VisibleCertificate(view.question);expect(cert.asksContinuity).toBe(true);
   expect(view.question).toContain(locale==='pl'?'f(x,y)=g(x,y) dla ':'f(x,y)=g(x,y) for ');
   expect(view.solution?.some(s=>s.action.includes('f(x,y)=g(x,y)'))).toBe(true);
   expect(()=>qa003VisibleCertificate(missingRelation(view.question))).toThrow('Missing explicit off-point relation f=g');
  }
 }
});
it('visible-definition guard checks all four audited families and refuses inconsistent or incomplete extensions',()=>{
 let positive=0,removed=0;
 for(const row of qa003Families)for(const level of row.levels)for(let v=0;v<24;v++)for(const locale of ['pl','en']as const){
  const question=localizeUniversity(makeUniversityTask(row.family,v,level),locale).question;
  const cert=qa003VisibleCertificate(question);positive++;
  if(cert.asksContinuity){
   expect(()=>qa003VisibleCertificate(missingRelation(question))).toThrow('Missing explicit off-point relation f=g');removed++;
   const wrongLink=question.replace(/(f\(x,y\)=g\(x,y\) (?:dla|for) \(x,y\)≠)\([^)]*\)/,'$1(999, 999)');
   expect(()=>qa003VisibleCertificate(wrongLink)).toThrow('Off-point definition target mismatch');
   expect(()=>qa003VisibleCertificate(question.replace(/f\([−+\-\d./]+,\s*[−+\-\d./]+\)=([^;\n]+)$/,'f(999, 999)=$1'))).toThrow('Assigned function value target mismatch');
   expect(()=>qa003VisibleCertificate(question.replace(/(?:;|, oraz|, and) f\([−+\-\d./]+,\s*[−+\-\d./]+\)=[^;\n]+$/,''))).toThrow('Missing assigned value of f at target');
  }else{expect(question).not.toContain('f(x,y)=g(x,y)');expect(cert.valueAt).toBeUndefined();}
 }
 expect(positive).toBe(576);expect(removed).toBe(288);
});
it('the actual pre-review PL/EN questions fail the strengthened semantic oracle',()=>{
 const old=JSON.parse(readFileSync(new URL('../../docs/qa003-multivariable-20261107/review2/finding-definition-before.json',import.meta.url),'utf8'));
 expect(old.head).toBe('ace2e815b33320c60dc6e1573c9ad927000f11c2');expect(old.examples).toHaveLength(6);
 for(const example of old.examples)expect(()=>qa003VisibleCertificate(example.question)).toThrow('Missing explicit off-point relation f=g');
});
