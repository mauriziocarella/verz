export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
	constructor(private _level: LogLevel = 'info') {
	}
	
	debug(...args: unknown[]): void {
		if (this.shouldLog('debug')) console.log('[DEBUG]', ...args);
	}
	
	info(...args: unknown[]): void {
		if (this.shouldLog('info')) console.log('[INFO]', ...args);
	}
	
	warn(...args: unknown[]): void {
		if (this.shouldLog('warn')) console.warn('[WARN]', ...args);
	}
	
	error(...args: unknown[]): void {
		if (this.shouldLog('error')) console.error('[ERROR]', ...args);
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