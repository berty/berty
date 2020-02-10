import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, takeLeading, select } from 'redux-saga/effects'
import { Buffer } from 'buffer'

import * as protocol from '../protocol'

export type Entity = {
	id: string
	accountId: string
	requesterPk: string
	requesterName: string
	accepted: boolean
	discarded: boolean
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
		incomingContactRequest: State
	}
}

export namespace Command {
	export type Send = void
	export type Accept = { id: string }
	export type Discard = { id: string }
}

type SimpleCaseReducer<P> = CaseReducer<State, PayloadAction<P>>

export type CommandsReducer = {
	accept: SimpleCaseReducer<Command.Accept>
	discard: SimpleCaseReducer<Command.Discard>
}

export type QueryReducer = {
	list: (state: GlobalState, query: {}) => Array<Entity>
	get: (state: GlobalState, query: { id: string }) => Entity
	getLength: (state: GlobalState) => number
}

export type Transactions = {
	[K in keyof CommandsReducer]: CommandsReducer[K] extends SimpleCaseReducer<infer TPayload>
		? (payload: TPayload) => Generator
		: never
}

const initialState: State = {
	events: [],
	aggregates: {},
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'chat/incomingContactRequest/command',
	initialState,
	reducers: {
		accept: (state) => state,
		discard: (state) => state,
	},
})

const getAggregateId: (kwargs: { accountId: string; contactPk: Uint8Array }) => string = ({
	accountId,
	contactPk,
}) => Buffer.concat([Buffer.from(accountId, 'utf-8'), Buffer.from(contactPk)]).toString('base64')

const eventHandler = createSlice<State, {}>({
	name: 'chat/incomingContactRequest/event',
	initialState,
	reducers: {},
	extraReducers: {
		[protocol.events.client.accountContactRequestIncomingAccepted.type]: (state, { payload }) => {
			const aggregateId = getAggregateId({
				accountId: payload.aggregateId,
				contactPk: payload.event.contactPk,
			})
			state.aggregates[aggregateId].accepted = true
			return state
		},
		[protocol.events.client.accountContactRequestIncomingDiscarded.type]: (state, { payload }) => {
			const aggregateId = getAggregateId({
				accountId: payload.aggregateId,
				contactPk: payload.event.contactPk,
			})
			state.aggregates[aggregateId].discarded = true
			return state
		},
		[protocol.events.client.accountContactRequestIncomingReceived.type]: (state, { payload }) => {
			const {
				aggregateId: accountId,
				event: { contactPk, contactMetadata },
			} = payload
			const metadata = JSON.parse(new Buffer(contactMetadata).toString('utf-8'))
			const aggregateId = getAggregateId({ accountId, contactPk })
			state.aggregates[aggregateId] = {
				id: aggregateId,
				accountId,
				requesterPk: new Buffer(contactPk).toString('base64'),
				requesterName: metadata.name,
				accepted: false,
				discarded: false,
			}
			return state
		},
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(state.chat.incomingContactRequest.aggregates),
	get: (state, { id }) => state.chat.incomingContactRequest.aggregates[id],
	getLength: (state) => Object.keys(state.chat.incomingContactRequest.aggregates).length,
}
export const transactions: Transactions = {
	accept: function*(payload) {
		const request: Entity = yield select((state) => queries.get(state, { id: payload.aggregateId }))
		yield put(
			protocol.commands.client.contactRequestAccept({
				id: request.accountId,
				contactPk: Buffer.from(request.requesterPk, 'base64'),
			}),
		)
	},
	discard: function*(payload) {
		const request: Entity = yield select((state) => queries.get(state, { id: payload.aggregateId }))
		yield put(
			protocol.commands.client.contactRequestDiscard({
				id: request.accountId,
				contactPk: Buffer.from(request.requesterPk, 'base64'),
			}),
		)
	},
}

export function* orchestrator() {
	yield all([
		takeLeading(commands.accept, function*({ payload }) {
			yield* transactions.accept(payload)
		}),
		takeLeading(commands.discard, function*({ payload }) {
			yield* transactions.discard(payload)
		}),
	])
}
