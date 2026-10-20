import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const shaPattern = /^[a-f0-9]{40}$/;
const botId = 41898282; // github-actions[bot], not a user-supplied login string.
const reviewStatuses = new Set(["NEEDS_FIXES", "PASS", "READY_FOR_USER_APPROVAL", "WAITING_FOR_CI"]);

const gateMarker = (number, sha) => `<!-- math-tutor-ci-gate:v1 pr=${number} sha=${sha} -->`;
const reviewMarker = (number, sha) => `<!-- math-tutor-work-review:v1 pr=${number} sha=${sha} -->`;
const isOwnGate = (comment, marker) =>
  comment.user?.id === botId && typeof comment.body === "string" &&
  comment.body.startsWith(`${marker}\n`);

function reviewFor(comments, repository, number, sha) {
  const marker = reviewMarker(number, sha);
  const eligible = comments.flatMap((comment) => {
    // Work currently posts through the repository owner's account. A marker from
    // another account (including another bot) is not review evidence.
    if (comment.user?.id !== repository.owner?.id || typeof comment.body !== "string" ||
        !comment.body.startsWith(`${marker}\n`)) return [];
    const firstLine = comment.body.slice(marker.length).trimStart().split(/\r?\n/, 1)[0];
    const status = /^## (NEEDS_FIXES|PASS|READY_FOR_USER_APPROVAL|WAITING_FOR_CI)(?:\s|$)/.exec(firstLine)?.[1];
    if (!reviewStatuses.has(status)) return [];
    const lines = comment.body.split(/\r?\n/).map((line) => line.trim());
    const noBlockers = lines.includes("<!-- math-tutor-work-audit:v1 blockers=none -->") ||
      lines.includes("Nie potwierdziłem innych błędów blokujących w aktualnym zakresie zmian.") ||
      lines.includes("No blocking defects remain in the current change.");
    return [{ status, noBlockers, id: comment.id, updated: comment.updated_at ?? comment.created_at ?? "" }];
  });
  if (eligible.some((review) => review.status === "NEEDS_FIXES"))
    return eligible.find((review) => review.status === "NEEDS_FIXES");
  return eligible.sort((a, b) => b.updated.localeCompare(a.updated))[0] ?? null;
}

function ciStatus(conclusion) {
  if (conclusion === "success") return "CI_SUCCESS";
  if (conclusion === "failure") return "CI_FAILED";
  if (conclusion === "cancelled") return "CI_CANCELLED";
  const other = new Set(["timed_out", "action_required", "neutral", "skipped", "stale", "startup_failure"]);
  return other.has(conclusion) ? `CI_${conclusion.toUpperCase()}` : "CI_UNKNOWN";
}

function gateStatus(ci, review) {
  if (review?.status === "NEEDS_FIXES") return "BLOCKED_BY_REVIEW";
  if (ci !== "CI_SUCCESS") return ci;
  if (review?.status === "PASS" || review?.status === "READY_FOR_USER_APPROVAL")
    return "CODE_REVIEW_PASS_AND_CI_GREEN";
  if (review?.status === "WAITING_FOR_CI" && review.noBlockers)
    return "CODE_REVIEW_AUDIT_COMPLETE_CI_GREEN";
  return "CI_SUCCESS_AWAITING_INDEPENDENT_REVIEW";
}

function renderGate(repository, pull, run, review) {
  const sha = run.head_sha;
  const ci = ciStatus(run.conclusion);
  const reviewState = review?.status ?? "NOT_CONFIRMED";
  const gate = gateStatus(ci, review);
  const runUrl = `https://github.com/${repository.full_name}/actions/runs/${run.id}`;
  const reviewUrl = review ? `https://github.com/${repository.full_name}/pull/${pull.number}#issuecomment-${review.id}` : null;
  return `${gateMarker(pull.number, sha)}
**CI completion gate for PR #${pull.number}, HEAD \`${sha}\`**

- CI: **${ci}** — [run ${run.id}, attempt ${run.run_attempt}](${runUrl}).
- CODE_REVIEW: **${reviewState}**${reviewUrl ? ` — [same-SHA Work report](${reviewUrl})` : " (no trusted same-SHA Work report)"}.
- PHYSICAL_SAFARI: **NOT_VERIFIED**.
- OWNER_APPROVAL: **REQUIRED**.
- Gate: **${gate}**.

This automated comment reports GitHub CI and existing review evidence. It is not a ChatGPT Work decision or a formal approval; it does not authorize merge or deployment.`;
}

function validRepository(repository, expectedName) {
  return repository?.full_name === expectedName &&
    /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(expectedName) &&
    Number.isSafeInteger(repository.id) && Number.isSafeInteger(repository.owner?.id);
}

function validPull(pull, repository, sha, branch) {
  return pull?.state === "open" && Number.isSafeInteger(pull.number) &&
    pull.base?.ref === "main" && pull.base?.repo?.id === repository.id &&
    pull.head?.repo?.id === repository.id && pull.head?.sha === sha &&
    pull.head?.ref === branch;
}

