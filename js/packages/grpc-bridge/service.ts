// @ts-nocheck
import * as pbjs from 'protobufjs'
import { ServiceClientType } from './welsh-clients.gen'

const lowerFirst = (str: string) => str.charAt(0).toLowerCase() + str.substring(1)

// Unary generator
const createUnaryMethod = <M extends pbjs.Method>(method: M, unaryCall: unknown) => {
	const requestType = method.resolvedRequestType
	const responseType = method.resolvedResponseType
	return async (payload: Uint8Array, metadata: unknown) => {
		const req = requestType?.encode(payload).finish()
		const res = await unaryCall(method, req, metadata)
		return responseType?.decode(res)
	}
}

const createUnaryMethodList = <S extends pbjs.Service>(
	service: S,
	rpcImpl: unknown,
	middleware: unknown,
) => {
	const methods = {}
	Object.keys(service.methods || {}).forEach((key: keyof typeof service.methods) => {
		const method = service.methods[key]
		if (!method.responseStream && !method.requestStream) {
			const lkey = lowerFirst(key)
			const genMethod = createUnaryMethod(method, rpcImpl.unaryCall)
			methods[lkey] = middleware(method, genMethod)
		}
	})
	return methods
}

// Streams generator
const createStreamMethod = <M extends pbjs.Method>(method: M, streamCall: unknown) => {
	const requestType = method.resolvedRequestType
	const responseType = method.resolvedResponseType
	return async (payload: Uint8Array, metadata: unknown) => {
		const req = requestType?.encode(payload).finish()
		const stream = await streamCall(method, req, metadata)
		return {
			onMessage: listener => {
				stream.onMessage((buf, err) => {
					if (err) {
						listener(null, err)
						return
					}

					try {
						const res = responseType.decode(buf)
						listener(res, null)
					} catch (e) {
						console.warn('invalid response type', e)
					}
				})
			},
			emit: async payload => {
				const req = requestType.encode(payload).finish()
				return stream.emit(req)
			},
			start: async () => stream.start(),
			stop: async () => stream.stop(),
			stopAndRecv: async () => stream.stopAndRecv(),
		}
	}
}

const createStreamMethodList = <S extends typeof pbjs.rpc.Service>(
	service: S,
	rpcImpl: unknown,
	middleware: unknown,
) => {
	const methods = {}
	Object.keys(service.methods || {}).forEach(key => {
		const method = service.methods[key]
		if (method.responseStream || method.requestStream) {
			const lkey = lowerFirst(key)
			const genMethod = createStreamMethod(method, rpcImpl.streamCall)
			methods[lkey] = middleware(method, genMethod)
		}
	})
	return methods
}

export const createService = <T extends typeof pbjs.rpc.Service, S extends InstanceType<T>>(
	service: T,
	rpcImpl: unknown,
	middleware?: unknown,
): ServiceClientType<S> => {
	if (!service) {
		throw new Error('invalid service')
	}

	if (typeof rpcImpl === 'undefined') {
		throw new Error('no rpc implem provided')
	}

	if (!middleware) {
		middleware = (method: unknown, call: unknown) => call
	}

	const sr = service.resolveAll()
	const unaryMethods = createUnaryMethodList(sr, rpcImpl, middleware)
	const streamMethods = createStreamMethodList(sr, rpcImpl, middleware)
	return Object.assign(unaryMethods, streamMethods)
}
