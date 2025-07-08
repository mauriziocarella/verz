# verz

**verz** is a simple CLI tool for bumping your project's `package.json` version, committing the change, and tagging it in Git.

## Installation

```bash
npm install -g verz
```
```bash
yarn add -g verz
```
or
```bash
npx verz <type> [options]
```

## Usage

```bash
verz <type> [options]
```

* `<type>` must be one of `major`, `minor`, or `patch` (see [semver](https://www.npmjs.com/package/semver)).

## Example Commands

```bash
# Bump patch version (e.g., 1.0.0 -> 1.0.1)
verz patch

# Bump minor version with a custom commit message
verz minor --commit.message "Release version %v"

# Bump major version with verbose logging and no actual changes (dry run)
verz major --verbose --dryRun
```

## Options

| Option             | Description                                                   |
| ------------------ | ------------------------------------------------------------- |
| `--commit.message` | Custom commit message. Use `%v` as a placeholder for version. |
| `-v, --verbose`    | Enable verbose logging.                                       |
| `--dryRun`         | Perform a dry run without writing or committing changes.      |

## How it works

1. Reads the current version from `package.json`.
2. Bumps the version using [semver](https://www.npmjs.com/package/semver).
3. Stashes any uncommitted changes to avoid conflicts.
4. Updates `package.json`.
5. Creates a git commit and tag with the new version.
6. Restores any stashed changes.

## License

MIT
