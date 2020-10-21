import GoBridge from './GoBridge'

import BridgeLogger from './logger'
const BridgeConsole = {
	...console,
	...BridgeLogger(GoBridge),
}

import { GoBridgeInterface, GoBridgeOpts, GoLogLevel } from './types'

export { GoBridgeDefaultOpts } from './defaults'

export type { GoBridgeInterface, GoBridgeOpts }

export { GoLogLevel, BridgeConsole }

export default GoBridge
