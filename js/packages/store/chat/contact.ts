import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, takeLeading, takeEvery, select, put } from 'redux-saga/effects'
import * as protocol from '../protocol'
import * as incomingContactRequest from './incomingContactRequest'
import * as outgoingContactRequest from './outgoingContactRequest'
import { Buffer } from 'buffer'

export type Entity = {
	id: string
	name: string
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
	export type Create = { id: string; name: string }
	export type Delete = void
}

export namespace Query {
	export type List = {}
	export type Get = { id: string }
	export type GetLength = void
	export type Search = { searchText: string }
}

export namespace Event {
	export type Created = { aggregateId: string; name: string }
	export type Deleted = { aggregateId: string }
}

type SimpleCaseReducer<P> = CaseReducer<State, PayloadAction<P>>

export type CommandsReducer = {
	create: SimpleCaseReducer<Command.Create>
	delete: SimpleCaseReducer<Command.Delete>
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
	getLength: (state: GlobalState) => number
	search: (state: GlobalState, query: Query.Search) => Array<Entity>
}

export type EventsReducer = {
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
		create: (state: State) => state,
		delete: (state: State) => state,
	},
})

const eventHandler = createSlice<State, EventsReducer>({
	name: 'chat/contact/event',
	initialState,
	reducers: {
		created: (state: State, action) => {
			const {
				payload: { aggregateId, name },
			} = action
			state.aggregates[aggregateId] = {
				id: aggregateId,
				name,
			}
			return state
		},
		deleted: (state: State) => state,
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(state.chat.contact.aggregates),
	get: (state, { id }) => state.chat.contact.aggregates[id],
	getLength: (state) => Object.keys(state.chat.contact.aggregates).length,
	search: (state, { searchText }) =>
		searchText
			? Object.values(state.chat.contact.aggregates).filter((contact) =>
					contact.name.toLowerCase().includes(searchText.toLowerCase()),
			  )
			: [],
}

export function* orchestrator() {
	yield all([
		takeEvery(protocol.events.client.accountContactRequestIncomingAccepted, function*({ payload }) {
			const {
				event: { contactPk },
				aggregateId: accountId,
			} = payload
			const request = (yield select((state) =>
				incomingContactRequest.queries.getDerived(state, { contactPk, accountId }),
			)) as incomingContactRequest.Entity | undefined
			yield put(
				events.created({
					aggregateId: Buffer.from(contactPk).toString('utf-8'),
					name: request ? request.requesterName : 'Unknown',
				}),
			)
		}),
		takeEvery(protocol.events.client.groupMemberDeviceAdded, function*({ payload }) {
			const {
				event: { memberPk: contactPk },
				aggregateId: accountId,
				eventContext,
			} = payload
			if (!eventContext.groupPk) {
				throw new Error('Invalid groupPk in eventContext')
			}
			const request = (yield select((state) =>
				outgoingContactRequest.queries.getDerived(state, { contactPk, accountId }),
			)) as outgoingContactRequest.Entity | undefined
			if (!request || new Buffer(eventContext.groupPk).toString('utf-8') !== request.groupPk) {
				return
			}
			yield put(
				events.created({
					aggregateId: Buffer.from(contactPk).toString('utf-8'),
					name: request.contactName,
				}),
			)
		}),
		takeLeading(commands.delete, function*() {
			// TODO: delete contact
			// yield put(events.deleted())
		}),
	])
}
