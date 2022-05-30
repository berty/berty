import faker from '@faker-js/faker'
import range from 'lodash/range'
import Long from 'long'

import beapi from '@berty/api'

/**
 * NOTE: Everything that is using Date.now won't be deterministic.
 * Some are easily fixed, for example faker.date.past is based on it, for this we can provide a base date.
 * But how to handle the sentDate in a newly created Interaction ? Or a FromNow component ? For this kind of stuff, mocking Date.now could make sense
 */

const genFakeAccount = ({
	displayName = faker.name.findName(),
	publicKey = faker.datatype.uuid(),
}): beapi.messenger.IAccount => {
	return {
		displayName: displayName,
		link: `https://berty.tech/mock#contact/${publicKey}/name=${displayName}`,
		publicKey: publicKey,
	}
}

const contactStates = [
	beapi.messenger.Contact.State.IncomingRequest,
	beapi.messenger.Contact.State.OutgoingRequestEnqueued,
	beapi.messenger.Contact.State.OutgoingRequestSent,
	beapi.messenger.Contact.State.Accepted,
]

const genFakeContactsMap = ({ count = 20, baseDate = Date.now() }) => {
	return range(0, count).reduce(contacts => {
		const infoDate = faker.date.past(1, baseDate)
		const sentDate = faker.date.past(1, infoDate)
		const createdDate = faker.date.past(1, sentDate)
		const contact: beapi.messenger.IContact = {
			infoDate: Long.fromNumber(infoDate.getTime()),
			sentDate: Long.fromNumber(sentDate.getTime()),
			createdDate: Long.fromNumber(createdDate.getTime()),
			state: faker.helpers.arrayElement(contactStates),
			publicKey: faker.datatype.uuid(),
			conversationPublicKey: faker.datatype.uuid(),
			displayName: faker.name.findName(),
		}
		contacts[contact.publicKey || ''] = contact
		return contacts
	}, {} as { [key: string]: beapi.messenger.IContact })
}

const genFakeMultiMemberConversations = ({ count = 20, baseDate = Date.now() }) =>
	range(0, count).map(() => {
		const displayName = faker.lorem.sentence(faker.datatype.number({ min: 1, max: 5 }))
		const lastUpdate = faker.date.past(1, baseDate)
		const publicKey = faker.datatype.uuid()
		const conv: beapi.messenger.IConversation = {
			publicKey,
			displayName,
			type: beapi.messenger.Conversation.Type.MultiMemberType,
			isOpen: false,
			link: `https://berty.tech/mock#group/${publicKey}/name=${displayName}`,
			unreadCount: faker.datatype.boolean() ? faker.datatype.number({ min: 0, max: 200 }) : 0,
			lastUpdate: Long.fromNumber(lastUpdate.getTime()),
			createdDate: Long.fromNumber(faker.date.past(1, lastUpdate).getTime()),
			accountMemberPublicKey: faker.datatype.uuid(),
		}
		return conv
	})

const genFakeContactConversations = ({
	contacts,
	accountMemberPublicKey,
	baseDate = Date.now(),
}: {
	contacts: beapi.messenger.IContact[]
	accountMemberPublicKey: beapi.messenger.IConversation['accountMemberPublicKey']
	baseDate?: number
}) => {
	return contacts.map(contact => {
		const createdDate = contact.createdDate
		if (!createdDate) {
			throw new Error('golden contact badly defined')
		}
		const lastUpdate = faker.date.between(createdDate.toNumber(), baseDate)
		const conv: beapi.messenger.IConversation = {
			publicKey: contact.conversationPublicKey,
			contactPublicKey: contact.publicKey,
			type: beapi.messenger.Conversation.Type.ContactType,
			isOpen: false,
			unreadCount: faker.datatype.boolean() ? faker.datatype.number({ min: 0, max: 200 }) : 0,
			lastUpdate: Long.fromNumber(lastUpdate.getTime()),
			createdDate: contact.createdDate,
			accountMemberPublicKey,
		}
		return conv
	})
}

const genFakeMembersMap = ({
	accountDisplayName,
	conversations,
}: {
	accountDisplayName: beapi.messenger.IMember['displayName']
	conversations: beapi.messenger.IConversation[]
}) =>
	conversations.reduce((members, conv) => {
		if (conv.type === beapi.messenger.Conversation.Type.MultiMemberType) {
			members[conv.publicKey || ''] = [
				{
					publicKey: conv.accountMemberPublicKey,
					displayName: accountDisplayName,
					conversationPublicKey: conv.publicKey,
					isMe: true,
				},
			]
			range(0, faker.datatype.number({ min: 0, max: 20 })).forEach(() => {
				members[conv.publicKey || ''].push({
					conversationPublicKey: conv.publicKey,
					publicKey: faker.datatype.uuid(),
					displayName: faker.name.findName(),
				})
			})
			return members
		}

		members[conv.publicKey || ''] = [
			{ publicKey: conv.accountMemberPublicKey, conversationPublicKey: conv.publicKey, isMe: true },
			{ publicKey: conv.contactPublicKey, conversationPublicKey: conv.publicKey },
		]
		return members
	}, {} as { [key: string]: beapi.messenger.IMember[] })

