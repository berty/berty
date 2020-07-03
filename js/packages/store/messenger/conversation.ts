import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, select, takeEvery, call } from 'redux-saga/effects'
import { berty } from '@berty-tech/api'
import { Buffer } from 'buffer'
import { AppMessage, GroupInvitation, SetGroupName, AppMessageType } from './AppMessage'
import { makeDefaultCommandsSagas, strToBuf, bufToStr, jsonToBuf, bufToJSON } from '../utils'
import {
	commands as groupsCommands,
	transactions as groupsTransactions,
	queries as groupsQueries,
} from '../groups'
import {
	queries as contactQueries,
	events as contactEvents,
	getAggregateId as getContactAggregateId,
	Entity as ContactEntity,
	ContactRequestMetadata,
} from './contact'

import * as protocol from '../protocol'

export enum ConversationKind {
	OneToOne = 'OneToOne',
	MultiMember = 'MultiMember',
	Self = 'Self',
}

type BaseConversation = {
	id: string
	accountId: string
	title: string
	pk: string
	createdAt: number
	membersDevices: { [key: string]: string[] | undefined }
	members: Array<number>
	messages: Array<string>
	unreadCount: number
	reading: boolean
	lastSentMessage?: string
	lastMessageDate?: number
	kind: ConversationKind | 'fake'
}

export type FakeConversation = BaseConversation & {
	kind: 'fake'
}
type OneToOneConversation = BaseConversation & {
	kind: ConversationKind.OneToOne
	contactId: string
}
type MultiMemberConversation = BaseConversation & {
	kind: ConversationKind.MultiMember
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
	messenger: {
		conversation: State
	}
}

