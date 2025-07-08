#!/usr/bin/env node

import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {Command} from 'commander';
import semver, {type ReleaseType} from 'semver';
import Logger from '@/lib/logger';
import logger from '@/lib/logger';
import exec from '@/lib/exec';
import Config, {type VerzConfig} from '@/lib/config';
import type {DeepPartial} from '@/lib/types';

function bumpVersion(type: ReleaseType): string {
	const config = Config.get();
	const packagePath = join(process.cwd(), 'package.json');
	const packageContent = readFileSync(packagePath, 'utf-8');
	const packageJson = JSON.parse(packageContent);
	
	const newVersion = semver.inc(packageJson.version, type);
	if (!newVersion) {
		throw new Error(`Failed to bump version: ${packageJson.version}`);
	}
	
	// Stash any current changes
	const hasChanges = exec('git', ['diff', 'HEAD'], {
		ignoreReturnCode: true,
	}).length > 0;
	if (hasChanges) {
		exec('git', ['stash', 'push', '--keep-index']);
	}
	
	packageJson.version = newVersion;
	
	logger.debug('Updating package.json');
	const match = packageContent.match(/^(?:( +)|\t+)/m);
	const indent = match?.[0] ?? '  ';
	if (!config.dryRun) writeFileSync(packagePath, JSON.stringify(packageJson, null, indent) + '\n');
	
	try {
		exec('git', ['add', 'package.json']);
		
		const commitMessage = config.commit.message.replace('%v', newVersion);
		exec('git', ['commit', '-m', commitMessage]);
		
		const tagName = config.tag.name.replace('%v', newVersion);
		exec('git', ['tag', tagName]);
	} catch (e) {
		Logger.error('Failed to commit and tag:', e);
	} finally {
		// Restore previously stashed changes
		if (hasChanges) {
			exec('git', ['stash', 'pop']);
		}
	}
	
	return newVersion;
}

async function main(): Promise<void> {
	const program = new Command();
	
	program
		.name('verz')
		.description('Version bumping tool')
		.argument('<type>', 'version bump type (major, minor, patch)')
		.option('--commit.message <message>', 'custom commit message')
		.option('-v, --verbose', 'enable verbose logging')
		.option('--dryRun', 'dry run')
		.action(async (type: ReleaseType, options: { 'commit.message'?: string; verbose?: boolean, dryRun?: boolean }) => {
			if (options.verbose) {
				Logger.level('debug');
			}
			
			try {
				const cliConfig: DeepPartial<VerzConfig> = {
					commit: {
						message: options['commit.message'],
					},
					dryRun: options['dryRun']
				};
				
				await Config.load(cliConfig)
				
				const newVersion = bumpVersion(type);
				Logger.info(`Version bumped to ${newVersion}`);
			} catch (error) {
				Logger.error('Error:', error);
				process.exit(1);
			}
		});
	
	program.parse();
}

main();