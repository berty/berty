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
	const conv = Object.values(state.messenger.conversations.entities).find(conv => {
		if (
			(conv?.type as keyof typeof beapi.messenger.Conversation.Type | unknown) ===
			beapi.messenger.Conversation.Type[beapi.messenger.Conversation.Type.ContactType]
		) {
			// recup the contact of the conv to check if the request is accepted
			const contact = Object.values(state.messenger.contacts.entities).find(
				contact => contact?.publicKey === conv?.contactPublicKey,
			)
			if (
				(contact?.state as keyof typeof beapi.messenger.Contact.State | unknown) ===
				beapi.messenger.Contact.State[beapi.messenger.Contact.State.Accepted]
			) {
				return conv
			}
		}
	})
	return conv
}

export const getFirstContact = () => {
	const state = store.getState()
	const contact = Object.values(state.messenger.contacts.entities)[0]
	return contact
}
