import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, select, takeEvery, put, call } from 'redux-saga/effects'
import * as protocol from '../protocol'
import { berty } from '@berty-tech/api'
import { Buffer } from 'buffer'
import { AppMessage, AppMessageType } from './AppMessage'
import { makeDefaultCommandsSagas, strToBuf, bufToStr, bufToJSON } from '../utils'
import { commands as groupsCommands } from '../groups'
import { events as conversationEvents, ConversationKind } from './conversation'

export enum ContactRequestType {
	Incoming,
	Outgoing,
}

type ContactRequestBase = {
	type: ContactRequestType
	accepted: boolean
	discarded: boolean
}

type OutgoingContactRequestBase = ContactRequestBase & {
	type: ContactRequestType.Outgoing
}

export type ContactRequest =
	| (ContactRequestBase & {
			type: ContactRequestType.Incoming
	  })
	| (OutgoingContactRequestBase & {
			state: 'initiated' | 'enqueued'
	  })
	| (OutgoingContactRequestBase & {
			state: 'sent'
			sentDate: number
	  })

export type Entity = {
	id: string // id of the contact
	publicKey: string
	accountId: string // id of the account that has this contact
	name: string
	request: ContactRequest
	groupPk?: string
	addedDate: number
}

export type Event = {
	id: string
	version: number
	aggregateId: string
}

export type ValidRequestDraft = {
	contactId: string
	contactPublicKey: string
	contactRdvSeed: string
	contactName: string
	error?: undefined
}

export type RequestDraft =
	| {
			error: string
	  }
	| ValidRequestDraft

export type State = {
	events: Array<Event>
	aggregates: { [key: string]: Entity }
	requestDraft?: RequestDraft
}

export type GlobalState = {
	chat: {
		contact: State
	}
}

export namespace Command {
	export type AcceptRequest = { id: string }
	export type DiscardRequest = { id: string }
	export type Create = { id: string; name: string }
	export type Delete = { id: string }
	export type DeleteAll = void
	export type InitiateRequest = { accountId: string; url: string }
}

export namespace Query {
	export type List = void
	export type Get = { id: string }
	export type GetLength = void
	export type Search = { accountId: string; searchText: string }
	export type GetWithId = { contactPk: Uint8Array | Buffer; accountId: string }
	export type GetRequestDraft = void
}

export type ContactRequestMetadata = {
	name: string // requester name
	givenName: string // requested name
}

export namespace Event {
	export type Created = Entity
	export type OutgoingContactRequestAccepted = { accountId: string; contactPk: Uint8Array }
	export type OutgoingContactRequestSent = { id: string; date: number; groupPk?: string }
	export type OutgoingContactRequestEnqueued = {
		accountId: string
		contactPk: string
		groupPk: string
		metadata: ContactRequestMetadata
		addedDate: number
	}
	export type Deleted = { id: string }
	export type RequestInitiated = {
		accountId: string
		bertyId?: berty.messenger.IBertyID
		error?: Error
		now: number
	}
	export type DraftReset = {
		accountId: string
	}
}

type SimpleCaseReducer<P> = CaseReducer<State, PayloadAction<P>>

export type CommandsReducer = {
	acceptRequest: SimpleCaseReducer<Command.AcceptRequest>
	discardRequest: SimpleCaseReducer<Command.DiscardRequest>
	delete: SimpleCaseReducer<Command.Delete>
	deleteAll: SimpleCaseReducer<Command.DeleteAll>
	initiateRequest: SimpleCaseReducer<Command.InitiateRequest>
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
	getLength: (state: GlobalState) => number
	search: (state: GlobalState, query: Query.Search) => Array<Entity>
	getWithId: (state: GlobalState, query: Query.GetWithId) => Entity
	getRequestDraft: (state: GlobalState, query: Query.GetRequestDraft) => RequestDraft | undefined
}

export type EventsReducer = {
	outgoingContactRequestEnqueued: SimpleCaseReducer<Event.OutgoingContactRequestEnqueued>
	outgoingContactRequestSent: SimpleCaseReducer<Event.OutgoingContactRequestSent>
	outgoingContactRequestAccepted: SimpleCaseReducer<Event.OutgoingContactRequestAccepted>
	created: SimpleCaseReducer<Event.Created>
	deleted: SimpleCaseReducer<Event.Deleted>
	requestInitiated: SimpleCaseReducer<Event.RequestInitiated>
	draftReset: SimpleCaseReducer<Event.DraftReset>
}

