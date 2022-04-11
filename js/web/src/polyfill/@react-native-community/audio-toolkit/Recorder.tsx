import EventEmitter from 'eventemitter3'

export class Recorder extends EventEmitter {
	constructor(_filename: string, _options: any) {
		super()
	}

	stop(cb: ((err: Error | null) => void) | undefined) {
		if (cb) {
			cb(null)
		}
	}

	destroy(cb: ((err: Error | null) => void) | undefined) {
		if (cb) {
			cb(null)
		}
	}

	record(cb: ((err: Error | null) => void) | undefined) {
		if (cb) {
			cb(new Error('recording is not supported on this platform'))
		}
	}
}
