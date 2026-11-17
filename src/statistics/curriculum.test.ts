import { describe, expect, it } from "vitest";
import { statisticsCurriculum } from "./curriculum";
import { statisticsPracticeCopy } from "../locales/statistics";

describe("Statistics canonical proposed curriculum",()=>{
 it("has two stable tracks and 15 unique topics, with only mean and median playable",()=>{
  expect(statisticsCurriculum.map(t=>t.id)).toEqual(["fundamentals","university"]);
  expect(statisticsCurriculum.map(t=>t.topics.length)).toEqual([6,9]);
  const ids:string[]=[],lessons:string[]=[];
  for(const track of statisticsCurriculum) for(const topic of track.topics) {
   ids.push(topic.id);if("lesson" in topic) lessons.push(topic.lesson);
  }
  expect(new Set(ids).size).toBe(15);
  expect(lessons).toEqual(["mean","median"]);
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
