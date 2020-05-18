import faker from 'faker'
import randomEmoji from 'random-emoji'
import { inspect } from 'util'
import { berty, google } from '@berty-tech/api'

export const promiseResolved = (): Promise<void> => new Promise((res): any => setTimeout(res, 1000))
// export const promiseRejected = (): Promise<void> =>
//   new Promise((res, rej): Timeout => setTimeout(rej, 1000))

export const randomItem = <T extends unknown>(arr: Array<T>): T =>
	arr[Math.floor(Math.random() * 1000) % arr.length]

export const randomValue = <T extends { [name: string]: any }>(obj: T): any =>
	obj[randomItem(Object.keys(obj))]

export const randomLength = (mod = 20): number => Math.floor(Math.random() * 1000) % mod
export const randomArray = <T extends unknown>(mod: number): Array<T> =>
	new Array(randomLength(mod)).fill({})
export const timestamp = (date: Date): google.protobuf.ITimestamp => ({
	seconds: Math.floor(date.getTime() / 1000),
	nanos: (date.getTime() % 1000) * 1000,
})

export const fakeUsers = {
	items: randomArray(20).map(() => ({
		avatarUri: faker.internet.avatar(),
		name: faker.name.findName(),
	})),
}

export const fakeOneUser = {
	avatarUri: faker.internet.avatar(),
	name: faker.name.findName(),
}

export const fakeContacts = randomArray(100).map(
	(_, index): berty.chatmodel.IContact => ({
		id: index,
		protocolId: '',
		name: faker.name.findName(),
		avatarUri: faker.internet.avatar(),
		createdAt: timestamp(faker.date.recent()),
		updatedAt: timestamp(faker.date.recent()),
		seenAt: timestamp(faker.date.recent()),
		statusText: faker.random.words(),
		statusEmoji: new Uint8Array(randomEmoji.random({ count: 1 })[0]),
		blocked: faker.random.boolean(),
		kind: randomValue(berty.chatmodel.Contact.Kind),
	}),
)

export const fakeConversations = randomArray(30).map(
	(_, index): berty.chatmodel.IConversation => ({
		id: index,
		protocolId: '',
		createdAt: timestamp(faker.date.recent()),
		updatedAt: timestamp(faker.date.recent()),
		avatarUri: faker.internet.avatar(),
		title: randomItem([faker.name.findName, faker.name.title])(),
		badge: Math.random() % 100,
		kind: randomValue(berty.chatmodel.Conversation.Kind),
		topic: '',
		mutePolicy: randomValue(berty.chatmodel.Conversation.Kind),
		lastMessageId: 0,
		members: [],
	}),
)

export const fakeMembers = randomArray(100).map(
	(_, index): berty.chatmodel.IMember => ({
		id: index,
		protocolId: '',
		createdAt: timestamp(faker.date.recent()),
		updatedAt: timestamp(faker.date.recent()),
		readAt: timestamp(faker.date.recent()),
		name: randomItem(['', faker.name.findName()]),
		avatarUri: randomItem(['', faker.internet.avatar()]),
		role: randomValue(berty.chatmodel.Member.Role),
		contactId: randomItem(fakeContacts).id,
		conversationId: randomItem(fakeConversations).id,
	}),
)

export const generateUsers = () => ({
	items: randomArray().map(() => ({
		avatarUri: faker.internet.avatar(),
		name: faker.name.findName(),
	})),
})

export const generateOneUser = () => ({
	avatarUri: faker.internet.avatar(),
	name: faker.name.findName(),
})

export const fakeAttachments = randomArray(50).map(
	(_, index): berty.chatmodel.IAttachment => ({
		id: index,
		createdAt: timestamp(faker.date.recent()),
		updatedAt: timestamp(faker.date.recent()),
		uri: randomItem([
			faker.image.image,
			faker.image.avatar,
			faker.image.imageUrl,
			faker.image.abstract,
			faker.image.animals,
			faker.image.business,
			faker.image.cats,
			faker.image.city,
			faker.image.food,
			faker.image.nightlife,
			faker.image.fashion,
			faker.image.people,
			faker.image.nature,
			faker.image.sports,
			faker.image.technics,
			faker.image.transport,
			faker.image.dataUri,
		])(),
		contentType: '',
	}),
)

export const fakeReaction = randomArray(50).map(
	(_, index): berty.chatmodel.IReaction => ({
		id: index,
		createdAt: timestamp(faker.date.recent()),
		updatedAt: timestamp(faker.date.recent()),
		emoji: new Uint8Array(randomEmoji.random({ count: 1 })[0]),
		memberId: 0,
	}),
)
