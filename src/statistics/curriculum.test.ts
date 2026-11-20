import { describe, expect, it } from "vitest";
import { statisticsCurriculum } from "./curriculum";
import { statisticsPracticeCopy } from "../locales/statistics";

describe("Statistics canonical proposed curriculum",()=>{
 it("preserves both tracks and the original topics, adding only the separate ST-104 interpretation lesson",()=>{
  expect(statisticsCurriculum.map(t=>t.id)).toEqual(["fundamentals","university"]);
  expect(statisticsCurriculum.map(t=>t.topics.length)).toEqual([7,9]);
  const ids:string[]=[],lessons:string[]=[];
  for(const track of statisticsCurriculum) for(const topic of track.topics) {
   ids.push(topic.id);if("lesson" in topic) lessons.push(topic.lesson);
  }
  expect(new Set(ids).size).toBe(16);
  expect(ids).toEqual(["data-tables","mean","median","mode","dispersion","charts","interpretation","descriptive","combinatorics","probability","conditional","random-variables","distributions","estimation","hypothesis-tests","correlation"]);
  expect(lessons).toEqual(["mean","median","variance","interpretation"]);
 });
 it("provides a single complete PL/EN label mapping without inventing availability",()=>{
  for(const locale of ["pl","en"] as const) {
   const c=statisticsPracticeCopy[locale];
   for(const track of statisticsCurriculum) {
    expect(c.trackLabels[track.id].length).toBeGreaterThan(5);
    for(const topic of track.topics) expect(c.topicLabels[topic.id].length).toBeGreaterThan(3);
   }
   expect(c.levelsUnavailable).toMatch(locale==="pl"?/niedostępne/:/not available/);
   expect(c.topicsUnavailable).toMatch(locale==="pl"?/niedostępne/:/not available/);
  }
 });
});
