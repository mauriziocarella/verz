# verz
[![NPM Version](https://img.shields.io/npm/v/verz)](https://www.npmjs.com/package/verz)

**verz** is a simple CLI tool for bumping the version of your Node.js project, committing the change, and creating a Git tag — all in one go.

> 🤓 Fun fact: verz uses itself to manage its own versions.

## 📦 Installation

Install **verz** globally or as a dev dependency:

```bash
# Using npm
npm install -D verz

# Using yarn
yarn add -D verz

# Using pnpm
pnpm add -D verz
```

Or run it directly without installation using **npx**:

```bash
npx verz --<type>
```

## ⚙️ Usage

Run **verz** in the root of your project:

### Version Bumping

```bash
verz version --<type> [options]
# or simply
verz --<type> [options]
```

**`<type>`** is the type of version bump (see [semver](https://www.npmjs.com/package/semver))

### Tagging

Create a git tag for the current version without bumping:

```bash
verz tag [options]
```

## 📑 Options

### Version Options

| Option                 | Description                                                                                              | Default             |
|------------------------|----------------------------------------------------------------------------------------------------------|---------------------|
| `--patch`              | Bump the patch version (0.0.x)                                                                           | `false`             |
| `--minor`              | Bump the minor version (0.x.0)                                                                           | `false`             |
| `--major`              | Bump the major version (x.0.0)                                                                           | `false`             |
| `--prerelease [preid]` | Bump to prerelease version (e.g., 1.0.0 -> 1.0.1-rc.0). Optionally specify preid (alpha, beta, rc, etc.) | `false`             |
| `--version <version>`  | Set exact version (e.g., 1.2.3)                                                                          |                     |
| `--commit-message`     | Custom commit message. Use `%v` for version.                                                             | `chore: release %v` |
| `--tag-name`           | Custom tag name. Use `%v` for version.                                                                   | `%v`                |
| `--no-check-remote`    | Skip check if current branch is up-to-date with remote branch                                            | `false`             |
| `-v, --verbose`        | Enable verbose debug logging.                                                                            | `false`             |
| `--dry-run`            | Run without writing files or committing.                                                                 | `false`             |

### Tag Options

| Option          | Description                            | Default |
|-----------------|----------------------------------------|---------|
| `--tag-name`    | Custom tag name. Use `%v` for version. | `%v`    |
| `-v, --verbose` | Enable verbose debug logging.          | `false` |
| `--dry-run`     | Run without creating the tag.          | `false` |

## ⚙️ Configuration

You can configure **verz** using a configuration file. Create one of the following files in your project root:

- `verz.config.js`
- `verz.config.mjs`
- `verz.config.json`

The configuration file structure:
```json
{
  "commit": {
    "message": "chore: version %v"
  },
  "tag": {
    "name": "%v"
  }
}
```

## ✅ Examples

### Version Bumping Examples

Bump the patch version:

```bash
verz --patch
# or
verz version --patch
```

Bump to a prerelease version (defaults to 'rc' preid):

```bash
verz --prerelease
# or
verz version --prerelease
```

Bump to a specific prerelease type:

```bash
verz --prerelease beta
# or
verz version --prerelease beta
```

Set an exact version:

```bash
verz --version 2.0.0
# or
verz version --version 2.0.0
```

### Tagging Examples

Create a tag for the current version:

```bash
verz tag
```

Create a tag with verbose output:

```bash
verz tag --verbose
```

### Other Examples

Bump the minor version with a custom commit message:

```bash
verz --minor --commit.message "release: bump to %v"
```

Create a git tag for the current version without bumping:

```bash
verz --tag-only
```

Dry run (show what would happen without doing it):

```bash
verz --major --dry-run
```

Enable verbose logging:

```bash
verz --patch -v
```

Run without installing:

```bash
npx verz --patch
```

## 📝 License

MIT License
