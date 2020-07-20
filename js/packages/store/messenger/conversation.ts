import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, select, takeEvery, call } from 'redux-saga/effects'
import { berty } from '@berty-tech/api'
import {
	AppMessage,
	GroupInvitation,
	SetGroupName,
	AppMessageType,
	SetUserName,
} from './AppMessage'
import { makeDefaultCommandsSagas, strToBuf, bufToStr, jsonToBuf, bufToJSON } from '../utils'
import {
	commands as groupsCommands,
	transactions as groupsTransactions,
	queries as groupsQueries,
} from '../groups'
import {
	queries as contactQueries,
	events as contactEvents,
	Entity as ContactEntity,
	contactPkToGroupPk,
	ContactRequestMetadata,
} from './contact'
import { unaryChan } from '../sagaUtils'

import * as protocol from '../protocol'
import { account } from '.'

export enum ConversationKind {
	OneToOne = 'OneToOne',
	MultiMember = 'MultiMember',
	Self = 'Self',
}

type BaseConversation = {
	id: string
	title: string
	pk: string
	createdAt: number
	membersNames: { [key: string]: string }
	members: Array<number>
	messages: Array<string>
	unreadCount: number
	reading: boolean
	lastSentMessage?: string
	lastMessageDate?: number
	kind: ConversationKind | 'fake'
	shareableGroup?: string
}

export type FakeConversation = BaseConversation & {
	kind: 'fake'
}
export type OneToOneConversation = BaseConversation & {
	kind: ConversationKind.OneToOne
	contactId: string
}
export type MultiMemberConversation = BaseConversation & {
	kind: ConversationKind.MultiMember
}

export type Entity = FakeConversation | OneToOneConversation | MultiMemberConversation

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
		members: ContactEntity[]
		name: string
	}
	export type Join = {
		link: string
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
		title: string
		pk: string
		now: number
		shareableGroup?: string
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
		shareableGroup?: string
	}
	export type UserNameUpdated = {
		aggregateId: string
		userName: string
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
	join: SimpleCaseReducer<Command.Join>
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
	userNameUpdated: SimpleCaseReducer<Event.UserNameUpdated>
	messageAdded: SimpleCaseReducer<Event.MessageAdded>
	startRead: SimpleCaseReducer<Event.StartRead>
	stopRead: SimpleCaseReducer<Event.StopRead>
	appInit: SimpleCaseReducer<void>
}

export type Transactions = {
	[K in keyof CommandsReducer]: CommandsReducer[K] extends SimpleCaseReducer<infer TPayload>
		? (payload: TPayload) => Generator
		: never
} & {
	open: () => Generator
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
		join: (state) => state,
		delete: (state) => state,
		deleteAll: (state) => state,
		addMessage: (state) => state,
		startRead: (state) => state,
		stopRead: (state) => state,
	},
})

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
			const { pk, title, now, shareableGroup } = payload
			// Create id
			if (!state.aggregates[pk]) {
				const base = {
					id: pk,
					title,
					pk,
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
		title: fc.title,
		pk: id,
		kind: 'fake',
		createdAt: Date.now(),
		membersNames: {},
		members: [],
		messages: [id],
		unreadCount: 0,
		reading: false,
		shareableGroup: 'fake://fake',
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

		const setGroupName: SetGroupName = {
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

		const reply = (yield* protocol.client.transactions.shareableBertyGroup({
			groupPk: group.publicKey,
			groupName: name,
		})) as berty.messenger.v1.ShareableBertyGroup.IReply

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

		const a = (yield select((state) => account.queries.get(state))) as ReturnType<
			typeof account.queries.get
		>
		if (!a) {
			console.warn('no account')
			return
		}
		const groupInfo: any = yield call(protocol.transactions.client.groupInfo, {
			groupPk,
			contactPk: new Uint8Array(),
		})
		const setUserName: SetUserName = {
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

		const invitation: GroupInvitation = {
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
					// TODO: replace with appMessageSend
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
		const reply = (yield* protocol.client.transactions.parseDeepLink({
			link,
		})) as berty.messenger.v1.ParseDeepLink.IReply
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
			console.warn('Failed to join multi-member group:', e)
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
			const groupInfo = (yield* protocol.transactions.client.groupInfo({
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
				reply = (yield* protocol.client.transactions.shareableBertyGroup({
					groupPk: publicKey,
					groupName: 'Unknown',
				})) as berty.messenger.v1.ShareableBertyGroup.IReply | undefined
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
			const a = (yield select((state) => account.queries.get(state))) as ReturnType<
				typeof account.queries.get
			>
			if (!a) {
				console.warn('account not found')
				return
			}
			const groupInfo: any = yield call(protocol.transactions.client.groupInfo, {
				groupPk: publicKey,
				contactPk: new Uint8Array(),
			})
			const setUserName: SetUserName = {
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
			const event = payload.event as AppMessage
			if (!groupPk) {
				return
			}
			const id = bufToStr(groupPk)
			const conversation = (yield select((state) => queries.get(state, { id }))) as ReturnType<
				typeof queries.get
			>
			if (!conversation) {
				return
			}
			if (event && event.type === AppMessageType.SetGroupName) {
				let reply
				try {
					reply = (yield* protocol.client.transactions.shareableBertyGroup({
						groupPk,
						groupName: event.name,
					})) as berty.messenger.v1.ShareableBertyGroup.IReply | undefined
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
