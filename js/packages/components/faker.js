import faker from 'faker'
import { messenger } from '../store/index'
import { OneToOne } from './chat'
import { conversation, message } from '@berty-tech/store/messenger'

const fakeArray = (length) => new Array(length).fill({})
export const fakeContacts = (length, start) =>
	fakeArray(length).map((_, index) => ({
		id: `fake_${(start + index).toString()}`,
		publicKey: `fake_${index.toString()}`,
		name: faker.name.findName(),
		fake: true,
		request: {
			type: messenger.contact.ContactRequestType.Outgoing,
			accepted: false,
			discarded: false,
			state: 'initiated',
		},
		addedDate: Date.now(),
	}))
export const fakeMessages = (length, start) =>
	fakeArray(length).map((_, index) => ({
		id: `fake_${(start + index).toString()}`,
		receivedDate: faker.date.past(),
		type: messenger.AppMessageType.UserMessage,
		body: faker.lorem.sentences(),
		fake: true,
		attachments: [],
		sentDate: faker.date.past(),
		isMe: faker.random.boolean(),
		acknowledged: faker.random.boolean(),
	}))
export const fakeConversations = (length, start) =>
	fakeArray(length).map((_, index) => {
		// const contacts = fakeContacts()
		// const contact = contacts[index]
		return {
			id: `fake_${(start + index).toString()}`,
			// title: contact.name,
			// pk: contact.publicKey,
			kind: messenger.conversation.ConversationKind.OneToOne,
			fake: true,
			createdAt: faker.date.past(),
			// lastMessageDate: faker.date.past(),
			// membersNames: { [contact.id]: contact.name },
			members: [],
			// messages: fakeMessages().map((_) => _.id),
			unreadCount: 0,
			reading: false,
			// contactId: contact.id,
			shareableGroup: 'fake://fake',
		}
	})
