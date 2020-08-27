import faker from 'faker'

import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { keyBy, flatten } from 'lodash'

const fakeArray = (length) => new Array(length).fill({})

const contactStates = [
	messengerpb.Contact.State.Established,
	messengerpb.Contact.State.OutgoingRequestSent,
	messengerpb.Contact.State.OutgoingRequestEnqueued,
	messengerpb.Contact.State.IncomingRequest,
]

export const fakeContacts = (length, start) => {
	const conversationList = []
	const contactList = fakeArray(length).map((_, index) => {
		const state = contactStates[Math.floor(Math.random() * contactStates.length)]
		const convPk = `fake_pk_contact_conv_${index + start}`
		const contactPk = `fake_pk_contact_${index + start}`
		const name = faker.name.findName()
		if (state === messengerpb.Contact.State.Established) {
			conversationList.push({
				publicKey: convPk,
				contactPublicKey: contactPk,
				displayName: name,
				kind: '1to1',
				fake: true,
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

export const fakeMultiMemberConversations = (length, start) => {
	// TODO: fake members
	const conversationList = fakeArray(length).map((_, index) => {
		const displayName = faker.name.findName() + "'s Party"
		const publicKey = `fake_pk_multi_${index + start}`
		const link = `fake://fake-multi-${index}`
		return {
			publicKey,
			displayName,
			link,
			kind: 'multi',
			fake: true,
		}
	})
	return keyBy(conversationList, 'publicKey')
}

export const fakeMessages = (length, conversationList = [], start) => {
	const type = messengerpb.AppMessage.Type.UserMessage
	const fake = true
	const messagesForConversation = (conversation = {}, i = 0) => {
		return fakeArray(length).map((_, idx = 0) => {
			return {
				cid: `fake_interaction_${i * length + idx + start}`,
				type,
				conversationPublicKey: conversation.publicKey,
				payload: messengerpb.AppMessage.UserMessage.encode({
					body: faker.lorem.sentences(),
				}).finish(),
				isMe: faker.random.boolean(),
				fake,
			}
		})
	}
	const messageList = flatten(conversationList.map(messagesForConversation))
	console.log('generated x fake messages:', messageList.length)
	return keyBy(messageList, 'cid')
}
