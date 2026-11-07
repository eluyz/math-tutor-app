import {it,expect} from 'vitest';
import {makeUniversityTask,localizeUniversity} from '../university/catalog';
import {qa003VisibleCertificate} from './qa003MultivariableOracle';
it('QA003-MV-01: all 72 angular-continuity variants explain the final classification in PL/EN',()=>{
 const labels={
  pl:{continuous:'Funkcja jest ciągła w punkcie',removable:'Nieciągłość usuwalna — granica istnieje, ale f(a,b) jest inne',nonremovable:'Nieciągłość nieusuwalna — granica nie istnieje'},
  en:{continuous:'The function is continuous at the point',removable:'Removable discontinuity — the limit exists but differs from f(a,b)',nonremovable:'Nonremovable discontinuity — the limit does not exist'},
 };
 for(const level of ['hard','advanced','expert']as const)for(let v=0;v<24;v++)for(const locale of ['pl','en']as const){
  const view=localizeUniversity(makeUniversityTask('multivar-angular-continuity',v,level),locale),cert=qa003VisibleCertificate(view.question);
  if(!['continuous','removable','nonremovable'].includes(cert.classification))throw Error('continuity');
  const working=view.solution?.filter(s=>s.kind==='working')??[];
  expect(working.at(-1)?.action).toBe((locale==='pl'?'Klasyfikacja: ':'Classification: ')+labels[locale][cert.classification as keyof typeof labels.pl]);
  if(locale==='pl')expect(working.at(-1)?.action).not.toMatch(/\b(?:continuous|removable|nonremovable)\b/);
 }
});