const genFakeInteractionsMap = ({
	conversations,
	contactsMap,
	membersMap,
	baseDate = Date.now(),
	maxPerConv = 200,
}: {
	conversations: beapi.messenger.IConversation[]
	contactsMap: { [key: string]: beapi.messenger.IContact }
	membersMap: { [key: string]: beapi.messenger.IMember[] }
	baseDate?: number
	maxPerConv?: number
}) =>
	conversations.reduce((intes, conv) => {
		intes[conv.publicKey || ''] = []

		if (conv.type === beapi.messenger.Conversation.Type.ContactType) {
			const contact = contactsMap[conv.contactPublicKey || '']
			if (contact.state !== beapi.messenger.Contact.State.Accepted) {
				return intes
			}
		}

		let lastSent = faker.date.recent(1, baseDate)

		range(0, faker.datatype.number({ min: 0, max: maxPerConv })).forEach(() => {
			const convMembers = membersMap[conv.publicKey || '']
			const member = convMembers[faker.datatype.number(convMembers.length - 1)]
			const isMine = member.publicKey === conv.accountMemberPublicKey
			const inte: beapi.messenger.IInteraction = {
				cid: faker.datatype.uuid(),
				conversationPublicKey: conv.publicKey,
				type: beapi.messenger.AppMessage.Type.TypeUserMessage,
				isMine,
				payload: beapi.messenger.AppMessage.UserMessage.encode({
					body: faker.lorem.paragraph(1),
				}).finish(),
				memberPublicKey: member.publicKey,
				sentDate: Long.fromNumber(lastSent.getTime()),
				acknowledged: faker.datatype.boolean(),
				reactions: range(0, faker.datatype.number({ min: 0, max: 5 }))
					.map(() => {
						const ownState = faker.datatype.boolean()
						const ownCount = ownState ? 1 : 0
						return {
							emoji: faker.internet.emoji(),
							ownState,
							count: Long.fromNumber(
								faker.datatype.number({ min: 0, max: convMembers.length - 1 }) + ownCount,
							),
						}
					})
					.filter(reaction => reaction.count.gt(0)),
			}
			lastSent = faker.date.recent(1, lastSent)
			intes[conv.publicKey || ''].push(inte)
		})

		intes[conv.publicKey || ''].sort(
			(a, b) => (b.sentDate?.toNumber() || 0) - (a.sentDate?.toNumber() || 0),
		)

		return intes
	}, {} as { [key: string]: beapi.messenger.IInteraction[] })

export const genFakeMessengerData = ({
	seed,
	baseDate = Date.now(),
	accountDisplayName,
}: {
	seed?: number
	baseDate?: number
	accountDisplayName?: string
}) => {
	if (seed !== undefined) {
		faker.seed(seed)
	}

	const account = genFakeAccount({ displayName: accountDisplayName })

	const accountMetadata: beapi.account.IAccountMetadata = {
		accountId: '0',
		name: account.displayName,
		publicKey: account.publicKey,
	}

	const contactsMap = genFakeContactsMap({ baseDate })

	const contacts = Object.values(contactsMap)

	const multiMemberConversations = genFakeMultiMemberConversations({ baseDate })

	const contactConversations = genFakeContactConversations({
		contacts,
		accountMemberPublicKey: account.publicKey,
		baseDate,
	})

	const conversations: beapi.messenger.IConversation[] = [
		...multiMemberConversations,
		...contactConversations,
	]

	const conversationsMap = conversations.reduce((convsMap, conv) => {
		convsMap[conv.publicKey || ''] = conv
		return convsMap
	}, {} as { [key: string]: beapi.messenger.IConversation })

	const membersMap = genFakeMembersMap({
		conversations,
		accountDisplayName: account.displayName,
	})

	const members = Object.values(membersMap).reduce(
		(allMembers, convMembers) => [...allMembers, ...convMembers],
		[],
	)

	const interactionsMap = genFakeInteractionsMap({
		baseDate,
		conversations,
		membersMap,
		contactsMap,
	})

	const interactions: beapi.messenger.IInteraction[] = []
	for (const convIntes of Object.values(interactionsMap)) {
		for (const inte of convIntes) {
			interactions.push(inte)
		}
	}

	return {
		account,
		accountMetadata,
		contacts,
		contactsMap,
		multiMemberConversations,
		contactConversations,
		conversations,
		conversationsMap,
		members,
		membersMap,
		interactions,
		interactionsMap,
	}
}
