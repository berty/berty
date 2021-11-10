import { GRPCError } from '../grpc-bridge/error'
import { GoBridgeInterface, GoLogLevel } from './types'

const stringifyReplacer = (key: string, value: any): any => {
	if (value instanceof GRPCError) {
		return value.toJSON()
	}

	if (value instanceof Error) {
		var error: { [key: string]: any } = {}
		Object.getOwnPropertyNames(value).forEach(key => {
			error[key] = (value as any)[key]
		})
		return error
	}

	return value
}

const formatMessage = (...args: any[]): string =>
	args
		.map(e => JSON.stringify(e, stringifyReplacer))
		.join(' ')
		.replace(/\\"/g, '"')

const BridgeLogger = (bridge: GoBridgeInterface) => ({
	...console,
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
