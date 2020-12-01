import beapi from '@berty-tech/api'

export type StreamEventPayloadType<T> = T extends beapi.messenger.StreamEvent.Type.Undefined
	? undefined
	: T extends beapi.messenger.StreamEvent.Type.TypeListEnded
	? beapi.messenger.StreamEvent.IListEnded
	: T extends beapi.messenger.StreamEvent.Type.TypeConversationUpdated
	? beapi.messenger.StreamEvent.IConversationUpdated
	: T extends beapi.messenger.StreamEvent.Type.TypeConversationDeleted
	? beapi.messenger.StreamEvent.IConversationDeleted
	: T extends beapi.messenger.StreamEvent.Type.TypeInteractionUpdated
	? beapi.messenger.StreamEvent.IInteractionUpdated
	: T extends beapi.messenger.StreamEvent.Type.TypeInteractionDeleted
	? beapi.messenger.StreamEvent.IInteractionDeleted
	: T extends beapi.messenger.StreamEvent.Type.TypeContactUpdated
	? beapi.messenger.StreamEvent.IContactUpdated
	: T extends beapi.messenger.StreamEvent.Type.TypeAccountUpdated
	? beapi.messenger.StreamEvent.IAccountUpdated
	: T extends beapi.messenger.StreamEvent.Type.TypeMemberUpdated
	? beapi.messenger.StreamEvent.IMemberUpdated
	: T extends beapi.messenger.StreamEvent.Type.TypeDeviceUpdated
	? beapi.messenger.StreamEvent.IDeviceUpdated
	: T extends beapi.messenger.StreamEvent.Type.TypeNotified
	? beapi.messenger.StreamEvent.INotified
	: T extends beapi.messenger.StreamEvent.Type.TypeMediaUpdated
	? beapi.messenger.StreamEvent.IMediaUpdated
	: never

export type StreamEventNotifiedPayloadType<
	T
> = T extends beapi.messenger.StreamEvent.Notified.Type.Unknown
	? undefined
	: T extends beapi.messenger.StreamEvent.Notified.Type.TypeBasic
	? beapi.messenger.StreamEvent.Notified.IBasic
	: T extends beapi.messenger.StreamEvent.Notified.Type.TypeMessageReceived
	? beapi.messenger.StreamEvent.Notified.IMessageReceived
	: T extends beapi.messenger.StreamEvent.Notified.Type.TypeContactRequestSent
	? beapi.messenger.StreamEvent.Notified.IContactRequestSent
	: T extends beapi.messenger.StreamEvent.Notified.Type.TypeContactRequestReceived
	? beapi.messenger.StreamEvent.Notified.IContactRequestReceived
	: never

export type AppMessagePayloadType<T> = T extends beapi.messenger.AppMessage.Type.Undefined
	? undefined
	: T extends beapi.messenger.AppMessage.Type.TypeUserMessage
	? beapi.messenger.AppMessage.IUserMessage
	: T extends beapi.messenger.AppMessage.Type.TypeUserReaction
	? beapi.messenger.AppMessage.IUserReaction
	: T extends beapi.messenger.AppMessage.Type.TypeGroupInvitation
	? beapi.messenger.AppMessage.IGroupInvitation
	: T extends beapi.messenger.AppMessage.Type.TypeSetGroupInfo
	? beapi.messenger.AppMessage.ISetGroupInfo
	: T extends beapi.messenger.AppMessage.Type.TypeSetUserInfo
	? beapi.messenger.AppMessage.ISetUserInfo
	: T extends beapi.messenger.AppMessage.Type.TypeAcknowledge
	? beapi.messenger.AppMessage.IAcknowledge
	: T extends beapi.messenger.AppMessage.Type.TypeReplyOptions
	? beapi.messenger.AppMessage.IReplyOptions
	: T extends beapi.messenger.AppMessage.Type.TypeMonitorMetadata
	? beapi.messenger.AppMessage.IMonitorMetadata
	: never

export type MonitorGroupPayloadType<
	T
> = T extends beapi.types.MonitorGroup.TypeEventMonitor.TypeEventMonitorUndefined
	? undefined
	: T extends beapi.types.MonitorGroup.TypeEventMonitor.TypeEventMonitorAdvertiseGroup
	? beapi.types.MonitorGroup.IEventMonitorAdvertiseGroup
	: T extends beapi.types.MonitorGroup.TypeEventMonitor.TypeEventMonitorPeerFound
	? beapi.types.MonitorGroup.IEventMonitorPeerFound
	: T extends beapi.types.MonitorGroup.TypeEventMonitor.TypeEventMonitorPeerJoin
	? beapi.types.MonitorGroup.IEventMonitorPeerJoin
	: T extends beapi.types.MonitorGroup.TypeEventMonitor.TypeEventMonitorPeerLeave
	? beapi.types.MonitorGroup.IEventMonitorPeerLeave
	: never

