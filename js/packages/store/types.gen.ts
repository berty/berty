import beapi from '@berty-tech/api'

export type StreamEventPayloadType<T> =
T extends beapi.messenger.StreamEvent.Type.Undefined ? undefined :
T extends beapi.messenger.StreamEvent.Type.TypeListEnded ? beapi.messenger.StreamEvent.IListEnded :
T extends beapi.messenger.StreamEvent.Type.TypeConversationUpdated ? beapi.messenger.StreamEvent.IConversationUpdated :
T extends beapi.messenger.StreamEvent.Type.TypeConversationDeleted ? beapi.messenger.StreamEvent.IConversationDeleted :
T extends beapi.messenger.StreamEvent.Type.TypeInteractionUpdated ? beapi.messenger.StreamEvent.IInteractionUpdated :
T extends beapi.messenger.StreamEvent.Type.TypeInteractionDeleted ? beapi.messenger.StreamEvent.IInteractionDeleted :
T extends beapi.messenger.StreamEvent.Type.TypeContactUpdated ? beapi.messenger.StreamEvent.IContactUpdated :
T extends beapi.messenger.StreamEvent.Type.TypeAccountUpdated ? beapi.messenger.StreamEvent.IAccountUpdated :
T extends beapi.messenger.StreamEvent.Type.TypeMemberUpdated ? beapi.messenger.StreamEvent.IMemberUpdated :
T extends beapi.messenger.StreamEvent.Type.TypeDeviceUpdated ? beapi.messenger.StreamEvent.IDeviceUpdated :
T extends beapi.messenger.StreamEvent.Type.TypeNotified ? beapi.messenger.StreamEvent.INotified :
T extends beapi.messenger.StreamEvent.Type.TypeMediaUpdated ? beapi.messenger.StreamEvent.IMediaUpdated :
never

export type StreamEventNotifiedPayloadType<T> =
T extends beapi.messenger.StreamEvent.Notified.Type.Unknown ? undefined :
T extends beapi.messenger.StreamEvent.Notified.Type.TypeBasic ? beapi.messenger.StreamEvent.Notified.IBasic :
T extends beapi.messenger.StreamEvent.Notified.Type.TypeMessageReceived ? beapi.messenger.StreamEvent.Notified.IMessageReceived :
T extends beapi.messenger.StreamEvent.Notified.Type.TypeContactRequestSent ? beapi.messenger.StreamEvent.Notified.IContactRequestSent :
T extends beapi.messenger.StreamEvent.Notified.Type.TypeContactRequestReceived ? beapi.messenger.StreamEvent.Notified.IContactRequestReceived :
never

export type AppMessagePayloadType<T> =
T extends beapi.messenger.AppMessage.Type.Undefined ? undefined :
T extends beapi.messenger.AppMessage.Type.TypeUserMessage ? beapi.messenger.AppMessage.IUserMessage :
T extends beapi.messenger.AppMessage.Type.TypeUserReaction ? beapi.messenger.AppMessage.IUserReaction :
T extends beapi.messenger.AppMessage.Type.TypeGroupInvitation ? beapi.messenger.AppMessage.IGroupInvitation :
T extends beapi.messenger.AppMessage.Type.TypeSetGroupInfo ? beapi.messenger.AppMessage.ISetGroupInfo :
T extends beapi.messenger.AppMessage.Type.TypeSetUserInfo ? beapi.messenger.AppMessage.ISetUserInfo :
T extends beapi.messenger.AppMessage.Type.TypeAcknowledge ? beapi.messenger.AppMessage.IAcknowledge :
T extends beapi.messenger.AppMessage.Type.TypeReplyOptions ? beapi.messenger.AppMessage.IReplyOptions :
T extends beapi.messenger.AppMessage.Type.TypeMonitorMetadata ? beapi.messenger.AppMessage.IMonitorMetadata :
never

export type MonitorGroupPayloadType<T> =
