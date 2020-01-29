import * as api from '@berty-tech/api'

export interface IProtocolServiceHandler {
	InstanceExportData: (
		request: api.berty.protocol.InstanceExportData.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.InstanceExportData.IReply | null,
		) => void,
	) => void
	InstanceGetConfiguration: (
		request: api.berty.protocol.InstanceGetConfiguration.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.InstanceGetConfiguration.IReply | null,
		) => void,
	) => void
	ContactRequestReference: (
		request: api.berty.protocol.ContactRequestReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestReference.IReply | null,
		) => void,
	) => void
	ContactRequestDisable: (
		request: api.berty.protocol.ContactRequestDisable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestDisable.IReply | null,
		) => void,
	) => void
	ContactRequestEnable: (
		request: api.berty.protocol.ContactRequestEnable.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestEnable.IReply | null,
		) => void,
	) => void
	ContactRequestResetReference: (
		request: api.berty.protocol.ContactRequestResetReference.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestResetReference.IReply | null,
		) => void,
	) => void
	ContactRequestSend: (
		request: api.berty.protocol.ContactRequestSend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestSend.IReply | null,
		) => void,
	) => void
	ContactRequestAccept: (
		request: api.berty.protocol.ContactRequestAccept.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestAccept.IReply | null,
		) => void,
	) => void
	ContactRequestDiscard: (
		request: api.berty.protocol.ContactRequestDiscard.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactRequestDiscard.IReply | null,
		) => void,
	) => void
	ContactBlock: (
		request: api.berty.protocol.ContactBlock.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactBlock.IReply | null,
		) => void,
	) => void
	ContactUnblock: (
		request: api.berty.protocol.ContactUnblock.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactUnblock.IReply | null,
		) => void,
	) => void
	ContactAliasKeySend: (
		request: api.berty.protocol.ContactAliasKeySend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.ContactAliasKeySend.IReply | null,
		) => void,
	) => void
	MultiMemberGroupCreate: (
		request: api.berty.protocol.MultiMemberGroupCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupCreate.IReply | null,
		) => void,
	) => void
	MultiMemberGroupJoin: (
		request: api.berty.protocol.MultiMemberGroupJoin.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupJoin.IReply | null,
		) => void,
	) => void
	MultiMemberGroupLeave: (
		request: api.berty.protocol.MultiMemberGroupLeave.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupLeave.IReply | null,
		) => void,
	) => void
	MultiMemberGroupAliasResolverDisclose: (
		request: api.berty.protocol.MultiMemberGroupAliasResolverDisclose.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupAliasResolverDisclose.IReply | null,
		) => void,
	) => void
	MultiMemberGroupAdminRoleGrant: (
		request: api.berty.protocol.MultiMemberGroupAdminRoleGrant.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupAdminRoleGrant.IReply | null,
		) => void,
	) => void
	MultiMemberGroupInvitationCreate: (
		request: api.berty.protocol.MultiMemberGroupInvitationCreate.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.MultiMemberGroupInvitationCreate.IReply | null,
		) => void,
	) => void
	AppMetadataSend: (
		request: api.berty.protocol.AppMetadataSend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.AppMetadataSend.IReply | null,
		) => void,
	) => void
	AppMessageSend: (
		request: api.berty.protocol.AppMessageSend.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.AppMessageSend.IReply | null,
		) => void,
	) => void
	GroupMetadataSubscribe: (
		request: api.berty.protocol.GroupMetadataSubscribe.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.IGroupMetadataEvent | null,
		) => void,
	) => void
	GroupMessageSubscribe: (
		request: api.berty.protocol.GroupMessageSubscribe.IRequest,
		callback: (
			error: Error | null,
			response?: api.berty.protocol.IGroupMessageEvent | null,
		) => void,
	) => void
}
