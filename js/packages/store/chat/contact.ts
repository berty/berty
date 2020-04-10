import { createSlice, CaseReducer, PayloadAction, CaseReducerActions } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, select, takeLeading, takeEvery, put, fork, take } from 'redux-saga/effects'
import * as protocol from '../protocol'
import { berty } from '@berty-tech/api'
import { Buffer } from 'buffer'
import { AppMessage, AppMessageType } from './AppMessage'

export enum ContactRequestType {
	Incoming,
	Outgoing,
}

export type ContactRequest =
	| {
			type: ContactRequestType.Incoming
			accepted: boolean
			discarded: boolean
	  }
	| {
			type: ContactRequestType.Outgoing
			accepted: boolean
			discarded: boolean
			sent: boolean
	  }

export type Entity = {
	id: string // id of the contact
	publicKey: string
	accountId: string // id of the account that has this contact
	name: string
	request: ContactRequest
	groupPk?: string
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

export namespace Event {
	export type OutgoingContactRequestAccepted = { accountId: string; contactPk: Uint8Array }
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
	deleted: SimpleCaseReducer<Event.Deleted>
	outgoingContactRequestAccepted: SimpleCaseReducer<Event.OutgoingContactRequestAccepted>
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
	contactPk: Uint8Array | Buffer
}) => {
	return Buffer.concat([Buffer.from(accountId, 'utf-8'), Buffer.from(contactPk)]).toString('base64')
}

const encodePublicKey = (pk: Buffer | Uint8Array) => Buffer.from(pk).toString('utf-8')
const decodePublicKey = (pk: string): Buffer => Buffer.from(pk, 'utf-8')

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
	},
	extraReducers: {
		[protocol.events.client.accountContactRequestOutgoingEnqueued.type]: (state, { payload }) => {
			const { aggregateId: accountId, event } = payload
			const { groupPk, contact: c } = event as berty.types.IAccountContactRequestEnqueued
			if (!c || !c.pk || !groupPk) {
				return state
			}
			const id = getAggregateId({ accountId, contactPk: c.pk })
			const contact = state.aggregates[id]
			if (!contact) {
				const metadata = c.metadata ? JSON.parse(new Buffer(c.metadata).toString('utf-8')) : {}
				state.aggregates[id] = {
					id,
					accountId: payload.aggregateId,
					name: metadata.givenName,
					publicKey: encodePublicKey(c.pk),
					groupPk: encodePublicKey(groupPk),
					request: {
						type: ContactRequestType.Outgoing,
						accepted: false,
						discarded: false,
						sent: false,
					},
				}
			}
			return state
		},
		[protocol.events.client.accountContactRequestOutgoingSent.type]: (state, { payload }) => {
			const { aggregateId: accountId, event } = payload
			const { contactPk } = event as berty.types.IAccountContactRequestSent
			if (!contactPk) {
				return state
			}
			const id = getAggregateId({ accountId, contactPk })
			const contact = state.aggregates[id]
			if (contact && contact.request.type === ContactRequestType.Outgoing) {
				contact.request.sent = true
			}
			return state
		},
		[protocol.events.client.accountContactRequestIncomingReceived.type]: (state, { payload }) => {
			const {
				aggregateId: accountId,
				event: { contactPk, contactMetadata },
			} = payload
			const id = getAggregateId({ accountId, contactPk })
			const contact = state.aggregates[id]
			if (!contact) {
				const metadata = JSON.parse(new Buffer(contactMetadata).toString('utf-8'))
				state.aggregates[id] = {
					id,
					publicKey: encodePublicKey(contactPk),
					accountId,
					name: metadata.name,
					request: {
						type: ContactRequestType.Incoming,
						accepted: false,
						discarded: false,
					},
				}
			}
			return state
		},
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
				contact.groupPk = encodePublicKey(groupPk)
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
	open: function*({ accountId }) {
		const contacts = (yield select((state) => queries.list(state))) as Entity[]
		for (const { groupPk } of contacts.filter((contact) => contact.accountId === accountId)) {
			if (groupPk) {
				yield fork(function*() {
					const chan = yield* protocol.transactions.client.groupMetadataSubscribe({
						id: accountId,
						groupPk: decodePublicKey(groupPk),
						// TODO: use last cursor
						since: new Uint8Array(),
						until: new Uint8Array(),
						goBackwards: false,
					})
					while (1) {
						const action = yield take(chan)
						yield put(action)
					}
				})
				yield fork(function*() {
					const chan = yield* protocol.transactions.client.groupMessageSubscribe({
						id: accountId,
						groupPk: decodePublicKey(groupPk),
						// TODO: use last cursor
						since: new Uint8Array(),
						until: new Uint8Array(),
						goBackwards: false,
					})
					while (1) {
						const action = yield take(chan)
						yield put(action)
					}
				})
			}
		}
	},
	delete: function*({ id }) {
		yield events.deleted({ id })
	},
	acceptRequest: function*({ id }) {
		const contact = (yield select((state: GlobalState) => queries.get(state, { id }))) as
			| Entity
			| undefined
		if (!contact) {
			return
		}
		yield put(
			protocol.commands.client.contactRequestAccept({
				id: contact.accountId,
				contactPk: decodePublicKey(contact.publicKey),
			}),
		)
	},
	discardRequest: function*({ id }) {
		const contact = (yield select((state: GlobalState) => queries.get(state, { id }))) as
			| Entity
			| undefined
		if (!contact) {
			return
		}
		yield put(
			protocol.commands.client.contactRequestDiscard({
				id: contact.accountId,
				contactPk: decodePublicKey(contact.publicKey),
			}),
		)
	},
	deleteAll: function*() {
		const contacts = (yield select(queries.list)) as Entity[]

		for (const contact of contacts) {
			yield* transactions.delete({ id: contact.id })
		}
	},
}

