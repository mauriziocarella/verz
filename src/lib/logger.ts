import {inspect} from 'node:util';

const COLORS = {
	reset: '\x1b[0m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	green: '\x1b[32m',
	magenta: '\x1b[35m',
	gray: '\x1b[90m',
	cyan: '\x1b[36m',
} as const;

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const PREFIX = {
	debug: '[DEBUG]',
	info: '[INFO]',
	warn: '[WARN]',
	error: '[ERROR]',
	success: '[SUCCESS]',
};

class Logger {
	COLORS = COLORS;

	constructor(private _level: LogLevel = 'info') {}

	private pad(content: string) {
		return content.padEnd(
			Object.values(PREFIX).reduce((max, str) => Math.max(max, str.length), 0),
			' ',
		);
	}

	debug(...args: unknown[]): void {
		if (this.shouldLog('debug'))
			console.log(
				`${COLORS.gray}${this.pad(PREFIX.debug)}${COLORS.reset}`,
				...args.map((arg) => (typeof arg === 'object' ? inspect(arg) : arg)),
				COLORS.reset,
			);
	}

	info(...args: unknown[]): void {
		if (this.shouldLog('info'))
			console.log(
				`${COLORS.blue}${this.pad(PREFIX.info)}${COLORS.reset}`,
				...args.map((arg) => (typeof arg === 'object' ? inspect(arg) : arg)),
				COLORS.reset,
			);
	}

	warn(...args: unknown[]): void {
		if (this.shouldLog('warn'))
			console.warn(
				`${COLORS.yellow}${this.pad(PREFIX.warn)}${COLORS.reset}`,
				...args.map((arg) => (typeof arg === 'object' ? inspect(arg) : arg)),
				COLORS.reset,
			);
	}

	error(...args: unknown[]): void {
		if (this.shouldLog('error'))
			console.error(
				`${COLORS.red}${this.pad(PREFIX.error)}${COLORS.reset}`,
				...args.map((arg) => (typeof arg === 'object' ? inspect(arg) : arg)),
				COLORS.reset,
			);
	}

	success(...args: unknown[]): void {
		if (this.shouldLog('info'))
			console.info(
				`${COLORS.green}${this.pad(PREFIX.success)}${COLORS.reset}`,
				...args.map((arg) => (typeof arg === 'object' ? inspect(arg) : arg)),
				COLORS.reset,
			);
	}

	level(level: LogLevel): void {
		this._level = level;
	}

	private shouldLog(level: LogLevel): boolean {
		const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
		return levels.indexOf(this._level) >= levels.indexOf(level);
	}
}

export default new Logger();
