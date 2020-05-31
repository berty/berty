import { composeReducers } from 'redux-compose'
import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit'
import { all, put, takeEvery, select, call } from 'redux-saga/effects'
import { berty } from '@berty-tech/api'
import { makeDefaultCommandsSagas, strToBuf, bufToStr, jsonToBuf, bufToJSON } from '../utils'

import * as conversation from './conversation'
import * as notifications from '../notifications'
import * as protocol from '../protocol'

import { UserMessage, GroupInvitation, AppMessageType, AppMessage, Acknowledge } from './AppMessage'

export type StoreUserMessage = UserMessage & { isMe: boolean; acknowledged: boolean }

export type StoreMessage = StoreUserMessage | GroupInvitation

export type Entity = {
	id: string
	receivedDate: number
	convId: string
} & StoreMessage

export type Event = {
	id: string
	version: number
	aggregateId: string
}

export type State = {
	events: Array<Event>
	aggregates: { [key: string]: Entity | undefined }
	ackBacklog: { [key: string]: true | undefined }
}

export type GlobalState = {
	chat: {
		message: State
	}
}

export namespace Command {
	export type Delete = { id: string }
	export type Send = AppMessage & { id: string }
	export type Hide = void
}

export namespace Query {
	export type List = {}
	export type Get = { id: string }
	export type GetLength = void
	export type GetList = { list: Entity['id'][] }
}

export namespace Event {
	export type Deleted = { aggregateId: string }
	export type Received = {
		aggregateId: string
		message: AppMessage
		receivedDate: number
		isMe: boolean
		convId: string
	}
	export type Hidden = { aggregateId: string }
}

type SimpleCaseReducer<P> = CaseReducer<State, PayloadAction<P>>

export type CommandsReducer = {
	delete: SimpleCaseReducer<Command.Delete>
	send: SimpleCaseReducer<Command.Send>
	hide: SimpleCaseReducer<Command.Hide>
}

type FakeConfig = {
	body: string
}

const FAKE_MESSAGES_CONFIG: FakeConfig[] = [
	{ body: 'Welcome to Berty' },
	{ body: 'Hey, nice to see you here' },
	{ body: 'Get out of here! It has all the cryptos!' },
	{ body: 'Hey, I just arrived in New York' },
]

const FAKE_MESSAGES: Entity[] = FAKE_MESSAGES_CONFIG.map((fc, i) => {
	return {
		type: AppMessageType.UserMessage,
		id: `fake_${i}`,
		body: fc.body,
		attachments: [],
		sentDate: Date.now(),
		receivedDate: Date.now(),
		isMe: false,
		acknowledged: false,
		convId: 'unknown',
	}
})

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Entity[]
	get: (state: GlobalState, query: Query.Get) => Entity | undefined
	getLength: (state: GlobalState) => number
	getList: (state: GlobalState, query: Query.GetList) => Entity[]
}

export type EventsReducer = {
	deleted: SimpleCaseReducer<Event.Deleted>
	received: SimpleCaseReducer<Event.Received>
	hidden: SimpleCaseReducer<Event.Hidden>
}

export type Transactions = {
	[K in keyof CommandsReducer]: CommandsReducer[K] extends SimpleCaseReducer<infer TPayload>
		? (payload: TPayload) => Generator
		: never
}

const initialState: State = {
	events: [],
	aggregates: {},
	ackBacklog: {},
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'chat/message/command',
	initialState,
	reducers: {
		delete: (state) => state,
		send: (state) => state,
		hide: (state) => state,
	},
})

const eventHandler = createSlice<State, EventsReducer>({
	name: 'chat/message/event',
	initialState,
	reducers: {
		received: (state, { payload: { aggregateId, message, receivedDate, isMe, convId } }) => {
			if (state.aggregates[aggregateId]) {
				return state
			}
			switch (message.type) {
				case AppMessageType.UserMessage:
					const hasAckInBacklog = !!state.ackBacklog[aggregateId]
					if (hasAckInBacklog) {
						delete state.ackBacklog[aggregateId]
					}
					state.aggregates[aggregateId] = {
						id: aggregateId,
						type: message.type,
						body: message.body,
						isMe,
						attachments: [],
						sentDate: message.sentDate,
						acknowledged: hasAckInBacklog,
						receivedDate,
						convId,
					}
					break
				case AppMessageType.UserReaction:
					// todo: append reaction to message
					break
				case AppMessageType.GroupInvitation:
					state.aggregates[aggregateId] = {
						id: aggregateId,
						type: message.type,
						groupPk: message.groupPk,
						receivedDate,
						convId,
					}
					break
				case AppMessageType.Acknowledge:
					if (!isMe) {
						const target = state.aggregates[message.target]
						if (!target) {
							state.ackBacklog[message.target] = true
						} else if (target.type === AppMessageType.UserMessage && target.isMe) {
							target.acknowledged = true
						}
					}
					break
			}
			return state
		},
		hidden: (state) => state,
		deleted: (state, { payload }) => {
			delete state.aggregates[payload.aggregateId]
			return state
		},
	},
})

