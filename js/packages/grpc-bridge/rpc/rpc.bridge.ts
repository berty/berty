import { Service } from '..'
import rpcNative from './rpc.native'
import beapi from '@berty-tech/api'
import { getServiceName, EOF } from './utils'
import * as pbjs from 'protobufjs'
import { ServiceClientType } from '../welsh-clients.gen'

const getErrorFromResponse = <M extends pbjs.Method>(
	method: M,
	response: beapi.account.ClientStreamRecv.IReply,
) => {
	if (response.error) {
		if (
			response.error.grpcErrorCode === beapi.account.GRPCErrCode.CANCELED ||
			(response.error.grpcErrorCode === beapi.account.GRPCErrCode.UNKNOWN &&
				response.error.message === 'EOF')
		) {
			return EOF
		}

		if (response.error.errorCode || 0 > 0) {
			return new Error(`${method.name} error: ${response.error.message}`)
		}

		if (response.error.grpcErrorCode || 0 > 0) {
			const name = beapi.account.GRPCErrCode[response.error.grpcErrorCode || 0]
			return new Error(`${method.name} error: GRPC_${name}(${response.error.grpcErrorCode})`)
		}

		return new Error(`unknown error: ${response.error.message}`)
	}

	return null
}

const makeStreamClient = <M extends pbjs.Method>(
	streamid: string,
	method: M,
	accountClient: ServiceClientType<beapi.account.AccountService>,
) => {
	const eventEmitter = {
		events: [] as ((...a: unknown[]) => void)[],
		started: false,

		_publish(...args: unknown[]) {
			this.events.forEach((listener) => listener.apply(this, args))
		},
		onMessage(listener: (...a: unknown[]) => void) {
			this.events.push(listener)
		},
		async emit(payload: Uint8Array) {
			const response = await accountClient.clientStreamSend({
				streamId: streamid,
				payload,
			})

			const err = getErrorFromResponse(method, response)
			if (err) {
				throw err
			}
		},
		async start() {
			if (this.started) {
				throw new Error('client stream already started or has been closed')
			}
			this.started = true

			var response: beapi.account.ClientStreamRecv.IReply
			for (;;) {
				response = await accountClient.clientStreamRecv({ streamId: streamid })

				const err = getErrorFromResponse(method, response)

				if (err) {
					this._publish(null, err)
					return
				}

				this._publish(response.payload, null)
			}
		},
		async stop() {
			if (!this.started) {
				throw new Error('client stream not started or has been closed')
			}
			const response = await accountClient.clientStreamClose({ streamId: streamid })
			const err = getErrorFromResponse(method, response)
			if (err) {
				throw err
			}
			return
		},
		async stopAndRecv() {
			if (this.started) {
				throw new Error('client stream not started or has been closed')
			}

			const response = await accountClient.clientStreamCloseAndRecv({ streamId: streamid })

			const err = getErrorFromResponse(method, response)
			if (err) {
				throw err
			}
			return method.resolvedResponseType?.decode(response.payload)
		},
	}

	return {
		__proto__: eventEmitter,
		events: [],
		started: false,
	}
}

const unary = (accountClient: ServiceClientType<beapi.account.AccountService>) => async <
	M extends pbjs.Method
>(
	method: M,
	request: Uint8Array,
	_metadata?: never,
) => {
	const methodDesc = {
		name: `/${getServiceName(method)}/${method.name}`,
	}

	const response = await accountClient.clientInvokeUnary({
		methodDesc: methodDesc,
		payload: request,
		// metadata: {}, // @TODO: pass metdate object
	})
	const err = getErrorFromResponse(method, response)
	if (err !== null) {
		throw err
	}

	return response.payload
}

const stream = (accountClient: ServiceClientType<beapi.account.AccountService>) => async <
	M extends pbjs.Method
>(
	method: M,
	request: Uint8Array,
	_metadata?: never,
) => {
	const methodDesc = {
		name: `/${getServiceName(method)}/${method.name}`,

		isClientStream: !!method.requestStream,
		isServerStream: !!method.responseStream,
	}

	const response = await accountClient.createClientStream({
		methodDesc: methodDesc,
		payload: request,
		// metadata: {},
	})

	const err = getErrorFromResponse(method, response)
	if (err !== null) {
		throw err
	}

	return makeStreamClient(response.streamId, method, accountClient)
}

const client = (accountClient: ServiceClientType<beapi.account.AccountService>) => ({
	unaryCall: unary(accountClient),
	streamCall: stream(accountClient),
})

const accountClient = Service(beapi.account.AccountService, rpcNative)
export default client(accountClient)
