import * as pb from 'protobufjs'
import { IProtocolServiceHandler } from './protocol/handler.gen'

export type MockBridge = (
	protocolServiceHandlerFactory: (persist?: boolean) => Promise<IProtocolServiceHandler>,
	persist?: boolean,
) => Promise<pb.RPCImpl>

export const mockBridge: MockBridge = async (protocolServiceHandlerFactory, persist) => {
	const service = ((await protocolServiceHandlerFactory(persist)) as unknown) as {
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
					// WARN: reponseData should never be undefined, if so the service will be ended
					// (see https://github.com/protobufjs/protobuf.js/blob/e8449c4bf1269a2cc423708db6f0b47a383d33f0/src/rpc/service.js#L104)
					responseData ? method?.resolvedResponseType?.encode(responseData).finish() : undefined,
				)
			},
		)
	}
}
