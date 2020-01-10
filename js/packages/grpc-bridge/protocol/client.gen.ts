import * as api from '@berty-tech/api'
import * as pb from 'protobufjs'

export class ProtocolServiceClient {
	_pbService: api.berty.protocol.ProtocolService

	constructor(rpcImpl: pb.RPCImpl) {
		this._pbService = api.berty.protocol.ProtocolService.create(rpcImpl)
	}

	instanceExportData(
		request: api.berty.protocol.InstanceExportData.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.InstanceExportData.IReply,
		) => void,
	) {
		return this._pbService.instanceExportData.bind(this._pbService)(request, callback)
	}
	instanceGetConfiguration(
		request: api.berty.protocol.InstanceGetConfiguration.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.InstanceGetConfiguration.IReply,
		) => void,
	) {
		return this._pbService.instanceGetConfiguration.bind(this._pbService)(request, callback)
	}
	groupCreate(
		request: api.berty.protocol.GroupCreate.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.GroupCreate.IReply) => void,
	) {
		return this._pbService.groupCreate.bind(this._pbService)(request, callback)
	}
	groupJoin(
		request: api.berty.protocol.GroupJoin.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.GroupJoin.IReply) => void,
	) {
		return this._pbService.groupJoin.bind(this._pbService)(request, callback)
	}
	groupLeave(
		request: api.berty.protocol.GroupLeave.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.GroupLeave.IReply) => void,
	) {
		return this._pbService.groupLeave.bind(this._pbService)(request, callback)
	}
	groupInvite(
		request: api.berty.protocol.GroupInvite.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.GroupInvite.IReply) => void,
	) {
		return this._pbService.groupInvite.bind(this._pbService)(request, callback)
	}
	devicePair(
		request: api.berty.protocol.DevicePair.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.DevicePair.IReply) => void,
	) {
		return this._pbService.devicePair.bind(this._pbService)(request, callback)
	}
	contactRequestReference(
		request: api.berty.protocol.ContactRequestReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestReference.IReply,
		) => void,
	) {
		return this._pbService.contactRequestReference.bind(this._pbService)(request, callback)
	}
	contactRequestDisable(
		request: api.berty.protocol.ContactRequestDisable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestDisable.IReply,
		) => void,
	) {
		return this._pbService.contactRequestDisable.bind(this._pbService)(request, callback)
	}
	contactRequestEnable(
		request: api.berty.protocol.ContactRequestEnable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestEnable.IReply,
		) => void,
	) {
		return this._pbService.contactRequestEnable.bind(this._pbService)(request, callback)
	}
	contactRequestResetReference(
		request: api.berty.protocol.ContactRequestResetLink.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestResetLink.IReply,
		) => void,
	) {
		return this._pbService.contactRequestResetReference.bind(this._pbService)(request, callback)
	}
	contactRequestEnqueue(
		request: api.berty.protocol.ContactRequestEnqueue.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestEnqueue.IReply,
		) => void,
	) {
		return this._pbService.contactRequestEnqueue.bind(this._pbService)(request, callback)
	}
	contactRequestAccept(
		request: api.berty.protocol.ContactRequestAccept.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestAccept.IReply,
		) => void,
	) {
		return this._pbService.contactRequestAccept.bind(this._pbService)(request, callback)
	}
	contactRemove(
		request: api.berty.protocol.ContactRemove.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.ContactRemove.IReply) => void,
	) {
		return this._pbService.contactRemove.bind(this._pbService)(request, callback)
	}
	contactBlock(
		request: api.berty.protocol.ContactBlock.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.ContactBlock.IReply) => void,
	) {
		return this._pbService.contactBlock.bind(this._pbService)(request, callback)
	}
	contactUnblock(
		request: api.berty.protocol.ContactUnblock.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.ContactUnblock.IReply) => void,
	) {
		return this._pbService.contactUnblock.bind(this._pbService)(request, callback)
	}
	groupSettingSetGroup(
		request: api.berty.protocol.GroupSettingSetGroup.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.GroupSettingSetGroup.IReply,
		) => void,
	) {
		return this._pbService.groupSettingSetGroup.bind(this._pbService)(request, callback)
	}
	groupSettingSetMember(
		request: api.berty.protocol.GroupSettingSetMember.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.GroupSettingSetMember.IReply,
		) => void,
	) {
		return this._pbService.groupSettingSetMember.bind(this._pbService)(request, callback)
	}
	groupMessageSend(
		request: api.berty.protocol.GroupMessageSend.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.GroupMessageSend.IReply) => void,
	) {
		return this._pbService.groupMessageSend.bind(this._pbService)(request, callback)
	}
	accountAppendAppSpecificEvent(
		request: api.berty.protocol.AccountAppendAppSpecificEvent.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.AccountAppendAppSpecificEvent.IReply,
		) => void,
	) {
		return this._pbService.accountAppendAppSpecificEvent.bind(this._pbService)(request, callback)
	}
	accountSubscribe(
		request: api.berty.protocol.AccountSubscribe.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.AccountSubscribe.IReply) => void,
	) {
		return this._pbService.accountSubscribe.bind(this._pbService)(request, callback)
	}
	groupSettingSubscribe(
		request: api.berty.protocol.GroupSettingStoreSubscribe.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.GroupSettingStoreSubscribe.IReply,
		) => void,
	) {
		return this._pbService.groupSettingSubscribe.bind(this._pbService)(request, callback)
	}
	groupMessageSubscribe(
		request: api.berty.protocol.GroupMessageSubscribe.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.GroupMessageSubscribe.IReply,
		) => void,
	) {
		return this._pbService.groupMessageSubscribe.bind(this._pbService)(request, callback)
	}
	groupMemberSubscribe(
		request: api.berty.protocol.GroupMemberSubscribe.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.GroupMemberSubscribe.IReply,
		) => void,
	) {
		return this._pbService.groupMemberSubscribe.bind(this._pbService)(request, callback)
	}
}
