import { GoBridgeInterface } from './types'

class NoopGoBirdge implements GoBridgeInterface {
	initBridge() {
		return Promise.reject()
	}

	closeBridge() {
		return Promise.reject()
	}

	log() {}

	getProtocolAddr() {
		return Promise.reject()
	}

	clearStorage() {
		return Promise.reject()
	}

	invokeBridgeMethod() {
		return Promise.reject()
	}
}

const GoBridge: GoBridgeInterface = new NoopGoBirdge()

export default GoBridge
