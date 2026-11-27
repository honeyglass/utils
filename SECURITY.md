# Security

Six documented supply chain attacks on GitHub Actions between 2024 and 2026 follow one
pattern. Something the workflow depends on is replaced, and the workflow hands it a
token. These are the rules this repository follows, and each one also stands as a
comment at the line where it acts: in a workflow, in `pnpm-workspace.yaml` or in
`.github/dependabot.yml`.

> [!IMPORTANT]
> **Every CI run starts with the supply check of
> [honeyglass/actions](https://github.com/honeyglass/actions/tree/main/supply-check).**
> It runs before any dependency is installed, pinned to a full commit id like every other
> action. It is an allow list: a dependency passes only as a registry version, an `npm:` alias,
> a link to a folder this repository tracks, or a pinned commit of a git source that the check
> lists for this repository, under the package name the list binds it to. A pnpm setting passes
> only as the template sets it, and a pnpmfile, a `.npmrc` key or a tracked path in a
> `node_modules` folder never passes.
> After the install it runs a second time and fails the job on a symlink that leads out of the
> checkout.

- **Every third party action is pinned to a full commit id, never to a tag.** A tag
  can be moved to another commit by anyone who gains write access to the action's
  repository, and every workflow that names that tag then runs their code on its next
  run. That is how `tj-actions/changed-files` was compromised in March 2025. A commit
  id addresses the content and cannot be moved.
- **`permissions: contents: read` stands at the top of every workflow.** A token that
  cannot write cannot push, tag or publish a release.
- **`pull_request`, never `pull_request_target`.** The second one runs in the context
  of the target repository, with a writable token and the secrets in reach, while it
  checks out the fork's code. That is the pattern known as Pwn Request.
- **`actions/checkout` runs with `persist-credentials: false`.** Otherwise the job's
  token stays in `.git/config`, and every later step, including anything a dependency
  runs, can read it and use it.
- **No secrets.** No job gets a secret; the exceptions stand in this repository's README.
  CI needs no Claude token, since it makes no model call: `CLAUDE_CODE_OAUTH_TOKEN` and
  `ANTHROPIC_API_KEY` stay out of GitHub, as each is valid for a year or more.
- **Dependabot moves the pins forward weekly.** A pin nobody updates rots, and a rotten
  pin is an action that no longer gets its fixes.
- **The package manager is pinned by hash.** `packageManager` in `package.json` names
  pnpm with the sha512 of its tarball, and Corepack, which ships with Node, refuses a
  download whose hash differs. No action installs pnpm: the one that would reads the
  version and drops the hash. The hash was checked against the integrity record the
  registry keeps for that version.
- **Dependencies install frozen and three days late.** `pnpm install --frozen-lockfile`
  refuses when the lockfile and `package.json` disagree, and every package in the
  lockfile carries its integrity hash. `minimumReleaseAge` in `pnpm-workspace.yaml`
  keeps pnpm from resolving a version younger than three days, and Dependabot waits
  the same three days before it opens a pull request, because a compromised release
  is usually found and pulled within hours. `blockExoticSubdeps` lets only a dependency
  named in `package.json` come from a git repository or a tarball URL, and
  `trustPolicy: no-downgrade` fails the install when a version carries weaker proof of
  its origin than the versions before it, which is what a stolen npm token looks like.
- **No dependency runs an install script, and no pnpmfile loads.** pnpm blocks the
  lifecycle scripts of dependencies, the allow list `allowBuilds` in `pnpm-workspace.yaml`
  stays empty, and `strictDepBuilds` turns a script that would have been skipped into an
  install that fails. `ignorePnpmfile: true` keeps pnpm from loading a `.pnpmfile.cjs`,
  whose code would run at every install, and the supply check refuses a
  `pnpm-workspace.yaml` without it. The exceptions stand in this repository's README.
- **Vendored code is checked against its release.** Code taken from a release into the
  repository comes with an `UPSTREAM` file that names the release and its SHA256. A
  check hashes the code before anything runs and refuses when it differs, so a pull
  request that touches the code has to touch that line too, where a reviewer sees it.
  Dependabot does not cover vendored code; moving it to a new release is done by hand.
  The rule applies where a repository vendors code, and the exceptions stand in this
  repository's README.
