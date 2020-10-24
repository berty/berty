export type GoBridgeOpts = {
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
	log(_: GoLoggerOpts): void
	initBridge(): Promise<void>
	stopProtocol(): Promise<void>
	getProtocolAddr(): Promise<string>
	clearStorage(): Promise<void>
}
