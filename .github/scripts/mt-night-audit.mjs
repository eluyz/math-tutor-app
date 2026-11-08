import {readFileSync, writeFileSync, mkdirSync, appendFileSync} from "node:fs";
import {pathToFileURL} from "node:url";

const REPO = "eluyz/math-tutor-app";
const ROOT = "https://api.github.com/repos/" + REPO;
const configUrl = new URL("../../docs/MT_NIGHT_QUEUE.json", import.meta.url);

function integer(n) {return Number.isSafeInteger(n) && n > 0;}
function scopeOverlap(a,b) {
  const norm = x => x.replace(/\/+$/, "");
  const x = norm(a), y = norm(b);
  return x === y || x.startsWith(y + "/") || y.startsWith(x + "/");
}
export function validateQueue(cfg) {
  if (!cfg || cfg.schema_version !== 1 || cfg.mode !== "REPORT_ONLY")
    throw Error("Invalid schema/mode; only REPORT_ONLY is permitted");
  if (!Number.isInteger(cfg.max_active) || cfg.max_active < 1 || cfg.max_active > 3)
    throw Error("max_active must be 1..3");
  if (!Array.isArray(cfg.queue) || cfg.queue.length > 24)
    throw Error("Expected bounded queue");
  const ids = new Set(), codes = new Set();
  for (const t of cfg.queue) {
    if (!integer(t.issue) || ids.has(t.issue)) throw Error("Duplicate/invalid issue");
    ids.add(t.issue);
    if (typeof t.code !== "string" || !/^[A-Z0-9-]{2,30}$/.test(t.code) || codes.has(t.code))
      throw Error("Duplicate/invalid code");
    codes.add(t.code);
    if (!Array.isArray(t.scope) || !t.scope.length || t.scope.length > 10)
      throw Error("Task needs a bounded scope");
    for (const p of t.scope) {
      if (typeof p !== "string" || !/^[A-Za-z0-9._/-]+$/.test(p) || p.includes("..") || p.startsWith("/"))
        throw Error("Unsafe/invalid scope");
      if (p.startsWith(".github/workflows") || p.startsWith(".github/scripts"))
        throw Error("Copilot task scope must not include privileged workflow/script paths");
    }
    if (!Array.isArray(t.depends_on) || t.depends_on.length > 10)
      throw Error("Task depends_on must be bounded");
    for (const d of t.depends_on) {
      if (!d || !["issue","pr"].includes(d.kind) || !integer(d.number) ||
          (d.kind === "issue" && d.number === t.issue))
        throw Error("Invalid/self dependency");
    }
    if (t.completed_by_pr !== undefined && !integer(t.completed_by_pr))
      throw Error("Invalid completion PR");
  }
  for (let i=0;i<cfg.queue.length;i++) for (let j=i+1;j<cfg.queue.length;j++)
    for (const p of cfg.queue[i].scope) for (const q of cfg.queue[j].scope)
      if (scopeOverlap(p,q)) throw Error("Overlapping task scope: " + p + " / " + q);
  const items = new Map(cfg.queue.map(t=>[t.issue,t]));
  const visiting = new Set(), done = new Set();
  const visit = id => {
    if (visiting.has(id)) throw Error("Dependency cycle");
    if (done.has(id)) return;
    visiting.add(id);
    for (const dep of items.get(id).depends_on)
      if (dep.kind === "issue" && items.has(dep.number)) visit(dep.number);
    visiting.delete(id);done.add(id);
  };
  for (const id of ids) visit(id);
  return cfg;
}
export function matchesFixes(body, issue) {
  if (typeof body !== "string" || !integer(issue)) return false;
  const re = new RegExp("\\b(?:fixes|closes|resolves)\\s+(?:eluyz/math-tutor-app)?#" + issue + "\\b","i");
  return re.test(body);
}
export function runStatus(runs, workflowName, event) {
  const found = runs.filter(r=>r.name === workflowName && r.event === event)
    .sort((a,b)=>(b.run_number || 0)-(a.run_number || 0) ||
      (b.run_attempt || 0)-(a.run_attempt || 0) ||
      String(b.created_at || "").localeCompare(String(a.created_at || "")))[0];
  if (!found) return {status:"NOT_VERIFIED",run_id:null};
  if (found.status !== "completed") return {status:"IN_PROGRESS",run_id:found.id};
  const values = {success:"PASS",action_required:"APPROVAL_REQUIRED",
    failure:"FAIL",cancelled:"CANCELLED",timed_out:"FAIL",skipped:"NOT_VERIFIED"};
  return {status:values[found.conclusion] || "NOT_VERIFIED",run_id:found.id};
}
export function releaseStatus(runs) {
  const ci = runStatus(runs,"CI","push");
  const pages = runStatus(runs,"Deploy Pages","workflow_run");
  return {status:ci.status === "PASS" && pages.status === "PASS" ?
    "RELEASE_PASS" : "RELEASE_NOT_VERIFIED",ci,pages};
}
export function isCopilotAssigned(issue) {
  return (issue.assignees || []).some(x=>String(x.login || "").toLowerCase() === "copilot");
}
export function sensitivePaths(files) {
  return files.filter(p=>p.startsWith(".github/workflows/") ||
    p.startsWith(".github/scripts/") || p.startsWith("src/university/") ||
    p === "src/answers.ts" || p.startsWith("src/answers/"));
}
async function liveReport(cfg) {
  const token = process.env.GITHUB_TOKEN;
  if (!token || process.env.GITHUB_REPOSITORY !== REPO)
    throw Error("GITHUB_TOKEN or exact repository identity unavailable; fail closed");
  const get = async path => {
    if (!path.startsWith("/")) throw Error("Invalid API path");
    const response = await fetch(ROOT + path,{headers:{
      Accept:"application/vnd.github+json",
      Authorization:"Bearer " + token,
      "X-GitHub-Api-Version":"2022-11-28",
      "User-Agent":"mt-night-report-readonly"
    }});
    if (!response.ok) throw Error("GitHub read error " + response.status + " for " + path.split("?")[0]);
    return response.json();
  };
  const cachedIssues = new Map(), cachedPulls = new Map(), cachedRuns = new Map();
  const issue = async n => {
    if (!cachedIssues.has(n)) cachedIssues.set(n,await get("/issues/" + n));
    return cachedIssues.get(n);
  };
  const pull = async n => {
    if (!cachedPulls.has(n)) cachedPulls.set(n,await get("/pulls/" + n));
    return cachedPulls.get(n);
  };
  const runsAt = async sha => {
    if (!/^[a-f0-9]{40}$/.test(sha)) throw Error("Invalid commit SHA");
    if (!cachedRuns.has(sha)) {
      const obj = await get("/actions/runs?head_sha=" + sha + "&per_page=100");
      if (obj.total_count > 100) throw Error("Runs result truncated: fail closed");
      cachedRuns.set(sha,(obj.workflow_runs || []).filter(r=>r.head_sha === sha));
    }
    return cachedRuns.get(sha);
  };
  const branch = await get("/branches/main");
  const main_sha = branch.commit?.sha;
  if (!/^[a-f0-9]{40}$/.test(main_sha || "")) throw Error("Cannot pin main SHA");
  const openPrs = await get("/pulls?state=open&per_page=100");
  if (!Array.isArray(openPrs) || openPrs.length === 100) throw Error("Open PR set may be truncated");
  const dependency = async d => {
    if (d.kind === "pr") {
      const p = await pull(d.number);
      if (!p.merged_at || !p.merge_commit_sha) return "PR_NOT_MERGED";
      const release = releaseStatus(await runsAt(p.merge_commit_sha));
      return release.status;
    }
    const target = await issue(d.number);
    const inQueue = cfg.queue.find(t=>t.issue === d.number);
    if (target.state !== "closed" || !inQueue?.completed_by_pr) return "ISSUE_NOT_RELEASED";
    const completion = await pull(inQueue.completed_by_pr);
    if (!completion.merged_at || !completion.merge_commit_sha ||
       !matchesFixes(completion.body,inQueue.issue)) return "ISSUE_MERGE_NOT_VERIFIED";
    return releaseStatus(await runsAt(completion.merge_commit_sha)).status;
  };
  const rows = [];
  for (const t of cfg.queue) {
    const i = await issue(t.issue);
    const deps = [];
    for (const d of t.depends_on) deps.push({
      kind:d.kind,number:d.number,status:await dependency(d)
    });
    const linked = openPrs.filter(p=>matchesFixes(p.body,t.issue));
    if (linked.length > 1) throw Error("Multiple open PRs claim issue " + t.issue);
    const p = linked[0], blocked = deps.some(d=>d.status !== "RELEASE_PASS");
    let ci = {status:"NOT_VERIFIED",run_id:null}, changed = [], state = "NOT_STARTED";
    if (p) {
      ci = runStatus(await runsAt(p.head.sha),"CI","pull_request");
      const files = await get("/pulls/" + p.number + "/files?per_page=100");
      if (!Array.isArray(files) || files.length === 100) throw Error("PR file list may be truncated");
      changed = sensitivePaths(files.map(f=>f.filename));
      state = changed.length ? "SENSITIVE_CHANGES_REVIEW" :
        ci.status === "PASS" ? "REVIEW_REQUIRED" :
        ci.status === "APPROVAL_REQUIRED" ? "CI_APPROVAL_REQUIRED" :
        ci.status === "FAIL" ? "CI_FAILURE" : "CI_NOT_READY";
      if (blocked) state = "BLOCKED_DEPENDENCY_ACTIVE_PR";
    } else if (isCopilotAssigned(i)) state = blocked ? "BLOCKED_DEPENDENCY_ASSIGNED" : "COPILOT_ASSIGNED";
    else if (!blocked) state = "READY_FOR_MANUAL_DISPATCH";
    else state = "BLOCKED_DEPENDENCY";
    rows.push({issue:t.issue,code:t.code,state,dependencies:deps,
      assigned_to_copilot:isCopilotAssigned(i),pr:p?.number || null,
      head_sha:p?.head?.sha || null,ci,unsafe_files:changed});
  }
  const copilotOpenPrs = openPrs.filter(p=>String(p.user?.login || "").toLowerCase() === "copilot"
    || String(p.head?.ref || "").startsWith("copilot/"));
  const openInQueue = new Set(rows.filter(row=>row.pr).map(row=>row.pr));
  const assignedWithoutPr = rows.filter(row=>row.assigned_to_copilot && !row.pr).length;
  const active = copilotOpenPrs.length + assignedWithoutPr;
  const guards = {max_active:cfg.max_active,active,
    active_limit_ok:active <= cfg.max_active,
    external_open_copilot_prs:copilotOpenPrs.filter(p=>!openInQueue.has(p.number)).map(p=>p.number),
    mode:cfg.mode,automatic_assignment:false,automatic_merge:false};
  return {schema_version:1,generated_at:new Date().toISOString(),
    main_sha,repo:REPO,guards,rows};
}
export function markdown(report) {
  const g = report.guards;
  const lines = ["# MT-NIGHT-01 — morning QA evidence",
    "Pinned main SHA: " + report.main_sha,
    "Mode: REPORT_ONLY. NO automatic assignment, CI approval, or merge.",
    "Active Copilot work: " + g.active + "/" + g.max_active +
      (g.active_limit_ok ? " (within limit)" : " (OVER LIMIT — BLOCKED)"),
    "",
    "| Issue | Dependency gate | State | PR / exact HEAD | PR CI |",
    "| --- | --- | --- | --- | --- |"];
  for (const row of report.rows) {
    const dependencies = row.dependencies.length ?
      row.dependencies.map(d=>d.kind + "#" + d.number + ":" + d.status).join(", ") : "none";
    lines.push("| #" + row.issue + " | " + dependencies + " | " + row.state + " | " +
      (row.pr ? "#" + row.pr + " / " + row.head_sha : "none") + " | " +
      row.ci.status + (row.ci.run_id ? " (run " + row.ci.run_id + ")" : "") + " |");
  }
  lines.push("", "No deployment or mathematical SOURCE_PASS is claimed from this read-only report.");
  if (g.external_open_copilot_prs.length)
    lines.push("Untracked open Copilot PRs: " + g.external_open_copilot_prs.join(", "));
  return lines.join("\n") + "\n";
}
export async function main() {
  const cfg = validateQueue(JSON.parse(readFileSync(configUrl,"utf8")));
  if (process.argv.includes("--check")) {
    process.stdout.write("MT-NIGHT-01 CONFIG_PASS: REPORT_ONLY; tasks=" + cfg.queue.length + "\n");
    return;
  }
  const result = await liveReport(cfg);
  const summary = markdown(result);
  mkdirSync(".night",{recursive:true});
  writeFileSync(".night/report.json",JSON.stringify(result,null,2) + "\n");
  writeFileSync(".night/summary.md",summary);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);
  process.stdout.write(summary);
  if (!result.guards.active_limit_ok) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch(err=>{process.stderr.write("MT-NIGHT-01 BLOCKED: " + err.message + "\n");process.exitCode=1;});
