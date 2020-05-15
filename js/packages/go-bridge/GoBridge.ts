import { GoBridgeInterface } from './types'

class NoopGoBirdge implements GoBridgeInterface {
	startProtocol() {
		return Promise.reject()
	}

	stopProtocol() {
		return Promise.reject()
	}

	getProtocolAddr() {
		return Promise.reject()
	}

	clearStorage() {
		return Promise.reject()
	}
}

const GoBridge: GoBridgeInterface = new NoopGoBirdge()

export default GoBridge