const initialState: State = {
	events: [],
	aggregates: {},
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'chat/contact/command',
	initialState,
	reducers: {
		acceptRequest: (state: State) => state,
		discardRequest: (state: State) => state,
		delete: (state: State) => state,
		deleteAll: (state: State) => state,
		initiateRequest: (state: State) => state,
	},
})

export const getAggregateId = ({
	accountId,
	contactPk,
}: {
	accountId: string
	contactPk: string | Uint8Array
}) => {
	return bufToStr(
		Buffer.concat([
			Buffer.from(accountId, 'utf-8'),
			typeof contactPk === 'string' ? strToBuf(contactPk) : Buffer.from(contactPk),
		]),
	)
}

const eventHandler = createSlice<State, EventsReducer>({
	name: 'chat/contact/event',
	initialState,
	reducers: {
		deleted: (state: State, { payload: { id } }) => {
			delete state.aggregates[id]
			return state
		},
		outgoingContactRequestAccepted: (state: State, { payload: { accountId, contactPk } }) => {
			const id = getAggregateId({ accountId, contactPk })
			const contact = state.aggregates[id] as Entity | undefined
			if (contact && contact.request.type === ContactRequestType.Outgoing) {
				contact.request.accepted = true
			}
			return state
		},
		outgoingContactRequestEnqueued: (state: State, { payload }) => {
			const { accountId, contactPk, groupPk, metadata, addedDate } = payload
			if (!accountId || !contactPk) {
				return state
			}
			const id = getAggregateId({ accountId, contactPk })
			if (!state.aggregates[id]) {
				state.aggregates[id] = {
					id,
					accountId,
					name: metadata.givenName,
					publicKey: contactPk,
					groupPk,
					request: {
						type: ContactRequestType.Outgoing,
						accepted: false,
						discarded: false,
						state: 'enqueued',
					},
					addedDate,
				}
			}
			return state
		},
		outgoingContactRequestSent: (state: State, { payload: { id, date, groupPk } }) => {
			const contact = state.aggregates[id]
			if (!contact || contact.request.type !== ContactRequestType.Outgoing) {
				return state
			}
			contact.request = { ...contact.request, state: 'sent', sentDate: date }
			if (!contact.groupPk) {
				contact.groupPk = groupPk
			}
			return state
		},
		created: (state: State, { payload }) => {
			const { id } = payload
			if (!state.aggregates[id]) {
				state.aggregates[id] = payload
			}
			return state
		},
		requestInitiated: (state: State, { payload: { accountId, bertyId, error, now } }) => {
			try {
				if (!bertyId || error) {
					throw error || new Error('Unknown.')
				}
				if (!(bertyId.accountPk && bertyId.publicRendezvousSeed)) {
					throw new Error('Contact already added.')
				}
				const contactPk = bufToStr(bertyId.accountPk)
				const id = getAggregateId({ accountId, contactPk })
				if (state.aggregates[id]) {
					throw new Error('Contact already added.')
				}
				const name = bertyId.displayName || 'anon#1337'
				state.requestDraft = {
					contactId: id,
					contactName: name,
					contactRdvSeed: bufToStr(bertyId.publicRendezvousSeed),
					contactPublicKey: contactPk,
				}
				state.aggregates[id] = {
					id,
					accountId,
					name,
					publicKey: contactPk,
					request: {
						type: ContactRequestType.Outgoing,
						accepted: false,
						discarded: false,
						state: 'initiated',
					},
					addedDate: now,
				}
			} catch (e) {
				state.requestDraft = {
					error: e.toString(),
				}
			}
			return state
		},
		draftReset: (state) => {
			delete state.requestDraft
			return state
		},
	},
	extraReducers: {
		[protocol.events.client.accountContactRequestIncomingAccepted.type]: (state, action) => {
			const {
				payload: {
					aggregateId: accountId,
					event: { contactPk, groupPk },
				},
			} = action
			const id = getAggregateId({ accountId, contactPk })
			const contact = state.aggregates[id]
			if (contact && contact.request.type === ContactRequestType.Incoming) {
				contact.request.accepted = true
				contact.groupPk = bufToStr(groupPk)
			}
			return state
		},
		[protocol.events.client.accountContactRequestIncomingDiscarded.type]: (state, { payload }) => {
			const {
				aggregateId: accountId,
				event: { contactPk },
			} = payload
			const id = getAggregateId({ accountId, contactPk })
			const contact = state.aggregates[id]
			if (contact && contact.request.type === ContactRequestType.Incoming) {
				contact.request.discarded = true
			}
			return state
		},
		deleted: (state, { payload }) => {
			delete state.aggregates[payload.aggregateId]
			return state
		},
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(state.chat.contact.aggregates),
	get: (state, { id }) => state.chat.contact.aggregates[id],
	getRequestDraft: (state) => state.chat.contact.requestDraft,
	getLength: (state) => Object.keys(state.chat.contact.aggregates).length,
	search: (state, { searchText, accountId }) =>
		searchText
			? Object.values(state.chat.contact.aggregates).filter(
					(contact) =>
						contact.accountId === accountId &&
						contact.name.toLowerCase().includes(searchText.toLowerCase()),
			  )
			: [],
	getWithId: (state, { contactPk, accountId }) =>
		state.chat.contact.aggregates[getAggregateId({ accountId, contactPk })],
}

export type Transactions = {
	[K in keyof CommandsReducer]: CommandsReducer[K] extends SimpleCaseReducer<infer TPayload>
		? (payload: TPayload) => Generator
		: never
} & { open: (payload: { accountId: string }) => Generator }

export const transactions: Transactions = {
	open: function* () {},
	delete: function* ({ id }) {
		yield events.deleted({ id })
	},
	acceptRequest: function* ({ id }) {
		const contact = (yield select((state: GlobalState) => queries.get(state, { id }))) as
			| Entity
			| undefined
		if (!contact) {
			return
		}
		yield put(
			protocol.commands.client.contactRequestAccept({
				id: contact.accountId,
				contactPk: strToBuf(contact.publicKey),
			}),
		)
	},
	discardRequest: function* ({ id }) {
		const contact = (yield select((state: GlobalState) => queries.get(state, { id }))) as
			| Entity
			| undefined
		if (!contact) {
			return
		}
		yield put(
			protocol.commands.client.contactRequestDiscard({
				id: contact.accountId,
				contactPk: strToBuf(contact.publicKey),
			}),
		)
	},
	deleteAll: function* () {
		const contacts = (yield select(queries.list)) as Entity[]

		for (const contact of contacts) {
			yield* transactions.delete({ id: contact.id })
		}
	},
	initiateRequest: function* ({ accountId, url }) {
		try {
			const data = (yield call(protocol.client.transactions.parseDeepLink, {
				id: accountId,
				link: url,
			})) as berty.messenger.ParseDeepLink.IReply
			if (!(data && data.bertyId && data.bertyId.accountPk)) {
				throw new Error('Internal: Invalid node response.')
			}
			const client = (yield select((state) =>
				protocol.queries.client.get(state, { id: accountId }),
			)) as protocol.client.Entity | undefined
			if (!client) {
				return
			}
			const contactPk = bufToStr(data.bertyId.accountPk)
			if (contactPk === client.accountPk) {
				throw new Error("Can't send a contact request to yourself.")
			}
			const contacts = (yield select((state) => queries.list(state))) as Entity[]
			if (contacts.find((c) => c.publicKey === contactPk)) {
				throw new Error('Contact already added.')
			}
			yield put(events.requestInitiated({ accountId, bertyId: data.bertyId, now: Date.now() }))
		} catch (e) {
			if (e.name === 'GRPCError') {
				yield put(
					events.requestInitiated({
						accountId,
						error: new Error('Corrupted deep link.'),
						now: Date.now(),
					}),
				)
			} else {
				yield put(events.requestInitiated({ accountId, error: e.toString(), now: Date.now() }))
			}
		}
	},
}

function* getContact(id: string) {
	const contact = (yield select((state: GlobalState) => queries.get(state, { id }))) as
		| Entity
		| undefined
	return contact
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
		})) as berty.types.GroupInfo.IReply
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
		takeEvery(protocol.events.client.accountContactRequestOutgoingEnqueued, function* (action) {
			const contactPk = action.payload.event.contact.pk
			const accountId = action.payload.aggregateId
			if (!contactPk) {
				throw new Error('No contact pk in AccountContactRequestOutgoingEnqueued')
			}
			const groupPk = yield* contactPkToGroupPk({ accountId, contactPk })
			if (!groupPk) {
				return
			}
			const contactPkStr = bufToStr(contactPk)
			const groupPkStr = bufToStr(groupPk)
			const mtdt = action.payload.event.contact.metadata
			const metadata: ContactRequestMetadata = mtdt && bufToJSON(mtdt)
			yield put(
				events.outgoingContactRequestEnqueued({
					accountId: accountId,
					contactPk: contactPkStr,
					groupPk: groupPkStr,
					metadata,
					addedDate: Date.now(),
				}),
			)
			yield call(protocol.client.transactions.activateGroup, { id: accountId, groupPk })
			yield put(
				groupsCommands.subscribe({
					clientId: action.payload.aggregateId,
					publicKey: groupPkStr,
					metadata: true,
					messages: true,
				}),
			)
		}),
		takeEvery(protocol.events.client.accountContactRequestIncomingReceived, function* ({
			payload,
		}) {
			const {
				aggregateId: accountId,
				event: { contactPk, contactMetadata },
			} = payload
			const id = getAggregateId({ accountId, contactPk })
			const contact = yield* getContact(id)
			if (!contact) {
				let metadata: ContactRequestMetadata
				try {
					metadata = bufToJSON(contactMetadata)
				} catch (e) {
					console.warn('Invalid contact metadata')
					return
				}
				yield put(
					events.created({
						id,
						publicKey: bufToStr(contactPk),
						accountId,
						name: metadata.name,
						request: {
							type: ContactRequestType.Incoming,
							accepted: false,
							discarded: false,
						},
						addedDate: Date.now(),
					}),
				)
			}
		}),
		takeEvery(protocol.events.client.accountContactRequestIncomingAccepted, function* ({
			payload,
		}) {
			const {
				event: { groupPk },
				aggregateId: accountId,
			} = payload
			yield call(protocol.client.transactions.activateGroup, { id: accountId, groupPk })
			yield put(
				groupsCommands.subscribe({
					clientId: accountId,
					publicKey: bufToStr(groupPk),
					messages: true,
					metadata: true,
				}),
			)
		}),
		takeEvery(protocol.events.client.accountContactRequestOutgoingSent, function* ({ payload }) {
			const { aggregateId: accountId, event } = payload
			const { contactPk } = event
			if (!contactPk) {
				return
			}
			const id = getAggregateId({ accountId, contactPk })
			const contact = yield* getContact(id)
			if (!contact || contact.request.type !== ContactRequestType.Outgoing) {
				return
			}

			const groupPk = yield* contactPkToGroupPk({ accountId, contactPk })

			yield put(
				events.outgoingContactRequestSent({
					id,
					date: Date.now(),
					groupPk: groupPk && bufToStr(groupPk),
				}),
			)

			if (groupPk && contact.request.state === 'initiated') {
				console.log('jumping from initiated state to sent state')
				yield put(
					conversationEvents.created({
						kind: ConversationKind.OneToOne,
						accountId,
						contactId: contact.id,
						title: contact.name,
						pk: bufToStr(groupPk),
					}),
				)
				yield call(protocol.client.transactions.activateGroup, { id: accountId, groupPk })
				yield put(
					groupsCommands.subscribe({
						clientId: accountId,
						publicKey: bufToStr(groupPk),
						messages: true,
						metadata: true,
					}),
				)
			}
		}),
		takeEvery(protocol.events.client.groupMetadataPayloadSent, function* ({ payload }) {
			const { aggregateId: accountId } = payload
			const event = payload.event as AppMessage
			if (event.type === AppMessageType.GroupInvitation) {
				const group: berty.types.IGroup = {
					groupType: berty.types.GroupType.GroupTypeMultiMember,
					publicKey: strToBuf(event.groupPk),
				}
				yield* protocol.client.transactions.multiMemberGroupJoin({ id: accountId, group })
			}
		}),
		takeEvery(protocol.events.client.groupMemberDeviceAdded, function* ({ payload }) {
			// This is the only way to know if an outgoing contact request has been accepted without receiving a message
			const {
				aggregateId: accountId,
				eventContext: { groupPk },
				event: { memberPk },
			} = payload
			if (!groupPk) {
				return
			}
			const client: protocol.client.Entity = yield select((state) =>
				protocol.queries.client.get(state, { id: accountId }),
			)
			// noop if the event comes from our devices
			if (bufToStr(memberPk) === client.accountPk) {
				// TODO: multidevice
				return
			}
			const groupPkStr = bufToStr(groupPk)

			const contacts: Entity[] = yield select((state) => queries.list(state))
			const contact = contacts.find(
				(contact) =>
					contact.accountId === accountId &&
					contact.request.type === ContactRequestType.Outgoing &&
					contact.groupPk === groupPkStr,
			)
			if (contact && !contact.request.accepted) {
				yield put(
					events.outgoingContactRequestAccepted({
						accountId,
						contactPk: strToBuf(contact.publicKey),
					}),
				)
			}
		}),
	])
}
