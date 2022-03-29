import beapi from '@berty/api'

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
	: T extends beapi.messenger.StreamEvent.Type.TypeConversationPartialLoad
	? beapi.messenger.StreamEvent.IConversationPartialLoad
	: never

export type StreamEventNotifiedPayloadType<T> =
	T extends beapi.messenger.StreamEvent.Notified.Type.Unknown
		? undefined
		: T extends beapi.messenger.StreamEvent.Notified.Type.TypeBasic
		? beapi.messenger.StreamEvent.Notified.IBasic
		: T extends beapi.messenger.StreamEvent.Notified.Type.TypeMessageReceived
		? beapi.messenger.StreamEvent.Notified.IMessageReceived
		: T extends beapi.messenger.StreamEvent.Notified.Type.TypeContactRequestSent
		? beapi.messenger.StreamEvent.Notified.IContactRequestSent
		: T extends beapi.messenger.StreamEvent.Notified.Type.TypeContactRequestReceived
		? beapi.messenger.StreamEvent.Notified.IContactRequestReceived
		: T extends beapi.messenger.StreamEvent.Notified.Type.TypeGroupInvitation
		? beapi.messenger.StreamEvent.Notified.IGroupInvitation
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

export type MonitorGroupPayloadType<T> =
	T extends beapi.protocol.MonitorGroup.TypeEventMonitor.TypeEventMonitorUndefined
		? undefined
		: T extends beapi.protocol.MonitorGroup.TypeEventMonitor.TypeEventMonitorAdvertiseGroup
		? beapi.protocol.MonitorGroup.IEventMonitorAdvertiseGroup
		: T extends beapi.protocol.MonitorGroup.TypeEventMonitor.TypeEventMonitorPeerFound
		? beapi.protocol.MonitorGroup.IEventMonitorPeerFound
		: T extends beapi.protocol.MonitorGroup.TypeEventMonitor.TypeEventMonitorPeerJoin
		? beapi.protocol.MonitorGroup.IEventMonitorPeerJoin
		: T extends beapi.protocol.MonitorGroup.TypeEventMonitor.TypeEventMonitorPeerLeave
		? beapi.protocol.MonitorGroup.IEventMonitorPeerLeave
		: never

