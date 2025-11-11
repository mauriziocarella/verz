import {spawnSync} from 'node:child_process';
import Logger from '@/lib/logger';
import Config from '@/lib/config';

const exec = (command: string, args: (string | number)[], options?: {ignoreReturnCode?: boolean}) => {
	const config = Config.get();
	Logger.debug(`Running command${Logger.COLORS.gray}`, command, args);

	if (config.dryRun) return '';

	const p = spawnSync(command, args.map(String), {
		stdio: 'pipe',
	});

	const stdout = p.stdout?.toString() ?? '';
	const stderr = p.stderr?.toString() ?? '';

	if (!options?.ignoreReturnCode) {
		if (p.error) {
			throw p.error;
		}

		if (p.status !== 0) {
			const output = [stdout, stderr].filter(Boolean).join('\n');

			throw new Error(`Command \`${command}\` failed with exit code ${p.status}${output ? `:\n${output}` : ''}`);
		}
	}

	if (stdout) {
		// logger.debug('Command output:', stdout);
	}

	return stdout;
};

export default exec;
