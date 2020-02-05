import { createSlice } from '@reduxjs/toolkit'
import { Buffer } from 'buffer'

import * as protocol from '../protocol'

export type Entity = {
	id: string
	accountId: string
	contactName: string
	sent: boolean
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
		outgoingContactRequest: State
	}
}

export namespace Query {
	export type List = {}
	export type Get = { id: string }
	export type GetLength = void
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
	getLength: (state: GlobalState) => number
}

const initialState: State = {
	events: [],
	aggregates: {},
}

const getAggregateId = ({
	contactPk,
	accountId,
}: {
	contactPk: Uint8Array
	accountId: string
}): string => {
	return Buffer.concat([Buffer.from(contactPk), Buffer.from(accountId, 'utf-8')]).toString('base64')
}

const eventHandler = createSlice<State, {}>({
	name: 'chat/outgoingContactRequest/event',
	initialState,
	reducers: {},
	extraReducers: {
		[protocol.events.client.accountContactRequestOutgoingEnqueued.type]: (state, { payload }) => {
			const {
				aggregateId: accountId,
				event: { contactPk },
			} = payload
			const id = getAggregateId({ contactPk, accountId })
			state.aggregates[id] = {
				id,
				accountId,
				contactName: 'todo', // need to add metadata in the QR/link
				sent: false,
			}
			return state
		},
		[protocol.events.client.accountContactRequestOutgoingSent.type]: (state, { payload }) => {
			const {
				aggregateId: accountId,
				event: { contactPk },
			} = payload
			const id = getAggregateId({ contactPk, accountId })
			state.aggregates[id].sent = true
			return state
		},
	},
})

export const reducer = eventHandler.reducer
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(state.chat.outgoingContactRequest.aggregates),
	get: (state, { id }) => state.chat.outgoingContactRequest.aggregates[id],
	getLength: (state) => Object.keys(state.chat.outgoingContactRequest.aggregates).length,
}
