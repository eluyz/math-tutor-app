import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { processCompletion } from "./review-ci-gate.mjs";

const sha = "a".repeat(40);
const repository = { full_name: "eluyz/math-tutor-app", id: 42, owner: { id: 7 } };
const run = () => ({
  id: 123, name: "CI", event: "pull_request", status: "completed",
  conclusion: "success", head_sha: sha, head_branch: "feature/check", run_attempt: 1,
});
const pull = () => ({
  number: 27, state: "open", base: { ref: "main", repo: { id: 42 } },
  head: { sha, ref: "feature/check", repo: { id: 42 } },
});
function fixture() {
  const state = { run: run(), pull: pull(), comments: [], associated: [{ number: 27 }] };
  const event = {
    repository, workflow_run: { ...state.run, head_repository: { id: 42 }, pull_requests: [{ number: 27 }] },
  };
  const api = {
    getRun: vi.fn(async () => state.run),
    associatedPulls: vi.fn(async () => state.associated),
    getPull: vi.fn(async (number) => number === state.pull.number ? state.pull : null),
    listComments: vi.fn(async () => [...state.comments]),
    createComment: vi.fn(async (_, body) => state.comments.push({ id: 99, user: { id: 41898282 }, body })),
    updateComment: vi.fn(async (id, body) => { state.comments.find((c) => c.id === id).body = body; }),
  };
  return { state, event, api, process: () => processCompletion(event, api, repository.full_name) };
}
function workComment(status, { author = 7, noBlockers = false, commentSha = sha } = {}) {
  return {
    id: 33, user: { id: author }, updated_at: "2026-10-20T07:00:00Z",
    body: `<!-- math-tutor-work-review:v1 pr=27 sha=${commentSha} -->\n\n## ${status} — independent review\n${noBlockers ? "\n<!-- math-tutor-work-audit:v1 blockers=none -->\n" : ""}`,
  };
}

