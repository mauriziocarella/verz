import {spawnSync} from 'node:child_process';
import logger from '@/lib/logger';
import Config from '@/lib/config';

const exec = (command: string, args: (string | number)[], options?: {ignoreReturnCode?: boolean}) => {
	const config = Config.get()
	logger.debug('Running command:', command, args);
	
	if (config.dryRun) return '';
	
	const p = spawnSync(command, args.map(String), {
		stdio: 'pipe',
	});
	
	if (!options?.ignoreReturnCode) {
		if (p.error) {
			throw p.error;
		}
		
		if (p.status !== 0) {
			throw new Error(`Command failed with exit code ${p.status}`);
		}
	}
	
	const stdout = p.stdout?.toString() ?? '';
	
	if (stdout) {
		// logger.debug('Command output:', stdout);
	}
	
	return stdout;
};

export default exec;