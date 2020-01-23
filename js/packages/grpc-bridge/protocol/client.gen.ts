import * as api from '@berty-tech/api'
import * as pb from 'protobufjs'

export class ProtocolServiceClient {
	_pbService: api.berty.protocol.ProtocolService

	constructor(rpcImpl: pb.RPCImpl) {
		this._pbService = api.berty.protocol.ProtocolService.create(rpcImpl)
	}

	instanceExportData: (
		request: api.berty.protocol.InstanceExportData.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.InstanceExportData.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.instanceExportData.bind(this._pbService)(request, callback)
	}
	instanceGetConfiguration: (
		request: api.berty.protocol.InstanceGetConfiguration.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.InstanceGetConfiguration.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.instanceGetConfiguration.bind(this._pbService)(request, callback)
	}
	contactRequestReference(
		request: api.berty.protocol.ContactRequestReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestReference.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestReference.bind(this._pbService)(request, callback)
	}
	contactRequestDisable: (
		request: api.berty.protocol.ContactRequestDisable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestDisable.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestDisable.bind(this._pbService)(request, callback)
	}
	contactRequestEnable: (
		request: api.berty.protocol.ContactRequestEnable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestEnable.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestEnable.bind(this._pbService)(request, callback)
	}
	contactRequestResetReference: (
		request: api.berty.protocol.ContactRequestResetReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestResetReference.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestResetReference.bind(this._pbService)(request, callback)
	}
	contactRequestSend: (
		request: api.berty.protocol.ContactRequestSend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestSend.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestSend.bind(this._pbService)(request, callback)
	}
	contactRequestAccept: (
		request: api.berty.protocol.ContactRequestAccept.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestAccept.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactRequestAccept.bind(this._pbService)(request, callback)
	}
	contactRequestDiscard(
		request: api.berty.protocol.ContactRequestDiscard.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestDiscard.IReply,
		) => void,
	) {
		return this._pbService.contactRequestDiscard.bind(this._pbService)(request, callback)
	}
	contactBlock: (
		request: api.berty.protocol.ContactBlock.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.ContactBlock.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.contactBlock.bind(this._pbService)(request, callback)
	}
	contactUnblock: (
		request: api.berty.protocol.ContactUnblock.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.ContactUnblock.IReply) => void,
	) => void = (request, callback) => {
		return this._pbService.contactUnblock.bind(this._pbService)(request, callback)
	}
	contactAliasKeySend: (
		request: api.berty.protocol.ContactAliasKeySend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactAliasKeySend.IReply,
		) => void,
	) => void = (request, callback) => {
		return this._pbService.contactAliasKeySend.bind(this._pbService)(request, callback)
	}
	multiMemberGroupCreate(
		request: api.berty.protocol.MultiMemberGroupCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupCreate.IReply,
		) => void,
	) {
		return this._pbService.multiMemberGroupCreate.bind(this._pbService)(request, callback)
	}
	multiMemberGroupJoin(
		request: api.berty.protocol.MultiMemberGroupJoin.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupJoin.IReply,
		) => void,
	) {
		return this._pbService.multiMemberGroupJoin.bind(this._pbService)(request, callback)
	}
	multiMemberGroupLeave(
		request: api.berty.protocol.MultiMemberGroupLeave.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupLeave.IReply,
		) => void,
	) {
		return this._pbService.multiMemberGroupLeave.bind(this._pbService)(request, callback)
	}
	multiMemberGroupAliasResolverDisclose(
		request: api.berty.protocol.MultiMemberGroupAliasResolverDisclose.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupAliasResolverDisclose.IReply,
		) => void,
	) {
		return this._pbService.multiMemberGroupAliasResolverDisclose.bind(this._pbService)(
			request,
			callback,
		)
	}
	multiMemberGroupAdminRoleGrant(
		request: api.berty.protocol.MultiMemberGroupAdminRoleGrant.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupAdminRoleGrant.IReply,
		) => void,
	) {
		return this._pbService.multiMemberGroupAdminRoleGrant.bind(this._pbService)(request, callback)
	}
	multiMemberGroupInvitationCreate(
		request: api.berty.protocol.MultiMemberGroupInvitationCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupInvitationCreate.IReply,
		) => void,
	) {
		return this._pbService.multiMemberGroupInvitationCreate.bind(this._pbService)(request, callback)
	}
	appMetadataSend(
		request: api.berty.protocol.AppMetadataSend.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.AppMetadataSend.IReply) => void,
	) {
		return this._pbService.appMetadataSend.bind(this._pbService)(request, callback)
	}
	appMessageSend(
		request: api.berty.protocol.AppMessageSend.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.AppMessageSend.IReply) => void,
	) {
		return this._pbService.appMessageSend.bind(this._pbService)(request, callback)
	}
	groupMetadataSubscribe: (
		request: api.berty.protocol.GroupMetadataSubscribe.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.IGroupMetadataEvent) => void,
	) => void = (request, callback) => {
		return this._pbService.groupMetadataSubscribe.bind(this._pbService)(request, callback)
	}
	groupMessageSubscribe(
		request: api.berty.protocol.GroupMessageSubscribe.IRequest,
		callback: (error: Error | null, response?: api.berty.protocol.IGroupMessageEvent) => void,
	) {
		return this._pbService.groupMessageSubscribe.bind(this._pbService)(request, callback)
	}
}
