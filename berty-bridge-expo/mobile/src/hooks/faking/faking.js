import faker from 'faker'
import { keyBy, flatten } from 'lodash'

import beapi from '@berty/api'

const fakeArray = length => new Array(length).fill({})

const contactStates = [
	beapi.messenger.Contact.State.Accepted,
	beapi.messenger.Contact.State.OutgoingRequestSent,
	beapi.messenger.Contact.State.OutgoingRequestEnqueued,
	beapi.messenger.Contact.State.IncomingRequest,
]

export const fakeContacts = (length, start) => {
	const conversationList = []
	const contactList = fakeArray(length).map((_, index) => {
		const state = contactStates[Math.floor(Math.random() * contactStates.length)]
		const convPk = `fake_pk_contact_conv_${index + start}` // TODO: set to empty depending on state
		const contactPk = `fake_pk_contact_${index + start}`
		const name = faker.name.findName()
		const createdDate =
			Date.now() - Math.floor(Math.random() * (50 * 24 * 60 * 60 * 1000)).toString()
		if (state === beapi.messenger.Contact.State.Accepted) {
			conversationList.push({
				publicKey: convPk,
				contactPublicKey: contactPk,
				displayName: name,
				type: beapi.messenger.Conversation.Type.ContactType,
				fake: true,
				createdDate,
			})
		}
		return {
			publicKey: contactPk,
			displayName: name,
			conversationPublicKey: convPk,
			state,
			fake: true,
		}
	})
	return {
		contacts: keyBy(contactList, 'publicKey'),
		conversations: keyBy(conversationList, 'publicKey'),
	}
}

const maxMembersAmount = 10

export const fakeMultiMemberConversations = (length, start) => {
	// TODO: fake members
	const modelsList = fakeArray(length).map((_, index) => {
		const publicKey = `fake_pk_multi_${index + start}`

		const fakeMembersAmount = Math.floor(Math.random() * (maxMembersAmount + 1))
		const fakeMembers = {}
		for (let i = 0; i < fakeMembersAmount; i++) {
			const memberPublicKey = `fake_pk_multi_member_${index * maxMembersAmount + i}`
			fakeMembers[memberPublicKey] = {
				publicKey: memberPublicKey,
				conversationPublicKey: publicKey,
				displayName: faker.name.findName(),
				fake: true,
			}
		}

		const displayName = faker.name.findName() + "'s Party"
		const link = `fake://fake-multi-${index}`
		const createdDate =
			Date.now() - Math.floor(Math.random() * (50 * 24 * 60 * 60 * 1000)).toString()

		return {
			conversation: {
				publicKey,
				displayName,
				link,
				type: beapi.messenger.Conversation.Type.MultiMemberType,
				fake: true,
				createdDate,
			},
			members: fakeMembers,
		}
	})
	const payload = modelsList.reduce(
		(r, { conversation, members }) => {
			return {
				conversations: { ...r.conversations, [conversation.publicKey]: conversation },
				members: { ...r.members, [conversation.publicKey]: members },
			}
		},
		{ conversations: {}, members: {} },
	)
	return payload
}
