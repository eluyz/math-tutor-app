import {it,expect} from 'vitest';
import {makeUniversityTask,localizeUniversity} from './catalog';
import {assessAnswer,emptyAnswer,formatRational as f} from '../answers';
import {r,add} from '../qa/batchFMath';
import {polishLearningText} from '../../e2e/helpers/localization';
import {independentElementary} from '../qa/w01Elementary';
it('24 symbolic tasks, implicit differentiation oracle, all orders, domains and PL/EN teaching',()=>{
 const keys=new Set<string>(),targets=new Set<string>();
 for(let v=0;v<24;v++){
  const task=makeUniversityTask('multivar-elementary-partial',v,'hard'),p=task.university;if(p.kind!=='multivar-elementary-partial')throw Error('scope');
  keys.add(task.contentKey);targets.add(p.mode+':'+p.target);
  expect(p.a).toBeGreaterThan(0);expect(p.c).toBeLessThan(0);expect(p.d).toBeGreaterThan(0);
  expect(4*p.a*p.c-p.b*p.b).toBeLessThan(0); // regular u=0 boundary, indefinite quadratic
  expect(p.d+p.c*10000).toBeLessThan(0); // both allowed and forbidden regions, not a vacuous domain
  const input=independentElementary(task);
  for(const locale of ['pl','en'] as const){
   const view=localizeUniversity(task,locale);expect(assessAnswer(view.answer,input).kind).toBe('correct');
   const wrong={...input,values:[f(add(r(1),view.answer.kind==='list'?view.answer.values[0]:r(0))),...input.values.slice(1)]};
   expect(assessAnswer(view.answer,wrong).kind).toBe('incorrect');expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind).toBe('invalid');
   const steps=view.solution?.filter(x=>x.kind==='working')??[];expect(steps).toHaveLength(7);
   expect(steps[0].action).toContain(`(${p.a})x²+(${p.b})xy+(${p.c})y²+(${p.d})`);
   expect(steps[1].action).toBe(p.mode==='log'?'D(f)={u>0}; D(C²)={u>0}':'D(f)={u≥0}; D(C²)={u>0}');
   expect(steps[2].action).toBe(`u_x=(${2*p.a})x+(${p.b})y; u_y=(${p.b})x+(${2*p.c})y; u_xx=${2*p.a}; u_xy=u_yx=${p.b}; u_yy=${2*p.c}`);
   expect(steps[3].action).toBe(p.mode==='log'?'F′(u)=1/u; F″(u)=−1/u²':'F′(u)=1/(2√u); F″(u)=−1/(4u^(3/2))');
   expect(steps[4].action).toBe('f_i=F′(u)u_i; f_ij=F″(u)u_i u_j+F′(u)u_ij');
   expect(steps[5].action).toContain('f_'+p.target+'=');
   input.values.forEach(x=>{const q=x.replaceAll('−','-').split('/');expect(steps[6].action).toContain(`(${q[0]}/${q[1]??'1'})`);});
   for(const s of steps)expect(s.reason.length).toBeGreaterThan(20);
   expect(view.hint).toContain(locale==='pl'?'dziedzinę':'domain');expect(view.nextHint).toContain(p.target.length===1?'F′':'F″');
   const final=view.solution?.at(-1);if(final?.kind!=='answer')throw Error('final');expect(assessAnswer(final.answer,input).kind).toBe('correct');
   if(locale==='en')expect(view.explanation+' '+view.hint+' '+view.nextHint).not.toMatch(polishLearningText);
  }
  if(p.target==='xy'||p.target==='yx'){
   const other=independentElementary({...task,university:{...p,target:p.target==='xy'?'yx':'xy'}});expect(other).toEqual(input);
  }
 }
 expect(keys.size).toBe(24);expect(targets.size).toBe(12);
});
