import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, select, takeEvery, put } from 'redux-saga/effects'
import * as protocol from '../protocol'
import { berty } from '@berty-tech/api'
import { Buffer } from 'buffer'
import { AppMessage, AppMessageType } from './AppMessage'
import { makeDefaultCommandsSagas, strToBuf, bufToStr, bufToJSON } from '../utils'

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
	sent: boolean
	sentDate?: number
}

export type ContactRequest =
	| (ContactRequestBase & {
			type: ContactRequestType.Incoming
	  })
	| (OutgoingContactRequestBase & {
			sent: false
	  })
	| (OutgoingContactRequestBase & {
			sent: true
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

export type State = {
	events: Array<Event>
	aggregates: { [key: string]: Entity }
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
}

export namespace Query {
	export type List = void
	export type Get = { id: string }
	export type GetLength = void
	export type Search = { accountId: string; searchText: string }
	export type GetWithId = { contactPk: Uint8Array | Buffer; accountId: string }
}

export type ContactRequestMetadata = {
	name: string // requester name
	givenName: string // requested name
}

export namespace Event {
	export type Created = Entity
	export type OutgoingContactRequestAccepted = { accountId: string; contactPk: Uint8Array }
	export type OutgoingContactRequestSent = { id: string; date: number }
	export type OutgoingContactRequestEnqueued = {
		accountId: string
		contactPk: string
		groupPk: string
		metadata: ContactRequestMetadata
		addedDate: number
	}
	export type Deleted = { id: string }
}

type SimpleCaseReducer<P> = CaseReducer<State, PayloadAction<P>>

export type CommandsReducer = {
	acceptRequest: SimpleCaseReducer<Command.AcceptRequest>
	discardRequest: SimpleCaseReducer<Command.DiscardRequest>
	delete: SimpleCaseReducer<Command.Delete>
	deleteAll: SimpleCaseReducer<Command.DeleteAll>
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
	getLength: (state: GlobalState) => number
	search: (state: GlobalState, query: Query.Search) => Array<Entity>
	getWithId: (state: GlobalState, query: Query.GetWithId) => Entity
}

export type EventsReducer = {
	outgoingContactRequestEnqueued: SimpleCaseReducer<Event.OutgoingContactRequestEnqueued>
	outgoingContactRequestSent: SimpleCaseReducer<Event.OutgoingContactRequestSent>
	outgoingContactRequestAccepted: SimpleCaseReducer<Event.OutgoingContactRequestAccepted>
	created: SimpleCaseReducer<Event.Created>
	deleted: SimpleCaseReducer<Event.Deleted>
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
			const contact = state.aggregates[id]
			if (!contact) {
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
						sent: false,
					},
					addedDate,
				}
			}
			return state
		},
		outgoingContactRequestSent: (state: State, { payload: { id, date } }) => {
			const contact = state.aggregates[id]
			if (contact && contact.request.type === ContactRequestType.Outgoing) {
				contact.request.sent = true
				contact.request.sentDate = date
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
	open: function* ({ accountId }) {
		const contacts = (yield select((state) => queries.list(state))) as Entity[]
		for (const { groupPk } of contacts.filter((contact) => contact.accountId === accountId)) {
			if (groupPk) {
				const gpks = strToBuf(groupPk)
				yield* protocol.client.transactions.activateGroup({
					id: accountId,
					groupPk: gpks,
				})
				yield* protocol.client.transactions.listenToGroup({
					clientId: accountId,
					groupPk: gpks,
				})
			}
		}
	},
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
}

function* getContact(id: string) {
	const contact = (yield select((state: GlobalState) => queries.get(state, { id }))) as
		| Entity
		| undefined
	return contact
}

export function* orchestrator() {
	yield all([
		...makeDefaultCommandsSagas(commands, transactions),
		takeEvery(protocol.events.client.accountContactRequestOutgoingEnqueued, function* (action) {
			const contactPk = action.payload.event.contact.pk
			if (!contactPk) {
				throw new Error('No contact pk in AccountContactRequestOutgoingEnqueued')
			}
			const groupInfo = (yield* protocol.transactions.client.groupInfo({
				id: action.payload.aggregateId,
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
				id: action.payload.aggregateId,
				groupPk,
			})
			const contactPkStr = bufToStr(contactPk)
			const groupPkStr = bufToStr(groupPk)
			const mtdt = action.payload.event.contact.metadata
			const metadata: ContactRequestMetadata = mtdt && bufToJSON(mtdt)
			yield put(
				events.outgoingContactRequestEnqueued({
					accountId: action.payload.aggregateId,
					contactPk: contactPkStr,
					groupPk: groupPkStr,
					metadata,
					addedDate: Date.now(),
				}),
			)
			yield* protocol.transactions.client.listenToGroup({
				clientId: action.payload.aggregateId,
				groupPk,
			})
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
				const metadata: ContactRequestMetadata = bufToJSON(contactMetadata)
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
			yield* protocol.transactions.client.listenToGroup({
				clientId: accountId,
				groupPk,
			})
		}),
		takeEvery(protocol.events.client.accountContactRequestOutgoingSent, function* ({ payload }) {
			const { aggregateId: accountId, event } = payload
			const { contactPk } = event
			if (!contactPk) {
				return
			}
			const id = getAggregateId({ accountId, contactPk })
			yield put(
				events.outgoingContactRequestSent({
					id,
					date: Date.now(),
				}),
			)
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
