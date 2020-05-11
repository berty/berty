import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, select, takeEvery } from 'redux-saga/effects'
import { berty } from '@berty-tech/api'
import { Buffer } from 'buffer'
import { AppMessage, GroupInvitation, SetGroupName, AppMessageType } from './AppMessage'
import { makeDefaultCommandsSagas, strToBuf, bufToStr, jsonToBuf, bufToJSON } from '../utils'

import * as protocol from '../protocol'
import { contact } from '../chat'

type BaseConversation = {
	id: string
	accountId: string
	title: string
	pk: string
	createdAt: number
	membersDevices: { [key: string]: string[] }
	members: Array<number>
	messages: Array<string>
	unreadCount: number
	reading: boolean
	lastSentMessage?: string
	lastMessageDate?: number
	kind: berty.chatmodel.Conversation.Kind | 'fake'
}

type FakeConversation = BaseConversation & {
	kind: 'fake'
}
type OneToOneConversation = BaseConversation & {
	kind: berty.chatmodel.Conversation.Kind.OneToOne
	contactId: string
}
type MultiMemberConversation = BaseConversation & {
	kind: berty.chatmodel.Conversation.Kind.PrivateGroup
}

export type Entity = FakeConversation | OneToOneConversation | MultiMemberConversation

export type Event = {
	id: string
	version: number
	aggregateId: string
}

export type State = {
	events: Array<Event>
	aggregates: { [key: string]: Entity }
}

export type GlobalState = {
	chat: {
		conversation: State
	}
}

export namespace Command {
	export type Generate = void
	export type Create = {
		accountId: string
		members: contact.Entity[]
		name: string
	}
	export type Delete = { id: string }
	export type DeleteAll = void
	export type AddMessage = { aggregateId: string; messageId: string; isMe: boolean }
	export type StartRead = string
	export type StopRead = string
}

export namespace Query {
	export type List = void
	export type Get = { id: string }
	export type GetLength = void
}

export namespace Event {
	export type Deleted = { aggregateId: string }
	export type Created = {
		accountId: string
		title: string
		pk: string
	} & (
		| {
				kind: berty.chatmodel.Conversation.Kind.OneToOne
				contactId: string
		  }
		| { kind: berty.chatmodel.Conversation.Kind.PrivateGroup }
	)
	export type NameUpdated = {
		aggregateId: string
		name: string
	}
	export type DeviceAdded = {
		accountId: string
		groupPk: string
		devicePk: string
		memberPk: string
	}
	export type MessageAdded = {
		aggregateId: string
		messageId: string
		isMe: boolean
		lastMessageDate: number
	}
	export type StartRead = string
	export type StopRead = string
}

type SimpleCaseReducer<P> = CaseReducer<State, PayloadAction<P>>

export type CommandsReducer = {
	generate: SimpleCaseReducer<Command.Generate>
	create: SimpleCaseReducer<Command.Create>
	delete: SimpleCaseReducer<Command.Delete>
	deleteAll: SimpleCaseReducer<Command.DeleteAll>
	addMessage: SimpleCaseReducer<Command.AddMessage>
	startRead: SimpleCaseReducer<Command.StartRead>
	stopRead: SimpleCaseReducer<Command.StopRead>
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity | FakeConversation>
	get: (state: GlobalState, query: Query.Get) => Entity | FakeConversation | undefined
	getLength: (state: GlobalState) => number
}

export type EventsReducer = {
	created: SimpleCaseReducer<Event.Created>
	deleted: SimpleCaseReducer<Event.Deleted>
	nameUpdated: SimpleCaseReducer<Event.NameUpdated>
	messageAdded: SimpleCaseReducer<Event.MessageAdded>
	deviceAdded: SimpleCaseReducer<Event.DeviceAdded>
	startRead: SimpleCaseReducer<Event.StartRead>
	stopRead: SimpleCaseReducer<Event.StopRead>
	appInit: SimpleCaseReducer<void>
}

export type Transactions = {
	[K in keyof CommandsReducer]: CommandsReducer[K] extends SimpleCaseReducer<infer TPayload>
		? (payload: TPayload) => Generator
		: never
} & { open: (payload: { accountId: string }) => Generator }

const initialState: State = {
	events: [],
	aggregates: {},
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'chat/conversation/command',
	initialState,
	reducers: {
		generate: (state) => state,
		create: (state) => state,
		delete: (state) => state,
		deleteAll: (state) => state,
		addMessage: (state) => state,
		startRead: (state) => state,
		stopRead: (state) => state,
	},
})

export const getAggregateId: (kwargs: {
	accountId: string
	groupPk: string | Uint8Array
}) => string = ({ accountId, groupPk }) =>
	bufToStr(
		Buffer.concat([
			Buffer.from(accountId, 'utf-8'),
			typeof groupPk === 'string' ? strToBuf(groupPk) : Buffer.from(groupPk),
		]),
	)

