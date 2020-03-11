import { grpc } from '@improbable-eng/grpc-web'
import * as pb from 'protobufjs'

const convertionOptions: pb.IConversionOptions = {
	longs: Number,
	bytes: String,
}

const createMessage = (mtype: pb.Type): grpc.ProtobufMessageClass<grpc.ProtobufMessage> => {
	class Message extends pb.Message implements grpc.ProtobufMessage {
		static $type = mtype
		$type = mtype

		serializeBinary(): Uint8Array {
			return this.$type.encode(this).finish()
		}

		static deserializeBinary(bytes: Uint8Array): Message {
			return new Message(this.$type.toObject(this.$type.decode(bytes), convertionOptions))
		}

		toObject(): {} {
			return this.$type.toObject(this, convertionOptions)
		}
	}
	return Message
}

export type Bridge = (
	options: grpc.ClientRpcOptions,
	metadata?: { [key: string]: string | Array<string> },
) => pb.RPCImpl
export const bridge: Bridge = (options, metadata): pb.RPCImpl => (
	method,
	requestData,
	callback,
): void => {
	// console.log('bridge', requestData)
	// map pbjs method descriptor to grpc method descriptor
	if (!(method instanceof pb.Method)) {
		console.error("bridge doesn't support protobuf.rpc.ServiceMethod")
		return
	}

	const [requestType, responseType] = [
		createMessage(method.resolvedRequestType as pb.Type),
		createMessage(method.resolvedResponseType as pb.Type),
	]

	const _method: grpc.MethodDefinition<grpc.ProtobufMessage, grpc.ProtobufMessage> = {
		methodName: method.name,
		service: {
			serviceName: (method.parent && method.parent.fullName.substr(1)) || '',
		},
		requestStream: method.requestStream || false,
		responseStream: method.responseStream || false,
		requestType,
		responseType,
	}

	// initialize client
	const client = grpc.client(_method, options)
	client.start(new grpc.Metadata(metadata))
	client.onHeaders((headers: grpc.Metadata) => {
		// console.log('onHeaders: ', headers)
	})
	client.onMessage((message: grpc.ProtobufMessage): void => {
		// console.log('onMessage: ', message.toObject())
		callback(null, message.serializeBinary())
	})
	client.onEnd((code: grpc.Code, message: string, trailers: grpc.Metadata): void => {
		if (code !== grpc.Code.OK) {
			const error = new Error(
				`GRPC ${grpc.Code[code]} (${code}): ${message}\nTrailers: ${JSON.stringify(trailers)}`,
			)

			console.error(error.message)
			// response "null" will shutdown the service
			callback(error, null)
			return
		}
	})
	client.send(requestType.deserializeBinary(requestData))
	client.finishSend()
}

export default bridge
