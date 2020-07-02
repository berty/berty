import * as api from '@berty-tech/api'
import * as pb from 'protobufjs'

export default class ProtocolServiceClient {
	_pbService: api.berty.protocol.v1.ProtocolService
	end: () => void

	constructor(rpcImpl: pb.RPCImpl) {
		this._pbService = api.berty.protocol.v1.ProtocolService.create(rpcImpl)
		this.end = this._pbService.end.bind(this._pbService)
	}

	instanceExportData: (
		request: api.berty.types.v1.InstanceExportData.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.InstanceExportData.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.instanceExportData.bind(this._pbService)(request, callback)
	}
	instanceGetConfiguration: (
		request: api.berty.types.v1.InstanceGetConfiguration.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.InstanceGetConfiguration.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.instanceGetConfiguration.bind(this._pbService)(request, callback)
	}
	contactRequestReference: (
		request: api.berty.types.v1.ContactRequestReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.ContactRequestReference.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestReference.bind(this._pbService)(request, callback)
	}
	contactRequestDisable: (
		request: api.berty.types.v1.ContactRequestDisable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.ContactRequestDisable.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestDisable.bind(this._pbService)(request, callback)
	}
	contactRequestEnable: (
		request: api.berty.types.v1.ContactRequestEnable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.ContactRequestEnable.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestEnable.bind(this._pbService)(request, callback)
	}
	contactRequestResetReference: (
		request: api.berty.types.v1.ContactRequestResetReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.ContactRequestResetReference.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestResetReference.bind(this._pbService)(request, callback)
	}
	contactRequestSend: (
		request: api.berty.types.v1.ContactRequestSend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.ContactRequestSend.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestSend.bind(this._pbService)(request, callback)
	}
	contactRequestAccept: (
		request: api.berty.types.v1.ContactRequestAccept.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.ContactRequestAccept.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestAccept.bind(this._pbService)(request, callback)
	}
	contactRequestDiscard: (
		request: api.berty.types.v1.ContactRequestDiscard.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.ContactRequestDiscard.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestDiscard.bind(this._pbService)(request, callback)
	}
	contactBlock: (
		request: api.berty.types.v1.ContactBlock.IRequest,
		callback: (error: Error | null, response?: api.berty.types.v1.ContactBlock.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.contactBlock.bind(this._pbService)(request, callback)
	}
	contactUnblock: (
		request: api.berty.types.v1.ContactUnblock.IRequest,
		callback: (error: Error | null, response?: api.berty.types.v1.ContactUnblock.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.contactUnblock.bind(this._pbService)(request, callback)
	}
	contactAliasKeySend: (
		request: api.berty.types.v1.ContactAliasKeySend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.ContactAliasKeySend.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactAliasKeySend.bind(this._pbService)(request, callback)
	}
	multiMemberGroupCreate: (
		request: api.berty.types.v1.MultiMemberGroupCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.MultiMemberGroupCreate.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.multiMemberGroupCreate.bind(this._pbService)(request, callback)
	}
	multiMemberGroupJoin: (
		request: api.berty.types.v1.MultiMemberGroupJoin.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.MultiMemberGroupJoin.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.multiMemberGroupJoin.bind(this._pbService)(request, callback)
	}
	multiMemberGroupLeave: (
		request: api.berty.types.v1.MultiMemberGroupLeave.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.MultiMemberGroupLeave.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.multiMemberGroupLeave.bind(this._pbService)(request, callback)
	}
	multiMemberGroupAliasResolverDisclose: (
		request: api.berty.types.v1.MultiMemberGroupAliasResolverDisclose.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.MultiMemberGroupAliasResolverDisclose.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.multiMemberGroupAliasResolverDisclose.bind(this._pbService)(
			request,
			callback,
		)
	}
	multiMemberGroupAdminRoleGrant: (
		request: api.berty.types.v1.MultiMemberGroupAdminRoleGrant.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.MultiMemberGroupAdminRoleGrant.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.multiMemberGroupAdminRoleGrant.bind(this._pbService)(request, callback)
	}
	multiMemberGroupInvitationCreate: (
		request: api.berty.types.v1.MultiMemberGroupInvitationCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.MultiMemberGroupInvitationCreate.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.multiMemberGroupInvitationCreate.bind(this._pbService)(request, callback)
	}
	appMetadataSend: (
		request: api.berty.types.v1.AppMetadataSend.IRequest,
		callback: (error: Error | null, response?: api.berty.types.v1.AppMetadataSend.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.appMetadataSend.bind(this._pbService)(request, callback)
	}
	appMessageSend: (
		request: api.berty.types.v1.AppMessageSend.IRequest,
		callback: (error: Error | null, response?: api.berty.types.v1.AppMessageSend.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.appMessageSend.bind(this._pbService)(request, callback)
	}
	groupMetadataSubscribe: (
		request: api.berty.types.v1.GroupMetadataSubscribe.IRequest,
		callback: (error: Error | null, response?: api.berty.types.v1.IGroupMetadataEvent) => void,
	) => void = (request, callback) => {
		return this._pbService.groupMetadataSubscribe.bind(this._pbService)(request, callback)
	}
	groupMessageSubscribe: (
		request: api.berty.types.v1.GroupMessageSubscribe.IRequest,
		callback: (error: Error | null, response?: api.berty.types.v1.IGroupMessageEvent) => void,
	) => void = (request, callback) => {
		return this._pbService.groupMessageSubscribe.bind(this._pbService)(request, callback)
	}
	groupMetadataList: (
		request: api.berty.types.v1.GroupMetadataList.IRequest,
		callback: (error: Error | null, response?: api.berty.types.v1.IGroupMetadataEvent) => void,
	) => void = (request, callback) => {
		return this._pbService.groupMetadataList.bind(this._pbService)(request, callback)
	}
	groupMessageList: (
		request: api.berty.types.v1.GroupMessageList.IRequest,
		callback: (error: Error | null, response?: api.berty.types.v1.IGroupMessageEvent) => void,
	) => void = (request, callback) => {
		return this._pbService.groupMessageList.bind(this._pbService)(request, callback)
	}
	groupInfo: (
		request: api.berty.types.v1.GroupInfo.IRequest,
		callback: (error: Error | null, response?: api.berty.types.v1.GroupInfo.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.groupInfo.bind(this._pbService)(request, callback)
	}
	activateGroup: (
		request: api.berty.types.v1.ActivateGroup.IRequest,
		callback: (error: Error | null, response?: api.berty.types.v1.ActivateGroup.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.activateGroup.bind(this._pbService)(request, callback)
	}
	deactivateGroup: (
		request: api.berty.types.v1.DeactivateGroup.IRequest,
		callback: (error: Error | null, response?: api.berty.types.v1.DeactivateGroup.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.deactivateGroup.bind(this._pbService)(request, callback)
	}
	debugListGroups: (
		request: api.berty.types.v1.DebugListGroups.IRequest,
		callback: (error: Error | null, response?: api.berty.types.v1.DebugListGroups.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.debugListGroups.bind(this._pbService)(request, callback)
	}
	debugInspectGroupStore: (
		request: api.berty.types.v1.DebugInspectGroupStore.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.v1.DebugInspectGroupStore.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.debugInspectGroupStore.bind(this._pbService)(request, callback)
	}
	debugGroup: (
		request: api.berty.types.v1.DebugGroup.IRequest,
		callback: (error: Error | null, response?: api.berty.types.v1.DebugGroup.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.debugGroup.bind(this._pbService)(request, callback)
	}
}
