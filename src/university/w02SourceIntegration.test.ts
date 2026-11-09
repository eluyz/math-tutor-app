import {describe,it,expect} from 'vitest';
import {makeUniversityTask,localizeUniversity,isUniversityTask} from './catalog';
import {taskPool} from '../generators';
import {englishAnswer} from '../locales/lessons-en';
import {assessAnswer,emptyAnswer} from '../answers';
import {independentW02Source,sourceW02OracleInput} from '../qa/w02SourceStationarityOracle';
import {polishLearningText} from '../../e2e/helpers/localization';

describe('W02 source stationarity: student catalog integration and independent answers',()=>{
 it('has precisely 24 advanced variants, 12 three-point and 12 four-point, without changing legacy hard',()=>{
  const pool=taskPool('derivatives','advanced').filter(isUniversityTask).filter(t=>t.templateId==='multivar-quadratic-cubic-extrema');
  const hard=taskPool('derivatives','hard').filter(isUniversityTask).filter(t=>t.templateId==='multivar-quadratic-cubic-extrema');
  expect(pool).toHaveLength(24);
  expect(hard).toHaveLength(24);
  const ids=new Set(pool.map(p=>p.contentKey));
  expect(ids.size).toBe(24);
  expect(pool.filter(p=>p.university.kind==='multivar-quadratic-cubic-extrema'&&p.university.mode==='three')).toHaveLength(12);
  expect(pool.filter(p=>p.university.kind==='multivar-quadratic-cubic-extrema'&&p.university.mode==='four')).toHaveLength(12);
  for(const task of hard)if(task.university.kind==='multivar-quadratic-cubic-extrema')expect(task.university.mode).toBeUndefined();
  for(let v=0;v<24;v++){
   const task=makeUniversityTask('multivar-quadratic-cubic-extrema',v,'advanced');
   expect(task.category).toBe('derivatives');
   const independent=independentW02Source(task),input=sourceW02OracleInput(task);
   expect(independent.points.length).toBe(v%2===0?3:4);
   if(typeof input==='string'||input.kind!=='multi-choice')throw Error('Oracle should be multichoice');
   expect(Object.keys(input.values)).toHaveLength(6*independent.points.length);
   for(const locale of ['pl','en'] as const){
    const view=localizeUniversity(task,locale),spec=view.answer;
    expect(spec.kind).toBe('multi-choice');
    if(spec.kind!=='multi-choice')throw Error('Student view needs multi-choice');
    expect(spec.fields).toHaveLength(6*independent.points.length);
    expect(assessAnswer(spec,input).kind).toBe('correct');
    expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe('invalid');
    expect(view.title.length).toBeGreaterThan(20);
    expect(view.question).toContain('f(x,y)=');
    expect(view.solution?.length).toBeGreaterThan(10);
    if(locale==='en'){
     const pl=localizeUniversity(task,'pl');
     expect(view.answer).toEqual(englishAnswer(pl.answer));
     for(const text of [view.title,view.question,view.hint,view.nextHint,view.explanation,
      ...spec.fields.flatMap(field=>[field.label,...field.options.map(opt=>opt.label)])])
      expect(text).not.toMatch(polishLearningText);
    }
   }
  }
 });
});
