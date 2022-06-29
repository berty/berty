import beapi from '@berty/api'
import store from '@berty/redux/store'

export const getFirstMultiMemberConv = () => {
	const state = store.getState()
	const conv = Object.values(state.messenger.conversations.entities).find(
		conv =>
			(conv?.type as keyof typeof beapi.messenger.Conversation.Type | unknown) ===
			beapi.messenger.Conversation.Type[beapi.messenger.Conversation.Type.MultiMemberType],
	)
	return conv
}

export const getFirstOneToOneConv = () => {
	const state = store.getState()
	const conv = Object.values(state.messenger.conversations.entities).find(
		conv =>
			(conv?.type as keyof typeof beapi.messenger.Conversation.Type | unknown) ===
			beapi.messenger.Conversation.Type[beapi.messenger.Conversation.Type.ContactType],
	)
	return conv
}

export const getFirstContact = () => {
	const state = store.getState()
	const contact = Object.values(state.messenger.contacts.entities)[0]
	return contact
}
