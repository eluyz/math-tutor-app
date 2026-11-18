# MT-UI-SETUP-003 — project UI/UX tools

> Historical installation and optimization record. The versions, probes and PR
> observations below belong to MT-UI-SETUP-003. These skills are present on main
> at `307276a7a4f3196f47633992b936704178d147c4`, the main revision checked during
> MT-UI-004. The English migration does not reinstall or update the packages.

Setup for future tasks, without starting a redesign. Skills are tracked in Git
under `.agents/skills/`. After checking out the branch, start a new Codex session
in the repository directory. There is no need to rerun installers. A Draft PR
does not make the skills available on `main` before a separate merge decision.

## Installation status

| Tool | Installation and location | Verification |
| --- | --- | --- |
| UI UX Pro Max | CLI 2.15.0, `.agents/skills/ui-ux-pro-max/` and six companion skills | unchanged files from #338; validation of 12 domains/22 stacks, UX/React search, and recommendations |
| Impeccable | skill 4.9.2, `.agents/skills/impeccable/`, official Codex copy without hooks | unchanged package; engine 0.1.25, `engine-probe`, and local `detect` |
| Vercel Web Design Guidelines | `.agents/skills/web-design-guidelines/`, CLI `skills@1.9.0` | unchanged package, retrieval of current guidelines |
| Taste Skill | optional, removed in MT-UI-SETUP-003 | not detected; reinstalling requires a separate task |
| Superpowers | available in the conversation host, no local CLI plugin | Codex Plugins installation instructions below |

Installation environment: Codex CLI 0.159.2, Node.js 24.19.0, npm 11.9.0,
Python 3.12.14. Python 3 with its standard library is sufficient for UI UX Pro Max.
The Impeccable engine is a standalone executable, without npm/pip dependencies.

## Optimization and completeness

Taste comprised 1631 files and 36 599 882 bytes, including local photos, icons,
references, and tools. None of the retained skills requires its files. A comment
about Taste as an inspiration remains in UI UX Pro Max; it is neither an import
nor a runtime dependency. The entire optional skill, its license, and its
manifest entry were removed. Taste was already absent from `skills-lock.json`.

| Measurement | Before (04fb91f) | After optimization |
| --- | ---: | ---: |
| Files in the PR diff against the main baseline | 1881 | 249 |
| Added / removed lines in the PR diff | +239808 / −0 | +110689 / −0 |
| Files in `.agents/skills/` | 1873 | 242 |
| Skill assets — total size of Git-tracked files | 43 189 462 B | 6 589 580 B |

Skill asset savings: 84.7%. These are logical file sizes, rather than the size of
compressed `.git` objects. Deletion in a new commit reduces the current snapshot
and PR diff; large assets remain in the branch's previous commit. History was
not rewritten. If the goal is also to keep those assets out of `main` history,
choose squash merge when performing a later manual merge.

Every file in the remaining skills was preserved byte for byte, including
CSV/JSON data, license metadata, scripts, tests, fixtures, references, and
templates. UI UX Pro Max uses the data for search/recommendations; Impeccable uses
references, command metadata, a font index, VERSION, and a checksum manifest.
Files were not trimmed solely on the basis of extension or name. The Vercel
package contains one `SKILL.md` and fetches audit rules from the network.

PR #339 fully includes the installation from PR #338: all 174 files from that PR
were preserved unchanged. Recommendation: close #338 as superseded by #339 once
the owner confirms this consolidation. #338 was neither closed nor modified.

## Sources, updates, and persistence

Source revisions and hashes: `ui-ux-sources.json`. `skills-lock.json` pins Vercel.
Do not update or overwrite existing skills without reviewing their sources.

- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill):
  retained CLI 2.15.0 installation; command and limitations in `README.md`.
- [Impeccable](https://github.com/pbakaus/impeccable/blob/d41d9860b0094dcb68030657da63461212835aaa/README.md):
  official “Manual copy, no Node required” method, copied to `.agents/skills/impeccable`.
  Neither `.codex/hooks.json` nor plugin configuration was copied. The launcher
  checks the downloaded engine's SHA-256 against the bundled manifest.
- [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/README.md):
  `npx --yes skills@1.9.0 add vercel-labs/agent-skills --skill web-design-guidelines --agent codex --copy --yes`.

Before installing the CLI, the `vercel-labs/skills` source, the `tar`, `yaml`, and
`nostics` dependencies, and permissions were reviewed. Installation used
`npm_config_ignore_scripts=true`, `DISABLE_TELEMETRY=1`, and the
`/tmp/math-tutor-npm` cache. Nothing was installed globally. Repository copies do
not depend on symlinks to `/tmp`.

The Impeccable license is in `licenses/impeccable.LICENSE`; UI UX Pro Max licenses
were retained in their original locations. The reviewed Vercel revision does
not provide a LICENSE file — no license was invented for it.

## MT-UI-SETUP-003 verification

- Started a new Codex app-server process, called `thread/start` with
  `ephemeral: true`, read-only mode, and the project directory, then called
  `skills/list` with `forceReload: true`. Detected 9 project skills, with no
  errors and no Taste. A fresh `codex debug prompt-input` also confirms the
  skills directory in context. No model turn, UI changes, or hooks were run.
  The test uses a temporary `CODEX_HOME` because the default configuration
  directory is read-only.
- Hashes for all 9 retained skills match the pre-optimization manifest.
  UI UX Pro Max and Impeccable utility scripts work.
- Check current CI results for the specific head of PR #339 in the Checks tab;
  the PR description gives the verified SHA and link. An earlier commit's
  status does not establish the result for a new head. Pending CI must not be
  treated as passed.
- MT-UI-SETUP-002 passed 2603 tests, the build, and 6 E2E checks at
  375/768/1280 px in PL/EN. Optimization changes neither the application nor
  those tests; the CI workflow runs the full suite required before merging.
- New documentation passes the diff whitespace check. Retained upstream files
  were not reformatted; their existing whitespace is unchanged.

Impeccable has a persistent launcher, but its engine cache in `/tmp` is ephemeral.
A new environment may require downloading the engine to a writable
`IMPECCABLE_HOME` through the normal approval process. Vercel needs network
access for each audit to fetch
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md.
Impeccable Live/Apply requires `IMPECCABLE_LIVE_COPY_AGENT=off` or `chat`, as
specified in `AGENTS.md`; neither an approval-bypassing mode nor hooks were run.

## Superpowers through Codex Plugins

[Official instructions](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/README.md#codex-app):
in the Codex app, open **Plugins**, find **Superpowers** under **Coding**, click
**+**, and start a new session. In the CLI: `/plugins` → `superpowers` → **Install Plugin**.
Do not replace the plugin with a script/bootstrap or manual hook configuration.
Availability in the conversation host does not prove a local installation on
the user's computer. In this container, the CLI cannot query the remote plugin
catalog.

The application, React libraries, generators, and mathematical tests were
unchanged. PR #337 remains outside the setup task's scope: no editing, closing,
or merging.
