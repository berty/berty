import { Service } from '..'
import rpcNative from './rpc.native'
import proto from '@berty-tech/api/index.pb'
import {
  ErrorStreamNotImplemented,
  getServiceName,
} from './utils'

const bridgepb =  proto.lookup('berty.bridge.v1.BridgeService')

const unary = bridgeClient => async (method, request, metadata) => {
	const methodDesc = {
		name: `/${getServiceName(method)}/${method.name}`,
	}

	const res = await bridgeClient.clientInvokeUnary({
		methodDesc: methodDesc,
		payload: request,
		metadata: {} // @TODO: pass metdate object
	})

	if (res.error) {
		if (res.error.grpcErrorCode > 0) {
			throw new Error(`grpc error(${res.error.grpcErrorCode}) ${res.error.message}`)
		}

		if (res.error.errorCode > 0) {
			throw new Error(`service error(${res.error.errorCode}) ${res.error.message}`)
		}

		throw new Error(`unknown error: ${res.error.message}`)
	}

	return res.payload
}

const stream = bridgeClient => async (method, request, metadata) => {
	const methodDesc = {
		name: `/${getServiceName(method)}/${method.name}`,

		isClientStream: !!method.requestStream,
		isServerStream: !!method.responseStream,
	}

	throw ErrorStreamNotImplemented
	// const res = await bridgeclient.clientCreateStream({
	// 	methodDesc: methodDesc,
	// 	payload: request,
	// 	metadata: {},
	// })

	// if (res.error) {
	// 	if (res.error.grpcErrorCode > 0) {
	// 		throw new Error(`grpc error(${res.error.grpcErrorCode}) ${res.error.message}`)
	// 	}

	// 	if (res.error.errorCode > 0) {
	// 		throw new Error(`service error(${res.error.errorCode}) ${res.error.message}`)
	// 	}

	// 	throw new Error(`unknown error: ${res.error.message}`)
	// }


	// const streamid = res.streamId
	// const send = async (request) => {

	}

}

const client = bridgeClient => ({
	unaryCall: unary(bridgeClient),
	streamCall: stream(bridgeClient),
})

const bridgeClient =  Service(bridgepb, rpcNative)
export default client(bridgeClient)
