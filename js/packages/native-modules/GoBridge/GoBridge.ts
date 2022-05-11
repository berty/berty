import { GoBridgeInterface } from './GoBridgeInterface'

class NoopGoBirdge implements GoBridgeInterface {
	initBridge() {
		return Promise.reject()
	}

	closeBridge() {
		return Promise.reject()
	}

	log() {}

	clearStorage() {
		return Promise.reject()
	}

	invokeBridgeMethod() {
		return Promise.reject()
	}
}

export const GoBridge: GoBridgeInterface = new NoopGoBirdge()