const getAggregatesWithFakes = (state: GlobalState) => {
	// TODO: optimize
	const result: { [key: string]: Entity | undefined } = { ...state.chat.message.aggregates }
	for (const fake of FAKE_MESSAGES) {
		result[fake.id] = fake
	}
	return result
}

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(getAggregatesWithFakes(state)) as Entity[],
	get: (state, { id }) => getAggregatesWithFakes(state)[id],
	getLength: (state) => Object.keys(getAggregatesWithFakes(state)).length,
	getList: (state, { list }) => {
		const messages = list.map((id) => {
			const ret = state.chat.message.aggregates[id]
			return ret
		})
		return messages as Entity[]
	},
}

export const transactions: Transactions = {
	delete: function* ({ id }) {
		yield put(
			events.deleted({
				aggregateId: id,
			}),
		)
	},
	send: function* (payload) {
		// Recup the conv
		const conv = (yield select((state) => conversation.queries.get(state, { id: payload.id }))) as
			| conversation.Entity
			| undefined
		if (!conv) {
			return
		}

		if (payload.type === AppMessageType.UserMessage) {
			const message: UserMessage = {
				type: AppMessageType.UserMessage,
				body: payload.body,
				attachments: payload.attachments,
				sentDate: Date.now(),
			}
			console.log('calling app message send')
			yield call(protocol.transactions.client.appMessageSend, {
				id: conv.accountId,
				groupPk: strToBuf(conv.pk), // need to set the pk in conv handlers
				payload: jsonToBuf(message),
			})
			console.log('app message send done')
		}
	},
	hide: function* () {
		// TODO: hide a message
	},
}

export const getProtocolClient = function* (id: string): Generator<unknown, protocol.Client, void> {
	const client = (yield select((state) => protocol.queries.client.get(state, { id }))) as
		| protocol.Client
		| undefined
	if (client == null) {
		throw new Error('client is not defined')
	}
	return client
}

export function* orchestrator() {
	yield all([
		...makeDefaultCommandsSagas(commands, transactions),
		takeEvery('protocol/GroupMessageEvent', function* (
			action: PayloadAction<berty.types.IGroupMessageEvent & { aggregateId: string }>,
		) {
			// create an id for the message
			const idBuf = action.payload.eventContext?.id
			if (!idBuf) {
				return
			}
			const groupPkBuf = action.payload.eventContext?.groupPk
			if (!groupPkBuf) {
				return
			}
			if (!action.payload.message) {
				return
			}
			const message: AppMessage = bufToJSON(action.payload.message) || {
				type: AppMessageType.Unknown,
			}
			const aggregateId = bufToStr(idBuf)
			// create the message entity
			const existingMessage = (yield select((state) => queries.get(state, { id: aggregateId }))) as
				| Entity
				| undefined
			if (existingMessage) {
				return
			}
			// Reconstitute the convId
			const convId = conversation.getAggregateId({
				accountId: action.payload.aggregateId,
				groupPk: groupPkBuf,
			})
			// Recup the conv
			const conv = (yield select((state) => conversation.queries.get(state, { id: convId }))) as
				| conversation.Entity
				| undefined
			if (!conv) {
				return
			}

			const client = yield* getProtocolClient(action.payload.aggregateId)
			const devicePk = action.payload.headers?.devicePk

			// warning, this does not support using multiple devices and might not work for multimember groups
			const isMe = !!devicePk && bufToStr(devicePk) === client.devicePk

			// Add received message in store
			yield put(
				events.received({
					aggregateId,
					message,
					receivedDate: Date.now(),
					isMe,
					convId: conv.id,
				}),
			)

			if (message.type === AppMessageType.UserMessage) {
				// add message to corresponding conversation
				yield call(conversation.transactions.addMessage, {
					aggregateId: conversation.getAggregateId({
						accountId: action.payload.aggregateId,
						groupPk: groupPkBuf,
					}),
					messageId: aggregateId,
					isMe,
				})

				if (!isMe) {
					// send acknowledgment
					const acknowledge: Acknowledge = {
						type: AppMessageType.Acknowledge,
						target: aggregateId,
					}

					yield call(protocol.transactions.client.appMessageSend, {
						id: conv.accountId,
						groupPk: groupPkBuf,
						payload: jsonToBuf(acknowledge),
					})
				}
			}
		}),
		takeEvery(events.received, function* ({ payload }) {
			if (payload.message.type === AppMessageType.UserMessage && !payload.isMe) {
				const conv = yield* conversation.getConversation(payload.convId)
				if (!conv?.reading) {
					yield call(notifications.transactions.notify, {
						title: 'New message!',
						message: payload.message.body,
					})
				}
			}
		}),
	])
}
