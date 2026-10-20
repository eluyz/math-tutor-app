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
    listComments: vi.fn(async () => structuredClone(state.comments)),
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
  it("publishes only a historical CI attempt, separating review, Safari and owner approval", async () => {
    const f = fixture();
    expect(await f.process()).toBe("created");
    const body = f.state.comments[0].body;
    expect(body).toContain(`<!-- math-tutor-ci-gate:v1 pr=27 sha=${sha} -->`);
    expect(body).toContain("CI_RUN_RESULT: **SUCCESS**");
    expect(body).toContain("CURRENT_CI: **NOT_VERIFIED**");
    expect(body).toContain("CODE_REVIEW: **NOT_ASSESSED_BY_THIS_WORKFLOW**");
    expect(body).toContain("CURRENT_READINESS: **NOT_ASSESSED**");
    expect(body).toContain("PHYSICAL_SAFARI: **NOT_VERIFIED**");
    expect(body).toContain("OWNER_APPROVAL: **REQUIRED**");
    expect(body).not.toMatch(/CODE_REVIEW_PASS_AND_CI_GREEN|CI_SUCCESS|Gate:|CODE_REVIEW: \*\*PASS\*\*/);
    expect(await f.process()).toBe("unchanged");
    expect(f.state.comments).toHaveLength(1);
    expect(f.api.createComment).toHaveBeenCalledTimes(1);
    expect(f.api.updateComment).not.toHaveBeenCalled();
  });

  it.each([
    ["failure", "FAILURE"], ["cancelled", "CANCELLED"],
    ["timed_out", "TIMED_OUT"], ["neutral", "NEUTRAL"],
  ])("reports %s without claiming a green gate", async (conclusion, status) => {
    const f = fixture();
    f.state.run.conclusion = conclusion;
    f.event.workflow_run.conclusion = conclusion;
    expect(await f.process()).toBe("created");
    expect(f.state.comments[0].body).toContain(`CI_RUN_RESULT: **${status}**`);
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
    expect(f.state.comments[0].body).toContain("CI_RUN_RESULT: **SUCCESS**");
    f.event.workflow_run = { ...f.event.workflow_run, run_attempt: 2, conclusion: "failure" };
    expect(await f.process()).toBe("updated");
    expect(f.state.comments).toHaveLength(1);
    expect(f.state.comments[0].body).toContain("CI_RUN_RESULT: **FAILURE**");
    expect(f.state.comments[0].body).toContain("attempt 2");
    expect(f.api.createComment).toHaveBeenCalledTimes(1);
    expect(f.api.updateComment).toHaveBeenCalledTimes(1);
  });

  it("does not let a delayed older run overwrite a newer run at the same SHA", async () => {
    const f = fixture();
    f.state.comments.push({
      id: 99, user: { id: 41898282 },
      body: `<!-- math-tutor-ci-gate:v1 pr=27 sha=${sha} -->\n- CI_RUN_RESULT: **SUCCESS** — [run 200, attempt 1](https://github.com/eluyz/math-tutor-app/actions/runs/200).`,
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
    h.api.listComments.mockImplementation(async () => {
      h.state.pull = { ...h.state.pull, head: { ...h.state.pull.head, sha: "b".repeat(40) } };
      return structuredClone(h.state.comments);
    });
    expect(await h.process()).toBe("ignored: PR head changed before comment");
    expect(h.api.createComment).not.toHaveBeenCalled();
  });

  it.each([false, true])("treats a rerun during comment pagination as historical on %s path", async (existing) => {
    const f = fixture();
    f.state.comments.push(workComment("PASS"));
    if (existing) f.state.comments.push({
      id: 99, user: { id: 41898282 },
      body: `<!-- math-tutor-ci-gate:v1 pr=27 sha=${sha} -->\nold notice`,
    });
    f.api.getRun.mockImplementation(async () => structuredClone(f.state.run));
    f.api.listComments.mockImplementation(async () => {
      const snapshot = structuredClone(f.state.comments);
      f.state.run = { ...f.state.run, run_attempt: 2, status: "in_progress", conclusion: null };
      return snapshot;
    });
    expect(await f.process()).toBe(existing ? "updated" : "created");
    expect(f.api.listComments).toHaveBeenCalledTimes(1);
    expect(f.state.comments.at(-1).body).toContain("CURRENT_CI: **NOT_VERIFIED**");
    expect(f.state.comments.at(-1).body).not.toMatch(/CI_SUCCESS|CODE_REVIEW_PASS_AND_CI_GREEN|Gate:/);
    expect(f.state.comments).toHaveLength(2);
    expect(f.api.createComment).toHaveBeenCalledTimes(existing ? 0 : 1);
    expect(f.api.updateComment).toHaveBeenCalledTimes(existing ? 1 : 0);
  });

  it.each([
    [false, "comments"], [true, "comments"],
    [false, "final HEAD"], [true, "final HEAD"],
  ])("does not infer Work approval when PASS changes during %s / %s", async (existing, during) => {
    const f = fixture();
    f.state.comments.push(workComment("PASS"));
    if (existing) f.state.comments.push({
      id: 99, user: { id: 41898282 },
      body: `<!-- math-tutor-ci-gate:v1 pr=27 sha=${sha} -->\nold notice`,
    });
    f.api.listComments.mockImplementation(async () => {
      const snapshot = structuredClone(f.state.comments);
      if (during === "comments") f.state.comments[0] = workComment("NEEDS_FIXES");
      return snapshot;
    });
    f.api.getPull.mockImplementationOnce(async () => structuredClone(f.state.pull))
      .mockImplementationOnce(async () => {
        if (during === "final HEAD") f.state.comments[0] = workComment("NEEDS_FIXES");
        return structuredClone(f.state.pull);
      });
    expect(await f.process()).toBe(existing ? "updated" : "created");
    expect(f.state.comments.at(-1).body).toContain("CODE_REVIEW: **NOT_ASSESSED_BY_THIS_WORKFLOW**");
    expect(f.state.comments.at(-1).body).not.toMatch(/CODE_REVIEW: \*\*PASS\*\*|CODE_REVIEW_PASS_AND_CI_GREEN|Gate:/);
  });

  it.each(["getRun", "first getPull", "listComments", "final getPull"])(
    "keeps a rerun starting during %s historical, not current", async (during) => {
      const f = fixture();
      f.state.comments.push(workComment("PASS"));
      const rerun = () => { f.state.run = { ...f.state.run, run_attempt: 2, status: "in_progress", conclusion: null }; };
      f.api.getRun.mockImplementation(async () => {
        const snapshot = structuredClone(f.state.run);
        if (during === "getRun") rerun();
        return snapshot;
      });
      let pullReads = 0;
      f.api.getPull.mockImplementation(async () => {
        const snapshot = structuredClone(f.state.pull);
        if (++pullReads === (during === "first getPull" ? 1 : 2) && during.includes("getPull")) rerun();
        return snapshot;
      });
      f.api.listComments.mockImplementation(async () => {
        const snapshot = structuredClone(f.state.comments);
        if (during === "listComments") rerun();
        return snapshot;
      });
      expect(await f.process()).toBe("created");
      expect(f.state.comments.at(-1).body).toContain("CI_RUN_RESULT: **SUCCESS**");
      expect(f.state.comments.at(-1).body).toContain("CURRENT_CI: **NOT_VERIFIED**");
      expect(f.state.comments.at(-1).body).not.toMatch(/CI_SUCCESS|CODE_REVIEW_PASS_AND_CI_GREEN|Gate:/);
    },
  );

  it.each([false, true])("does not publish after a HEAD change during comments on %s path", async (existing) => {
    const f = fixture();
    if (existing) f.state.comments.push({
      id: 99, user: { id: 41898282 },
      body: `<!-- math-tutor-ci-gate:v1 pr=27 sha=${sha} -->\nold notice`,
    });
    f.api.listComments.mockImplementation(async () => {
      const snapshot = structuredClone(f.state.comments);
      f.state.pull = { ...f.state.pull, head: { ...f.state.pull.head, sha: "b".repeat(40) } };
      return snapshot;
    });
    expect(await f.process()).toBe("ignored: PR head changed before comment");
    expect(f.api.createComment).not.toHaveBeenCalled();
    expect(f.api.updateComment).not.toHaveBeenCalled();
  });

  it("does not trust another author, stale SHA or any Work status as a current gate", async () => {
    for (const comment of [
      workComment("PASS", { author: 8 }),
      workComment("PASS", { commentSha: "b".repeat(40) }),
      workComment("WAITING_FOR_CI", { noBlockers: true }),
      workComment("NEEDS_FIXES"),
    ]) {
      const f = fixture(); f.state.comments.push(comment);
      expect(await f.process()).toBe("created");
      expect(f.state.comments[1].body).toContain("CURRENT_READINESS: **NOT_ASSESSED**");
      expect(f.state.comments[1].body).toContain("CODE_REVIEW: **NOT_ASSESSED_BY_THIS_WORKFLOW**");
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
