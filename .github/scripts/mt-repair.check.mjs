import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {policyCheck,isProtected,matchesQuota,eligiblePR,parseRepairs,readTrustedQA,latestCI,
  evaluatePR,repairPrompt,activeCount,activePRConflict,mainRelease} from "./mt-repair.mjs";
const cfg=policyCheck(JSON.parse(readFileSync(new URL("../../docs/MT_REPAIR_01_POLICY.json",import.meta.url),"utf8")));
const a="a".repeat(40),b="b".repeat(40),c="c".repeat(40);
const pr=(sha=a,number=250)=>({number,state:"open",merged_at:null,base:{ref:"main"},head:{sha,repo:{full_name:"eluyz/math-tutor-app"}},user:{login:"Copilot"},body:"Fixes #209",title:"Independent math tests"});
const ci=(p,conclusion="success",status="completed")=>({id:123,name:"CI",event:"pull_request",head_sha:p.head.sha,pull_requests:[{number:p.number}],status,conclusion,created_at:"2026-11-08T09:00:00Z"});
const comment=(body,login="eluyz",id=1)=>({id,user:{login},body,created_at:"2026-11-08T11:"+String(id).padStart(2,"0")+":00Z"});
const repairs=(p,head=p.head.sha,attempt=1)=>comment("<!-- MT-REPAIR-01:v1 pr="+p.number+" sha="+head+" attempt="+attempt+" trigger=QA -->\n@copilot repair","eluyz",attempt);
const qa=(p,verdict="NEEDS_FIXES",login="eluyz")=>comment("<!-- MT-QA:v1 pr="+p.number+" sha="+p.head.sha+" verdict="+verdict+" -->\nFindings:\n- Wrong Hessian sign at x=0 and y=2; expected determinant -8, got +8.",login,25);
test("policy prevents automatic merge, unlimited loops or unchecked permissions",()=>{
  assert.equal(cfg.automatic_merge,false);assert.equal(cfg.max_repairs_per_pr,2);
  assert.equal(cfg.max_active_agent_sessions,3);assert.equal(cfg.allowed_issue_numbers.length,22);
  for(const key of ["automatic_merge","require_protected_main","require_night_02_released"]){
    const x=structuredClone(cfg);x[key]=key==="automatic_merge"?true:false;
    assert.throws(()=>policyCheck(x),/UNSAFE/);
  }
});
test("repair locks independent tests, oracles, workflow and dependency files",()=>{
  for(const path of [".github/workflows/ci.yml","src/qa/independentOracle.ts","src/university/math.test.ts",
    "e2e/suite.spec.ts","docs/QA_EVIDENCE.md","package.json","package-lock.json"])
    assert.equal(isProtected(path,cfg),true,path);
  assert.equal(isProtected("src/university/graphIntegratedAsymptotes.ts",cfg),false);
});
test("current quota exhaustion blocks; closed historical PR does not",()=>{
  assert.equal(matchesQuota([{state:"open",body:"Session quota exhausted"}]),true);
  assert.equal(matchesQuota([{state:"closed",title:"quota exhausted"}]),false);
  assert.equal(matchesQuota([{state:"open",body:"All CI tests passed"}]),false);
});
test("only same-repo Copilot PR linked to exactly one allowlisted Issue qualifies",()=>{
  assert.equal(eligiblePR(pr(),cfg),209);
  const x=pr();x.user.login="eluyz";assert.equal(eligiblePR(x,cfg),null);
  const y=pr();y.head.repo.full_name="outside/other";assert.equal(eligiblePR(y,cfg),null);
  const z=pr();z.body="Fixes #209\nRefs #210";assert.equal(eligiblePR(z,cfg),null);
  const w=pr();w.body="Fixes #221";assert.equal(eligiblePR(w,cfg),null);
});
test("CI must match exact PR and current SHA, newer run takes precedence",()=>{
  const p=pr();const old={...ci(p,"failure"),id:89},newer={...ci(p,"success"),id:90};
  assert.equal(latestCI([old,newer],p).conclusion,"success");
  assert.equal(latestCI([{...ci(p,"failure"),head_sha:b}],p),null);
  assert.equal(latestCI([{...ci(p,"failure"),pull_requests:[{number:251}]}],p),null);
});
test("trusted QA requires owner, matching SHA and concrete reproducible findings",()=>{
  const p=pr();
  assert.equal(readTrustedQA([qa(p)],p,cfg).verdict,"NEEDS_FIXES");
  assert.equal(readTrustedQA([qa(p,"NEEDS_FIXES","Copilot")],p,cfg),null);
  assert.equal(readTrustedQA([comment("<!-- MT-QA:v1 pr=250 sha="+b+" verdict=NEEDS_FIXES -->\nFindings:\n- Valid finding")],p,cfg),null);
  assert.equal(readTrustedQA([comment("<!-- MT-QA:v1 pr=250 sha="+a+" verdict=NEEDS_FIXES -->\nNo details")],p,cfg),null);
});
test("CI action_required, running and absent cannot be treated as failure",()=>{
  const p=pr();
  assert.equal(evaluatePR(p,[],[ci(p,"action_required")],cfg).status,"BLOCKED");
  assert.equal(evaluatePR(p,[],[ci(p,"failure","in_progress")],cfg).status,"WAITING_CI");
  assert.equal(evaluatePR(p,[],[],cfg).status,"WAITING_CI");
});
test("CI failure triggers repair; CI green alone does not certify maths",()=>{
  const p=pr();
  assert.equal(evaluatePR(p,[],[ci(p,"failure")],cfg).trigger,"CI");
  assert.equal(evaluatePR(p,[],[ci(p,"success")],cfg).status,"AWAITING_INDEPENDENT_QA");
  assert.equal(evaluatePR(p,[qa(p,"PASS")],[ci(p,"success")],cfg).status,"PASS_CANDIDATE_NO_MERGE");
  assert.equal(evaluatePR(p,[qa(p,"BLOCKED")],[ci(p,"success")],cfg).reason,"TRUSTED_QA_BLOCKED");
});
test("detailed QA NEEDS_FIXES launches one bounded repair on same PR",()=>{
  const p=pr(),res=evaluatePR(p,[qa(p)],[ci(p,"success")],cfg);
  assert.equal(res.trigger,"QA");assert.equal(res.attempts,0);
  const prompt=repairPrompt(p,res);
  assert.match(prompt,/MT-REPAIR-01:v1 pr=250 sha=a{40} attempt=1 trigger=QA/);
  assert.match(prompt,/@copilot/);assert.match(prompt,/Do NOT edit tests/);
});
test("never re-request a repair on the same head SHA",()=>{
  const p=pr();assert.equal(evaluatePR(p,[repairs(p)],[ci(p,"failure")],cfg).status,"WAITING_NEW_SHA");
});
test("two attempts exhaust budget across commits",()=>{
  const p=pr(c),logs=[repairs(p,a,1),repairs(p,b,2)];
  const x=evaluatePR(p,logs,[ci(p,"failure")],cfg);
  assert.equal(x.status,"BLOCKED");assert.equal(x.reason,"RETRY_BUDGET_EXHAUSTED");
});
test("one attempt may continue once, only after new SHA and fresh CI",()=>{
  const p=pr(b),res=evaluatePR(p,[repairs(p,a,1)],[ci(p,"failure")],cfg);
  assert.equal(res.status,"NEEDS_FIXES");assert.equal(res.attempts,1);
  assert.match(repairPrompt(p,res),/attempt=2 trigger=CI/);
});
test("modified independent QA tests stop repairs, production-only changes may continue",()=>{
  const p=pr(b),history=[repairs(p,a,1)];
  assert.equal(evaluatePR(p,history,[ci(p,"success")],cfg,{afterRepairFiles:["src/qa/oracle.test.ts"]}).reason,"REPAIR_CHANGED_PROTECTED_QA");
  assert.equal(evaluatePR(p,history,[ci(p,"failure")],cfg,{afterRepairFiles:["src/university/graphIntegratedAsymptotes.ts"]}).status,"NEEDS_FIXES");
});
test("duplicate or missing retry markers fail closed",()=>{
  const p=pr();
  assert.throws(()=>parseRepairs([repairs(p,a,1),repairs(p,b,1)],p),/INVALID/);
  assert.throws(()=>parseRepairs([repairs(p,a,2)],p),/INVALID/);
});
test("active task counter preserves global three-slot budget",()=>{
  assert.equal(activeCount([{state:"queued"},{state:"in_progress"},{state:"completed"}]),2);
  assert.throws(()=>activeCount([{state:"unknown_running"}]),/UNKNOWN/);
  assert.throws(()=>activeCount(Array(100).fill({state:"completed"})),/TRUNCATED/);
});
test("CI and Pages need success on same main SHA",()=>{
  const x={id:1,status:"completed",conclusion:"success",head_sha:a};
  assert.equal(mainRelease([{...x,name:"CI",event:"push"},{...x,id:2,name:"Deploy Pages",event:"workflow_run"}],a),true);
  assert.equal(mainRelease([{...x,name:"CI",event:"push"},{...x,id:2,name:"Deploy Pages",event:"workflow_run",head_sha:b}],a),false);
});

test("never start a second Copilot session on a PR with a running task",()=>{
  const p={...pr(),id:909};
  const tasks=[{state:"in_progress",artifacts:[{provider:"github",type:"pull",data:{id:909}}]}];
  assert.equal(activePRConflict(tasks,p),true);
  assert.equal(activePRConflict([{state:"completed",artifacts:[]}],p),false);
  assert.throws(()=>activePRConflict([{state:"queued",artifacts:[]}],p),/UNMAPPED/);
});
