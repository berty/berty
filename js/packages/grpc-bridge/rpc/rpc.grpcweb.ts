import { grpc } from '@improbable-eng/grpc-web'
import { getServiceName, EOF } from './utils'
import * as pb from 'protobufjs'

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

const LazyMessageClass: grpc.ProtobufMessageClass<grpc.ProtobufMessage> = LazyMessage
const unary = (options: grpc.ClientRpcOptions) => async (
	method: any,
	request: Uint8Array,
	metadata: grpc.Metadata,
) => {
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
		client.onEnd((code: grpc.Code, message: string, trailers: grpc.Metadata): void => {
			if (code !== grpc.Code.OK) {
				reject(new Error(message))
			}
		})
		console.log(request)
		client.send(LazyMessage.deserializeBinary(request))
		client.finishSend()
	})
}

const stream = (options: grpc.ClientRpcOptions) => async (
	method: any,
	request: Uint8Array,
	metadata: grpc.Metadata,
) => {
	const methodDesc: grpc.MethodDefinition<grpc.ProtobufMessage, grpc.ProtobufMessage> = {
		methodName: method.name,
		service: {
			serviceName: getServiceName(method),
		},
		requestStream: method.requestStream || false,
		responseStream: method.responseStream || false,
		requestType: LazyMessageClass,
		responseType: LazyMessageClass,
	}

	const client = grpc.client(methodDesc, options)
	return new Promise((resolve) => {
		const stream = {
			onMessage: (callback: (message: Uint8Array | null, error: Error | null) => void) => {
				client.onMessage((message: grpc.ProtobufMessage): void => {
					callback(message.serializeBinary(), null)
				})
				client.onEnd((code: grpc.Code, message: string, metadata: grpc.Metadata) => {
					if (code !== grpc.Code.OK) {
						callback(null, new Error(`grpc error(${code}): ${message}`))
					} else {
						callback(null, EOF)
					}
				})
			},
			emit: async (request: Uint8Array) => {
				client.send(LazyMessage.deserializeBinary(request))
			},
			start: async () => {
				client.start(new grpc.Metadata(metadata))
				if (!methodDesc.requestStream) {
					client.send(LazyMessage.deserializeBinary(request))
					client.finishSend()
				}
			},
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
