import { Service } from '..'
import rpcNative from './rpc.native'
import { account, errcode } from '@berty-tech/api/index.js'
import { getServiceName, EOF } from './utils'

const protocolErrors = errcode.lookup('ErrCode')
const grpcErrors = account.lookup('GRPCErrCode')
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

const makeStreamClient = (streamid, method, accountClient) => {
	const requestType = method.resolvedRequestType
	// const responseType = method.resolvedResponseType
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
			const response = await accountClient.clientStreamSend({
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
	}

	return {
		__proto__: eventEmitter,
		events: [],
		started: false,
	}
}

const unary = (accountClient) => async (method, request, metadata) => {
	const methodDesc = {
		name: `/${getServiceName(method)}/${method.name}`,
	}

	const response = await accountClient.clientInvokeUnary({
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

const stream = (accountClient) => async (method, request, metadata) => {
	const methodDesc = {
		name: `/${getServiceName(method)}/${method.name}`,

		isClientStream: !!method.requestStream,
		isServerStream: !!method.responseStream,
	}

	const response = await accountClient.createClientStream({
		methodDesc: methodDesc,
		payload: request,
		metadata: {},
	})

	const err = getErrorFromResponse(method, response)
	if (err !== null) {
		throw err
	}

	return makeStreamClient(response.streamId, method, accountClient)
}

const client = (accountClient) => ({
	unaryCall: unary(accountClient),
	streamCall: stream(accountClient),
})

const accountClient = Service(account.AccountService, rpcNative)
export default client(accountClient)
