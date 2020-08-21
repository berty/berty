import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, select, takeEvery, call } from 'redux-saga/effects'
import { berty } from '@berty-tech/api'
import {
	makeDefaultCommandsSagas,
	strToBuf,
	bufToStr,
	jsonToBuf,
	bufToJSON,
	unaryChan,
	createCommands,
} from '../utils'
import {
	commands as groupsCommands,
	transactions as groupsTransactions,
	queries as groupsQueries,
} from '../groups'
import { queries as contactQueries, events as contactEvents, contactPkToGroupPk } from './contact'
import { AppMessageType } from './AppMessage'
import { messenger } from '@berty-tech/store'
import * as faker from '../../components/faker'

import * as protocol from '../protocol'
import { account } from '.'

export const ConversationKind = {
	OneToOne: 'OneToOne',
	MultiMember: 'MultiMember',
	Self: 'Self',
}

const initialState = {
	events: [],
	aggregates: {},
}

const commandsSlice = createCommands('messenger/conversation/command', initialState, [
	'generate',
	'generateMsg',
	'create',
	'join',
	'delete',
	'deleteFake',
	'deleteAll',
	'addMessage',
	'startRead',
	'stopRead',
	'acceptGroupInvitation',
])

const eventHandler = createSlice({
	name: 'messenger/conversation/event',
	initialState,
	reducers: {
		deleted: (state, { payload }) => {
			// Delete conversation
			delete state.aggregates[payload.aggregateId]
			return state
		},
		deletedFake: (state) => {
			for (const conv of Object.values(state.aggregates)) {
				if (conv.fake) {
					delete state.aggregates[conv.id]
				}
			}
			return state
		},
		generated: (state, { payload }) => {
			const { convs } = payload
			for (const conv of convs) {
				state.aggregates[conv.id] = conv
			}
			return state
		},
		generatedMsg: (state, { payload }) => {
			const { msgs } = payload
			for (const msg of msgs) {
				state.aggregates[payload.id].messages.push(msg.id)
			}
			return state
		},
		created: (state, { payload }) => {
			const { pk, title, now, shareableGroup } = payload
			// Create id
			if (!state.aggregates[pk]) {
				const base = {
					id: pk,
					title,
					pk,
					fake: false,
					shareableGroup,
					createdAt: now,
					members: [],
					messages: [],
					membersNames: {},
					unreadCount: 0,
					reading: false,
				}
				if (payload.kind === ConversationKind.OneToOne) {
					const oneToOne = { ...base, contactId: payload.contactId, kind: payload.kind }
					state.aggregates[pk] = oneToOne
				} else if (payload.kind === ConversationKind.MultiMember) {
					state.aggregates[pk] = { ...base, kind: payload.kind }
				}
			} else {
				const conv = state.aggregates[pk]
				if (shareableGroup) {
					conv.shareableGroup = shareableGroup
				}
				if (title && title !== 'Unknown') {
					conv.title = title
				}
			}
			return state
		},
		nameUpdated: (state, { payload }) => {
			const { aggregateId, name } = payload
			if (state.aggregates[aggregateId]) {
				state.aggregates[aggregateId].title = name
				if (payload.shareableGroup) {
					state.aggregates[aggregateId].shareableGroup = payload.shareableGroup
				}
			}
			return state
		},
		userNameUpdated: (state, { payload }) => {
			const { aggregateId, userName, memberPk } = payload
			const conversation = state.aggregates[aggregateId]
			if (conversation) {
				if (!conversation.membersNames[memberPk]) {
					conversation.membersNames[memberPk] = userName
				}
			}
			return state
		},
		messageAdded: (state, { payload }) => {
			const conv = state.aggregates[payload.aggregateId]
			if (conv) {
				if (!conv.messages) {
					conv.messages = []
				}
				conv.messages.push(payload.messageId)
				if (payload.isMe) {
					conv.lastSentMessage = payload.messageId
				} else if (!conv.reading) {
					conv.unreadCount += 1
				}
				conv.lastMessageDate = payload.lastMessageDate
			}
			return state
		},
		startRead: (state, { payload: id }) => {
			const conv = state.aggregates[id]
			if (conv) {
				conv.unreadCount = 0
				conv.reading = true
			}
			return state
		},
		stopRead: (state, { payload: id }) => {
			const conv = state.aggregates[id]
			if (conv) {
				conv.reading = false
			}
			return state
		},
		appInit: (state) => {
			for (const conv of Object.values(state.aggregates)) {
				conv.reading = false
			}
			return state
		},
	},
})

