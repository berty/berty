import * as api from '@berty-tech/api'
import { MockServiceHandler } from '../mock'
import { DemoServiceClient } from '../orbitdb'
import { bridge } from '../bridge'
import { WebsocketTransport } from '../grpc-web-websocket-transport'

export class ProtocolServiceHandler extends MockServiceHandler {
	orbitdbClient = new DemoServiceClient(
		bridge({
			host: 'localhost:1337',
			transport: WebsocketTransport(),
		}),
	)
	accountId = this.metadata?.id as string

	InstanceExportData: (
		request: api.berty.protocol.InstanceExportData.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.InstanceExportData.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	InstanceGetConfiguration: (
		request: api.berty.protocol.InstanceGetConfiguration.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.InstanceGetConfiguration.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	GroupCreate: (
		request: api.berty.protocol.GroupCreate.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.GroupCreate.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	GroupJoin: (
		request: api.berty.protocol.GroupJoin.IRequest,
		callback: (error?: Error | null, response?: api.berty.protocol.GroupJoin.IReply | null) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	GroupLeave: (
		request: api.berty.protocol.GroupLeave.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.GroupLeave.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	GroupInvite: (
		request: api.berty.protocol.GroupInvite.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.GroupInvite.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	DevicePair: (
		request: api.berty.protocol.DevicePair.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.DevicePair.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	ContactRequestReference: (
		request: api.berty.protocol.ContactRequestReference.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.ContactRequestReference.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	ContactRequestDisable: (
		request: api.berty.protocol.ContactRequestDisable.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.ContactRequestDisable.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	ContactRequestEnable: (
		request: api.berty.protocol.ContactRequestEnable.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.ContactRequestEnable.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	ContactRequestResetReference: (
		request: api.berty.protocol.ContactRequestResetLink.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.ContactRequestResetLink.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	ContactRequestEnqueue: (
		request: api.berty.protocol.ContactRequestEnqueue.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.ContactRequestEnqueue.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	ContactRequestAccept: (
		request: api.berty.protocol.ContactRequestAccept.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.ContactRequestAccept.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	ContactRemove: (
		request: api.berty.protocol.ContactRemove.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.ContactRemove.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	ContactBlock: (
		request: api.berty.protocol.ContactBlock.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.ContactBlock.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	ContactUnblock: (
		request: api.berty.protocol.ContactUnblock.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.ContactUnblock.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	GroupSettingSetGroup: (
		request: api.berty.protocol.GroupSettingSetGroup.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.GroupSettingSetGroup.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	GroupSettingSetMember: (
		request: api.berty.protocol.GroupSettingSetMember.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.GroupSettingSetMember.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	GroupMessageSend: (
		request: api.berty.protocol.GroupMessageSend.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.GroupMessageSend.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	AccountAppendAppSpecificEvent: (
		request: api.berty.protocol.AccountAppendAppSpecificEvent.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.AccountAppendAppSpecificEvent.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	AccountSubscribe: (
		request: api.berty.protocol.AccountSubscribe.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.AccountSubscribe.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, { event: {} })
		// this.orbitdbClient.logStream({}, (error, response) => {
		// 	if (error == null) {
		// 		console.warn('GRPC Protocol Error: AccountSubscribe: orbitdb logStream error')
		// 	}
		// 	// TODO: deserialize and send event
		// 	callback(null, { event: {} })
		// })
	}

	GroupSettingSubscribe: (
		request: api.berty.protocol.GroupSettingStoreSubscribe.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.GroupSettingStoreSubscribe.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	GroupMessageSubscribe: (
		request: api.berty.protocol.GroupMessageSubscribe.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.GroupMessageSubscribe.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}

	GroupMemberSubscribe: (
		request: api.berty.protocol.GroupMemberSubscribe.IRequest,
		callback: (
			error?: Error | null,
			response?: api.berty.protocol.GroupMemberSubscribe.IReply | null,
		) => void,
	) => void = (request, callback) => {
		callback(null, {})
	}
}
