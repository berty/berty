export enum GoLogLevel {
	debug = 'debug',
	info = 'info',
	error = 'error',
	warn = 'warn',
}

export type GoBridgeOpts = {
	swarmListeners?: string[]
	grpcListeners?: string[]
	persistance?: boolean
	logLevel?: GoLogLevel
	tracing?: boolean
}

export interface GoBridgeInterface {
	startProtocol(_: GoBridgeOpts): Promise<void>
	stopProtocol(): Promise<void>
	getProtocolAddr(): Promise<string>
	clearStorage(): Promise<void>
}
