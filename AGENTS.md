# Agent Reference

This repository contains `verz`, a TypeScript CLI for semver-oriented package versioning.

## What The Library Does

- Updates the root `package.json` version.
- Supports semver bumps: patch, minor, major, prerelease, and exact version assignment.
- Supports release suffixes: `-rN` and `-<prefix>-rN`.
- Can create Git commits and Git tags for version changes.
- Can create a tag for the current version without bumping.
- Can dry-run operations.
- Can load defaults from `verz.config.json`, `verz.config.js`, or `verz.config.mjs`.

For agent-facing usage details, command behavior, and side effects, read `llms.txt`.

## Important Files

- `src/index.ts`: CLI command definitions and command behavior.
- `src/lib/config.ts`: config loading, default config, and merge behavior.
- `src/lib/exec.ts`: Git command execution wrapper; respects `dryRun`.
- `src/lib/logger.ts`: console logging utility.
- `src/lib/utils.ts`: generic helpers.
- `README.md`: human-facing package documentation.
- `llms.txt`: concise feature and behavior reference for LLMs and automation agents.

## Development Commands

```bash
pnpm install
pnpm run build
```

There is currently no test script in `package.json`.

## Implementation Notes

- The package is a CLI-first tool; no stable runtime library API is documented.
- The default command is `version`, so `verz --patch` is equivalent to `verz version --patch`.
- Non-dry-run version commands may run Git commands with side effects: `git fetch`, `git stash`, `git add`, `git commit`, `git tag`, and `git stash pop`.
- Keep README and `llms.txt` synchronized when changing commands, options, defaults, or Git behavior.