export type InteractionUndefined = {
	type: beapi.messenger.AppMessage.Type.Undefined
	payload: undefined
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionUserMessage = {
	type: beapi.messenger.AppMessage.Type.TypeUserMessage
	payload: beapi.messenger.AppMessage.IUserMessage
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionUserReaction = {
	type: beapi.messenger.AppMessage.Type.TypeUserReaction
	payload: beapi.messenger.AppMessage.IUserReaction
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionGroupInvitation = {
	type: beapi.messenger.AppMessage.Type.TypeGroupInvitation
	payload: beapi.messenger.AppMessage.IGroupInvitation
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionSetGroupInfo = {
	type: beapi.messenger.AppMessage.Type.TypeSetGroupInfo
	payload: beapi.messenger.AppMessage.ISetGroupInfo
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionSetUserInfo = {
	type: beapi.messenger.AppMessage.Type.TypeSetUserInfo
	payload: beapi.messenger.AppMessage.ISetUserInfo
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionAcknowledge = {
	type: beapi.messenger.AppMessage.Type.TypeAcknowledge
	payload: beapi.messenger.AppMessage.IAcknowledge
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionReplyOptions = {
	type: beapi.messenger.AppMessage.Type.TypeReplyOptions
	payload: beapi.messenger.AppMessage.IReplyOptions
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionMonitorMetadata = {
	type: beapi.messenger.AppMessage.Type.TypeMonitorMetadata
	payload: beapi.messenger.AppMessage.IMonitorMetadata
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>

export type ParsedInteraction =
	| InteractionUndefined
	| InteractionUserMessage
	| InteractionUserReaction
	| InteractionGroupInvitation
	| InteractionSetGroupInfo
	| InteractionSetUserInfo
	| InteractionAcknowledge
	| InteractionReplyOptions
	| InteractionMonitorMetadata
export type MessengerMethodsHooks = {
	useInstanceShareableBertyID: () => {
		error: any
		call: (req?: beapi.messenger.InstanceShareableBertyID.IRequest) => void
		reply: beapi.messenger.InstanceShareableBertyID.IReply | null
		done: boolean
		called: boolean
	}
	useShareableBertyGroup: () => {
		error: any
		call: (req?: beapi.messenger.ShareableBertyGroup.IRequest) => void
		reply: beapi.messenger.ShareableBertyGroup.IReply | null
		done: boolean
		called: boolean
	}
	useDevShareInstanceBertyID: () => {
		error: any
		call: (req?: beapi.messenger.DevShareInstanceBertyID.IRequest) => void
		reply: beapi.messenger.DevShareInstanceBertyID.IReply | null
		done: boolean
		called: boolean
	}
	useParseDeepLink: () => {
		error: any
		call: (req?: beapi.messenger.ParseDeepLink.IRequest) => void
		reply: beapi.messenger.ParseDeepLink.IReply | null
		done: boolean
		called: boolean
	}
	useSendContactRequest: () => {
		error: any
		call: (req?: beapi.messenger.SendContactRequest.IRequest) => void
		reply: beapi.messenger.SendContactRequest.IReply | null
		done: boolean
		called: boolean
	}
	useSendMessage: () => {
		error: any
		call: (req?: beapi.messenger.SendMessage.IRequest) => void
		reply: beapi.messenger.SendMessage.IReply | null
		done: boolean
		called: boolean
	}
	useSendReplyOptions: () => {
		error: any
		call: (req?: beapi.messenger.SendReplyOptions.IRequest) => void
		reply: beapi.messenger.SendReplyOptions.IReply | null
		done: boolean
		called: boolean
	}
	useSendAck: () => {
		error: any
		call: (req?: beapi.messenger.SendAck.IRequest) => void
		reply: beapi.messenger.SendAck.IReply | null
		done: boolean
		called: boolean
	}
	useSystemInfo: () => {
		error: any
		call: (req?: beapi.messenger.SystemInfo.IRequest) => void
		reply: beapi.messenger.SystemInfo.IReply | null
		done: boolean
		called: boolean
	}
	useConversationCreate: () => {
		error: any
		call: (req?: beapi.messenger.ConversationCreate.IRequest) => void
		reply: beapi.messenger.ConversationCreate.IReply | null
		done: boolean
		called: boolean
	}
	useConversationJoin: () => {
		error: any
		call: (req?: beapi.messenger.ConversationJoin.IRequest) => void
		reply: beapi.messenger.ConversationJoin.IReply | null
		done: boolean
		called: boolean
	}
	useAccountGet: () => {
		error: any
		call: (req?: beapi.messenger.AccountGet.IRequest) => void
		reply: beapi.messenger.AccountGet.IReply | null
		done: boolean
		called: boolean
	}
	useAccountUpdate: () => {
		error: any
		call: (req?: beapi.messenger.AccountUpdate.IRequest) => void
		reply: beapi.messenger.AccountUpdate.IReply | null
		done: boolean
		called: boolean
	}
	useContactRequest: () => {
		error: any
		call: (req?: beapi.messenger.ContactRequest.IRequest) => void
		reply: beapi.messenger.ContactRequest.IReply | null
		done: boolean
		called: boolean
	}
	useContactAccept: () => {
		error: any
		call: (req?: beapi.messenger.ContactAccept.IRequest) => void
		reply: beapi.messenger.ContactAccept.IReply | null
		done: boolean
		called: boolean
	}
	useInteract: () => {
		error: any
		call: (req?: beapi.messenger.Interact.IRequest) => void
		reply: beapi.messenger.Interact.IReply | null
		done: boolean
		called: boolean
	}
	useConversationOpen: () => {
		error: any
		call: (req?: beapi.messenger.ConversationOpen.IRequest) => void
		reply: beapi.messenger.ConversationOpen.IReply | null
		done: boolean
		called: boolean
	}
	useConversationClose: () => {
		error: any
		call: (req?: beapi.messenger.ConversationClose.IRequest) => void
		reply: beapi.messenger.ConversationClose.IReply | null
		done: boolean
		called: boolean
	}
	useReplicationServiceRegisterGroup: () => {
		error: any
		call: (req?: beapi.messenger.ReplicationServiceRegisterGroup.IRequest) => void
		reply: beapi.messenger.ReplicationServiceRegisterGroup.IReply | null
		done: boolean
		called: boolean
	}
	useReplicationSetAutoEnable: () => {
		error: any
		call: (req?: beapi.messenger.ReplicationSetAutoEnable.IRequest) => void
		reply: beapi.messenger.ReplicationSetAutoEnable.IReply | null
		done: boolean
		called: boolean
	}
	useBannerQuote: () => {
		error: any
		call: (req?: beapi.messenger.BannerQuote.IRequest) => void
		reply: beapi.messenger.BannerQuote.IReply | null
		done: boolean
		called: boolean
	}
	useGetUsername: () => {
		error: any
		call: (req?: beapi.messenger.GetUsername.IRequest) => void
		reply: beapi.messenger.GetUsername.IReply | null
		done: boolean
		called: boolean
	}
}
export type ProtocolMethodsHooks = {
	useInstanceGetConfiguration: () => {
		error: any
		call: (req?: beapi.types.InstanceGetConfiguration.IRequest) => void
		reply: beapi.types.InstanceGetConfiguration.IReply | null
		done: boolean
		called: boolean
	}
	useContactRequestReference: () => {
		error: any
		call: (req?: beapi.types.ContactRequestReference.IRequest) => void
		reply: beapi.types.ContactRequestReference.IReply | null
		done: boolean
		called: boolean
	}
	useContactRequestDisable: () => {
		error: any
		call: (req?: beapi.types.ContactRequestDisable.IRequest) => void
		reply: beapi.types.ContactRequestDisable.IReply | null
		done: boolean
		called: boolean
	}
	useContactRequestEnable: () => {
		error: any
		call: (req?: beapi.types.ContactRequestEnable.IRequest) => void
		reply: beapi.types.ContactRequestEnable.IReply | null
		done: boolean
		called: boolean
	}
	useContactRequestResetReference: () => {
		error: any
		call: (req?: beapi.types.ContactRequestResetReference.IRequest) => void
		reply: beapi.types.ContactRequestResetReference.IReply | null
		done: boolean
		called: boolean
	}
	useContactRequestSend: () => {
		error: any
		call: (req?: beapi.types.ContactRequestSend.IRequest) => void
		reply: beapi.types.ContactRequestSend.IReply | null
		done: boolean
		called: boolean
	}
	useContactRequestAccept: () => {
		error: any
		call: (req?: beapi.types.ContactRequestAccept.IRequest) => void
		reply: beapi.types.ContactRequestAccept.IReply | null
		done: boolean
		called: boolean
	}
	useContactRequestDiscard: () => {
		error: any
		call: (req?: beapi.types.ContactRequestDiscard.IRequest) => void
		reply: beapi.types.ContactRequestDiscard.IReply | null
		done: boolean
		called: boolean
	}
	useContactBlock: () => {
		error: any
		call: (req?: beapi.types.ContactBlock.IRequest) => void
		reply: beapi.types.ContactBlock.IReply | null
		done: boolean
		called: boolean
	}
	useContactUnblock: () => {
		error: any
		call: (req?: beapi.types.ContactUnblock.IRequest) => void
		reply: beapi.types.ContactUnblock.IReply | null
		done: boolean
		called: boolean
	}
	useContactAliasKeySend: () => {
		error: any
		call: (req?: beapi.types.ContactAliasKeySend.IRequest) => void
		reply: beapi.types.ContactAliasKeySend.IReply | null
		done: boolean
		called: boolean
	}
	useMultiMemberGroupCreate: () => {
		error: any
		call: (req?: beapi.types.MultiMemberGroupCreate.IRequest) => void
		reply: beapi.types.MultiMemberGroupCreate.IReply | null
		done: boolean
		called: boolean
	}
	useMultiMemberGroupJoin: () => {
		error: any
		call: (req?: beapi.types.MultiMemberGroupJoin.IRequest) => void
		reply: beapi.types.MultiMemberGroupJoin.IReply | null
		done: boolean
		called: boolean
	}
	useMultiMemberGroupLeave: () => {
		error: any
		call: (req?: beapi.types.MultiMemberGroupLeave.IRequest) => void
		reply: beapi.types.MultiMemberGroupLeave.IReply | null
		done: boolean
		called: boolean
	}
	useMultiMemberGroupAliasResolverDisclose: () => {
		error: any
		call: (req?: beapi.types.MultiMemberGroupAliasResolverDisclose.IRequest) => void
		reply: beapi.types.MultiMemberGroupAliasResolverDisclose.IReply | null
		done: boolean
		called: boolean
	}
	useMultiMemberGroupAdminRoleGrant: () => {
		error: any
		call: (req?: beapi.types.MultiMemberGroupAdminRoleGrant.IRequest) => void
		reply: beapi.types.MultiMemberGroupAdminRoleGrant.IReply | null
		done: boolean
		called: boolean
	}
	useMultiMemberGroupInvitationCreate: () => {
		error: any
		call: (req?: beapi.types.MultiMemberGroupInvitationCreate.IRequest) => void
		reply: beapi.types.MultiMemberGroupInvitationCreate.IReply | null
		done: boolean
		called: boolean
	}
	useAppMetadataSend: () => {
		error: any
		call: (req?: beapi.types.AppMetadataSend.IRequest) => void
		reply: beapi.types.AppMetadataSend.IReply | null
		done: boolean
		called: boolean
	}
	useAppMessageSend: () => {
		error: any
		call: (req?: beapi.types.AppMessageSend.IRequest) => void
		reply: beapi.types.AppMessageSend.IReply | null
		done: boolean
		called: boolean
	}
	useGroupInfo: () => {
		error: any
		call: (req?: beapi.types.GroupInfo.IRequest) => void
		reply: beapi.types.GroupInfo.IReply | null
		done: boolean
		called: boolean
	}
	useActivateGroup: () => {
		error: any
		call: (req?: beapi.types.ActivateGroup.IRequest) => void
		reply: beapi.types.ActivateGroup.IReply | null
		done: boolean
		called: boolean
	}
	useDeactivateGroup: () => {
		error: any
		call: (req?: beapi.types.DeactivateGroup.IRequest) => void
		reply: beapi.types.DeactivateGroup.IReply | null
		done: boolean
		called: boolean
	}
	useDebugGroup: () => {
		error: any
		call: (req?: beapi.types.DebugGroup.IRequest) => void
		reply: beapi.types.DebugGroup.IReply | null
		done: boolean
		called: boolean
	}
	useSystemInfo: () => {
		error: any
		call: (req?: beapi.types.SystemInfo.IRequest) => void
		reply: beapi.types.SystemInfo.IReply | null
		done: boolean
		called: boolean
	}
	useAuthServiceInitFlow: () => {
		error: any
		call: (req?: beapi.types.AuthServiceInitFlow.IRequest) => void
		reply: beapi.types.AuthServiceInitFlow.IReply | null
		done: boolean
		called: boolean
	}
	useAuthServiceCompleteFlow: () => {
		error: any
		call: (req?: beapi.types.AuthServiceCompleteFlow.IRequest) => void
		reply: beapi.types.AuthServiceCompleteFlow.IReply | null
		done: boolean
		called: boolean
	}
	useReplicationServiceRegisterGroup: () => {
		error: any
		call: (req?: beapi.types.ReplicationServiceRegisterGroup.IRequest) => void
		reply: beapi.types.ReplicationServiceRegisterGroup.IReply | null
		done: boolean
		called: boolean
	}
	usePeerList: () => {
		error: any
		call: (req?: beapi.types.PeerList.IRequest) => void
		reply: beapi.types.PeerList.IReply | null
		done: boolean
		called: boolean
	}
}