export const getAggregates = (state) => {
	const result = {
		...state.messenger.conversation.aggregates,
	}
	return result
}

export const reducer = composeReducers(commandsSlice.reducer, eventHandler.reducer)
export const commands = commandsSlice.actions
export const events = eventHandler.actions
export const queries = {
	list: (state) => Object.values(getAggregates(state)),
	listHuman: (state) =>
		Object.values(state.messenger.conversation.aggregates).filter(
			(conv) =>
				conv.kind === ConversationKind.OneToOne || conv.kind === ConversationKind.MultiMember,
		),
	get: (state, { id }) => getAggregates(state)[id],
	getLength: (state) => Object.keys(getAggregates(state)).length,
	getFakeLength: (state) => queries.list(state).filter((conv) => conv.fake).length,
	searchByTitle: (state, { searchText }) =>
		Object.values(state.messenger.conversation.aggregates).filter((conv) =>
			searchText?.toLowerCase().includes(conv.title?.toLowerCase()),
		),
}

export const transactions = {
	open: function* () {
		yield put(events.appInit())
	},
	deleteFake: function* () {
		yield* messenger.contact.transactions.deleteFake()
		yield* messenger.message.transactions.deleteFake()
		yield put(events.deletedFake())
	},
	generate: function* ({ length }) {
		const contacts = yield* messenger.contact.transactions.generate({ length })
		const index = yield select((state) => queries.getFakeLength(state))
		const convs = faker.fakeConversations(length, index)
		for (const conv of convs) {
			const contact = contacts.find((c) => conv.id === c.id)
			conv.membersNames = {
				...conv.membersNames,
				[contact.id]: contact.name,
			}
			conv.contactId = contact.id
			conv.title = contact.name
			conv.pk = contact.publicKey
			conv.messages = []
			const messages = yield* messenger.message.transactions.generate({ length: 10 })
			for (const msg of messages) {
				conv.messages.push(msg.id)
			}
			conv.lastMessageDate = messages[messages.length - 1].sentDate
		}
		yield put(
			events.generated({
				convs,
			}),
		)
		return convs
	},
	generateMsg: function* ({ length }) {
		const convs = yield select((state) => queries.list(state))
		for (const conv of convs) {
			if (conv.fake) {
				const msgs = yield* messenger.message.transactions.generate({ length })
				yield put(events.generatedMsg({ msgs, id: conv.id }))
			}
		}
	},
	create: function* ({ members, name }) {
		console.log('creat/conv', members, name)

		const createReply = yield* unaryChan(
			protocol.client.getProtocolService().multiMemberGroupCreate,
		)
		const { groupPk } = createReply
		if (!groupPk) {
			console.error('failed to create multimembergroup, no groupPk in reply')
			return
		}
		console.log('creat/conv groupPk', groupPk)
		const groupPkStr = bufToStr(groupPk)

		console.log('creat/conv after app metadata send')

		console.log('creating group invitation')

		const rep = yield* unaryChan(
			protocol.client.getProtocolService().multiMemberGroupInvitationCreate,
			{ groupPk },
		)

		const { group } = rep

		if (!group) {
			console.error('no group in invitationCreate reply')
			return
		}

		console.log('created invitation')

		if (
			!(
				group.publicKey &&
				group.secret &&
				group.secretSig &&
				group.groupType === berty.types.v1.GroupType.GroupTypeMultiMember
			)
		) {
			console.error('malformed group in invitationCreate reply')
			return
		}

		console.log('setting group name')

		const setGroupName = {
			type: AppMessageType.SetGroupName,
			name,
		}
		yield* protocol.client.transactions.appMetadataSend({
			groupPk,
			payload: jsonToBuf(setGroupName),
		})

		console.log('subscribing')

		yield put(
			groupsCommands.subscribe({
				publicKey: groupPkStr,
				metadata: true,
				messages: true,
			}),
		)

		console.log('geting link')

		// get shareable group

		const reply = yield* protocol.client.transactions.shareableBertyGroup({
			groupPk: group.publicKey,
			groupName: name,
		})

		console.log('puting created event')

		yield put(
			events.created({
				kind: ConversationKind.MultiMember,
				title: name,
				pk: groupPkStr,
				now: Date.now(),
				shareableGroup: reply.deepLink || undefined,
			}),
		)

		const a = yield select((state) => account.queries.get(state))
		if (!a) {
			console.warn('no account')
			return
		}
		const groupInfo = yield call(protocol.transactions.client.groupInfo, {
			groupPk,
			contactPk: new Uint8Array(),
		})
		const setUserName = {
			type: AppMessageType.SetUserName,
			userName: a.name,
			memberPk: bufToStr(groupInfo.memberPk),
		}
		yield* protocol.client.transactions.appMetadataSend({
			groupPk,
			payload: jsonToBuf(setUserName),
		})

		console.log('creat/conv after multiMemberGroupJoin')

		console.log('invitation: ', rep)

		const invitation = {
			type: AppMessageType.GroupInvitation,
			name,
			group: {
				publicKey: groupPkStr,
				secret: bufToStr(group.secret),
				secretSig: bufToStr(group.secretSig),
				groupType: group.groupType,
			},
		}
		console.log('before invitations', members)
		for (const member of members) {
			let oneToOnePk = member.groupPk
			if (!oneToOnePk) {
				const pkbuf = yield* contactPkToGroupPk({ contactPk: member.publicKey })
				oneToOnePk = pkbuf && bufToStr(pkbuf)
			}
			console.log('after create oneToOnePk', oneToOnePk)
			if (oneToOnePk) {
				yield* protocol.client.transactions.appMessageSend({
					groupPk: strToBuf(oneToOnePk),
					payload: jsonToBuf(invitation),
				})
			} else {
				console.warn(
					'Tried to send a multimember group invitation to a contact without an established 1to1',
				)
			}
		}
	},
	join: function* ({ link }) {
		const reply = yield* protocol.client.transactions.parseDeepLink({
			link,
		})
		try {
			if (
				!(
					reply &&
					reply.kind === berty.messenger.v1.ParseDeepLink.Kind.BertyGroup &&
					reply.bertyGroup?.group &&
					reply.bertyGroup.displayName &&
					reply.bertyGroup.group.publicKey
				)
			) {
				throw new Error('Invalid link')
			}
			yield put(
				events.created({
					kind: ConversationKind.MultiMember,
					title: reply.bertyGroup.displayName,
					pk: bufToStr(reply.bertyGroup.group.publicKey),
					now: Date.now(),
				}),
			)
			yield* protocol.client.transactions.multiMemberGroupJoin({
				group: reply.bertyGroup?.group,
			})
		} catch (e) {
			console.warn(e.toString())
			throw new Error('Error joining group. Are you already a member?')
		}
	},
	createOneToOne: function* (payload) {
		if (payload.kind !== ConversationKind.OneToOne) {
			return
		}
		const group = yield select((state) => groupsQueries.get(state, { groupId: payload.pk }))
		if (group) {
			if (Object.keys(group.membersDevices).length > 1) {
				const contact = yield select((state) =>
					contactQueries.get(state, { id: payload.contactId }),
				)
				if (contact && !contact.request.accepted) {
					yield put(contactEvents.requestAccepted({ id: contact.id }))
				}
				//
			}
		}

		yield put(events.created(payload))
	},
	delete: function* ({ id }) {
		const conv = yield select((state) => queries.get(state, { id }))
		if (!conv) {
			return
		}
		yield call(groupsTransactions.unsubscribe, {
			publicKey: conv.pk,
			metadata: true,
			messages: true,
		})
		yield put(
			events.deleted({
				aggregateId: id,
			}),
		)
	},
	deleteAll: function* () {
		// Recup conversations
		const conversations = yield select(queries.list)
		// Delete conversations
		for (const conversation of conversations) {
			yield* transactions.delete({ id: conversation.id })
		}
	},
	addMessage: function* ({ aggregateId, messageId, isMe }) {
		yield put(
			events.messageAdded({
				aggregateId,
				messageId,
				isMe,
				lastMessageDate: Date.now(),
			}),
		)
	},
	startRead: function* (id) {
		yield put(events.startRead(id))
	},
	stopRead: function* (id) {
		yield put(events.stopRead(id))
	},
	acceptGroupInvitation: function* (payload) {
		console.log('got groupMetadataPayloadSent')
		if (!payload.message) {
			return
		}
		const event = payload.message // <--- Not secure
		if (
			event &&
			event.type === AppMessageType.GroupInvitation &&
			event.group.groupType === berty.types.v1.GroupType.GroupTypeMultiMember
		) {
			console.log('found group invitation')

			const group = {
				publicKey: strToBuf(event.group.publicKey),
				secret: strToBuf(event.group.secret),
				secretSig: strToBuf(event.group.secretSig),
				groupType: berty.types.v1.GroupType.GroupTypeMultiMember,
			}

			yield put(
				messenger.conversation.events.created({
					kind: ConversationKind.MultiMember,
					title: event.name,
					pk: event.group.publicKey,
					now: Date.now(),
				}),
			)

			try {
				yield* protocol.client.transactions.multiMemberGroupJoin({ group })
			} catch (e) {
				console.warn('Failed to join multi-member group:', e)
			}

			yield put(
				groupsCommands.subscribe({
					publicKey: event.group.publicKey,
					metadata: true,
					messages: true,
				}),
			)
		}
	},
}

