import {it,expect} from "vitest";
import {makeUniversityTask,localizeUniversity} from "../university/catalog";
import {assessAnswer,emptyAnswer} from "../answers";
import {independentTrig} from "./w01Trig";
import {independentRational} from "./w01Rational";
import {independentW01SourceShape} from "./w01SourceShapes";

// Public source-method identifiers only; private exercise formulas and source
// answer-key coefficients are NEVER copied into this repository.
const sources=[
 {id:"1a",family:"multivar-source-shape-partial",mode:"poly-cubic",offset:0,stride:4},
 {id:"1b",family:"multivar-rational-partial",mode:"inverse-cubic",offset:0,stride:4},
 {id:"1c",family:"multivar-source-shape-partial",mode:"log-positive",offset:2,stride:4},
 {id:"1d",family:"multivar-rational-partial",mode:"linear-quotient",offset:1,stride:4},
 {id:"1e",family:"multivar-trig-partial",mode:"sin-square-linear",offset:0,stride:2},
 {id:"1f",family:"multivar-source-shape-partial",mode:"poly-mixed",offset:1,stride:4},
 {id:"1g",family:"multivar-source-shape-partial",mode:"root-linear",offset:3,stride:4},
 {id:"1h",family:"multivar-rational-partial",mode:"simple-quotient",offset:2,stride:4},
 {id:"1i",family:"multivar-rational-partial",mode:"bilinear-quotient",offset:3,stride:4},
 {id:"1j",family:"multivar-trig-partial",mode:"cos-xy-square",offset:1,stride:2},
] as const;
const orders=[["xx",2],["xy",3],["yx",4],["yy",5]] as const;

it("P43 W01: 10 source method shapes × four second-order partial targets × PL/EN",()=>{
 const seen=new Set<string>();
 for(const source of sources)for(const [order,index]of orders){
  const v=source.offset+source.stride*index;
  const task=makeUniversityTask(source.family,v,"hard");
  const p=task.university;
  if(p.kind==="multivar-source-shape-partial"){
   expect(source.family).toBe("multivar-source-shape-partial");
   expect(p.mode).toBe(source.mode);expect(p.target).toBe(order);
  }else if(p.kind==="multivar-rational-partial"){
   expect(source.family).toBe("multivar-rational-partial");
   expect(p.mode).toBe(source.mode);expect(p.target).toBe(order);
  }else if(p.kind==="multivar-trig-partial"){
   expect(source.family).toBe("multivar-trig-partial");
   expect(p.mode).toBe(source.mode);expect(p.target).toBe(order);
  }else throw Error("Unrecognized source-mapped W01 generator");
  const key=source.id+":"+order;
  seen.add(key);
  const expected=p.kind==="multivar-source-shape-partial"?
   independentW01SourceShape(task):p.kind==="multivar-rational-partial"?
   independentRational(task):independentTrig(task);
  for(const locale of ["pl","en"] as const){
   const view=localizeUniversity(task,locale);
   expect(view.contentKey).toBe(task.contentKey);
   expect(view.answer.kind).toBe("list");
   expect(assessAnswer(view.answer,expected).kind,key+" "+locale).toBe("correct");
   expect(assessAnswer(view.answer,{...expected,values:["999999",...expected.values.slice(1)]}).kind,
    key+" "+locale+" wrong").toBe("incorrect");
   expect(assessAnswer(view.answer,emptyAnswer(view.answer)).kind,key+" "+locale+" blank").toBe("invalid");
   expect(view.solution?.length).toBeGreaterThanOrEqual(7);
   expect(view.hint.length).toBeGreaterThan(15);
   expect(view.nextHint.length).toBeGreaterThan(15);
   const solution=view.solution?.at(-1);
   if(!solution||solution.kind!=="answer")throw Error("Missing answer step "+key);
   expect(assessAnswer(solution.answer,expected).kind).toBe("correct");
  }
 }
 expect(sources).toHaveLength(10);
 expect(seen.size).toBe(40);
});
