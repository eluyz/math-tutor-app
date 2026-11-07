import test from "node:test";
import assert from "node:assert/strict";
import {validateQueue,matchesFixes,runStatus,releaseStatus,isCopilotAssigned,sensitivePaths,markdown} from "./mt-night-audit.mjs";

const config = () => ({schema_version:1,mode:"REPORT_ONLY",max_active:3,queue:[
  {issue:195,code:"QA-10",scope:["scripts/qa-inventory"],depends_on:[{kind:"pr",number:192}]},
  {issue:196,code:"QA-11",scope:["docs/QA_EVIDENCE_SCHEMA.md"],depends_on:[{kind:"issue",number:195}]}
]});
test("accepts a bounded, read-only queue",()=>{
  assert.equal(validateQueue(config()).queue.length,2);
});
test("rejects write-enabled mode or concurrency > 3",()=>{
  const a=config();a.mode="AUTO_MERGE";assert.throws(()=>validateQueue(a),/REPORT_ONLY/);
  const b=config();b.max_active=4;assert.throws(()=>validateQueue(b),/max_active/);
});
test("rejects duplicate IDs, cycles, and path overlap",()=>{
  const a=config();a.queue[1].issue=195;assert.throws(()=>validateQueue(a),/Duplicate/);
  const b=config();b.queue[0].depends_on=[{kind:"issue",number:196}];
  assert.throws(()=>validateQueue(b),/cycle/);
  const c=config();c.queue[1].scope=["scripts/qa-inventory/file"];
  assert.throws(()=>validateQueue(c),/Overlapping/);
});
test("rejects privileged workflow editing and malicious paths",()=>{
  const a=config();a.queue[0].scope=[".github/workflows"];assert.throws(()=>validateQueue(a),/privileged/);
  const b=config();b.queue[0].scope=["../etc"];assert.throws(()=>validateQueue(b),/Unsafe/);
});
test("links PRs to the exact referenced issue only",()=>{
  assert.equal(matchesFixes("Fixes #195",195),true);
  assert.equal(matchesFixes("Closes eluyz/math-tutor-app#195",195),true);
  assert.equal(matchesFixes("Fixes #1950",195),false);
  assert.equal(matchesFixes("Mentions #195",195),false);
});
test("never converts absent or approval-blocked CI into success",()=>{
  assert.equal(runStatus([],"CI","pull_request").status,"NOT_VERIFIED");
  assert.equal(runStatus([{id:7,name:"CI",event:"pull_request",status:"completed",
    conclusion:"action_required",run_number:7}],"CI","pull_request").status,"APPROVAL_REQUIRED");
  assert.equal(runStatus([{id:8,name:"CI",event:"pull_request",status:"completed",
    conclusion:"failure",run_number:8}],"CI","pull_request").status,"FAIL");
});
test("uses newest run rather than earlier success",()=>{
  const runs=[
    {id:1,name:"CI",event:"pull_request",status:"completed",conclusion:"success",run_number:8},
    {id:2,name:"CI",event:"pull_request",status:"completed",conclusion:"failure",run_number:9}
  ];
  assert.deepEqual(runStatus(runs,"CI","pull_request"),{status:"FAIL",run_id:2});
});
test("release requires both same-SHA main CI and Pages success",()=>{
  const ci={id:1,name:"CI",event:"push",status:"completed",conclusion:"success",run_number:1};
  const pages={id:2,name:"Deploy Pages",event:"workflow_run",status:"completed",conclusion:"success",run_number:1};
  assert.equal(releaseStatus([ci]).status,"RELEASE_NOT_VERIFIED");
  assert.equal(releaseStatus([pages]).status,"RELEASE_NOT_VERIFIED");
  assert.equal(releaseStatus([ci,pages]).status,"RELEASE_PASS");
});
test("flags unsafe PR file changes separately from green tests",()=>{
  assert.deepEqual(sensitivePaths(["docs/README.md",".github/workflows/ci.yml","src/university/f.ts"]),[
    ".github/workflows/ci.yml","src/university/f.ts"]);
  assert.equal(isCopilotAssigned({assignees:[{login:"Copilot"}]}),true);
});
test("renders audit results without mutating GitHub state",()=>{
  const output=markdown({main_sha:"a".repeat(40),guards:{active:0,max_active:3,
    active_limit_ok:true,external_open_copilot_prs:[]},rows:[
      {issue:195,dependencies:[{kind:"pr",number:192,status:"PR_NOT_MERGED"}],
       state:"BLOCKED_DEPENDENCY",pr:null,head_sha:null,ci:{status:"NOT_VERIFIED",run_id:null}}
    ]});
  assert.match(output,/BLOCKED_DEPENDENCY/);
  assert.match(output,/NO automatic assignment, CI approval, or merge/);
});