describe("MT-AUTO-001 CI completion gate", () => {
  it("publishes only the finished CI result, separating review, Safari and owner approval", async () => {
    const f = fixture();
    expect(await f.process()).toBe("created");
    const body = f.state.comments[0].body;
    expect(body).toContain(`<!-- math-tutor-ci-gate:v1 pr=27 sha=${sha} -->`);
    expect(body).toContain("CI: **CI_SUCCESS**");
    expect(body).toContain("CODE_REVIEW: **NOT_CONFIRMED**");
    expect(body).toContain("CI_SUCCESS_AWAITING_INDEPENDENT_REVIEW");
    expect(body).toContain("PHYSICAL_SAFARI: **NOT_VERIFIED**");
    expect(body).toContain("OWNER_APPROVAL: **REQUIRED**");
    expect(body).not.toContain("CODE_REVIEW_PASS_AND_CI_GREEN");
    expect(await f.process()).toBe("unchanged");
    expect(f.state.comments).toHaveLength(1);
    expect(f.api.createComment).toHaveBeenCalledTimes(1);
    expect(f.api.updateComment).not.toHaveBeenCalled();
  });

  it.each([
    ["failure", "CI_FAILED"], ["cancelled", "CI_CANCELLED"],
    ["timed_out", "CI_TIMED_OUT"], ["neutral", "CI_NEUTRAL"],
  ])("reports %s without claiming a green gate", async (conclusion, status) => {
    const f = fixture();
    f.state.run.conclusion = conclusion;
    f.event.workflow_run.conclusion = conclusion;
    expect(await f.process()).toBe("created");
    expect(f.state.comments[0].body).toContain(`CI: **${status}**`);
    expect(f.state.comments[0].body).not.toContain("CODE_REVIEW_PASS_AND_CI_GREEN");
  });

  it("ignores push-main, fork, wrong workflow and a PR whose HEAD moved", async () => {
    for (const change of [
      (f) => { f.event.workflow_run.event = "push"; },
      (f) => { f.event.workflow_run.head_repository.id = 99; },
      (f) => { f.event.workflow_run.name = "Deploy Pages"; },
      (f) => { f.state.pull.head.sha = "b".repeat(40); },
      (f) => { f.state.pull.head.repo.id = 99; },
      (f) => { f.state.pull.base.ref = "other"; },
    ]) {
      const f = fixture(); change(f);
      expect(await f.process()).toMatch(/^ignored:/);
      expect(f.api.createComment).not.toHaveBeenCalled();
    }
  });

  it("uses associated PR lookup only when workflow_run.pull_requests is empty", async () => {
    const f = fixture();
    f.event.workflow_run.pull_requests = [];
    expect(await f.process()).toBe("created");
    expect(f.api.associatedPulls).toHaveBeenCalledWith(sha);
    const g = fixture();
    g.event.workflow_run.pull_requests = [{ number: 28 }];
    expect(await g.process()).toMatch(/^ignored:/);
    expect(g.api.associatedPulls).not.toHaveBeenCalled();
  });

  it("updates one owned comment on a rerun, but ignores an obsolete attempt", async () => {
    const f = fixture();
    expect(await f.process()).toBe("created");
    f.state.run = { ...f.state.run, run_attempt: 2, conclusion: "failure" };
    expect(await f.process()).toBe("ignored: stale or incomplete run");
    expect(f.state.comments[0].body).toContain("CI_SUCCESS");
    f.event.workflow_run = { ...f.event.workflow_run, run_attempt: 2, conclusion: "failure" };
    expect(await f.process()).toBe("updated");
    expect(f.state.comments).toHaveLength(1);
    expect(f.state.comments[0].body).toContain("CI: **CI_FAILED**");
    expect(f.state.comments[0].body).toContain("attempt 2");
    expect(f.api.createComment).toHaveBeenCalledTimes(1);
    expect(f.api.updateComment).toHaveBeenCalledTimes(1);
  });

  it("does not let a delayed older run overwrite a newer run at the same SHA", async () => {
    const f = fixture();
    f.state.comments.push({
      id: 99, user: { id: 41898282 },
      body: `<!-- math-tutor-ci-gate:v1 pr=27 sha=${sha} -->\n- CI: **CI_SUCCESS** — [run 200, attempt 1](https://github.com/eluyz/math-tutor-app/actions/runs/200).`,
    });
    expect(await f.process()).toBe("ignored: newer CI run already reported");
    expect(f.api.updateComment).not.toHaveBeenCalled();
  });

  it("fails closed if the run is in progress or the PR changes before writing", async () => {
    const f = fixture();
    f.state.run.status = "in_progress";
    expect(await f.process()).toBe("ignored: stale or incomplete run");
    const g = fixture();
    g.api.getPull.mockImplementationOnce(async () => g.state.pull)
      .mockImplementationOnce(async () => ({ ...g.state.pull, head: { ...g.state.pull.head, sha: "b".repeat(40) } }));
    expect(await g.process()).toBe("ignored: PR head changed before comment");
    expect(g.api.createComment).not.toHaveBeenCalled();
    const h = fixture();
    h.api.getRun.mockImplementationOnce(async () => h.state.run)
      .mockImplementationOnce(async () => ({ ...h.state.run, status: "in_progress", run_attempt: 2 }));
    expect(await h.process()).toBe("ignored: CI run changed before comment");
    expect(h.api.createComment).not.toHaveBeenCalled();
  });

  it("blocks on trusted same-SHA NEEDS_FIXES regardless of CI", async () => {
    const f = fixture();
    f.state.comments.push(workComment("NEEDS_FIXES"));
    expect(await f.process()).toBe("created");
    expect(f.state.comments[1].body).toContain("CODE_REVIEW: **NEEDS_FIXES**");
    expect(f.state.comments[1].body).toContain("Gate: **BLOCKED_BY_REVIEW**");
  });

  it("recognizes a trusted same-SHA PASS, and confirmed audit completion without inventing Work PASS", async () => {
    const f = fixture(); f.state.comments.push(workComment("PASS"));
    expect(await f.process()).toBe("created");
    expect(f.state.comments[1].body).toContain("Gate: **CODE_REVIEW_PASS_AND_CI_GREEN**");
    const g = fixture(); g.state.comments.push(workComment("WAITING_FOR_CI", { noBlockers: true }));
    expect(await g.process()).toBe("created");
    expect(g.state.comments[1].body).toContain("CODE_REVIEW: **WAITING_FOR_CI**");
    expect(g.state.comments[1].body).toContain("Gate: **CODE_REVIEW_AUDIT_COMPLETE_CI_GREEN**");
    expect(g.state.comments[1].body).not.toContain("CODE_REVIEW: **PASS**");
  });

  it("does not trust another author, stale SHA or an inconclusive WAITING_FOR_CI review", async () => {
    for (const comment of [
      workComment("PASS", { author: 8 }),
      workComment("PASS", { commentSha: "b".repeat(40) }),
      workComment("WAITING_FOR_CI"),
    ]) {
      const f = fixture(); f.state.comments.push(comment);
      expect(await f.process()).toBe("created");
      expect(f.state.comments[1].body).toContain("Gate: **CI_SUCCESS_AWAITING_INDEPENDENT_REVIEW**");
    }
  });

  it("never edits a user's marker copy, even when it looks like a gate", async () => {
    const f = fixture();
    f.state.comments.push({ id: 15, user: { id: 8 }, body: `<!-- math-tutor-ci-gate:v1 pr=27 sha=${sha} -->\nspoof` });
    expect(await f.process()).toBe("created");
    expect(f.state.comments[0].body).toContain("spoof");
    expect(f.api.updateComment).not.toHaveBeenCalled();
  });

  it("keeps the privileged workflow on main with narrow permissions and no PR code execution", () => {
    const yaml = readFileSync(new URL("../workflows/review-ci-completed.yml", import.meta.url), "utf8");
    expect(yaml).toMatch(/workflow_run:\s*\n\s*workflows: \[CI\]\s*\n\s*types: \[completed\]/);
    expect(yaml).toContain("pull-requests: write");
    expect(yaml).toContain("actions: read");
    expect(yaml).toContain("contents: read");
    expect(yaml).toContain("ref: main");
    expect(yaml).toContain("persist-credentials: false");
    expect(yaml).toContain("cancel-in-progress: false");
    expect(yaml).not.toMatch(/pull_request_target|npm ci|gh pr merge|auto-merge|deploy/i);
  });
});