/** Return a reason for every ignored delivery; no API mutation occurs on that path. */
export async function processCompletion(event, api, expectedRepository) {
  const repository = event?.repository;
  const delivered = event?.workflow_run;
  if (!validRepository(repository, expectedRepository)) return "ignored: repository";
  if (delivered?.name !== "CI" || delivered.event !== "pull_request" ||
      delivered.status !== "completed" || !shaPattern.test(delivered.head_sha ?? "") ||
      !Number.isSafeInteger(delivered.id) || delivered.id <= 0 ||
      !Number.isSafeInteger(delivered.run_attempt) || delivered.run_attempt <= 0)
    return "ignored: not a completed pull-request CI run";
  if (delivered.head_repository?.id !== undefined && delivered.head_repository.id !== repository.id)
    return "ignored: fork run";

  // The authoritative run may already be on a newer attempt. Never publish an
  // old success from a delayed workflow_run delivery during or after a rerun.
  const run = await api.getRun(delivered.id);
  if (run?.id !== delivered.id || run.name !== "CI" || run.event !== "pull_request" ||
      run.status !== "completed" || run.run_attempt !== delivered.run_attempt ||
      run.head_sha !== delivered.head_sha || run.head_branch !== delivered.head_branch ||
      typeof run.conclusion !== "string") return "ignored: stale or incomplete run";

  const candidates = Array.isArray(delivered.pull_requests) && delivered.pull_requests.length
    ? delivered.pull_requests : await api.associatedPulls(run.head_sha);
  const numbers = [...new Set(candidates.map((candidate) => candidate?.number)
    .filter((number) => Number.isSafeInteger(number) && number > 0))];
  const pulls = await Promise.all(numbers.map((number) => api.getPull(number)));
  const matches = pulls.filter((pull) => validPull(pull, repository, run.head_sha, run.head_branch));
  if (matches.length !== 1) return "ignored: no unique open same-repository main PR at run SHA";
  const pull = matches[0];
  // Read each moving source twice. Work can revise a review during the HEAD
  // check, while CI can start a rerun during comment pagination. GitHub does
  // not provide an atomic transaction across these resources; the two passes
  // narrow the interval and reject changes observed before writing.
  await api.listComments(pull.number);
  const latestRun = await api.getRun(run.id);
  if (latestRun?.status !== "completed" || latestRun.run_attempt !== run.run_attempt ||
      latestRun.conclusion !== run.conclusion || latestRun.head_sha !== run.head_sha)
    return "ignored: CI run changed before comment";
  if (!validPull(await api.getPull(pull.number), repository, run.head_sha, run.head_branch))
    return "ignored: PR head changed before comment";
  await api.listComments(pull.number);
  const finalRun = await api.getRun(run.id);
  if (finalRun?.status !== "completed" || finalRun.run_attempt !== run.run_attempt ||
      finalRun.conclusion !== run.conclusion || finalRun.head_sha !== run.head_sha)
    return "ignored: CI run changed before comment";
  if (!validPull(await api.getPull(pull.number), repository, run.head_sha, run.head_branch))
    return "ignored: PR head changed before comment";

  // This is the final awaited read before the write. A Work edit during the
  // last HEAD check is reflected here; there is no atomic GitHub transaction.
  const comments = await api.listComments(pull.number);
  const marker = gateMarker(pull.number, run.head_sha);
  const own = comments.filter((comment) => isOwnGate(comment, marker));
  if (own.length > 1) throw new Error("Multiple owned CI gate comments need manual deduplication");
  if (own.length) {
    const previous = /\[run (\d+), attempt (\d+)\]/.exec(own[0].body);
    if (previous && (Number(previous[1]) > run.id ||
        (Number(previous[1]) === run.id && Number(previous[2]) > run.run_attempt)))
      return "ignored: newer CI run already reported";
  }
  const body = renderGate(repository, pull, run, reviewFor(comments, repository, pull.number, run.head_sha));
  if (own.length && own[0].body === body) return "unchanged";
  if (own.length) await api.updateComment(own[0].id, body);
  else await api.createComment(pull.number, body);
  return own.length ? "updated" : "created";
}

function githubApi(token, repository) {
  async function request(method, path, body) {
    const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error(`GitHub API ${method} ${path}: HTTP ${response.status}`);
    return response.status === 204 ? null : response.json();
  }
  async function pages(path) {
    const result = [];
    for (let page = 1; ; page++) {
      const batch = await request("GET", `${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
      if (!Array.isArray(batch)) throw new Error("Expected paginated GitHub array");
      result.push(...batch);
      if (batch.length < 100) return result;
    }
  }
  return {
    getRun: (id) => request("GET", `/actions/runs/${id}`),
    associatedPulls: (sha) => pages(`/commits/${sha}/pulls`),
    getPull: (number) => request("GET", `/pulls/${number}`),
    listComments: (number) => pages(`/issues/${number}/comments`),
    createComment: (number, body) => request("POST", `/issues/${number}/comments`, { body }),
    updateComment: (id, body) => request("PATCH", `/issues/comments/${id}`, { body }),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { GITHUB_EVENT_PATH: eventPath, GITHUB_REPOSITORY: repository, GITHUB_TOKEN: token } = process.env;
  if (!eventPath || !repository || !token) throw new Error("Missing GitHub Actions environment");
  const event = JSON.parse(await readFile(eventPath, "utf8"));
  console.log(await processCompletion(event, githubApi(token, repository), repository));
}
