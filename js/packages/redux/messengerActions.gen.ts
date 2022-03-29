import { createAction } from '@reduxjs/toolkit'

import beapi from '@berty/api'

export const messengerActions = {
	[beapi.messenger.StreamEvent.Type.TypeListEnded]: createAction<
		beapi.messenger.StreamEvent.IListEnded,
		'messenger/ListEnded'
	>('messenger/ListEnded'),
	[beapi.messenger.StreamEvent.Type.TypeConversationUpdated]: createAction<
		beapi.messenger.StreamEvent.IConversationUpdated,
		'messenger/ConversationUpdated'
	>('messenger/ConversationUpdated'),
	[beapi.messenger.StreamEvent.Type.TypeConversationDeleted]: createAction<
		beapi.messenger.StreamEvent.IConversationDeleted,
		'messenger/ConversationDeleted'
	>('messenger/ConversationDeleted'),
	[beapi.messenger.StreamEvent.Type.TypeInteractionUpdated]: createAction<
		beapi.messenger.StreamEvent.IInteractionUpdated,
		'messenger/InteractionUpdated'
	>('messenger/InteractionUpdated'),
	[beapi.messenger.StreamEvent.Type.TypeInteractionDeleted]: createAction<
		beapi.messenger.StreamEvent.IInteractionDeleted,
		'messenger/InteractionDeleted'
	>('messenger/InteractionDeleted'),
	[beapi.messenger.StreamEvent.Type.TypeContactUpdated]: createAction<
		beapi.messenger.StreamEvent.IContactUpdated,
		'messenger/ContactUpdated'
	>('messenger/ContactUpdated'),
	[beapi.messenger.StreamEvent.Type.TypeAccountUpdated]: createAction<
		beapi.messenger.StreamEvent.IAccountUpdated,
		'messenger/AccountUpdated'
	>('messenger/AccountUpdated'),
	[beapi.messenger.StreamEvent.Type.TypeMemberUpdated]: createAction<
		beapi.messenger.StreamEvent.IMemberUpdated,
		'messenger/MemberUpdated'
	>('messenger/MemberUpdated'),
	[beapi.messenger.StreamEvent.Type.TypeDeviceUpdated]: createAction<
		beapi.messenger.StreamEvent.IDeviceUpdated,
		'messenger/DeviceUpdated'
	>('messenger/DeviceUpdated'),
	[beapi.messenger.StreamEvent.Type.TypeNotified]: createAction<
		beapi.messenger.StreamEvent.INotified,
		'messenger/Notified'
	>('messenger/Notified'),
	[beapi.messenger.StreamEvent.Type.TypeMediaUpdated]: createAction<
		beapi.messenger.StreamEvent.IMediaUpdated,
		'messenger/MediaUpdated'
	>('messenger/MediaUpdated'),
	[beapi.messenger.StreamEvent.Type.TypeConversationPartialLoad]: createAction<
		beapi.messenger.StreamEvent.IConversationPartialLoad,
		'messenger/ConversationPartialLoad'
	>('messenger/ConversationPartialLoad'),
}
