import {join} from 'node:path';
import {existsSync, readFileSync} from 'node:fs';
import logger from '@/lib/logger';
import type {DeepPartial} from '@/lib/types';
import {deepMerge} from '@/lib/utils';

export type VerzConfig = {
	commit: {
		message: string;
	}
	tag: {
		name: string;
	}
	dryRun: boolean;
}
const defaultConfig: VerzConfig = {
	commit: {
		message: 'chore: version %v'
	},
	tag: {
		name: '%v'
	},
	dryRun: false,
};

class Config {
	private config: VerzConfig = defaultConfig
	
	private async fileLoad() {
		const configFiles = ['verz.config.json', 'verz.config.js', 'verz.config.mjs'];
		for (const file of configFiles) {
			const configPath = join(process.cwd(), file);
			if (existsSync(configPath)) {
				logger.debug(`Loading config from ${file}`);
				try {
					if (file.endsWith('.json')) {
						return JSON.parse(readFileSync(configPath, 'utf-8'));
					} else if (file.endsWith('.mjs')) {
						const module = await import(configPath);
						return module.default;
					} else {
						return require(configPath);
					}
				} catch (error) {
					logger.warn(`Failed to load config from ${file}:`, error);
				}
			}
		}
		return {};
	}
	
	async load(override: DeepPartial<VerzConfig> = {}): Promise<VerzConfig> {
		const fileConfig = await this.fileLoad();
		
		this.config = deepMerge(deepMerge(this.config, fileConfig), override);
		
		return this.config;
	}
	
	get(): VerzConfig {
		return this.config;
	}
}


export default new Config();