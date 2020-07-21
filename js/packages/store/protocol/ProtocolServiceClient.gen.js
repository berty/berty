import * as api from '@berty-tech/api'
import * as pb from 'protobufjs'

export default class ProtocolServiceClient {
	_pbService
	end

	constructor(rpcImpl) {
		this._pbService = api.berty.protocol.v1.ProtocolService.create(rpcImpl)
		this.end = this._pbService.end.bind(this._pbService)
	}

	instanceExportData = (request, callback) => {
		return this._pbService.instanceExportData.bind(this._pbService)(request, callback)
	}
	instanceGetConfiguration = (request, callback) => {
		return this._pbService.instanceGetConfiguration.bind(this._pbService)(request, callback)
	}
	contactRequestReference = (request, callback) => {
		return this._pbService.contactRequestReference.bind(this._pbService)(request, callback)
	}
	contactRequestDisable = (request, callback) => {
		return this._pbService.contactRequestDisable.bind(this._pbService)(request, callback)
	}
	contactRequestEnable = (request, callback) => {
		return this._pbService.contactRequestEnable.bind(this._pbService)(request, callback)
	}
	contactRequestResetReference = (request, callback) => {
		return this._pbService.contactRequestResetReference.bind(this._pbService)(request, callback)
	}
	contactRequestSend = (request, callback) => {
		return this._pbService.contactRequestSend.bind(this._pbService)(request, callback)
	}
	contactRequestAccept = (request, callback) => {
		return this._pbService.contactRequestAccept.bind(this._pbService)(request, callback)
	}
	contactRequestDiscard = (request, callback) => {
		return this._pbService.contactRequestDiscard.bind(this._pbService)(request, callback)
	}
	contactBlock = (request, callback) => {
		return this._pbService.contactBlock.bind(this._pbService)(request, callback)
	}
	contactUnblock = (request, callback) => {
		return this._pbService.contactUnblock.bind(this._pbService)(request, callback)
	}
	contactAliasKeySend = (request, callback) => {
		return this._pbService.contactAliasKeySend.bind(this._pbService)(request, callback)
	}
	multiMemberGroupCreate = (request, callback) => {
		return this._pbService.multiMemberGroupCreate.bind(this._pbService)(request, callback)
	}
	multiMemberGroupJoin = (request, callback) => {
		return this._pbService.multiMemberGroupJoin.bind(this._pbService)(request, callback)
	}
	multiMemberGroupLeave = (request, callback) => {
		return this._pbService.multiMemberGroupLeave.bind(this._pbService)(request, callback)
	}
	multiMemberGroupAliasResolverDisclose = (request, callback) => {
		return this._pbService.multiMemberGroupAliasResolverDisclose.bind(this._pbService)(
			request,
			callback,
		)
	}
	multiMemberGroupAdminRoleGrant = (request, callback) => {
		return this._pbService.multiMemberGroupAdminRoleGrant.bind(this._pbService)(request, callback)
	}
	multiMemberGroupInvitationCreate = (request, callback) => {
		return this._pbService.multiMemberGroupInvitationCreate.bind(this._pbService)(request, callback)
	}
	appMetadataSend = (request, callback) => {
		return this._pbService.appMetadataSend.bind(this._pbService)(request, callback)
	}
	appMessageSend = (request, callback) => {
		return this._pbService.appMessageSend.bind(this._pbService)(request, callback)
	}
	groupMetadataSubscribe = (request, callback) => {
		return this._pbService.groupMetadataSubscribe.bind(this._pbService)(request, callback)
	}
	groupMessageSubscribe = (request, callback) => {
		return this._pbService.groupMessageSubscribe.bind(this._pbService)(request, callback)
	}
	groupMetadataList = (request, callback) => {
		return this._pbService.groupMetadataList.bind(this._pbService)(request, callback)
	}
	groupMessageList = (request, callback) => {
		return this._pbService.groupMessageList.bind(this._pbService)(request, callback)
	}
	groupInfo = (request, callback) => {
		return this._pbService.groupInfo.bind(this._pbService)(request, callback)
	}
	activateGroup = (request, callback) => {
		return this._pbService.activateGroup.bind(this._pbService)(request, callback)
	}
	deactivateGroup = (request, callback) => {
		return this._pbService.deactivateGroup.bind(this._pbService)(request, callback)
	}
	debugListGroups = (request, callback) => {
		return this._pbService.debugListGroups.bind(this._pbService)(request, callback)
	}
	debugInspectGroupStore = (request, callback) => {
		return this._pbService.debugInspectGroupStore.bind(this._pbService)(request, callback)
	}
	debugGroup = (request, callback) => {
		return this._pbService.debugGroup.bind(this._pbService)(request, callback)
	}
}
