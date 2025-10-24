#!/usr/bin/env node

import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {Command} from 'commander';
import semver, {type ReleaseType} from 'semver';
import Logger from '@/lib/logger';
import exec from '@/lib/exec';
import Config, {type VerzConfig} from '@/lib/config';
import type {DeepPartial} from '@/lib/types';
import * as process from 'node:process';

type CommonOptions = {
	verbose?: boolean;
	dryRun?: boolean;
};
type VersionOptions = CommonOptions & {
	'patch'?: boolean;
	'minor'?: boolean;
	'major'?: boolean;
	'prerelease'?: boolean | string;
	'version'?: string;
	'commit.message'?: string;
};

type TagOptions = CommonOptions & {};

async function main(): Promise<void> {
	const program = new Command();

	program.name('verz');

	program
		.command('version', {
			isDefault: true,
		})
		.description('Version bumping tool')
		.option('--patch', 'bump patch version')
		.option('--minor', 'bump minor version')
		.option('--major', 'bump major version')
		.option('--prerelease [preid]', 'bump to prerelease version (optionally specify preid: alpha, beta, rc, etc.)')
		.option('--version <version>', 'set exact version (e.g., 1.2.3)')
		.option('--commit.message <message>', 'custom commit message')
		.option('-v, --verbose', 'enable verbose logging')
		.option('--dry-run', 'dry run')
		.action(async (options: VersionOptions) => {
			if (options.verbose) {
				Logger.level('debug');
			}
			if (options.dryRun) {
				Logger.info(`${Logger.COLORS.cyan}Dry run enabled. No changes will be made.`);
			}

			try {
				//region Load config
				let type: ReleaseType | undefined;
				let preid: string | undefined;
				let newVersion: string | undefined;

				// Count how many version bump options are specified
				const versionBumpOptions = [
					options.patch ? 'patch' : null,
					options.minor ? 'minor' : null,
					options.major ? 'major' : null,
					options.prerelease !== undefined ? 'prerelease' : null,
					options.version ? 'version' : null,
				].filter(Boolean);

				if (versionBumpOptions.length === 0) {
					Logger.error('You must specify one of: --patch, --minor, --major, --prerelease, or --version');
					return process.exit(1);
				}

				if (versionBumpOptions.length > 1) {
					Logger.error(
						`Only one version bump option can be specified. Found: ${versionBumpOptions.join(', ')}`,
					);
					return process.exit(1);
				}

				if (options.version) {
					if (!semver.valid(options.version)) {
						Logger.error(`Invalid version specified: ${options.version}. Must be a valid semver version.`);
						return process.exit(1);
					}

					newVersion = options.version;
				} else if (options.prerelease !== undefined) {
					type = 'prerelease';
					preid = typeof options.prerelease === 'string' ? options.prerelease : 'rc';
				} else if (options.major) {
					type = 'major';
				} else if (options.minor) {
					type = 'minor';
				} else if (options.patch) {
					type = 'patch';
				}

				const cliConfig: DeepPartial<VerzConfig> = {
					commit: {
						message: options['commit.message'],
					},
					dryRun: options['dryRun'],
				};

				await Config.load(cliConfig);
				//endregion

				//region Bump version

				const config = Config.get();
				const packagePath = join(process.cwd(), 'package.json');
				const packageContent = readFileSync(packagePath, 'utf-8');
				const packageJson = JSON.parse(packageContent);

				Logger.info(`Current version${Logger.COLORS.magenta}`, packageJson.version);

				if (!newVersion) {
					if (!type) {
						Logger.error('No version bump type specified');
						return process.exit(1);
					}

					const calculatedVersion = semver.inc(packageJson.version, type, false, preid || 'rc');
					if (!calculatedVersion) {
						Logger.error(`Failed to bump version: ${packageJson.version}`);
						return process.exit(1);
					}

					newVersion = calculatedVersion;
				}

				// Check if package.json has uncommitted changes
				const packageJsonStatus = exec('git', ['status', '--porcelain', 'package.json'], {
					ignoreReturnCode: true,
				});
				if (packageJsonStatus.length > 0) {
					Logger.error('package.json has uncommitted changes. Please commit or stash them first.');
					return process.exit(1);
				}

				// Stash any current changes
				const hasChanges =
					exec('git', ['diff', 'HEAD'], {
						ignoreReturnCode: true,
					}).length > 0;
				if (hasChanges) {
					exec('git', ['stash', 'push', '--keep-index']);
				}

				// Update package.json with new version
				packageJson.version = newVersion;

				Logger.debug(`Updating ${Logger.COLORS.gray}package.json`);
				const match = packageContent.match(/^(?:( +)|\t+)/m);
				const indent = match?.[0] ?? '  ';
				if (!config.dryRun) writeFileSync(packagePath, JSON.stringify(packageJson, null, indent) + '\n');

				try {
					exec('git', ['add', 'package.json']);

					if (config.commit.enabled) {
						const commitMessage = config.commit.message.replace('%v', newVersion);
						Logger.info(`Committing changes with message${Logger.COLORS.magenta}`, commitMessage);
						exec('git', ['commit', '-m', commitMessage]);
					} else {
						Logger.info('Skipping commit (commit.enabled is false)');
					}

					if (config.tag.enabled) {
						const tagName = config.tag.name.replace('%v', newVersion);
						Logger.info(`Creating tag${Logger.COLORS.magenta}`, tagName);
						exec('git', ['tag', tagName]);
					} else {
						Logger.info('Skipping tag creation (tag.enabled is false)');
					}
				} catch (e) {
					Logger.error('Failed to commit and tag:', e);
				} finally {
					// Restore previously stashed changes
					if (hasChanges) {
						exec('git', ['stash', 'pop']);
					}
				}

				Logger.info(`Version bumped to${Logger.COLORS.magenta}`, newVersion);
				//endregion
			} catch (error) {
				Logger.error(error);
				process.exit(1);
			}
		});

	program
		.command('tag')
		.description('create a tag for the current version without bumping the version')
		.option('-v, --verbose', 'enable verbose logging')
		.option('--dry-run', 'dry run')
		.action(async (options: TagOptions) => {
			if (options.verbose) {
				Logger.level('debug');
			}
			if (options.dryRun) {
				Logger.info(`${Logger.COLORS.cyan}Dry run enabled. No changes will be made.`);
			}

			try {
				// Load config
				const cliConfig: DeepPartial<VerzConfig> = {
					dryRun: options.dryRun,
				};

				await Config.load(cliConfig);

				const config = Config.get();
				const packagePath = join(process.cwd(), 'package.json');
				const packageContent = readFileSync(packagePath, 'utf-8');
				const packageJson = JSON.parse(packageContent);

				const currentVersion = packageJson.version;
				if (!currentVersion) {
					Logger.error('No version found in package.json');
					return process.exit(1);
				}

				Logger.info(`Current version${Logger.COLORS.magenta}`, currentVersion);

				if (!config.tag.enabled) {
					Logger.error('Tag creation is disabled (tag.enabled is false)');
					return process.exit(1);
				}

				// Create tag for current version
				const tagName = config.tag.name.replace('%v', currentVersion);
				Logger.info(`Creating tag for current version${Logger.COLORS.magenta}`, tagName);

				if (!config.dryRun) {
					exec('git', ['tag', tagName]);
				}
			} catch (error) {
				Logger.error(error);
				return process.exit(1);
			}
		});

	program
		.command('help')
		.description('display help')
		.action(() => {
			program.outputHelp();
		});

	program.parse();
}

main();

export {VerzConfig};
