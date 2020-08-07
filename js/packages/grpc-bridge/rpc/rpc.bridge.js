import { Service } from '..'
import rpcNative from './rpc.native'
import { bridge, errcode } from '@berty-tech/api/index.js'
import { getServiceName, EOF } from './utils'

const protocolErrors = errcode.lookup('ErrCode')
const grpcErrors = bridge.lookup('GRPCErrCode')
const getErrorFromResponse = (method, response) => {
	if (response.error) {
		if (response.error.grpcErrorCode === grpcErrors.values.CANCELED) {
			throw EOF
		}

		if (response.error.errorCode > 0) {
			const name = protocolErrors.valuesById[response.error.errorCode]
			return new Error(`${method.name} error: ${name}(${response.error.errorCode})`)
		}

		if (response.error.grpcErrorCode > 0) {
			const name = grpcErrors.valuesById[response.error.grpcErrorCode]
			return new Error(`${method.name} error: GRPC_${name}(${response.error.grpcErrorCode})`)
		}

		return new Error(`unknown error: ${response.error.message}`)
	}

	return null
}

const makeStreamClient = (streamid, method, bridgeClient) => {
	const requestType = method.resolvedRequestType
	const responseType = method.resolvedResponseType
	const eventEmitter = {
		events: [],
		started: false,

		_publish(...args) {
			this.events.forEach((listener) => listener.apply(this, args))
		},
		onMessage(listener) {
			this.events.push(listener)
		},
		async emit(payload) {
			const request = requestType.encode(payload).finish()
			const response = await bridgeClient.clientStreamSend({
				streamId: streamid,
				payload: request,
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

			var response
			for (;;) {
				response = await bridgeClient.clientStreamRecv({ streamId: streamid })
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

			const response = await bridgeClient.clientStreamClose({ streamId: streamid })
			const err = getErrorFromResponse(method, response)
			if (err) {
				throw err
			}
			return
		},
	}

	return {
		__proto__: eventEmitter,
		events: [],
		started: false,
	}
}

const unary = (bridgeClient) => async (method, request, metadata) => {
	const methodDesc = {
		name: `/${getServiceName(method)}/${method.name}`,
	}

	const response = await bridgeClient.clientInvokeUnary({
		methodDesc: methodDesc,
		payload: request,
		metadata: {}, // @TODO: pass metdate object
	})
	const err = getErrorFromResponse(method, response)
	if (err !== null) {
		throw err
	}

	return response.payload
}

const stream = (bridgeClient) => async (method, request, metadata) => {
	const methodDesc = {
		name: `/${getServiceName(method)}/${method.name}`,

		isClientStream: !!method.requestStream,
		isServerStream: !!method.responseStream,
	}

	const response = await bridgeClient.createClientStream({
		methodDesc: methodDesc,
		payload: request,
		metadata: {},
	})

	const err = getErrorFromResponse(method, response)
	if (err !== null) {
		throw err
	}

	return makeStreamClient(response.streamId, method, bridgeClient)
}

const client = (bridgeClient) => ({
	unaryCall: unary(bridgeClient),
	streamCall: stream(bridgeClient),
})

const bridgeClient = Service(bridge.BridgeService, rpcNative)
export default client(bridgeClient)
