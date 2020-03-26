import * as api from '@berty-tech/api'
import * as pb from 'protobufjs'

export class ProtocolServiceClient {
	_pbService: api.berty.protocol.ProtocolService
	end: () => void

	constructor(rpcImpl: pb.RPCImpl) {
		this._pbService = api.berty.protocol.ProtocolService.create(rpcImpl)
		this.end = this._pbService.end.bind(this._pbService)
	}

	instanceExportData: (
		request: api.berty.types.InstanceExportData.IRequest,
		callback: (error: Error | null, response?: api.berty.types.InstanceExportData.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.instanceExportData.bind(this._pbService)(request, callback)
	}
	instanceGetConfiguration: (
		request: api.berty.types.InstanceGetConfiguration.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.InstanceGetConfiguration.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.instanceGetConfiguration.bind(this._pbService)(request, callback)
	}
	contactRequestReference: (
		request: api.berty.types.ContactRequestReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.ContactRequestReference.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestReference.bind(this._pbService)(request, callback)
	}
	contactRequestDisable: (
		request: api.berty.types.ContactRequestDisable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.ContactRequestDisable.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestDisable.bind(this._pbService)(request, callback)
	}
	contactRequestEnable: (
		request: api.berty.types.ContactRequestEnable.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactRequestEnable.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestEnable.bind(this._pbService)(request, callback)
	}
	contactRequestResetReference: (
		request: api.berty.types.ContactRequestResetReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.ContactRequestResetReference.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestResetReference.bind(this._pbService)(request, callback)
	}
	contactRequestSend: (
		request: api.berty.types.ContactRequestSend.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactRequestSend.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestSend.bind(this._pbService)(request, callback)
	}
	contactRequestAccept: (
		request: api.berty.types.ContactRequestAccept.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactRequestAccept.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestAccept.bind(this._pbService)(request, callback)
	}
	contactRequestDiscard: (
		request: api.berty.types.ContactRequestDiscard.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.ContactRequestDiscard.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestDiscard.bind(this._pbService)(request, callback)
	}
	contactBlock: (
		request: api.berty.types.ContactBlock.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactBlock.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.contactBlock.bind(this._pbService)(request, callback)
	}
	contactUnblock: (
		request: api.berty.types.ContactUnblock.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactUnblock.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.contactUnblock.bind(this._pbService)(request, callback)
	}
	contactAliasKeySend: (
		request: api.berty.types.ContactAliasKeySend.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactAliasKeySend.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.contactAliasKeySend.bind(this._pbService)(request, callback)
	}
	multiMemberGroupCreate: (
		request: api.berty.types.MultiMemberGroupCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupCreate.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.multiMemberGroupCreate.bind(this._pbService)(request, callback)
	}
	multiMemberGroupJoin: (
		request: api.berty.types.MultiMemberGroupJoin.IRequest,
		callback: (error: Error | null, response?: api.berty.types.MultiMemberGroupJoin.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.multiMemberGroupJoin.bind(this._pbService)(request, callback)
	}
	multiMemberGroupLeave: (
		request: api.berty.types.MultiMemberGroupLeave.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupLeave.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.multiMemberGroupLeave.bind(this._pbService)(request, callback)
	}
	multiMemberGroupAliasResolverDisclose: (
		request: api.berty.types.MultiMemberGroupAliasResolverDisclose.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupAliasResolverDisclose.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.multiMemberGroupAliasResolverDisclose.bind(this._pbService)(
			request,
			callback,
		)
	}
	multiMemberGroupAdminRoleGrant: (
		request: api.berty.types.MultiMemberGroupAdminRoleGrant.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupAdminRoleGrant.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.multiMemberGroupAdminRoleGrant.bind(this._pbService)(request, callback)
	}
	multiMemberGroupInvitationCreate: (
		request: api.berty.types.MultiMemberGroupInvitationCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupInvitationCreate.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.multiMemberGroupInvitationCreate.bind(this._pbService)(request, callback)
	}
	appMetadataSend: (
		request: api.berty.types.AppMetadataSend.IRequest,
		callback: (error: Error | null, response?: api.berty.types.AppMetadataSend.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.appMetadataSend.bind(this._pbService)(request, callback)
	}
	appMessageSend: (
		request: api.berty.types.AppMessageSend.IRequest,
		callback: (error: Error | null, response?: api.berty.types.AppMessageSend.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.appMessageSend.bind(this._pbService)(request, callback)
	}
	groupMetadataSubscribe: (
		request: api.berty.types.GroupMetadataSubscribe.IRequest,
		callback: (error: Error | null, response?: api.berty.types.IGroupMetadataEvent) => void,
	) => void = (request, callback) => {
		return this._pbService.groupMetadataSubscribe.bind(this._pbService)(request, callback)
	}
	groupMessageSubscribe: (
		request: api.berty.types.GroupMessageSubscribe.IRequest,
		callback: (error: Error | null, response?: api.berty.types.IGroupMessageEvent) => void,
	) => void = (request, callback) => {
		return this._pbService.groupMessageSubscribe.bind(this._pbService)(request, callback)
	}
	groupMetadataList: (
		request: api.berty.types.GroupMetadataList.IRequest,
		callback: (error: Error | null, response?: api.berty.types.IGroupMetadataEvent) => void,
	) => void = (request, callback) => {
		return this._pbService.groupMetadataList.bind(this._pbService)(request, callback)
	}
	groupMessageList: (
		request: api.berty.types.GroupMessageList.IRequest,
		callback: (error: Error | null, response?: api.berty.types.IGroupMessageEvent) => void,
	) => void = (request, callback) => {
		return this._pbService.groupMessageList.bind(this._pbService)(request, callback)
	}
	groupInfo: (
		request: api.berty.types.GroupInfo.IRequest,
		callback: (error: Error | null, response?: api.berty.types.GroupInfo.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.groupInfo.bind(this._pbService)(request, callback)
	}
	activateGroup: (
		request: api.berty.types.ActivateGroup.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ActivateGroup.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.activateGroup.bind(this._pbService)(request, callback)
	}
	deactivateGroup: (
		request: api.berty.types.DeactivateGroup.IRequest,
		callback: (error: Error | null, response?: api.berty.types.DeactivateGroup.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.deactivateGroup.bind(this._pbService)(request, callback)
	}
}
