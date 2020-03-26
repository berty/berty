import * as api from '@berty-tech/api'

export interface IProtocolServiceHandler {
	InstanceExportData: (
		request: api.berty.types.InstanceExportData.IRequest,
		callback: (error: Error | null, response?: api.berty.types.InstanceExportData.IReply) => void,
	) => void
	InstanceGetConfiguration: (
		request: api.berty.types.InstanceGetConfiguration.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.InstanceGetConfiguration.IReply,
		) => void,
	) => void
	ContactRequestReference: (
		request: api.berty.types.ContactRequestReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.ContactRequestReference.IReply,
		) => void,
	) => void
	ContactRequestDisable: (
		request: api.berty.types.ContactRequestDisable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.ContactRequestDisable.IReply,
		) => void,
	) => void
	ContactRequestEnable: (
		request: api.berty.types.ContactRequestEnable.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactRequestEnable.IReply) => void,
	) => void
	ContactRequestResetReference: (
		request: api.berty.types.ContactRequestResetReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.ContactRequestResetReference.IReply,
		) => void,
	) => void
	ContactRequestSend: (
		request: api.berty.types.ContactRequestSend.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactRequestSend.IReply) => void,
	) => void
	ContactRequestAccept: (
		request: api.berty.types.ContactRequestAccept.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactRequestAccept.IReply) => void,
	) => void
	ContactRequestDiscard: (
		request: api.berty.types.ContactRequestDiscard.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.ContactRequestDiscard.IReply,
		) => void,
	) => void
	ContactBlock: (
		request: api.berty.types.ContactBlock.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactBlock.IReply) => void,
	) => void
	ContactUnblock: (
		request: api.berty.types.ContactUnblock.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactUnblock.IReply) => void,
	) => void
	ContactAliasKeySend: (
		request: api.berty.types.ContactAliasKeySend.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ContactAliasKeySend.IReply) => void,
	) => void
	MultiMemberGroupCreate: (
		request: api.berty.types.MultiMemberGroupCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupCreate.IReply,
		) => void,
	) => void
	MultiMemberGroupJoin: (
		request: api.berty.types.MultiMemberGroupJoin.IRequest,
		callback: (error: Error | null, response?: api.berty.types.MultiMemberGroupJoin.IReply) => void,
	) => void
	MultiMemberGroupLeave: (
		request: api.berty.types.MultiMemberGroupLeave.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupLeave.IReply,
		) => void,
	) => void
	MultiMemberGroupAliasResolverDisclose: (
		request: api.berty.types.MultiMemberGroupAliasResolverDisclose.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupAliasResolverDisclose.IReply,
		) => void,
	) => void
	MultiMemberGroupAdminRoleGrant: (
		request: api.berty.types.MultiMemberGroupAdminRoleGrant.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupAdminRoleGrant.IReply,
		) => void,
	) => void
	MultiMemberGroupInvitationCreate: (
		request: api.berty.types.MultiMemberGroupInvitationCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.types.MultiMemberGroupInvitationCreate.IReply,
		) => void,
	) => void
	AppMetadataSend: (
		request: api.berty.types.AppMetadataSend.IRequest,
		callback: (error: Error | null, response?: api.berty.types.AppMetadataSend.IReply) => void,
	) => void
	AppMessageSend: (
		request: api.berty.types.AppMessageSend.IRequest,
		callback: (error: Error | null, response?: api.berty.types.AppMessageSend.IReply) => void,
	) => void
	GroupMetadataSubscribe: (
		request: api.berty.types.GroupMetadataSubscribe.IRequest,
		callback: (error: Error | null, response?: api.berty.types.IGroupMetadataEvent) => void,
	) => void
	GroupMessageSubscribe: (
		request: api.berty.types.GroupMessageSubscribe.IRequest,
		callback: (error: Error | null, response?: api.berty.types.IGroupMessageEvent) => void,
	) => void
	GroupMetadataList: (
		request: api.berty.types.GroupMetadataList.IRequest,
		callback: (error: Error | null, response?: api.berty.types.IGroupMetadataEvent) => void,
	) => void
	GroupMessageList: (
		request: api.berty.types.GroupMessageList.IRequest,
		callback: (error: Error | null, response?: api.berty.types.IGroupMessageEvent) => void,
	) => void
	GroupInfo: (
		request: api.berty.types.GroupInfo.IRequest,
		callback: (error: Error | null, response?: api.berty.types.GroupInfo.IReply) => void,
	) => void
	ActivateGroup: (
		request: api.berty.types.ActivateGroup.IRequest,
		callback: (error: Error | null, response?: api.berty.types.ActivateGroup.IReply) => void,
	) => void
	DeactivateGroup: (
		request: api.berty.types.DeactivateGroup.IRequest,
		callback: (error: Error | null, response?: api.berty.types.DeactivateGroup.IReply) => void,
	) => void
}
