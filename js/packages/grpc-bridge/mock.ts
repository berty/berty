import { grpc } from '@improbable-eng/grpc-web'
import * as pb from 'protobufjs'

export abstract class MockServiceHandler {
	metadata?: { [key: string]: string | Array<string> }

	constructor(metadata?: { [key: string]: string | Array<string> }) {
		this.metadata = metadata
	}
}

export interface MockServiceHandlerCtor {
	new (metadata?: { [key: string]: string | Array<string> }): MockServiceHandler
}

export type MockBridge = (
	ServiceCtor: MockServiceHandlerCtor,
	metadata?: { [key: string]: string | Array<string> },
) => pb.RPCImpl

export const mockBridge: MockBridge = (ServiceCtor, metadata) => {
	const service = new ServiceCtor(metadata) as {
		[key: string]: (request: {}, callback: (error: Error, response: {}) => void) => void
	}
	return (method, requestData, callback) => {
		if (!(method instanceof pb.Method)) {
			console.error("GRPC MockBridge: bridge doesn't support protobuf.rpc.ServiceMethod")
			return
		}

		if (typeof service[method.name] !== 'function') {
			console.error(`
				GRPC MockBridge: ${service.constructor.name}: method ${method.name} does not exists
			`)
		}
		console.log(method.name, ServiceCtor.prototype)
		service[method.name].call(
			service,
			method?.resolvedRequestType?.decode(requestData) || {},
			(error?: Error | null, responseData?: {} | null) => {
				if (error != null) {
					console.warn(
						`GRPC MockBridge: ${service.constructor.name}: method ${method.name} ${error.message}`,
						error.stack,
					)
				}
				callback(
					error || null,
					responseData ? method?.resolvedResponseType?.encode(responseData).finish() : null,
				)
			},
		)
	}
}
