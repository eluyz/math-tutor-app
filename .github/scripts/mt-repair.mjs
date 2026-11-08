import {readFileSync,mkdirSync,writeFileSync,appendFileSync} from "node:fs";
import {pathToFileURL} from "node:url";
const REPO="eluyz/math-tutor-app",API="https://api.github.com";
const CFG=new URL("../../docs/MT_REPAIR_01_POLICY.json",import.meta.url);
const SHA=/^[a-f0-9]{40}$/;
const REPAIR=/<!-- MT-REPAIR-01:v1 pr=(\d+) sha=([0-9a-f]{40}) attempt=(\d+) trigger=(CI|QA) -->/g;
const QA=/<!-- MT-QA:v1 pr=(\d+) sha=([0-9a-f]{40}) verdict=(PASS|NEEDS_FIXES|BLOCKED) -->/g;
const ACTIVE=new Set(["queued","in_progress","idle","waiting_for_user"]);
const KNOWN=new Set([...ACTIVE,"completed","failed","timed_out","cancelled"]);
const isInt=v=>Number.isSafeInteger(v)&&v>0;
const safeErr=e=>String(e?.message||e).slice(0,250);

export function policyCheck(c){
  if(!c||c.schema_version!==1||c.repository!==REPO||c.mode!=="DRY_RUN_BY_DEFAULT"||
    c.automatic_merge!==false||c.max_active_agent_sessions!==3||
    c.max_repairs_per_pr!==2||c.max_new_repairs_per_tick!==1||
    c.require_protected_main!==true||c.require_night_02_released!==true||
    c.require_main_ci_pages_pass!==true||c.stop_if_quota_reported!==true||
    JSON.stringify(c.trusted_qa_reviewers)!=='["eluyz"]'||
    !Array.isArray(c.allowed_issue_numbers)||!Array.isArray(c.blocked_issue_numbers)||
    !Array.isArray(c.allowed_copilot_authors)||!Array.isArray(c.protected_paths)||
    !isInt(c.max_changed_files)||c.max_changed_files>12)throw Error("UNSAFE_POLICY");
  const all=[...c.allowed_issue_numbers,...c.blocked_issue_numbers];
  if(all.some(n=>!isInt(n))||new Set(all).size!==all.length||
    !c.allowed_copilot_authors.includes("Copilot")||
    ![".github/","package.json","package-lock.json","src/qa/","e2e/"].every(x=>c.protected_paths.includes(x)))
    throw Error("UNSAFE_ALLOWLIST");
  return c;
}
export function isProtected(p,c){
  return c.protected_paths.some(x=>x.endsWith("/")?p.startsWith(x):p===x)||
    /(?:^|\/)[^/]+\.(?:test|spec)\.[cm]?[jt]sx?$/.test(p)||
    p.startsWith("docs/qa")||p.startsWith("docs/QA_");
}
export function matchesQuota(prs){
  return prs.some(p=>p.state==="open"&&
    /\b(?:quota exhausted|quota limits|session quota|usage limit|limit reached|credits exhausted)\b/i
      .test(String(p.title||"")+" "+String(p.body||"")));
}
export function eligiblePR(p,c){
  if(!p||p.state!=="open"||p.merged_at||p.base?.ref!=="main"||
    p.head?.repo?.full_name!==REPO||!SHA.test(p.head.sha||"")||
    !c.allowed_copilot_authors.includes(p.user?.login))return null;
  const refs=[...String(p.body||"").matchAll(/\b(?:Fixes|Closes|Resolves|Refs)\s+(?:(?:eluyz\/math-tutor-app))?#(\d+)\b/ig)].map(m=>Number(m[1]));
  const uniq=[...new Set(refs)];
  return uniq.length===1&&c.allowed_issue_numbers.includes(uniq[0])?uniq[0]:null;
}
export function parseRepairs(comments,p){
  const logs=[];
  for(const x of comments){
    if(x.user?.login!=="eluyz")continue;
    for(const m of String(x.body||"").matchAll(REPAIR)){
      if(Number(m[1])!==p.number)continue;
      const attempt=Number(m[3]);
      if(!isInt(attempt)||attempt>2||!SHA.test(m[2]))throw Error("INVALID_REPAIR_LOG");
      logs.push({sha:m[2],attempt,trigger:m[4],id:x.id,created_at:x.created_at});
    }
  }
  logs.sort((a,b)=>a.attempt-b.attempt);
  const ids=new Set(),shas=new Set();
  for(let i=0;i<logs.length;i++){
    const x=logs[i];
    if(x.attempt!==i+1||ids.has(x.id)||shas.has(x.sha))throw Error("INVALID_REPAIR_LOG_SEQUENCE");
    ids.add(x.id);shas.add(x.sha);
  }
  return logs;
}
export function readTrustedQA(comments,p,c){
  const verdicts=[];
  for(const x of comments){
    if(!c.trusted_qa_reviewers.includes(x.user?.login)||x.user?.login===p.user?.login)continue;
    for(const m of String(x.body||"").matchAll(QA)){
      if(Number(m[1])!==p.number||m[2]!==p.head.sha)continue;
      const text=String(x.body||"").replace(m[0],"").trim();
      if(m[3]==="NEEDS_FIXES"&&(!/^Findings:\s*\n\s*-\s+\S/m.test(text)||text.length<35||text.length>3500))continue;
      verdicts.push({verdict:m[3],text,created_at:x.created_at,id:x.id});
    }
  }
  verdicts.sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at))||a.id-b.id);
  return verdicts.at(-1)||null;
}
export function latestCI(runs,pr){
  if(!Array.isArray(runs))throw Error("CI_RESPONSE_MISSING");
  const found=runs.filter(x=>x.name==="CI"&&x.event==="pull_request"&&x.head_sha===pr.head.sha&&
    (x.pull_requests||[]).some(y=>y.number===pr.number));
  found.sort((a,b)=>Number(b.id)-Number(a.id)||Number(b.run_attempt||1)-Number(a.run_attempt||1));
  return found[0]||null;
}
export function evaluatePR(p,comments,runs,c,{changed_files=[],afterRepairFiles=[]}={}){
  if(!eligiblePR(p,c))return {status:"INELIGIBLE"};
  if(changed_files.length>c.max_changed_files)return {status:"BLOCKED",reason:"TOO_MANY_FILES"};
  if(changed_files.some(x=>x.startsWith(".github/")||x==="package.json"||x==="package-lock.json"))
    return {status:"BLOCKED",reason:"PR_MODIFIES_INFRASTRUCTURE"};
  const logs=parseRepairs(comments,p),last=logs.at(-1);
  if(last&&last.sha===p.head.sha)return {status:"WAITING_NEW_SHA",attempts:logs.length};
  if(last&&afterRepairFiles.some(x=>isProtected(x,c)))
    return {status:"BLOCKED",reason:"REPAIR_CHANGED_PROTECTED_QA",attempts:logs.length};
  const qa=readTrustedQA(comments,p,c),ci=latestCI(runs,p);
  if(qa?.verdict==="BLOCKED")return {status:"BLOCKED",reason:"TRUSTED_QA_BLOCKED"};
  if(!ci)return {status:"WAITING_CI",reason:"NO_EXACT_SHA_CI"};
  if(ci.status!=="completed")return {status:"WAITING_CI",reason:"CI_RUNNING"};
  if(["action_required","skipped","cancelled","timed_out","neutral",null].includes(ci.conclusion))
    return {status:"BLOCKED",reason:"CI_NOT_EXECUTED_OR_APPROVED"};
  if(!["success","failure"].includes(ci.conclusion))return {status:"BLOCKED",reason:"UNRECOGNIZED_CI"};
  const needs=qa?.verdict==="NEEDS_FIXES"||ci.conclusion==="failure";
  if(!needs)return {status:qa?.verdict==="PASS"?"PASS_CANDIDATE_NO_MERGE":"AWAITING_INDEPENDENT_QA",attempts:logs.length};
  if(logs.length>=c.max_repairs_per_pr)return {status:"BLOCKED",reason:"RETRY_BUDGET_EXHAUSTED",attempts:logs.length};
  return {status:"NEEDS_FIXES",trigger:qa?.verdict==="NEEDS_FIXES"?"QA":"CI",
    findings:qa?.verdict==="NEEDS_FIXES"?qa.text:null,attempts:logs.length,ci_run_id:ci.id};
}
export function repairPrompt(pr,result){
  const i=result.attempts+1;
  const mark="<!-- MT-REPAIR-01:v1 pr="+pr.number+" sha="+pr.head.sha+" attempt="+i+" trigger="+result.trigger+" -->";
  const evidence=result.trigger==="QA"?result.findings:
    "Exact-head GitHub CI failed; run ID: "+result.ci_run_id+". Investigate the real failed CI logs. Do not infer mathematical failure from CI alone.";
  return [mark,
    "@copilot Please repair the exact issues below on THIS existing pull-request branch. Do not create another PR.",
    "Repair attempt "+i+"/2. Starting PR SHA: "+pr.head.sha+".",
    "Evidence: "+evidence,
    "Scope: minimal production-code correction only. Do NOT edit tests, independent QA oracles, fixtures, GitHub workflows, repository policy, package files or test configuration. If needed, STOP and explain BLOCKED instead of bypassing checks.",
    "Do NOT add unrelated variants or weaken acceptance. Ensure correct mathematical answers and steps in PL/EN. Run targeted tests and build when possible. Summarize changed files and actual results.",
    "NOT approved to merge. Exact-head CI and independent QA must run again. If quota, permissions, or source are missing, report BLOCKED and stop."
  ].join("\n\n");
}
export function activeCount(tasks){
  if(!Array.isArray(tasks)||tasks.length>=100)throw Error("AGENT_TASK_LIST_TRUNCATED");
  return tasks.filter(x=>{if(!KNOWN.has(x.state))throw Error("UNKNOWN_AGENT_TASK_STATE");return ACTIVE.has(x.state);}).length;
}
export function activePRConflict(tasks,pr){
  if(!Array.isArray(tasks)||tasks.length>=100)throw Error("AGENT_TASK_LIST_TRUNCATED");
  for(const task of tasks){
    if(!KNOWN.has(task.state))throw Error("UNKNOWN_AGENT_TASK_STATE");
    if(!ACTIVE.has(task.state))continue;
    const ids=(task.artifacts||[]).filter(a=>a.provider==="github"&&a.type==="pull").map(a=>a.data?.id);
    if(ids.length!==1||!isInt(ids[0]))throw Error("UNMAPPED_ACTIVE_AGENT_TASK");
    if(ids[0]===pr.id||ids[0]===pr.number)return true;
  }
  return false;
}
export function mainRelease(runs,sha){
  if(!Array.isArray(runs))throw Error("MAIN_CI_RESPONSE");
  const get=(name,event)=>runs.filter(x=>x.name===name&&x.event===event&&x.head_sha===sha)
    .sort((a,b)=>Number(b.id)-Number(a.id))[0];
  const ci=get("CI","push"),pages=get("Deploy Pages","workflow_run");
  return Boolean(ci?.status==="completed"&&ci.conclusion==="success"&&pages?.status==="completed"&&pages.conclusion==="success");
}
async function gh(path,token,method="GET",data){
  if(!token||!path.startsWith("/"))throw Error("MISSING_TOKEN_OR_BAD_API_PATH");
  const response=await fetch(API+path,{
    method,headers:{Authorization:"Bearer "+token,Accept:"application/vnd.github+json",
      "X-GitHub-Api-Version":"2026-03-10","User-Agent":"math-tutor-repair-01",
      ...(data?{"Content-Type":"application/json"}:{})},
    body:data?JSON.stringify(data):undefined});
  if(!response.ok)throw Error("GITHUB_API_"+response.status+"_"+method+"_"+path.split("?")[0]);
  return response.json();
}
async function prsFor(t){
  const x=await gh("/repos/"+REPO+"/pulls?state=open&per_page=100",t);
  if(!Array.isArray(x)||x.length>=100)throw Error("PR_LIST_TRUNCATED");return x;
}
async function getPR(p,t){return gh("/repos/"+REPO+"/pulls/"+p.number,t);}
async function commentsFor(p,t){
  const x=await gh("/repos/"+REPO+"/issues/"+p.number+"/comments?per_page=100",t);
  if(!Array.isArray(x)||x.length>=100)throw Error("PR_COMMENTS_TRUNCATED");return x;
}
async function changedPaths(p,t){
  const x=await gh("/repos/"+REPO+"/pulls/"+p.number+"/files?per_page=100",t);
  if(!Array.isArray(x)||x.length>=100)throw Error("PR_FILES_TRUNCATED");return x.map(z=>z.filename);
}
async function ciRuns(p,t){
  const x=await gh("/repos/"+REPO+"/actions/runs?head_sha="+p.head.sha+"&per_page=100",t);
  if(!Array.isArray(x.workflow_runs)||x.total_count>=100)throw Error("PR_CI_TRUNCATED");return x.workflow_runs;
}
async function afterRepair(p,head,t){
  const x=await gh("/repos/"+REPO+"/compare/"+head+"..."+p.head.sha,t);
  if(x.status!=="ahead"||x.total_commits>50||!Array.isArray(x.files)||x.files.length>=100)
    throw Error("PR_REPAIR_COMPARE_UNSAFE");
  return x.files.map(z=>z.filename);
}
async function measure(c,read,live){
  const branch=await gh("/repos/"+REPO+"/branches/main",read),sha=branch?.commit?.sha;
  if(!SHA.test(sha||""))throw Error("MAIN_SHA_UNKNOWN");
  const runs=await gh("/repos/"+REPO+"/actions/runs?head_sha="+sha+"&per_page=100",read);
  if(!Array.isArray(runs.workflow_runs)||runs.total_count>=100)throw Error("MAIN_RUNS_TRUNCATED");
  const all=await prsFor(read);
  const s={schema_version:1,mode:live?"LIVE":"DRY_RUN",main_sha:sha,
    protected_main:branch.protected===true,main_ci_pages_pass:mainRelease(runs.workflow_runs,sha),
    quota_blocked:matchesQuota(all),night02_released:false,
    possible:[],dispatched:[],blocked:[],active:"NOT_VERIFIED"};
  try{await gh("/repos/"+REPO+"/contents/.github/workflows/mt-night-dispatch.yml?ref=main",read);s.night02_released=true;}
  catch(e){if(/GITHUB_API_404/.test(safeErr(e)))s.night02_released=false;else throw e;}
  for(const base of all){
    if(!eligiblePR(base,c))continue;
    const p=await getPR(base,read),comments=await commentsFor(p,read),paths=await changedPaths(p,read);
    const logs=parseRepairs(comments,p);
    const diff=logs.length&&logs.at(-1).sha!==p.head.sha?await afterRepair(p,logs.at(-1).sha,read):[];
    const result=evaluatePR(p,comments,await ciRuns(p,read),c,{changed_files:paths,afterRepairFiles:diff});
    if(result.status==="NEEDS_FIXES")s.possible.push({number:p.number,head:p.head.sha,...result});
    else s.blocked.push({number:p.number,...result});
  }
  s.possible.sort((a,b)=>a.number-b.number);
  s.global_blockers=[
    ...(!s.protected_main?["MAIN_NOT_PROTECTED"]:[]),
    ...(!s.main_ci_pages_pass?["MAIN_CI_OR_PAGES_NOT_PASS"]:[]),
    ...(!s.night02_released?["NIGHT02_NOT_DEPLOYED"]:[]),
    ...(s.quota_blocked?["QUOTA_WARNING_IN_OPEN_PR"]:[])
  ];
  return s;
}
async function dispatch(c,s,read,pat){
  if(!pat){s.global_blockers.push("MISSING_OWNER_PAT");return s;}
  if(s.global_blockers.length)return s;
  const agent=await gh("/agents/repos/"+REPO+"/tasks?per_page=100",pat);
  s.active=activeCount(agent.tasks);
  if(s.active>=c.max_active_agent_sessions){s.global_blockers.push("AGENT_SLOTS_FULL");return s;}
  const first=s.possible[0];
  if(!first){s.global_blockers.push("NO_NEEDS_FIXES");return s;}
  const p=await getPR(first,read);
  if(p.head.sha!==first.head||!eligiblePR(p,c))throw Error("PR_CHANGED_BEFORE_POST");
  if(activePRConflict(agent.tasks,p)){s.global_blockers.push("PR_ALREADY_HAS_ACTIVE_AGENT");return s;}
  const comments=await commentsFor(p,read),paths=await changedPaths(p,read),logs=parseRepairs(comments,p);
  const diff=logs.length&&logs.at(-1).sha!==p.head.sha?await afterRepair(p,logs.at(-1).sha,read):[];
  const result=evaluatePR(p,comments,await ciRuns(p,read),c,{changed_files:paths,afterRepairFiles:diff});
  if(result.status!=="NEEDS_FIXES"||result.attempts!==first.attempts||result.trigger!==first.trigger)
    throw Error("REPAIR_SIGNAL_CHANGED_BEFORE_POST");
  if(matchesQuota(await prsFor(read)))throw Error("QUOTA_CHANGED_BEFORE_POST");
  const posted=await gh("/repos/"+REPO+"/issues/"+p.number+"/comments",pat,"POST",{body:repairPrompt(p,result)});
  if(!isInt(posted.id))throw Error("REPAIR_COMMENT_NOT_CONFIRMED");
  s.dispatched.push({pr:p.number,head:p.head.sha,attempt:result.attempts+1,comment_id:posted.id});
  return s;
}
function markdown(s){
  return [
    "# MT-REPAIR-01 checkpoint",
    "Mode: "+s.mode+" | main: "+s.main_sha,
    "Protected main: "+s.protected_main+" | CI+Pages: "+s.main_ci_pages_pass+" | NIGHT-02: "+s.night02_released,
    "Quota blocked: "+s.quota_blocked+" | agent slots: "+s.active+"/3",
    "Candidates: "+(s.possible.map(x=>"#"+x.number+" ("+x.trigger+")").join(", ")||"none"),
    "Repair comments sent: "+s.dispatched.length,
    "Global blockers: "+(s.global_blockers.join(", ")||"none"),
    "Other dispositions: "+(s.blocked.map(x=>"#"+x.number+" "+x.status+(x.reason?"/"+x.reason:"")).join(", ")||"none"),
    "NO automatic merge or mathematical SOURCE_PASS."
  ].join("\n")+"\n";
}
export async function main(){
  const c=policyCheck(JSON.parse(readFileSync(CFG,"utf8")));
  if(process.argv.includes("--check")){console.log("MT-REPAIR-01 POLICY_PASS: allowlisted="+c.allowed_issue_numbers.length);return;}
  if(process.env.GITHUB_REPOSITORY!==REPO||process.env.GITHUB_REF!=="refs/heads/main"||
    !["schedule","workflow_dispatch"].includes(process.env.GITHUB_EVENT_NAME))throw Error("UNTRUSTED_EVENT_OR_BRANCH");
  const live=process.env.MT_REPAIR_LIVE==="true";
  const s=await measure(c,process.env.GITHUB_TOKEN,live);
  if(!live)s.global_blockers.push("DRY_RUN_NO_WRITES");
  else await dispatch(c,s,process.env.GITHUB_TOKEN,process.env.MT_COPILOT_DISPATCH_PAT);
  mkdirSync(".repair01",{recursive:true});
  writeFileSync(".repair01/report.json",JSON.stringify(s,null,2)+"\n");
  const md=markdown(s);writeFileSync(".repair01/summary.md",md);
  if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,md);
  console.log(md);
  if(live&&s.global_blockers.length)process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
  main().catch(e=>{console.error("MT-REPAIR-01 BLOCKED: "+safeErr(e));process.exitCode=1;});