const eventHandler = createSlice<State, EventsReducer>({
	name: 'chat/conversation/event',
	initialState,
	reducers: {
		deleted: (state, { payload }) => {
			// Delete conversation
			delete state.aggregates[payload.aggregateId]
			return state
		},
		created: (state, { payload }) => {
			const { accountId, pk, title } = payload
			// Create id
			const id = getAggregateId({ accountId, groupPk: strToBuf(pk) })
			if (!state.aggregates[id]) {
				const base = {
					id,
					accountId,
					title,
					pk,
					createdAt: Date.now(),
					members: [],
					messages: [],
					membersDevices: {},
					unreadCount: 0,
					reading: false,
				}
				if (payload.kind === berty.chatmodel.Conversation.Kind.OneToOne) {
					const oneToOne = { ...base, contactId: payload.contactId, kind: payload.kind }
					state.aggregates[id] = oneToOne
				} else if (payload.kind === berty.chatmodel.Conversation.Kind.PrivateGroup) {
					state.aggregates[id] = { ...base, kind: payload.kind }
				}
			}
			return state
		},
		nameUpdated: (state, { payload }) => {
			const { aggregateId, name } = payload
			if (state.aggregates[aggregateId]) {
				state.aggregates[aggregateId].title = name
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
		deviceAdded: (state, { payload }) => {
			const { accountId, groupPk, devicePk, memberPk } = payload

			const aggregateId = getAggregateId({ accountId, groupPk: strToBuf(groupPk) })
			const conversation = state.aggregates[aggregateId]

			if (conversation) {
				if (!conversation.membersDevices[memberPk]) {
					conversation.membersDevices[memberPk] = []
				}

				const set = conversation.membersDevices[memberPk]
				if (!set.includes(devicePk)) {
					set.push(devicePk)
				}
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

type FakeConfig = {
	title: string
}

const FAKE_CONVERSATIONS_CONFIG: FakeConfig[] = [
	{ title: 'Berty Crew' },
	{ title: 'Snowlair' },
	{ title: 'Tromp' },
	{ title: 'Alice Yakeys' },
]

const FAKE_CONVERSATIONS: Entity[] = FAKE_CONVERSATIONS_CONFIG.map((fc, index) => {
	const id = `fake_${index}`
	return {
		id: id,
		accountId: 'fake',
		title: fc.title,
		pk: id,
		kind: 'fake',
		createdAt: Date.now(),
		membersDevices: {},
		members: [],
		messages: [id],
		unreadCount: 0,
		reading: false,
	}
})

export const getAggregatesWithFakes = (state: GlobalState) => {
	const result: { [key: string]: Entity | FakeConversation } = {
		...state.chat.conversation.aggregates,
	}
	for (let i = 0; i < FAKE_CONVERSATIONS.length; i++) {
		const conv = FAKE_CONVERSATIONS[i]
		result[conv.id] = conv
	}
	return result
}

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(getAggregatesWithFakes(state)),
	get: (state, { id }) => getAggregatesWithFakes(state)[id],
	getLength: (state) => Object.keys(getAggregatesWithFakes(state)).length,
}

export const transactions: Transactions = {
	open: function*({ accountId }) {
		const conversations = (yield select((state) => queries.list(state))) as Entity[]
		yield put(events.appInit())
		const multiMemberConversationsOfAccount = conversations.filter(
			(conversation) =>
				conversation.accountId === accountId &&
				conversation.kind === berty.chatmodel.Conversation.Kind.PrivateGroup,
		)
		for (const { pk } of multiMemberConversationsOfAccount) {
			if (pk) {
				const gpkb = strToBuf(pk)
				yield* protocol.client.transactions.activateGroup({
					id: accountId,
					groupPk: gpkb,
				})
				yield* protocol.transactions.client.listenToGroup({
					clientId: accountId,
					groupPk: gpkb,
				})
			}
		}
	},
	generate: function*() {
		// TODO: conversation generate
	},
	create: function*({ accountId, members, name }) {
		const { groupPk } = (yield* protocol.client.transactions.multiMemberGroupCreate({
			id: accountId,
		})) as {
			groupPk: Uint8Array
		}
		const groupPkStr = bufToStr(groupPk)

		const setGroupName: SetGroupName = {
			type: AppMessageType.SetGroupName,
			name,
		}
		yield* protocol.client.transactions.appMetadataSend({
			id: accountId,
			groupPk,
			payload: jsonToBuf(setGroupName),
		})

		const group: berty.types.IGroup = {
			groupType: berty.types.GroupType.GroupTypeMultiMember,
			publicKey: groupPk,
		}
		yield* protocol.client.transactions.multiMemberGroupJoin({ id: accountId, group })

		const invitation: GroupInvitation = {
			type: AppMessageType.GroupInvitation,
			groupPk: groupPkStr,
		}
		for (const member of members) {
			const oneToOnePk = member.groupPk
			if (oneToOnePk) {
				yield* protocol.client.transactions.appMetadataSend({
					// TODO: replace with appMessageSend
					id: accountId,
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
	delete: function*({ id }) {
		yield put(
			events.deleted({
				aggregateId: id,
			}),
		)
	},
	deleteAll: function*() {
		// Recup conversations
		const conversations = (yield select(queries.list)) as Entity[]
		// Delete conversations
		for (const conversation of conversations) {
			yield* transactions.delete({ id: conversation.id })
		}
	},
	addMessage: function*({ aggregateId, messageId, isMe }) {
		yield put(
			events.messageAdded({
				aggregateId,
				messageId,
				isMe,
				lastMessageDate: Date.now(),
			}),
		)
	},
	startRead: function*(id) {
		yield put(events.startRead(id))
	},
	stopRead: function*(id) {
		yield put(events.stopRead(id))
	},
}

export function* orchestrator() {
	yield all([
		...makeDefaultCommandsSagas(commands, transactions),
		// Events
		takeEvery(protocol.events.client.accountContactRequestIncomingAccepted, function*({ payload }) {
			const {
				aggregateId: accountId,
				event: { contactPk, groupPk },
			} = payload
			// Recup the request (for requester name)
			const request = (yield select((state) =>
				contact.queries.getWithId(state, { contactPk, accountId }),
			)) as contact.Entity | undefined
			if (!request) {
				return
			}
			yield put(
				events.created({
					accountId,
					title: request.name,
					pk: bufToStr(groupPk),
					kind: berty.chatmodel.Conversation.Kind.OneToOne,
					contactId: contact.getAggregateId({ accountId, contactPk }),
				}),
			)
		}),
		takeEvery(protocol.events.client.accountContactRequestOutgoingEnqueued, function*({ payload }) {
			const {
				aggregateId: accountId,
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
			const groupInfo = (yield* protocol.transactions.client.groupInfo({
				id: payload.aggregateId,
				contactPk,
			} as any)) as berty.types.GroupInfo.IReply
			const { group } = groupInfo
			if (!group) {
				return
			}
			const { publicKey: groupPk } = group
			if (!groupPk) {
				return
			}
			yield* protocol.transactions.client.activateGroup({
				id: payload.aggregateId,
				groupPk,
			})
			const groupPkStr = bufToStr(groupPk)
			const metadata: contact.ContactRequestMetadata = bufToJSON(c.metadata)
			yield put(
				events.created({
					accountId,
					title: metadata.givenName,
					pk: groupPkStr,
					kind: berty.chatmodel.Conversation.Kind.OneToOne,
					contactId: contact.getAggregateId({ accountId, contactPk: c.pk }),
				}),
			)
		}),
		takeEvery(protocol.events.client.groupMemberDeviceAdded, function*({ payload }) {
			// todo: move to extra reducers
			const {
				aggregateId: accountId,
				eventContext: { groupPk },
				event: { memberPk, devicePk },
			} = payload
			if (!groupPk) {
				return
			}
			yield put(
				events.deviceAdded({
					accountId,
					groupPk: bufToStr(groupPk),
					memberPk: bufToStr(memberPk),
					devicePk: bufToStr(devicePk),
				}),
			)
		}),
		takeEvery(protocol.events.client.accountGroupJoined, function*({ payload }) {
			const {
				aggregateId: accountId,
				event: { group },
			} = payload
			const { publicKey, groupType } = group
			if (groupType !== berty.types.GroupType.GroupTypeMultiMember) {
				return
			}
			if (!publicKey) {
				throw new Error('Invalid public key')
			}
			yield put(
				events.created({
					accountId,
					title: 'Unknown',
					pk: bufToStr(publicKey),
					kind: berty.chatmodel.Conversation.Kind.PrivateGroup,
				}),
			)
			yield* protocol.transactions.client.listenToGroup({ clientId: accountId, groupPk: publicKey })
		}),
		takeEvery(protocol.events.client.groupMetadataPayloadSent, function*({ payload }) {
			const {
				aggregateId: accountId,
				eventContext: { groupPk },
			} = payload
			const event = payload.event as AppMessage
			if (event.type === AppMessageType.SetGroupName) {
				if (!groupPk) {
					return
				}
				const id = getAggregateId({ accountId, groupPk })
				const conversation = (yield select((state) => queries.get(state, { id }))) as
					| Entity
					| undefined
				if (!conversation) {
					return
				}
				yield put(events.nameUpdated({ aggregateId: id, name: event.name }))
			}
		}),
	])
}