export namespace Command {
	export type Generate = void
	export type Create = {
		accountId: string
		members: ContactEntity[]
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
	export type ListHuman = void // TODO: May not need
	export type Get = { id: string }
	export type GetLength = void
	export type SearchByTitle = { searchText: string }
}

export namespace Event {
	export type Deleted = { aggregateId: string }
	export type Created = {
		accountId: string
		title: string
		pk: string
		membersDevices?: { [key: string]: string[] | undefined }
		now: number
	} & (
		| {
				kind: ConversationKind.OneToOne
				contactId: string
		  }
		| { kind: ConversationKind.MultiMember }
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
	listHuman: (state: GlobalState, query: Query.ListHuman) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity | FakeConversation | undefined
	getLength: (state: GlobalState) => number
	searchByTitle: (state: GlobalState, query: Query.SearchByTitle) => Array<Entity>
	// putSearchForMessages here?
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
} & {
	open: (payload: { accountId: string }) => Generator
	createOneToOne: (payload: Event.Created) => Generator
}

const initialState: State = {
	events: [],
	aggregates: {},
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'messenger/conversation/command',
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
	name: 'messenger/conversation/event',
	initialState,
	reducers: {
		deleted: (state, { payload }) => {
			// Delete conversation
			delete state.aggregates[payload.aggregateId]
			return state
		},
		created: (state, { payload }) => {
			const { accountId, pk, title, membersDevices, now } = payload
			// Create id
			const id = getAggregateId({ accountId, groupPk: strToBuf(pk) })
			if (!state.aggregates[id]) {
				const base = {
					id,
					accountId,
					title,
					pk,
					createdAt: now,
					members: [],
					messages: [],
					membersDevices: membersDevices || {},
					unreadCount: 0,
					reading: false,
				}
				if (payload.kind === ConversationKind.OneToOne) {
					const oneToOne = { ...base, contactId: payload.contactId, kind: payload.kind }
					state.aggregates[id] = oneToOne
				} else if (payload.kind === ConversationKind.MultiMember) {
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
				const set = conversation.membersDevices[memberPk]
				if (!set) {
					conversation.membersDevices[memberPk] = [devicePk]
					return state
				}
				if (set.indexOf(devicePk) === -1) {
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
		...state.messenger.conversation.aggregates,
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
	listHuman: (state) =>
		Object.values(state.messenger.conversation.aggregates).filter(
			(conv) =>
				conv.kind === ConversationKind.OneToOne || conv.kind === ConversationKind.MultiMember,
		),
	get: (state, { id }) => getAggregatesWithFakes(state)[id],
	getLength: (state) => Object.keys(getAggregatesWithFakes(state)).length,
	searchByTitle: (state, { searchText }) =>
		Object.values(state.messenger.conversation.aggregates).filter((conv) =>
			searchText?.toLowerCase().includes(conv.title?.toLowerCase()),
		),
}

export const transactions: Transactions = {
	open: function* () {
		yield put(events.appInit())
	},
	generate: function* () {
		// TODO: conversation generate
	},
	create: function* ({ accountId, members, name }) {
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

		const group: berty.types.v1.IGroup = {
			groupType: berty.types.v1.GroupType.GroupTypeMultiMember,
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
	createOneToOne: function* (payload) {
		if (payload.kind !== ConversationKind.OneToOne) {
			return
		}
		const group = (yield select((state) =>
			groupsQueries.get(state, { groupId: payload.pk }),
		)) as ReturnType<typeof groupsQueries.get>
		if (group) {
			payload.membersDevices = group.membersDevices
			if (Object.keys(group.membersDevices).length > 1) {
				const contact = (yield select((state) =>
					contactQueries.get(state, { id: payload.contactId }),
				)) as ReturnType<typeof contactQueries.get>
				if (contact && !contact.request.accepted) {
					yield put(contactEvents.requestAccepted({ id: contact.id }))
				}
				//
			}
		}

		yield put(events.created(payload))
	},
	delete: function* ({ id }) {
		const conv = (yield select((state) => queries.get(state, { id }))) as ReturnType<
			typeof queries.get
		>
		if (!conv) {
			return
		}
		yield call(groupsTransactions.unsubscribe, {
			clientId: conv.accountId,
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
		const conversations = (yield select(queries.list)) as Entity[]
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
}

function* contactPkToGroupPk({
	accountId,
	contactPk,
}: {
	accountId: string
	contactPk: string | Uint8Array
}) {
	try {
		const groupInfo = (yield call(protocol.transactions.client.groupInfo, {
			id: accountId,
			contactPk: typeof contactPk === 'string' ? strToBuf(contactPk) : contactPk,
			groupPk: new Uint8Array(),
		})) as berty.types.v1.GroupInfo.IReply
		const { group } = groupInfo
		if (!group) {
			return
		}
		const { publicKey: groupPk } = group
		return groupPk || undefined
	} catch (e) {}
}

export function* orchestrator() {
	yield all([
		...makeDefaultCommandsSagas(commands, transactions),
		// Events
		takeEvery(protocol.events.client.accountContactRequestIncomingAccepted, function* ({
			payload,
		}) {
			const {
				aggregateId: accountId,
				event: { contactPk, groupPk },
			} = payload
			// Recup the request (for requester name)
			const request = (yield select((state) =>
				contactQueries.getWithId(state, { contactPk, accountId }),
			)) as ContactEntity | undefined
			if (!request) {
				return
			}
			let realGroupPk: Uint8Array | undefined = groupPk
			const groupPkStr = bufToStr(groupPk)
			if (!groupPkStr) {
				console.log('groupPk not provided in AccountContactRequestIncomingAccepted')
				realGroupPk = yield* contactPkToGroupPk({ accountId, contactPk })
			}
			if (!realGroupPk) {
				throw new Error("Can't find groupPk for accepted contact request")
			}
			yield call(transactions.createOneToOne, {
				accountId,
				title: request.name,
				pk: bufToStr(realGroupPk),
				kind: ConversationKind.OneToOne,
				contactId: getContactAggregateId({ accountId, contactPk }),
				now: Date.now(),
			})
		}),
		takeEvery(protocol.events.client.accountContactRequestOutgoingEnqueued, function* ({
			payload,
		}) {
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
			} as any)) as berty.types.v1.GroupInfo.IReply
			const { group } = groupInfo
			if (!group) {
				return
			}
			const { publicKey: groupPk } = group
			if (!groupPk) {
				return
			}
			const groupPkStr = bufToStr(groupPk)
			const metadata: ContactRequestMetadata = bufToJSON(c.metadata)
			yield call(transactions.createOneToOne, {
				accountId,
				title: metadata.name,
				pk: groupPkStr,
				kind: ConversationKind.OneToOne,
				contactId: getContactAggregateId({ accountId, contactPk: c.pk }),
				now: Date.now(),
			})
		}),
		takeEvery(protocol.events.client.groupMemberDeviceAdded, function* ({ payload }) {
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
		takeEvery(protocol.events.client.accountGroupJoined, function* ({ payload }) {
			const {
				aggregateId: accountId,
				event: { group },
			} = payload
			const { publicKey, groupType } = group
			if (groupType !== berty.types.v1.GroupType.GroupTypeMultiMember) {
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
					kind: ConversationKind.MultiMember,
					now: Date.now(),
				}),
			)
			yield call(protocol.client.transactions.activateGroup, { id: accountId, groupPk: publicKey })
			yield put(
				groupsCommands.subscribe({
					clientId: accountId,
					publicKey: bufToStr(publicKey),
					messages: true,
					metadata: true,
				}),
			)
		}),
		takeEvery(protocol.events.client.groupMetadataPayloadSent, function* ({ payload }) {
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
