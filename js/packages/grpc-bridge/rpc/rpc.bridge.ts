import { Service } from '..'
import rpcNative from './rpc.native'
import { account } from '@berty-tech/api'
import { getServiceName } from './utils'
import * as pbjs from 'protobufjs'
import { ServiceClientType } from '../welsh-clients.gen'
import { GRPCError, EOF } from '../error'

const ErrStreamClientAlreadyStarted = new GRPCError({
	grpcErrorCode: account.GRPCErrCode.CANCELED,
	message: 'client stream not started or has been closed',
})

const makeStreamClient = <M extends pbjs.Method>(
	streamid: string,
	method: M,
	accountClient: ServiceClientType<account.AccountService>,
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

			// check for error
			if (response.error) {
				const grpcerr = new GRPCError(response.error)
				if (!grpcerr.OK) {
					throw grpcerr
				}
			}
		},
		async start() {
			if (this.started) {
				throw ErrStreamClientAlreadyStarted
			}
			this.started = true

			var response: account.ClientStreamRecv.IReply

			for (;;) {
				response = await accountClient.clientStreamRecv({ streamId: streamid })
				const grpcerr = new GRPCError(response.error)
				if (!grpcerr.OK) {
					this._publish(null, grpcerr)
					return
				}

				this._publish(response.payload, null)
			}
		},
		async stop() {
			if (!this.started) {
				throw ErrStreamClientAlreadyStarted
			}

			const response = await accountClient.clientStreamClose({ streamId: streamid })
			const grpcerr = new GRPCError(response.error)
			if (!grpcerr.OK) {
				this._publish(null, grpcerr)
				return
			}

			return
		},
		async stopAndRecv() {
			if (this.started) {
				throw ErrStreamClientAlreadyStarted
			}

			const response = await accountClient.clientStreamCloseAndRecv({ streamId: streamid })
			const grpcerr = new GRPCError(response.error)
			if (!grpcerr.OK) {
				this._publish(null, grpcerr)
				return
			}

			const payload = method.resolvedResponseType?.decode(response.payload)
			this._publish(payload, null)
			return payload
		},
	}

	return {
		__proto__: eventEmitter,
		events: [],
		started: false,
	}
}

const unary = (accountClient: ServiceClientType<account.AccountService>) => async <
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
	const grpcerr = new GRPCError(response.error)
	if (!grpcerr.OK) {
		throw grpcerr
	}

	return response.payload
}

const stream = (accountClient: ServiceClientType<account.AccountService>) => async <
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

	const grpcerr = new GRPCError(response.error)
	if (!grpcerr.OK) {
		throw grpcerr.EOF ? EOF : grpcerr
	}

	return makeStreamClient(response.streamId, method, accountClient)
}

const client = (accountClient: ServiceClientType<account.AccountService>) => ({
	unaryCall: unary(accountClient),
	streamCall: stream(accountClient),
})

const accountClient = Service(account.AccountService, rpcNative)
export default client(accountClient)
