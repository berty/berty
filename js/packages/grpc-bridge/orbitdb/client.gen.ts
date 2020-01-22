import * as api from '@berty-tech/api'
import * as pb from 'protobufjs'

export class DemoServiceClient {
	_pbService: api.berty.protocol.DemoService

	constructor(rpcImpl: pb.RPCImpl) {
		this._pbService = api.berty.protocol.DemoService.create(rpcImpl)
	}

	logToken(
		request: api.berty.protocol.LogToken.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.LogToken.IReply) => void,
	) {
		return this._pbService.logToken.bind(this._pbService)(request, callback)
	}
	logAdd(
		request: api.berty.protocol.LogAdd.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.LogAdd.IReply) => void,
	) {
		return this._pbService.logAdd.bind(this._pbService)(request, callback)
	}
	logGet(
		request: api.berty.protocol.LogGet.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.LogGet.IReply) => void,
	) {
		return this._pbService.logGet.bind(this._pbService)(request, callback)
	}
	logList(
		request: api.berty.protocol.LogList.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.LogList.IReply) => void,
	) {
		return this._pbService.logList.bind(this._pbService)(request, callback)
	}
	logStream(
		request: api.berty.protocol.LogStream.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.ILogOperation) => void,
	) {
		return this._pbService.logStream.bind(this._pbService)(request, callback)
	}
}
