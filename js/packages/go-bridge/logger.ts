import { GoLogLevel, GoBridgeInterface } from './types'

const formatMessage = (...args: any[]): string =>
	args
		.map((e) => JSON.stringify(e))
		.join(' ')
		.replace(/\\"/g, '"')

const BridgeLogger = (bridge: GoBridgeInterface) => ({
	log: (message?: any, ...opts: any[]): void =>
		bridge.log({
			level: GoLogLevel.debug,
			message: formatMessage(message, ...opts),
		}),
	debug: (message?: any, ...opts: any[]): void =>
		bridge.log({
			level: GoLogLevel.debug,
			message: formatMessage(message, ...opts),
		}),
	warn: (message?: any, ...opts: any[]): void =>
		bridge.log({
			level: GoLogLevel.warn,
			message: formatMessage(message, ...opts),
		}),
	error: (message?: any, ...opts: any[]): void =>
		bridge.log({
			level: GoLogLevel.error,
			message: formatMessage(message, ...opts),
		}),
	info: (message?: any, ...opts: any[]): void =>
		bridge.log({
			level: GoLogLevel.info,
			message: formatMessage(message, ...opts),
		}),
})

export default BridgeLogger
