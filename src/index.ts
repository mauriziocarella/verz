#!/usr/bin/env node

import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {Command} from 'commander';
import semver, {type ReleaseType} from 'semver';
import Logger from '@/lib/logger';
import exec from '@/lib/exec';
import Config, {type VerzConfig} from '@/lib/config';
import type {DeepPartial} from '@/lib/types';

type Options = {
	patch?: boolean;
	minor?: boolean;
	major?: boolean;
	prerelease?: boolean | string;
	'commit.message'?: string;
	verbose?: boolean;
	dryRun?: boolean
}

async function main(): Promise<void> {
	const program = new Command();
	
	program
		.name('verz')
		.description('Version bumping tool')
		.option('--patch', 'bump patch version')
		.option('--minor', 'bump minor version')
		.option('--major', 'bump major version')
		.option('--prerelease [preid]', 'bump to prerelease version (optionally specify preid: alpha, beta, rc, etc.)')
		.option('--commit.message <message>', 'custom commit message')
		.option('-v, --verbose', 'enable verbose logging')
		.option('--dry-run', 'dry run')
		.addHelpText('after', '\nAt least one of --patch, --minor, --major, or --prerelease must be specified.')
		.action(async (options: Options) => {
			if (options.verbose) {
				Logger.level('debug');
			}
			
			try {
				//region Load config
				let type: ReleaseType | undefined;
				let preid: string | undefined;

				// Count how many version bump options are specified
				const versionBumpOptions = [
					options.patch ? 'patch' : null,
					options.minor ? 'minor' : null,
					options.major ? 'major' : null,
					options.prerelease !== undefined ? 'prerelease' : null
				].filter(Boolean);

				if (versionBumpOptions.length === 0) {
					Logger.error('Error: You must specify one of: --patch, --minor, --major, or --prerelease');
					program.help({ error: true });
					return;
				}

				if (versionBumpOptions.length > 1) {
					Logger.error(`Error: Only one version bump option can be specified. Found: ${versionBumpOptions.join(', ')}`);
					program.help({ error: true });
					return;
				}

				if (options.prerelease !== undefined) {
					type = 'prerelease';
					preid = typeof options.prerelease === 'string' ? options.prerelease : 'rc';
				} else if (options.major) {
					type = 'major';
				} else if (options.minor) {
					type = 'minor';
				} else if (options.patch) {
					type = 'patch';
				}
				
				if (!type) {
					Logger.error('Error: You must specify one of: --patch, --minor, --major, or --prerelease');
					program.help({ error: true });
					return;
				}
				
				const cliConfig: DeepPartial<VerzConfig> = {
					commit: {
						message: options['commit.message'],
					},
					dryRun: options['dryRun']
				};
				
				await Config.load(cliConfig)
				//endregion
				
				//region Bump version
				
				const config = Config.get();
				const packagePath = join(process.cwd(), 'package.json');
				const packageContent = readFileSync(packagePath, 'utf-8');
				const packageJson = JSON.parse(packageContent);
				
				const newVersion = semver.inc(packageJson.version, type, false, preid || 'rc');
				if (!newVersion) {
					throw new Error(`Failed to bump version: ${packageJson.version}`);
				}
				
				// Check if package.json has uncommitted changes
				const packageJsonStatus = exec('git', ['status', '--porcelain', 'package.json'], {
					ignoreReturnCode: true,
				});
				if (packageJsonStatus.length > 0) {
					throw new Error('package.json has uncommitted changes. Please commit or stash them first.');
				}
				
				// Stash any current changes
				const hasChanges = exec('git', ['diff', 'HEAD'], {
					ignoreReturnCode: true,
				}).length > 0;
				if (hasChanges) {
					exec('git', ['stash', 'push', '--keep-index']);
				}
				
				packageJson.version = newVersion;
				
				Logger.debug(`Updating ${Logger.COLORS.gray}package.json`);
				const match = packageContent.match(/^(?:( +)|\t+)/m);
				const indent = match?.[0] ?? '  ';
				if (!config.dryRun) writeFileSync(packagePath, JSON.stringify(packageJson, null, indent) + '\n');
				
				try {
					exec('git', ['add', 'package.json']);
					
					const commitMessage = config.commit.message.replace('%v', newVersion);
					Logger.info(`Committing changes with message${Logger.COLORS.magenta}`, commitMessage);
					exec('git', ['commit', '-m', commitMessage]);
					
					const tagName = config.tag.name.replace('%v', newVersion);
					Logger.info(`Creating tag${Logger.COLORS.magenta}`, tagName);
					exec('git', ['tag', tagName]);
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
				Logger.error('Error:', error);
				process.exit(1);
			}
		});
	
	program.parse();
}

main();

export {
	VerzConfig
}
