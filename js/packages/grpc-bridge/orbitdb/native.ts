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

	startProtocol(_: GoBridgeOpts): Promise<void> {
		return Promise.reject()
	}

	stopProtocol(): Promise<void> {
		return Promise.reject()
	}

	getProtocolAddr(): Promise<string> {
		return Promise.reject()
	}

	clearStorage(): Promise<void> {
		return Promise.reject()
	}
}

export const GoBridge: NoopGoBirdge = new NoopGoBirdge()
