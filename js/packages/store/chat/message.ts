import { composeReducers } from 'redux-compose'
import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit'
import { all, takeLeading, put, takeEvery, select } from 'redux-saga/effects'
import { Buffer } from 'buffer'
import { berty } from '@berty-tech/api'

import * as protocol from '../protocol'
import { conversation } from '../chat'

import { UserMessage, GroupInvitation, AppMessageType, AppMessage, Acknowledge } from './AppMessage'

export type StoreUserMessage = UserMessage & { isMe: boolean; acknowledged: boolean }

export type StoreMessage = StoreUserMessage | GroupInvitation

export type Entity = {
	id: string
	receivedDate: number
} & StoreMessage

export type Event = {
	id: string
	version: number
	aggregateId: string
}

export type State = {
	events: Array<Event>
	aggregates: { [key: string]: Entity | undefined }
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
	export type GetList = { list: any }
}

export namespace Event {
	export type Deleted = { aggregateId: string }
	export type Sent = {
		aggregateId: string
		message: AppMessage
		receivedDate: number
		isMe: boolean
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
	{ body: 'fake' },
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
	sent: SimpleCaseReducer<Event.Sent>
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
		sent: (state, { payload: { aggregateId, message, receivedDate, isMe } }) => {
			switch (message.type) {
				case AppMessageType.UserMessage:
					state.aggregates[aggregateId] = {
						id: aggregateId,
						type: message.type,
						body: message.body,
						isMe,
						attachments: [],
						sentDate: message.sentDate,
						acknowledged: false,
						receivedDate,
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
					}
					break
				case AppMessageType.Acknowledge:
					if (!isMe) {
						const target = state.aggregates[message.target]
						if (target && target.type === AppMessageType.UserMessage && target.isMe) {
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
		const messages = list.map((_) => {
			const ret = state.chat.message.aggregates[_]
			return ret
		})
		return messages
	},
}

const getAggregateId: (kwargs: { accountId: string; groupPk: Uint8Array }) => string = ({
	accountId,
	groupPk,
}) => Buffer.concat([Buffer.from(accountId, 'utf-8'), Buffer.from(groupPk)]).toString('base64')

export const transactions: Transactions = {
	delete: function*({ id }) {
		yield put(
			events.deleted({
				aggregateId: id,
			}),
		)
	},
	send: function*(payload) {
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

			yield* protocol.transactions.client.appMessageSend({
				id: conv.accountId,
				groupPk: Buffer.from(conv.pk, 'utf-8'),
				payload: Buffer.from(JSON.stringify(message), 'utf-8'),
			})
		}
	},
	hide: function*() {
		// TODO: hide a message
	},
}

export const getProtocolClient = function*(id: string): Generator<unknown, protocol.Client, void> {
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
		takeLeading(commands.delete, function*({ payload }) {
			yield* transactions.delete(payload)
		}),
		takeLeading(commands.send, function*({ payload }) {
			yield* transactions.send(payload)
		}),
		takeLeading(commands.hide, function*({ payload }) {
			yield* transactions.hide(payload)
		}),
		takeEvery('protocol/GroupMessageEvent', function*(
			action: PayloadAction<berty.protocol.GroupMessageEvent & { aggregateId: string }>,
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
			const message: AppMessage = JSON.parse(new Buffer(action.payload.message).toString('utf-8'))
			const aggregateId = Buffer.from(idBuf).toString('utf-8')
			// create the message entity
			const existingMessage = (yield select((state) => queries.get(state, { id: aggregateId }))) as
				| Entity
				| undefined
			if (existingMessage) {
				return
			}
			// Reconstitute the convId
			const convId = getAggregateId({
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
			const isMe = !!devicePk && new Buffer(devicePk).toString('utf-8') === client.devicePk

			// Add received message in store
			yield put(
				events.sent({
					aggregateId,
					message,
					receivedDate: Date.now(),
					isMe,
				}),
			)

			if (message.type === AppMessageType.UserMessage) {
				// add message to corresponding conversation
				yield* conversation.transactions.addMessage({
					aggregateId: getAggregateId({
						accountId: action.payload.aggregateId,
						groupPk: groupPkBuf,
					}),
					messageId: aggregateId,
					isMe,
				})

				// send acknowledgment
				const acknowledge: Acknowledge = {
					type: AppMessageType.Acknowledge,
					target: aggregateId,
				}
				yield* protocol.transactions.client.appMessageSend({
					id: conv.accountId,
					groupPk: groupPkBuf,
					payload: Buffer.from(JSON.stringify(acknowledge), 'utf-8'),
				})
			}
		}),
	])
}
