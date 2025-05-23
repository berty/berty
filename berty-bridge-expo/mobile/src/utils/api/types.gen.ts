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
	: T extends beapi.messenger.StreamEvent.Type.TypeConversationPartialLoad
	? beapi.messenger.StreamEvent.IConversationPartialLoad
	: T extends beapi.messenger.StreamEvent.Type.TypePeerStatusConnected
	? beapi.messenger.StreamEvent.IPeerStatusConnected
	: T extends beapi.messenger.StreamEvent.Type.TypePeerStatusReconnecting
	? beapi.messenger.StreamEvent.IPeerStatusReconnecting
	: T extends beapi.messenger.StreamEvent.Type.TypePeerStatusDisconnected
	? beapi.messenger.StreamEvent.IPeerStatusDisconnected
	: T extends beapi.messenger.StreamEvent.Type.TypePeerStatusGroupAssociated
	? beapi.messenger.StreamEvent.IPeerStatusGroupAssociated
	: T extends beapi.messenger.StreamEvent.Type.TypeServiceTokenAdded
	? beapi.messenger.StreamEvent.IServiceTokenAdded
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
	: T extends beapi.messenger.AppMessage.Type.TypeGroupInvitation
	? beapi.messenger.AppMessage.IGroupInvitation
	: T extends beapi.messenger.AppMessage.Type.TypeSetGroupInfo
	? beapi.messenger.AppMessage.ISetGroupInfo
	: T extends beapi.messenger.AppMessage.Type.TypeSetUserInfo
	? beapi.messenger.AppMessage.ISetUserInfo
	: T extends beapi.messenger.AppMessage.Type.TypeAcknowledge
	? beapi.messenger.AppMessage.IAcknowledge
	: T extends beapi.messenger.AppMessage.Type.TypeAccountDirectoryServiceRegistered
	? beapi.messenger.AppMessage.IAccountDirectoryServiceRegistered
	: T extends beapi.messenger.AppMessage.Type.TypeAccountDirectoryServiceUnregistered
	? beapi.messenger.AppMessage.IAccountDirectoryServiceUnregistered
	: T extends beapi.messenger.AppMessage.Type.TypeServiceAddToken
	? beapi.messenger.AppMessage.IServiceAddToken
	: T extends beapi.messenger.AppMessage.Type.TypeServiceRemoveToken
	? beapi.messenger.AppMessage.IServiceRemoveToken
	: T extends beapi.messenger.AppMessage.Type.TypePushSetDeviceToken
	? beapi.messenger.AppMessage.IPushSetDeviceToken
	: T extends beapi.messenger.AppMessage.Type.TypePushSetServer
	? beapi.messenger.AppMessage.IPushSetServer
	: T extends beapi.messenger.AppMessage.Type.TypePushSetMemberToken
	? beapi.messenger.AppMessage.IPushSetMemberToken
	: never

export type InteractionUndefined = {
	type: beapi.messenger.AppMessage.Type.Undefined
	payload?: undefined
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionUserMessage = {
	type: beapi.messenger.AppMessage.Type.TypeUserMessage
	payload?: beapi.messenger.AppMessage.IUserMessage
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
export type InteractionAccountDirectoryServiceRegistered = {
	type: beapi.messenger.AppMessage.Type.TypeAccountDirectoryServiceRegistered
	payload?: beapi.messenger.AppMessage.IAccountDirectoryServiceRegistered
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionAccountDirectoryServiceUnregistered = {
	type: beapi.messenger.AppMessage.Type.TypeAccountDirectoryServiceUnregistered
	payload?: beapi.messenger.AppMessage.IAccountDirectoryServiceUnregistered
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionServiceAddToken = {
	type: beapi.messenger.AppMessage.Type.TypeServiceAddToken
	payload?: beapi.messenger.AppMessage.IServiceAddToken
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionServiceRemoveToken = {
	type: beapi.messenger.AppMessage.Type.TypeServiceRemoveToken
	payload?: beapi.messenger.AppMessage.IServiceRemoveToken
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionPushSetDeviceToken = {
	type: beapi.messenger.AppMessage.Type.TypePushSetDeviceToken
	payload?: beapi.messenger.AppMessage.IPushSetDeviceToken
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionPushSetServer = {
	type: beapi.messenger.AppMessage.Type.TypePushSetServer
	payload?: beapi.messenger.AppMessage.IPushSetServer
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>
export type InteractionPushSetMemberToken = {
	type: beapi.messenger.AppMessage.Type.TypePushSetMemberToken
	payload?: beapi.messenger.AppMessage.IPushSetMemberToken
} & Omit<beapi.messenger.IInteraction, 'payload' | 'type'>

export type ParsedInteraction =
	| InteractionUndefined
	| InteractionUserMessage
	| InteractionGroupInvitation
	| InteractionSetGroupInfo
	| InteractionSetUserInfo
	| InteractionAcknowledge
	| InteractionAccountDirectoryServiceRegistered
	| InteractionAccountDirectoryServiceUnregistered
	| InteractionServiceAddToken
	| InteractionServiceRemoveToken
	| InteractionPushSetDeviceToken
	| InteractionPushSetServer
	| InteractionPushSetMemberToken
