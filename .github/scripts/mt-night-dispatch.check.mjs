import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateConfig,isCopilot,quotaBlocked,liveSessionSummary,chooseNext,creditMonthApproved} from "./mt-night-dispatch.mjs";

const config=JSON.parse(readFileSync(new URL("../../docs/MT_NIGHT_02_QUEUE.json",import.meta.url),"utf8"));
const fresh=()=>structuredClone(config);
const issue=(assigned=false)=>({state:"open",assignees:assigned?[{login:"Copilot"}]:[]});
const issueMap=()=>new Map(config.queue.map(t=>[t.issue,issue([201,218].includes(t.issue))]));

test("safe queue configuration validates and excludes hard-gated dependencies",()=>{
  const checked=validateConfig(fresh());
  assert.equal(checked.queue.length,1);
  assert.equal(checked.parked_issues.length,20);
  assert.equal(checked.max_active,1);
  assert.equal(checked.max_assignments_per_tick,1);
  assert.deepEqual(checked.excluded_dependency_gated,[196,219,221,223]);
  assert.equal(checked.automatic_merge,false);
});
test("reject duplicate issues and overlapping paths",()=>{
  const v=fresh();v.queue.push(structuredClone(v.queue[0]));
  assert.throws(()=>validateConfig(v),/Duplicate/);
  const o=fresh();o.queue.push({...structuredClone(o.queue[0]),issue:999});
  assert.throws(()=>validateConfig(o),/Overlapping/);
});
test("reject privileged paths and bypassing safety guards",()=>{
  const v=fresh();v.queue[0].scope=[".github/workflows/ci.yml"];
  assert.throws(()=>validateConfig(v),/Forbidden/);
  const u=fresh();u.automatic_merge=true;
  assert.throws(()=>validateConfig(u),/unsafe/);
  const w=fresh();w.max_active=9;
  assert.throws(()=>validateConfig(w),/unsafe/);
});
test("quota signals prevent additional dispatch, no false positive on plain CI",()=>{
  assert.equal(quotaBlocked([{state:"open",title:"Quota exhausted before implementation"}]),true);
  assert.equal(quotaBlocked([{state:"closed",title:"Quota exhausted before implementation"}]),false);
  assert.equal(quotaBlocked([{state:"open",body:"CI and Playwright passed"}]),false);
});
test("Copilot assignee identifies both API and UI spellings",()=>{
  assert.equal(isCopilot({assignees:[{login:"copilot-swe-agent[bot]"}]}),true);
  assert.equal(isCopilot({assignees:[{login:"Copilot"}]}),true);
  assert.equal(isCopilot(issue(false)),false);
});
test("one pilot issue only, and original completed assignments are not repeated",()=>{
  const out=chooseNext(config,issueMap(),[],1);
  assert.deepEqual(out,[217]);
  assert.equal(out.includes(201),false);
  assert.equal(out.includes(218),false);
});
test("a busy pilot lane never receives a concurrent assignment",()=>{
  assert.deepEqual(chooseNext(config,issueMap(),["NEW"],1),[]);
});
test("all already assigned returns no candidates",()=>{
  const m=new Map(config.queue.map(t=>[t.issue,issue(true)]));
  assert.deepEqual(chooseNext(config,m,[],3),[]);
});
test("known active Copilot task linked to explicit issue occupies its lane",()=>{
  const prs=[{id:7,state:"open",body:"Fixes #217"}];
  const tasks=[{state:"in_progress",artifacts:[{provider:"github",type:"pull",data:{id:7}}]}];
  assert.deepEqual(liveSessionSummary(tasks,prs,config.queue),{count:1,lanes:["NEW"]});
});
test("task artifacts may identify pull requests by PR number rather than database id",()=>{
  const prs=[{id:12345,number:307,state:"open",body:"Fixes #217"}];
  const tasks=[{state:"queued",artifacts:[{provider:"github",type:"pull",data:{id:307}}]}];
  assert.deepEqual(liveSessionSummary(tasks,prs,config.queue),{count:1,lanes:["NEW"]});
});
test("unknown task state and unmapped active tasks fail closed",()=>{
  const p=[{id:7,state:"open",body:"Fixes #217"}];
  assert.throws(()=>liveSessionSummary([{state:"working",artifacts:[]}],p,config.queue),/Unknown/);
  assert.throws(()=>liveSessionSummary([{state:"queued",artifacts:[]}],p,config.queue),/uniquely/);
  assert.throws(()=>liveSessionSummary([{state:"in_progress",artifacts:[{provider:"github",type:"pull",data:{id:7}}]}],[{id:7,state:"open",body:"hello"}],config.queue),/linked/);
});
test("truncated API pages fail closed",()=>{
  assert.throws(()=>liveSessionSummary(Array(100).fill({state:"completed"}),[],config.queue),/truncated/);
});

test("monthly credit approval must match the CURRENT UTC month",()=>{
  assert.equal(creditMonthApproved("2026-12","2026-12"),true);
  assert.equal(creditMonthApproved("2026-11","2026-12"),false);
  assert.equal(creditMonthApproved(undefined,"2026-12"),false);
  assert.equal(creditMonthApproved("2026-12-extra","2026-12"),false);
});
test("do not expand pilot queue or concurrent slots without new review",()=>{
  const tooMany=fresh();tooMany.queue.push({...tooMany.queue[0],issue:998,scope:["docs/extra.md"]});
  tooMany.queue.push({...tooMany.queue[0],issue:997,scope:["docs/extra2.md"]});
  tooMany.queue.push({...tooMany.queue[0],issue:996,scope:["docs/extra3.md"]});
  assert.throws(()=>validateConfig(tooMany),/unsafe/);
  const more=fresh();more.max_assignments_per_tick=2;
  assert.throws(()=>validateConfig(more),/unsafe/);
});
