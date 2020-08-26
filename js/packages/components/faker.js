import faker from 'faker'

import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { keyBy, flatten } from 'lodash'

const fakeArray = (length) => new Array(length).fill({})

export const fakeContacts = (length, start) => {
	const fake = true
	const state = messengerpb.Contact.State.Established
	const contactList = fakeArray(length).map((_, index) => ({
		publicKey: `fake_pk_contact_${(index + start).toString()}`,
		displayName: faker.name.findName(),
		conversationPublicKey: `fake_pk_conv_${(index + start).toString()}`,
		state,
		fake,
	}))
	return keyBy(contactList, 'publicKey')
}

export const fakeConversations = (contacts = {}) => {
	const kind = '1to1'
	const fake = true
	const conversationList = Object.values(contacts).map((value, i) => {
		const displayName = value.displayName
		const publicKey = value.conversationPublicKey
		const link = `fake://fake-${i}`
		return {
			publicKey,
			displayName,
			link,
			kind,
			fake,
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
				cid: `fake_interaction_${(i + idx + start).toString()}`,
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
