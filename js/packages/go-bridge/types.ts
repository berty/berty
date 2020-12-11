export type GoBridgeOpts = {
	logFilters?: string
	cliArgs?: string[]
	persistence?: boolean
}

export enum GoLogLevel {
	debug = 'debug',
	info = 'info',
	error = 'error',
	warn = 'warn',
}

export type GoLoggerOpts = {
	level: GoLogLevel
	message: string
}

export interface GoBridgeInterface {
	log(opts: GoLoggerOpts): void
	initBridge(): Promise<void>
	clearStorage(): Promise<void>
	closeBridge(): Promise<void>
	getProtocolAddr(): Promise<string>
	invokeBridgeMethod(method: string, b64message: string): Promise<string>
}
