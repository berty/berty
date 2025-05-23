import { EventEmitter } from 'events'
import * as pb from 'protobufjs'

import { RequestStreamMock, ResponseStreamMock, UnaryMock } from '@berty/mock-services/types'

import { EOF } from '../error'

const unary =
	(service: any) =>
	async <T extends pb.Method>(method: T, request: Uint8Array, _metadata?: never) => {
		const methodImplem = service[method.name] as UnaryMock<any, any>
		if (!methodImplem) {
			throw new Error(`method ${method.name} not implemented`)
		}

		const requestType = method.resolvedRequestType
		const responseType = method.resolvedResponseType

		const req = requestType?.decode(request)
		const reply = await methodImplem(req)

		return responseType?.encode(reply).finish()
	}

const stream =
	(service: any) =>
	async <T extends pb.Method>(method: T, requestBytes: Uint8Array, _metadata?: never) => {
		const methodImplem = service[method.name]
		if (!methodImplem) {
			throw new Error(`method ${method.name} not implemented`)
		}

		const requestType = method.resolvedRequestType
		if (!requestType) {
			throw new Error('nil requestType')
		}

		const responseType = method.resolvedResponseType
		if (!responseType) {
			throw new Error('nil responseType')
		}

		if (method.responseStream && !method.requestStream) {
			// RESPONSE STREAM

			const responseStream = methodImplem as ResponseStreamMock<any, any>

			const listeners: Array<(message: Uint8Array | null, error: Error | null) => void> = []

			return {
				onMessage: (listener: (message: Uint8Array | null, error: Error | null) => void) => {
					listeners.push(listener)
				},
				start: async () => {
					const request = requestType?.decode(requestBytes)
					const send = async (response: any) => {
						for (const listener of listeners) {
							const msg = responseType.encode(response).finish()
							listener(msg, null)
						}
					}
					responseStream(request, send).then(() => {
						for (const listener of listeners) {
							listener(null, EOF)
						}
					})
				},
				stop: async () => {},
			}
		} else if (!method.responseStream && method.requestStream) {
			// REQUEST STREAM (not used and tested yet)

			const requestStream = methodImplem as RequestStreamMock<any, any>

			const eventEmitter = new EventEmitter()

			const onRequest = (listener: (request: any) => void) => {
				eventEmitter.on('msg', listener)
			}

			const onEnd = (listener: () => void) => {
				eventEmitter.on('end', listener)
			}

			const responsePromise = requestStream(onRequest, onEnd)

			return {
				emit: async (request: any) => {
					const msg = requestType.encode(request).finish()
					eventEmitter.emit('msg', msg)
				},
				stopAndRecv: async () => {
					eventEmitter.emit('end')
					const response = await responsePromise
					return responseType.encode(response).finish()
				},
				stop: async () => {
					eventEmitter.emit('end')
				},
			}
		} else if (method.responseStream && method.requestStream) {
			// BIDI STREAM

			throw new Error('bidi stream rpc not implemented')
		}

		throw new Error('malformed stream method')
	}

export const rpcMock = (service: any) => ({
	unaryCall: unary(service),
	streamCall: stream(service),
})
