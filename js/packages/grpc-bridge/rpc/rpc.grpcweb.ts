import { grpc } from '@improbable-eng/grpc-web'
import { getServiceName } from './utils'
import * as pb from 'protobufjs'
import { newGRPCError, EOF } from '../error'

class LazyMessage extends pb.Message implements grpc.ProtobufMessage {
	buf: Uint8Array

	constructor(buf: Uint8Array) {
		super()
		this.buf = buf
	}

	static deserializeBinary(buf: Uint8Array): LazyMessage {
		return new LazyMessage(buf)
	}

	serializeBinary(): Uint8Array {
		return this.buf
	}

	toObject(): {} {
		return {}
	}
}

export type GRPCBridge = (
	options: grpc.ClientRpcOptions,
	metadata?: { [key: string]: string | Array<string> },
) => pb.RPCImpl

const LazyMessageClass = LazyMessage as unknown as grpc.ProtobufMessageClass<grpc.ProtobufMessage>

const unary =
	<T extends pb.Method>(options: grpc.ClientRpcOptions) =>
	async (method: T, request: Uint8Array, metadata: grpc.Metadata) => {
		const methodDesc: grpc.MethodDefinition<grpc.ProtobufMessage, grpc.ProtobufMessage> = {
			methodName: method.name,
			service: {
				serviceName: (method.parent && method.parent.fullName.substr(1)) || '',
			},
			requestStream: method.requestStream || false,
			responseStream: method.responseStream || false,
			requestType: LazyMessageClass,
			responseType: LazyMessageClass,
		}

		const client = grpc.client(methodDesc, options)
		return new Promise((resolve, reject) => {
			client.start(new grpc.Metadata(metadata))
			client.onMessage((message: grpc.ProtobufMessage): void => {
				resolve(message.serializeBinary())
			})
			client.onEnd((code: grpc.Code, message: string /*, trailers: grpc.Metadata*/): void => {
				if (code !== grpc.Code.OK) {
					reject(newGRPCError(code, message))
				}
			})
			client.send(LazyMessage.deserializeBinary(request))
			client.finishSend()
		})
	}

const stream =
	<T extends pb.Method>(options: grpc.ClientRpcOptions) =>
	async (method: T, request: Uint8Array, metadata: grpc.Metadata) => {
		const serviceName = getServiceName(method)
		if (serviceName === undefined) {
			throw new Error('failed to get service name')
		}
		const methodDesc: grpc.MethodDefinition<grpc.ProtobufMessage, grpc.ProtobufMessage> = {
			methodName: method.name,
			service: { serviceName },
			requestStream: method.requestStream || false,
			responseStream: method.responseStream || false,
			requestType: LazyMessageClass,
			responseType: LazyMessageClass,
		}

		const client = grpc.client(methodDesc, options)
		return new Promise(resolve => {
			const stream = {
				resolve: null as ((_: unknown) => void) | null,
				reject: null as ((_: unknown) => void) | null,
				onMessage: (callback: (message: Uint8Array | null, error: Error | null) => void) => {
					client.onMessage((message: grpc.ProtobufMessage): void => {
						callback(message.serializeBinary(), null)
					})
					client.onEnd((code: grpc.Code, message: string /*, metadata: grpc.Metadata */) => {
						// TODO: dig why Internal Error is throw on grpcWeb
						const messagesToCheck = [
							'Response closed without grpc-status (Trailers provided)',
							'Response closed without grpc-status (Headers only)',
						]
						const codesToCheck = [grpc.Code.Unknown, grpc.Code.Internal]
						if (codesToCheck.indexOf(code) !== -1 && messagesToCheck.indexOf(message) !== -1) {
							callback(null, EOF)
							if (stream.resolve) {
								stream.resolve(null)
							}
						} else {
							callback(null, code === grpc.Code.OK ? EOF : newGRPCError(code, message))
							if (code === grpc.Code.OK && stream.resolve) {
								stream.resolve(null)
							} else if (code !== grpc.Code.OK && stream.reject) {
								stream.reject(newGRPCError(code, message))
							}
						}
					})
				},
				emit: async (request: Uint8Array) => {
					client.send(LazyMessage.deserializeBinary(request))
				},
				start: () =>
					new Promise((resolve, reject) => {
						stream.resolve = resolve
						stream.reject = reject
						client.start(new grpc.Metadata(metadata))
						if (!methodDesc.requestStream) {
							client.send(LazyMessage.deserializeBinary(request))
							client.finishSend()
						}
						return () => client.close()
					}),
				stop: async () => {
					if (methodDesc.requestStream) {
						client.finishSend()
					}

					client.close()
				},
			}

			resolve(stream)
		})
	}

const client = (options: grpc.ClientRpcOptions) => ({
	unaryCall: unary(options),
	streamCall: stream(options),
})

export default client
