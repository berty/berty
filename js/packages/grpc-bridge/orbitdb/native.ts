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
	logLevel?: string
}

class NoopGoBirdge {
	startDemo(_: GoBridgeOpts): Promise<void> {
		return Promise.reject()
	}

	getDemoAddr(): Promise<string> {
		return Promise.reject()
	}
}

export const GoBridge: NoopGoBirdge = new NoopGoBirdge()