export function* orchestrator() {
	yield all([
		takeEvery(protocol.events.client.accountContactRequestOutgoingEnqueued, function*(action) {
			yield fork(function*() {
				const chan = yield* protocol.transactions.client.groupMetadataSubscribe({
					id: action.payload.aggregateId,
					groupPk: action.payload.event.groupPk,
					since: new Uint8Array(),
					until: new Uint8Array(),
					goBackwards: false,
				})
				while (1) {
					const action = yield take(chan)
					yield put(action)
				}
			})
			yield fork(function*() {
				const chan = yield* protocol.transactions.client.groupMessageSubscribe({
					id: action.payload.aggregateId,
					groupPk: action.payload.event.groupPk,
					since: new Uint8Array(),
					until: new Uint8Array(),
					goBackwards: false,
				})
				while (1) {
					const action = yield take(chan)
					yield put(action)
				}
			})
		}),
		takeEvery(protocol.events.client.accountContactRequestIncomingAccepted, function*({ payload }) {
			const {
				event: { groupPk },
				aggregateId: accountId,
			} = payload
			yield fork(function*() {
				const chan = yield* protocol.transactions.client.groupMetadataSubscribe({
					id: accountId,
					groupPk: groupPk,
					// TODO: use last cursor
					since: new Uint8Array(),
					until: new Uint8Array(),
					goBackwards: false,
				})
				while (1) {
					const action = yield take(chan)
					yield put(action)
				}
			})
			yield fork(function*() {
				const chan = yield* protocol.transactions.client.groupMessageSubscribe({
					id: accountId,
					groupPk: groupPk,
					// TODO: use last cursor
					since: new Uint8Array(),
					until: new Uint8Array(),
					goBackwards: false,
				})
				while (1) {
					const action = yield take(chan)
					yield put(action)
				}
			})
		}),
		takeEvery(protocol.events.client.groupMetadataPayloadSent, function*({ payload }) {
			const { aggregateId: accountId } = payload
			const event = payload.event as AppMessage
			if (event.type === AppMessageType.GroupInvitation) {
				const group: berty.types.IGroup = {
					groupType: berty.types.GroupType.GroupTypeMultiMember,
					publicKey: Buffer.from(event.groupPk, 'utf-8'),
				}
				yield* protocol.client.transactions.multiMemberGroupJoin({ id: accountId, group })
			}
		}),
		takeEvery(protocol.events.client.groupMemberDeviceAdded, function*({ payload }) {
			// This is the only way to know if an outgoing contact request has been accepted without receiving a message
			const {
				aggregateId: accountId,
				eventContext: { groupPk },
				event: { devicePk },
			} = payload
			if (!groupPk) {
				return
			}
			const client: protocol.client.Entity = yield select((state) =>
				protocol.queries.client.get(state, { id: accountId }),
			)
			// noop if the event comes from our devices
			if (encodePublicKey(devicePk) === client.devicePk) {
				// TODO: multidevice
				return
			}
			const groupPkStr = encodePublicKey(groupPk)
			const contacts: Entity[] = yield select((state) => queries.list(state))
			const contact = contacts.find(
				(contact) =>
					contact.accountId === accountId &&
					contact.request.type === ContactRequestType.Outgoing &&
					contact.groupPk === groupPkStr,
			)
			if (contact) {
				yield put(
					events.outgoingContactRequestAccepted({
						accountId,
						contactPk: Buffer.from(contact.publicKey, 'utf-8'),
					}),
				)
			}
		}),
		...Object.keys(commands).map((commandName) =>
			takeLeading(commands[commandName as keyof CaseReducerActions<CommandsReducer>], function*(
				action,
			) {
				return yield* transactions[commandName as keyof CaseReducerActions<CommandsReducer>](
					action.payload as any,
				)
			}),
		),
	])
}
