import { createSlice } from '@reduxjs/toolkit'
import { Buffer } from 'buffer'
import { fork, put, take, select } from 'redux-saga/effects'

import * as protocol from '../protocol'

export type Entity = {
	id: string
	accountId: string
	contactName: string
	sent: boolean
	groupPk: string
	accepted: boolean
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
	export type Get = { id: string }
	export type GetLength = void
}

export type QueryReducer = {
	list: (state: GlobalState) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
	getDerived: (state: GlobalState, query: { accountId: string; contactPk: Uint8Array }) => Entity
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
				event: { contactPk, groupPk },
			} = payload
			const id = getAggregateId({ contactPk, accountId })
			const metadata = JSON.parse(new Buffer(payload.event.contactMetadata).toString('utf-8'))
			state.aggregates[id] = {
				id,
				accountId,
				contactName: metadata.givenName,
				sent: false,
				groupPk: Buffer.from(groupPk).toString('utf-8'),
				accepted: false,
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
		[protocol.events.client.groupMemberDeviceAdded.type]: (state, { payload }) => {
			const {
				aggregateId: accountId,
				eventContext,
				event: { memberPk: contactPk },
			} = payload
			if (!eventContext.groupPk) {
				throw new Error('Invalid groupPk in eventContext')
			}
			const id = getAggregateId({ contactPk, accountId })
			const request = state.aggregates[id]
			if (!request || new Buffer(eventContext.groupPk).toString('utf-8') !== request.groupPk) {
				return state
			}
			state.aggregates[id].accepted = true
			return state
		},
	},
})

export const reducer = eventHandler.reducer
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(state.chat.outgoingContactRequest.aggregates),
	get: (state, { id }) => state.chat.outgoingContactRequest.aggregates[id],
	getDerived: (state, { accountId, contactPk }) =>
		state.chat.outgoingContactRequest.aggregates[getAggregateId({ accountId, contactPk })],
	getLength: (state) => Object.keys(state.chat.outgoingContactRequest.aggregates).length,
}

export const transactions = {
	open: function*({ accountId }: { accountId: string }) {
		const requests = (yield select((state) => queries.list(state))) as Entity[]
		for (const req of requests.filter((requ) => requ.accountId === accountId)) {
			yield fork(function*() {
				const chan = yield* protocol.transactions.client.groupMetadataSubscribe({
					id: accountId,
					groupPk: Buffer.from(req.groupPk, 'utf-8'),
					// TODO: use last cursor
					since: new Uint8Array(),
					until: new Uint8Array(),
					goBackwards: false,
				})
				while (1) {
					const action = yield take(chan)
					yield put(action)
					if (action.type === protocol.events.client.groupMetadataPayloadSent.type) {
						yield put(action.payload.event)
					}
				}
			})
		}
	},
}