export type InteractionUndefined = {
	type: beapi.messenger.AppMessage.Type.Undefined
	payload?: undefined
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionUserMessage = {
	type: beapi.messenger.AppMessage.Type.TypeUserMessage
	payload?: beapi.messenger.AppMessage.IUserMessage
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionUserReaction = {
	type: beapi.messenger.AppMessage.Type.TypeUserReaction
	payload?: beapi.messenger.AppMessage.IUserReaction
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionGroupInvitation = {
	type: beapi.messenger.AppMessage.Type.TypeGroupInvitation
	payload?: beapi.messenger.AppMessage.IGroupInvitation
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionSetGroupInfo = {
	type: beapi.messenger.AppMessage.Type.TypeSetGroupInfo
	payload?: beapi.messenger.AppMessage.ISetGroupInfo
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionSetUserInfo = {
	type: beapi.messenger.AppMessage.Type.TypeSetUserInfo
	payload?: beapi.messenger.AppMessage.ISetUserInfo
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionAcknowledge = {
	type: beapi.messenger.AppMessage.Type.TypeAcknowledge
	payload?: beapi.messenger.AppMessage.IAcknowledge
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionReplyOptions = {
	type: beapi.messenger.AppMessage.Type.TypeReplyOptions
	payload?: beapi.messenger.AppMessage.IReplyOptions
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionMonitorMetadata = {
	type: beapi.messenger.AppMessage.Type.TypeMonitorMetadata
	payload?: beapi.messenger.AppMessage.IMonitorMetadata
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
		loading: boolean
	}
	useShareableBertyGroup: () => {
		error: any
		call: (req?: beapi.messenger.ShareableBertyGroup.IRequest) => void
		reply: beapi.messenger.ShareableBertyGroup.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useDevShareInstanceBertyID: () => {
		error: any
		call: (req?: beapi.messenger.DevShareInstanceBertyID.IRequest) => void
		reply: beapi.messenger.DevShareInstanceBertyID.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useParseDeepLink: () => {
		error: any
		call: (req?: beapi.messenger.ParseDeepLink.IRequest) => void
		reply: beapi.messenger.ParseDeepLink.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useSendContactRequest: () => {
		error: any
		call: (req?: beapi.messenger.SendContactRequest.IRequest) => void
		reply: beapi.messenger.SendContactRequest.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useSendReplyOptions: () => {
		error: any
		call: (req?: beapi.messenger.SendReplyOptions.IRequest) => void
		reply: beapi.messenger.SendReplyOptions.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useSystemInfo: () => {
		error: any
		call: (req?: beapi.messenger.SystemInfo.IRequest) => void
		reply: beapi.messenger.SystemInfo.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useConversationCreate: () => {
		error: any
		call: (req?: beapi.messenger.ConversationCreate.IRequest) => void
		reply: beapi.messenger.ConversationCreate.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useConversationJoin: () => {
		error: any
		call: (req?: beapi.messenger.ConversationJoin.IRequest) => void
		reply: beapi.messenger.ConversationJoin.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useAccountGet: () => {
		error: any
		call: (req?: beapi.messenger.AccountGet.IRequest) => void
		reply: beapi.messenger.AccountGet.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useAccountUpdate: () => {
		error: any
		call: (req?: beapi.messenger.AccountUpdate.IRequest) => void
		reply: beapi.messenger.AccountUpdate.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useContactRequest: () => {
		error: any
		call: (req?: beapi.messenger.ContactRequest.IRequest) => void
		reply: beapi.messenger.ContactRequest.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useContactAccept: () => {
		error: any
		call: (req?: beapi.messenger.ContactAccept.IRequest) => void
		reply: beapi.messenger.ContactAccept.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useInteract: () => {
		error: any
		call: (req?: beapi.messenger.Interact.IRequest) => void
		reply: beapi.messenger.Interact.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useConversationOpen: () => {
		error: any
		call: (req?: beapi.messenger.ConversationOpen.IRequest) => void
		reply: beapi.messenger.ConversationOpen.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useConversationClose: () => {
		error: any
		call: (req?: beapi.messenger.ConversationClose.IRequest) => void
		reply: beapi.messenger.ConversationClose.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useConversationLoad: () => {
		error: any
		call: (req?: beapi.messenger.ConversationLoad.IRequest) => void
		reply: beapi.messenger.ConversationLoad.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useReplicationServiceRegisterGroup: () => {
		error: any
		call: (req?: beapi.messenger.ReplicationServiceRegisterGroup.IRequest) => void
		reply: beapi.messenger.ReplicationServiceRegisterGroup.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useReplicationSetAutoEnable: () => {
		error: any
		call: (req?: beapi.messenger.ReplicationSetAutoEnable.IRequest) => void
		reply: beapi.messenger.ReplicationSetAutoEnable.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useBannerQuote: () => {
		error: any
		call: (req?: beapi.messenger.BannerQuote.IRequest) => void
		reply: beapi.messenger.BannerQuote.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useMediaGetRelated: () => {
		error: any
		call: (req?: beapi.messenger.MediaGetRelated.IRequest) => void
		reply: beapi.messenger.MediaGetRelated.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useMessageSearch: () => {
		error: any
		call: (req?: beapi.messenger.MessageSearch.IRequest) => void
		reply: beapi.messenger.MessageSearch.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useTyberHostAttach: () => {
		error: any
		call: (req?: beapi.messenger.TyberHostAttach.IRequest) => void
		reply: beapi.messenger.TyberHostAttach.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	usePushSetAutoShare: () => {
		error: any
		call: (req?: beapi.messenger.PushSetAutoShare.IRequest) => void
		reply: beapi.messenger.PushSetAutoShare.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	usePushShareTokenForConversation: () => {
		error: any
		call: (req?: beapi.messenger.PushShareTokenForConversation.IRequest) => void
		reply: beapi.messenger.PushShareTokenForConversation.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	usePushReceive: () => {
		error: any
		call: (req?: beapi.messenger.PushReceive.IRequest) => void
		reply: beapi.messenger.PushReceive.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useInteractionReactionsForEmoji: () => {
		error: any
		call: (req?: beapi.messenger.InteractionReactionsForEmoji.IRequest) => void
		reply: beapi.messenger.InteractionReactionsForEmoji.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
}
export type ProtocolMethodsHooks = {
	useInstanceGetConfiguration: () => {
		error: any
		call: (req?: beapi.protocol.InstanceGetConfiguration.IRequest) => void
		reply: beapi.protocol.InstanceGetConfiguration.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useContactRequestReference: () => {
		error: any
		call: (req?: beapi.protocol.ContactRequestReference.IRequest) => void
		reply: beapi.protocol.ContactRequestReference.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useContactRequestDisable: () => {
		error: any
		call: (req?: beapi.protocol.ContactRequestDisable.IRequest) => void
		reply: beapi.protocol.ContactRequestDisable.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useContactRequestEnable: () => {
		error: any
		call: (req?: beapi.protocol.ContactRequestEnable.IRequest) => void
		reply: beapi.protocol.ContactRequestEnable.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useContactRequestResetReference: () => {
		error: any
		call: (req?: beapi.protocol.ContactRequestResetReference.IRequest) => void
		reply: beapi.protocol.ContactRequestResetReference.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useContactRequestSend: () => {
		error: any
		call: (req?: beapi.protocol.ContactRequestSend.IRequest) => void
		reply: beapi.protocol.ContactRequestSend.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useContactRequestAccept: () => {
		error: any
		call: (req?: beapi.protocol.ContactRequestAccept.IRequest) => void
		reply: beapi.protocol.ContactRequestAccept.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useContactRequestDiscard: () => {
		error: any
		call: (req?: beapi.protocol.ContactRequestDiscard.IRequest) => void
		reply: beapi.protocol.ContactRequestDiscard.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useContactBlock: () => {
		error: any
		call: (req?: beapi.protocol.ContactBlock.IRequest) => void
		reply: beapi.protocol.ContactBlock.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useContactUnblock: () => {
		error: any
		call: (req?: beapi.protocol.ContactUnblock.IRequest) => void
		reply: beapi.protocol.ContactUnblock.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useContactAliasKeySend: () => {
		error: any
		call: (req?: beapi.protocol.ContactAliasKeySend.IRequest) => void
		reply: beapi.protocol.ContactAliasKeySend.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useMultiMemberGroupCreate: () => {
		error: any
		call: (req?: beapi.protocol.MultiMemberGroupCreate.IRequest) => void
		reply: beapi.protocol.MultiMemberGroupCreate.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useMultiMemberGroupJoin: () => {
		error: any
		call: (req?: beapi.protocol.MultiMemberGroupJoin.IRequest) => void
		reply: beapi.protocol.MultiMemberGroupJoin.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useMultiMemberGroupLeave: () => {
		error: any
		call: (req?: beapi.protocol.MultiMemberGroupLeave.IRequest) => void
		reply: beapi.protocol.MultiMemberGroupLeave.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useMultiMemberGroupAliasResolverDisclose: () => {
		error: any
		call: (req?: beapi.protocol.MultiMemberGroupAliasResolverDisclose.IRequest) => void
		reply: beapi.protocol.MultiMemberGroupAliasResolverDisclose.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useMultiMemberGroupAdminRoleGrant: () => {
		error: any
		call: (req?: beapi.protocol.MultiMemberGroupAdminRoleGrant.IRequest) => void
		reply: beapi.protocol.MultiMemberGroupAdminRoleGrant.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useMultiMemberGroupInvitationCreate: () => {
		error: any
		call: (req?: beapi.protocol.MultiMemberGroupInvitationCreate.IRequest) => void
		reply: beapi.protocol.MultiMemberGroupInvitationCreate.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useAppMetadataSend: () => {
		error: any
		call: (req?: beapi.protocol.AppMetadataSend.IRequest) => void
		reply: beapi.protocol.AppMetadataSend.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useAppMessageSend: () => {
		error: any
		call: (req?: beapi.protocol.AppMessageSend.IRequest) => void
		reply: beapi.protocol.AppMessageSend.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useGroupInfo: () => {
		error: any
		call: (req?: beapi.protocol.GroupInfo.IRequest) => void
		reply: beapi.protocol.GroupInfo.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useActivateGroup: () => {
		error: any
		call: (req?: beapi.protocol.ActivateGroup.IRequest) => void
		reply: beapi.protocol.ActivateGroup.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useDeactivateGroup: () => {
		error: any
		call: (req?: beapi.protocol.DeactivateGroup.IRequest) => void
		reply: beapi.protocol.DeactivateGroup.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useDebugGroup: () => {
		error: any
		call: (req?: beapi.protocol.DebugGroup.IRequest) => void
		reply: beapi.protocol.DebugGroup.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useDebugAuthServiceSetToken: () => {
		error: any
		call: (req?: beapi.protocol.DebugAuthServiceSetToken.IRequest) => void
		reply: beapi.protocol.DebugAuthServiceSetToken.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useSystemInfo: () => {
		error: any
		call: (req?: beapi.protocol.SystemInfo.IRequest) => void
		reply: beapi.protocol.SystemInfo.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useAuthServiceInitFlow: () => {
		error: any
		call: (req?: beapi.protocol.AuthServiceInitFlow.IRequest) => void
		reply: beapi.protocol.AuthServiceInitFlow.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useAuthServiceCompleteFlow: () => {
		error: any
		call: (req?: beapi.protocol.AuthServiceCompleteFlow.IRequest) => void
		reply: beapi.protocol.AuthServiceCompleteFlow.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	useReplicationServiceRegisterGroup: () => {
		error: any
		call: (req?: beapi.protocol.ReplicationServiceRegisterGroup.IRequest) => void
		reply: beapi.protocol.ReplicationServiceRegisterGroup.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	usePeerList: () => {
		error: any
		call: (req?: beapi.protocol.PeerList.IRequest) => void
		reply: beapi.protocol.PeerList.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	usePushReceive: () => {
		error: any
		call: (req?: beapi.protocol.PushReceive.IRequest) => void
		reply: beapi.protocol.PushReceive.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	usePushSend: () => {
		error: any
		call: (req?: beapi.protocol.PushSend.IRequest) => void
		reply: beapi.protocol.PushSend.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	usePushShareToken: () => {
		error: any
		call: (req?: beapi.protocol.PushShareToken.IRequest) => void
		reply: beapi.protocol.PushShareToken.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	usePushSetDeviceToken: () => {
		error: any
		call: (req?: beapi.protocol.PushSetDeviceToken.IRequest) => void
		reply: beapi.protocol.PushSetDeviceToken.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
	usePushSetServer: () => {
		error: any
		call: (req?: beapi.protocol.PushSetServer.IRequest) => void
		reply: beapi.protocol.PushSetServer.IReply | null
		done: boolean
		called: boolean
		loading: boolean
	}
}
