import GoBridge from './GoBridge'
import BridgeLogger from './logger'
import { GoBridgeInterface, GoBridgeOpts, GoLogLevel } from './types'

const BridgeConsole = {
	...console,
	...BridgeLogger(GoBridge),
}

export { GoBridgeDefaultOpts } from './defaults'

export type { GoBridgeInterface, GoBridgeOpts }

export { GoLogLevel, BridgeConsole }

export default GoBridge