export function* orchestrator() {
	yield all([
		...makeDefaultCommandsSagas(commands, transactions),
		takeEvery(protocol.events.client.accountContactRequestOutgoingEnqueued, function* ({
			payload,
		}) {
			const {
				event: { contact: c },
			} = payload
			// Recup metadata
			if (!c || !c.metadata || !c.pk) {
				throw new Error('Invalid contact')
			}
			const contactPk = payload.event.contact.pk
			if (!contactPk) {
				return
			}
			const groupInfo = yield* protocol.transactions.client.groupInfo({
				contactPk,
			})
			const { group } = groupInfo
			if (!group) {
				return
			}
			const { publicKey: groupPk } = group
			if (!groupPk) {
				return
			}
			const groupPkStr = bufToStr(groupPk)
			const metadata = bufToJSON(c.metadata)
			yield call(transactions.createOneToOne, {
				title: metadata.name,
				pk: groupPkStr,
				kind: ConversationKind.OneToOne,
				contactId: bufToStr(c.pk),
				now: Date.now(),
			})
		}),
		takeEvery(protocol.events.client.accountGroupJoined, function* ({ payload }) {
			const {
				event: { group },
				eventContext: { groupPk },
			} = payload
			const { publicKey, groupType } = group
			if (groupType !== berty.types.v1.GroupType.GroupTypeMultiMember || !groupPk) {
				return
			}
			if (!publicKey) {
				throw new Error('Invalid public key')
			}
			yield call(protocol.client.transactions.activateGroup, { groupPk: publicKey })
			let reply
			try {
				reply = yield* protocol.client.transactions.shareableBertyGroup({
					groupPk: publicKey,
					groupName: 'Unknown',
				})
			} catch (e) {
				console.warn('Failed to get deep link for group')
			}
			yield put(
				events.created({
					title: 'Unknown',
					pk: bufToStr(publicKey),
					kind: ConversationKind.MultiMember,
					now: Date.now(),
					shareableGroup: reply?.deepLink || undefined,
				}),
			)
			yield put(
				groupsCommands.subscribe({
					publicKey: bufToStr(publicKey),
					messages: true,
					metadata: true,
				}),
			)
			const a = yield select((state) => account.queries.get(state))
			if (!a) {
				console.warn('account not found')
				return
			}
			const groupInfo = yield call(protocol.transactions.client.groupInfo, {
				groupPk: publicKey,
				contactPk: new Uint8Array(),
			})
			const setUserName = {
				type: AppMessageType.SetUserName,
				userName: a.name,
				memberPk: bufToStr(groupInfo.memberPk),
			}
			yield* protocol.client.transactions.appMetadataSend({
				groupPk: publicKey,
				payload: jsonToBuf(setUserName),
			})
		}),
		takeEvery(protocol.events.client.groupMetadataPayloadSent, function* ({ payload }) {
			const {
				eventContext: { groupPk },
			} = payload
			const event = payload.event
			if (!groupPk) {
				return
			}
			const id = bufToStr(groupPk)
			const conversation = yield select((state) => queries.get(state, { id }))
			if (!conversation) {
				return
			}
			if (event && event.type === AppMessageType.SetGroupName) {
				let reply
				try {
					reply = yield* protocol.client.transactions.shareableBertyGroup({
						groupPk,
						groupName: event.name,
					})
				} catch (e) {
					console.warn('Failed to get deep link for group')
				}
				yield put(
					events.nameUpdated({
						aggregateId: id,
						name: event.name,
						shareableGroup: reply?.deepLink || undefined,
					}),
				)
			}
			if (event && event.type === AppMessageType.SetUserName) {
				yield put(
					events.userNameUpdated({
						aggregateId: id,
						userName: event.userName,
						memberPk: event.memberPk,
					}),
				)
			}
		}),
	])
}
