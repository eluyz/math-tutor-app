import {readFileSync, mkdirSync, writeFileSync, appendFileSync} from "node:fs";
import {pathToFileURL} from "node:url";

const REPO = "eluyz/math-tutor-app";
const ROOT = "https://api.github.com";
const CONFIG = new URL("../../docs/MT_NIGHT_02_QUEUE.json", import.meta.url);
const LANES = ["QA", "SYLLABUS", "NEW"];
const ACTIVE_STATES = new Set(["queued", "in_progress", "idle", "waiting_for_user"]);
const KNOWN_STATES = new Set([...ACTIVE_STATES, "completed", "failed", "timed_out", "cancelled"]);
const BOT = "copilot-swe-agent[bot]";

function positive(v) { return Number.isSafeInteger(v) && v > 0; }
function overlap(a,b) {
  const x=a.replace(/\/+$/,""), y=b.replace(/\/+$/,"");
  return x===y || x.startsWith(y+"/") || y.startsWith(x+"/");
}
export function isCopilot(issue) {
  return (issue.assignees || []).some(a=>["copilot","copilot-swe-agent[bot]","copilot-swe-agent"].includes(String(a.login||"").toLowerCase()));
}
export function validateConfig(cfg) {
  if (!cfg || cfg.schema_version!==1 || cfg.repository!==REPO || cfg.mode!=="DRY_RUN_BY_DEFAULT" ||
      cfg.automatic_merge!==false || cfg.max_active!==1 ||
      cfg.max_assignments_per_tick!==1 || cfg.budget_mode!=="MANUAL_MONTHLY_GATE" ||
      cfg.monthly_gate_variable!=="MT_CREDIT_MONTH_OK" || cfg.pilot_batch_max!==3 ||
      !Array.isArray(cfg.queue) || cfg.queue.length<1 || cfg.queue.length>cfg.pilot_batch_max ||
      !Array.isArray(cfg.parked_issues) ||
      JSON.stringify(cfg.lanes)!==JSON.stringify(LANES) ||
      !cfg.seed_dispatched || !Array.isArray(cfg.queue) ||
      !Array.isArray(cfg.excluded_dependency_gated) || cfg.paused_on_quota!==true)
    throw Error("Invalid or unsafe queue policy");
  const ids=new Set(), scopes=[];
  for (const t of cfg.queue) {
    if (!positive(t.issue) || ids.has(t.issue) || !LANES.includes(t.lane) ||
        !Array.isArray(t.scope) || t.scope.length<1 || t.scope.length>5)
      throw Error("Duplicate/invalid task");
    ids.add(t.issue);
    for (const p of t.scope) {
      if (typeof p!=="string" || !/^[A-Za-z0-9._/-]+$/.test(p) ||
          p.includes("..") || p.startsWith("/") ||
          p.startsWith(".github/") || p==="package.json" || p==="package-lock.json")
        throw Error("Forbidden write path");
      scopes.push({path:p,issue:t.issue});
    }
  }
  for (let i=0;i<scopes.length;i++) for (let j=i+1;j<scopes.length;j++)
    if (overlap(scopes[i].path,scopes[j].path)) throw Error("Overlapping task write scopes");
  for (const lane of LANES) {
    if (!Array.isArray(cfg.seed_dispatched[lane]) ||
        !cfg.seed_dispatched[lane].every(positive)) throw Error("Invalid seed lane");
  }
  for (const n of cfg.parked_issues) if (!positive(n) || ids.has(n) || cfg.excluded_dependency_gated.includes(n))
    throw Error("Parked issue entered active queue or excluded dependencies");
  for (const n of cfg.excluded_dependency_gated) if (!positive(n) || ids.has(n))
    throw Error("Blocked dependency appeared in dispatch queue");
  return cfg;
}
export function quotaBlocked(prs) {
  return prs.some(p=>p.state==="open" &&
    /(?:quota exhausted|quota limits|session quota|usage limit|limit reached|credits exhausted)/i
      .test(String(p.title||"")+" "+String(p.body||"")));
}
export function liveSessionSummary(tasks, prs, knownIssues) {
  if (!Array.isArray(tasks) || tasks.length>=100 || !Array.isArray(prs) || prs.length>=100)
    throw Error("Task/PR API page may be truncated");
  const active=tasks.filter(t=>{
    if (!KNOWN_STATES.has(t.state)) throw Error("Unknown agent task state");
    return ACTIVE_STATES.has(t.state);
  });
  const laneOf=new Map(knownIssues.map(x=>[x.issue,x.lane]));
  const byPrId=new Map();
  for (const p of prs) for (const k of [p.id,p.number]) {
    if (!positive(k)) continue;
    if (byPrId.has(k) && byPrId.get(k)!==p)
      throw Error("Ambiguous PR artifact id");
    byPrId.set(k,p);
  }
  const lanes=new Set();
  for (const t of active) {
    const artifacts=(t.artifacts||[]).filter(a=>a.provider==="github" && a.type==="pull");
    const related=artifacts.map(a=>byPrId.get(a.data?.id)).filter(Boolean);
    if (related.length!==1) throw Error("Active task has no uniquely identified open PR; fail closed");
    const body=String(related[0].body||"");
    const matched=[...laneOf].filter(([n])=>new RegExp("\\b(?:fixes|closes|resolves|refs)\\s+(?:eluyz/math-tutor-app)?#"+n+"\\b","i").test(body));
    if (matched.length!==1) throw Error("Active task PR not linked uniquely to a queued issue");
    lanes.add(matched[0][1]);
  }
  return {count:active.length,lanes:[...lanes]};
}
export function chooseNext(cfg, issues, busy, max) {
  const taken=new Set(busy), chosen=[], counts={QA:0,SYLLABUS:0,NEW:0};
  for (const lane of LANES) for (const n of new Set([
    ...cfg.seed_dispatched[lane],
    ...cfg.queue.filter(t=>t.lane===lane && isCopilot(issues.get(t.issue)||{})).map(t=>t.issue)
  ])) counts[lane]++;
  for (let step=0;step<max;step++) {
    const choices=LANES.filter(l=>!taken.has(l)).map(lane=>{
      const task=cfg.queue.find(t=>t.lane===lane && issues.get(t.issue)?.state==="open" &&
        !isCopilot(issues.get(t.issue)));
      return task?{lane,task,count:counts[lane]}:null;
    }).filter(Boolean);
    if (!choices.length) break;
    choices.sort((a,b)=>a.count-b.count || LANES.indexOf(a.lane)-LANES.indexOf(b.lane));
    const item=choices[0]; chosen.push(item.task.issue);
    taken.add(item.lane); counts[item.lane]++;
  }
  return chosen;
}
async function request(path,token,method="GET",body) {
  if (!token || !path.startsWith("/")) throw Error("Missing token or invalid API path");
  const headers={
    Accept:"application/vnd.github+json",
    Authorization:"Bearer "+token,
    "X-GitHub-Api-Version":"2026-03-10",
    "User-Agent":"math-tutor-mt-night-02"
  };
  if(body!==undefined) headers["Content-Type"]="application/json";
  const response=await fetch(ROOT+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  if(!response.ok) throw Error("GitHub API "+response.status+" for "+method+" "+path.split("?")[0]);
  return response.json();
}
function releaseStatus(runs) {
  const latest=(name,event)=>runs.filter(r=>r.name===name&&r.event===event)
    .sort((a,b)=>(b.run_number||0)-(a.run_number||0))[0];
  const ci=latest("CI","push"),pages=latest("Deploy Pages","workflow_run");
  return {ci:ci?.conclusion||"NOT_VERIFIED",pages:pages?.conclusion||"NOT_VERIFIED",
    pass:ci?.status==="completed" && ci.conclusion==="success" &&
      pages?.status==="completed" && pages.conclusion==="success"};
}
async function evaluate(cfg, env) {
  if (env.repository!==REPO || env.ref!=="refs/heads/main" ||
      !["schedule","workflow_dispatch"].includes(env.event))
    throw Error("Only trusted main schedule/manual dispatch is supported");
  const live=env.live==="true";
  const read=env.read;
  const api=path=>request("/repos/"+REPO+path,read);
  const branch=await api("/branches/main");
  const sha=branch.commit?.sha;
  if (!/^[a-f0-9]{40}$/.test(sha||"")) throw Error("Cannot pin main SHA");
  const runs=await api("/actions/runs?head_sha="+sha+"&per_page=100");
  if(runs.total_count>=100) throw Error("Workflow runs truncated");
  const release=releaseStatus((runs.workflow_runs||[]).filter(r=>r.head_sha===sha));
  const prs=await api("/pulls?state=open&per_page=100");
  if (!Array.isArray(prs)||prs.length>=100) throw Error("Open PR list may be truncated");
  const items=await Promise.all(cfg.queue.map(async t=>[t.issue,await api("/issues/"+t.issue)]));
  const issues=new Map(items);
  if ([...issues.values()].some(i=>!i || i.pull_request)) throw Error("Expected genuine issue records");
  const quota=quotaBlocked(prs);
  const overview={schema_version:1,main_sha:sha,mode:live?"LIVE":"DRY_RUN",
    main_protected:branch.protected===true,release,quota_hold:quota,
    queue_total:cfg.queue.length,already_assigned:cfg.queue.filter(t=>isCopilot(issues.get(t.issue))).map(t=>t.issue),
    excluded_dependency_gated:cfg.excluded_dependency_gated,
    active:"NOT_VERIFIED",selected:[],dispatched:[],blockers:[]};
  if (!branch.protected) overview.blockers.push("MAIN_NOT_PROTECTED");
  if (!release.pass) overview.blockers.push("MAIN_CI_OR_PAGES_NOT_PASS");
  if (quota) overview.blockers.push("COPILOT_QUOTA_WARNING_IN_OPEN_PR");
  if (env.creditMonth!==new Date().toISOString().slice(0,7))
    overview.blockers.push("MONTHLY_AI_CREDIT_BUDGET_NOT_APPROVED");
  if (!live) {
    overview.blockers.push("DRY_RUN_NO_ASSIGNMENT");
    return overview;
  }
  if(!env.pat) {overview.blockers.push("MISSING_USER_PAT"); return overview;}
  if(overview.blockers.length) return overview;
  const agent=await request("/agents/repos/"+REPO+"/tasks?per_page=100",env.pat);
  if(!Array.isArray(agent.tasks)||agent.tasks.length>=100) throw Error("Agent task list truncated/unavailable");
  const known=[...cfg.queue.map(t=>({issue:t.issue,lane:t.lane})),
    ...LANES.flatMap(l=>cfg.seed_dispatched[l].map(n=>({issue:n,lane:l})))];
  const summary=liveSessionSummary(agent.tasks,prs,known);
  overview.active=summary.count;
  if(summary.count>=cfg.max_active){overview.blockers.push("ACTIVE_SLOTS_FULL");return overview;}
  const slots=Math.min(cfg.max_assignments_per_tick,cfg.max_active-summary.count);
  const selected=chooseNext(cfg,issues,summary.lanes,slots);
  overview.selected=selected;
  if(!selected.length) {overview.blockers.push("NO_ELIGIBLE_ISSUES");return overview;}
  for(const issue of selected) {
    // Recheck immediate identity; never assign an already-assigned or closed issue.
    const current=await api("/issues/"+issue);
    if(current.state!=="open" || isCopilot(current)) throw Error("Issue state changed before dispatch");
    const assigned=await request("/repos/"+REPO+"/issues/"+issue+"/assignees",env.pat,"POST",{
      assignees:[BOT],agent_assignment:{target_repo:REPO,base_branch:"main"}
    });
    if(!isCopilot(assigned)) throw Error("GitHub did not confirm Copilot assignment");
    overview.dispatched.push(issue);
  }
  return overview;
}
function summarize(r) {
  return [
    "# MT-NIGHT-02 dispatch checkpoint",
    "Mode: "+r.mode+" | pinned main: "+r.main_sha,
    "Protected main: "+r.main_protected+
      " | main CI: "+r.release.ci+" | Pages: "+r.release.pages,
    "Active agent tasks: "+r.active+" / 3",
    "Quota hold: "+r.quota_hold,
    "Already assigned from allowlist: "+(r.already_assigned.join(", ")||"none"),
    "Candidate issues: "+(r.selected.join(", ")||"none"),
    "Assigned this run: "+(r.dispatched.join(", ")||"none"),
    "Blocked excluded dependencies: "+r.excluded_dependency_gated.join(", "),
    "Blockers: "+(r.blockers.join(", ")||"none"),
    "",
    "This workflow never merges PRs, approves CI or changes branch protection."
  ].join("\n")+"\n";
}
export async function main() {
  const cfg=validateConfig(JSON.parse(readFileSync(CONFIG,"utf8")));
  if(process.argv.includes("--check")) {process.stdout.write("MT-NIGHT-02 CONFIG_PASS; tasks="+cfg.queue.length+"\n");return;}
  const env={repository:process.env.GITHUB_REPOSITORY,ref:process.env.GITHUB_REF,
    event:process.env.GITHUB_EVENT_NAME,live:process.env.MT_DISPATCH_LIVE,
    creditMonth:process.env.MT_CREDIT_MONTH_OK,
    read:process.env.GITHUB_TOKEN,pat:process.env.MT_COPILOT_DISPATCH_PAT};
  const report=await evaluate(cfg,env);
  const summary=summarize(report);
  mkdirSync(".night02",{recursive:true});
  writeFileSync(".night02/report.json",JSON.stringify(report,null,2)+"\n");
  writeFileSync(".night02/summary.md",summary);
  if(process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);
  process.stdout.write(summary);
  if(report.mode==="LIVE" && report.blockers.length) process.exitCode=1;
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)
  main().catch(err=>{process.stderr.write("MT-NIGHT-02 BLOCKED: "+err.message+"\n");process.exitCode=1;});
