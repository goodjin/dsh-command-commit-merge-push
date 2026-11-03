# @goodjin2/dsh-command-commit-merge-push

The `/commit-merge-push` command: run the three git steps behind one slash command, with the repo's gates in between so a red build never lands.

## Usage

```
/commit-merge-push [commit message]
```

When invoked, the command:

1. **Checks environment** — confirms you're in a git repo and determines the current branch
2. **Runs gates** — `npm run typecheck`, `npm run test`, `npm run build` (any failure stops here)
3. **Commits** — stages all changes and commits with the provided message (or a default)
4. **Merges** — if in a worktree, switches to `main`, pulls, and merges the branch with `--no-ff`
5. **Pushes** — pushes `main` (and the branch if in a worktree)

## Behavior

- **On a worktree branch**: commits to the branch, merges to `main`, pushes both
- **On `main` directly**: commits to `main`, pushes (no merge step)
- **Detached HEAD**: returns an error (cannot determine branch)
- **Gate failure**: stops before committing, returns the error

## Example

```
/commit-merge-push fix: preserve user message source kind
```

Output on success:

```
Shipped: committed to fix-branch, merged to main, pushed both.
```

## Development

```sh
npm test
```

## License

UNLICENSED

## Install

Add to your profile's package.json:

```json
{
  "dependencies": { "@goodjin2/dsh-command-commit-merge-push": "link:~/github/dsh-plugins/dsh-command-commit-merge-push" }
}
```

And list the bundle in `dsh.profile.bundles`:

```json
{
  "dsh": { "profile": { "bundles": ["@goodjin2/dsh-command-commit-merge-push"] } }
}
```

The bundle's rows come from this repo's own `cordis.patch.yml` (declared as
`dsh.bundle.patch` in package.json), so there is nothing to merge into the
profile's own patch. **Without that declaration the host skips the whole
bundle** — the command simply never appears, with only one line in the startup
log to show for it:

```
dsh: skipping profile bundle "@goodjin2/dsh-command-commit-merge-push": Error: … declares no dsh.bundle in its package.json
```

This plugin is host-side only (it registers a slash command); it has no
browser half, so it declares no `dsh.client`.
