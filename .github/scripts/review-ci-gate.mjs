import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const shaPattern = /^[a-f0-9]{40}$/;
const botId = 41898282; // github-actions[bot], not a user-supplied login string.

const gateMarker = (number, sha) => `<!-- math-tutor-ci-gate:v1 pr=${number} sha=${sha} -->`;
const isOwnGate = (comment, marker) =>
  comment.user?.id === botId && typeof comment.body === "string" &&
  comment.body.startsWith(`${marker}\n`);

function renderNotice(repository, pull, run) {
  const sha = run.head_sha;
  const runUrl = `https://github.com/${repository.full_name}/actions/runs/${run.id}`;
  return `${gateMarker(pull.number, sha)}
**Powiadomienie o zakończonej próbie CI dla PR #${pull.number}, commit \`${sha}\`**

- CI_RUN_RESULT: **${run.conclusion.toUpperCase()}** — [run ${run.id}, attempt ${run.run_attempt}](${runUrl}) zakończył się z takim wynikiem w chwili odczytu. To historyczny wynik tej próby; późniejszy rerun mógł zmienić bieżący stan CI.
- CURRENT_CI: **NOT_VERIFIED** — sprawdź najnowszą próbę w GitHub Actions.
- CODE_REVIEW: **NOT_ASSESSED_BY_THIS_WORKFLOW** — sprawdź niezależny raport Work dla tego commita.
- PHYSICAL_SAFARI: **NOT_VERIFIED**.
- OWNER_APPROVAL: **REQUIRED**.
- CURRENT_READINESS: **NOT_ASSESSED**.

To automatyczne powiadomienie nie ocenia bieżącej gotowości, nie zastępuje decyzji ChatGPT Work ani nie upoważnia do scalenia lub wdrożenia.`;
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

  // The event and API must identify the same completed attempt. A subsequent
  // rerun can start during any later await, so the notice reports only this
  // attempt's observed historical result, never current readiness.
  const run = await api.getRun(delivered.id);
  if (run?.id !== delivered.id || run.name !== "CI" || run.event !== "pull_request" ||
      run.status !== "completed" || run.run_attempt !== delivered.run_attempt ||
      run.head_sha !== delivered.head_sha || run.head_branch !== delivered.head_branch ||
      run.conclusion !== delivered.conclusion || typeof run.conclusion !== "string")
    return "ignored: stale or incomplete run";

  const candidates = Array.isArray(delivered.pull_requests) && delivered.pull_requests.length
    ? delivered.pull_requests : await api.associatedPulls(run.head_sha);
  const numbers = [...new Set(candidates.map((candidate) => candidate?.number)
    .filter((number) => Number.isSafeInteger(number) && number > 0))];
  const pulls = await Promise.all(numbers.map((number) => api.getPull(number)));
  const matches = pulls.filter((pull) => validPull(pull, repository, run.head_sha, run.head_branch));
  if (matches.length !== 1) return "ignored: no unique open same-repository main PR at run SHA";
  const pull = matches[0];
  // Comments are read only to find our own notice. Work can edit its report
  // during this read without changing our message. A CI rerun can likewise
  // start at any time without falsifying the recorded result of this attempt.
  const comments = await api.listComments(pull.number);
  if (!validPull(await api.getPull(pull.number), repository, run.head_sha, run.head_branch))
    return "ignored: PR head changed before comment";
  const marker = gateMarker(pull.number, run.head_sha);
  const own = comments.filter((comment) => isOwnGate(comment, marker));
  if (own.length > 1) throw new Error("Multiple owned CI gate comments need manual deduplication");
  if (own.length) {
    const previous = /\[run (\d+), attempt (\d+)\]/.exec(own[0].body);
    if (previous && (Number(previous[1]) > run.id ||
        (Number(previous[1]) === run.id && Number(previous[2]) > run.run_attempt)))
      return "ignored: newer CI run already reported";
  }
  const body = renderNotice(repository, pull, run);
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
