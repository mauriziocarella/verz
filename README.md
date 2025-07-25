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

```bash
verz --<type> [options]
```

**`<type>`** is the type of version bump. (see [semver](https://www.npmjs.com/package/semver))

## 📑 Options

| Option             | Description                                  | Default             |
|--------------------| -------------------------------------------- |---------------------|
| `--commit.message` | Custom commit message. Use `%v` for version. | `chore: release %v` |
| `-v, --verbose`    | Enable verbose debug logging.                | `false`             |
| `--dry-run`        | Run without writing files or committing.     | `false`             |

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

Bump the patch version:

```bash
verz --patch
```

Bump the minor version with a custom commit message:

```bash
verz --minor --commit.message "release: bump to %v"
```

Dry run (show what would happen without doing it):

```bash
verz --major --dry-run
```

Enable verbose logging:

```bash
verz patch -v
```

Run without installing:

```bash
npx verz patch
```

## 📝 License

MIT License
