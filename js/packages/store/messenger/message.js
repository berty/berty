import { composeReducers } from 'redux-compose'
import { createSlice } from '@reduxjs/toolkit'
import { all, put, takeEvery, select, call } from 'redux-saga/effects'
import moment from 'moment'
import {
	makeDefaultCommandsSagas,
	strToBuf,
	bufToStr,
	jsonToBuf,
	bufToJSON,
	createCommands,
} from '../utils'
import { Buffer } from 'buffer'

import * as protocol from '../protocol'
import * as conversation from './conversation'

import { AppMessageType } from './AppMessage'
import * as faker from '../../components/faker'

const initialState = {
	events: [],
	aggregates: {},
	ackBacklog: {},
}

const commandsSlice = createCommands('messenger/message/command', initialState, [
	'generate',
	'delete',
	'deleteFake',
	'send',
	'hide',
	'sendToAll',
])

const eventHandler = createSlice({
	name: 'messenger/message/event',
	initialState,
	reducers: {
		generated: (state, { payload }) => {
			const { messages } = payload
			messages.forEach((message) => {
				state.aggregates[message.id] = message
			})
			return state
		},
		received: (state, { payload: { aggregateId, message, receivedDate, isMe, memberPk } }) => {
			if (state.aggregates[aggregateId]) {
				return state
			}
			switch (message.type) {
				case AppMessageType.UserMessage:
					const hasAckInBacklog = !!state.ackBacklog[aggregateId]
					if (hasAckInBacklog) {
						delete state.ackBacklog[aggregateId]
					}
					const templateMsg = {
						id: aggregateId,
						type: message.type,
						body: message.body,
						isMe,
						fake: false,
						attachments: [],
						sentDate: message.sentDate,
						acknowledged: hasAckInBacklog,
						receivedDate,
					}
					state.aggregates[aggregateId] = memberPk ? { ...templateMsg, memberPk } : templateMsg
					break
				case AppMessageType.UserReaction:
					// todo: append reaction to message
					break
				case AppMessageType.GroupInvitation:
					state.aggregates[aggregateId] = {
						id: aggregateId,
						type: message.type,
						group: message.group,
						isMe,
						fake: false,
						receivedDate,
						name: message.name,
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
		deletedFake: (state) => {
			for (const message of Object.values(state.aggregates)) {
				if (message?.fake) {
					delete state.aggregates[message.id]
				}
			}
			return state
		},
	},
})

const getAggregates = (state) => {
	const result = { ...state.messenger.message.aggregates }
	return result
}

export const reducer = composeReducers(commandsSlice.reducer, eventHandler.reducer)
export const commands = commandsSlice.actions
export const events = eventHandler.actions
export const queries = {
	list: (state) => Object.values(getAggregates(state)),
	get: (state, { id }) => getAggregates(state)[id],
	getLength: (state) => Object.keys(getAggregates(state)).length,
	getFakeLength: (state) => queries.list(state).filter((msg) => msg.fake).length,
	getList: (state, { list }) => {
		if (!list) {
			return []
		}
		const messages = list.map((id) => {
			const ret = state.messenger.message.aggregates[id]
			return ret
		})
		return messages
	},
	search: (state, { searchText, list }) => {
		const messages = list
			.map((id) => state.messenger.message.aggregates[id])
			.filter((message) => message && message.type === AppMessageType.UserMessage)
			.filter(
				(message) =>
					message && message.body && message.body.toLowerCase().includes(searchText.toLowerCase()),
			)
		return !searchText ? [] : messages
	},
	searchOne: (state, { searchText, id }) => {
		const message = state.messenger.message.aggregates[id]
		return message &&
			message.type === AppMessageType.UserMessage &&
			message?.body &&
			message?.body.toLowerCase().includes(searchText.toLowerCase())
			? message
			: undefined
	},
}

export const CommandsMessageType = {
	Help: 'help',
	DebugGroup: 'debug-group',
	SendMessage: 'send-message',
}

const addCommandMessage = function* (conv, title, response) {
	const index = yield select((state) => queries.getLength(state))
	const aggregateId = `cmd_${index.toString()}`
	const message = {
		type: AppMessageType.UserMessage,
		body: '/' + title + '\n\n' + response,
		attachments: [],
		sentDate: Date.now(),
	}
	yield put(
		events.received({
			aggregateId,
			message,
			receivedDate: Date.now(),
			isMe: true,
		}),
	)
	yield call(conversation.transactions.addMessage, {
		aggregateId: conv.pk,
		messageId: aggregateId,
		isMe: true,
	})
}

export const getCommandsMessage = () => {
	const arr = {
		[CommandsMessageType.Help]: {
			help: 'Displays all commands',
			run: function* (context, args) {
				const response =
					'/help					Show this command\n' +
					'/debug-group				Indicate 1to1 connection\n' +
					'/send-message [message]	Send message\n'
				yield addCommandMessage(context.conv, CommandsMessageType.Help, response)
				return
			},
		},
		[CommandsMessageType.DebugGroup]: {
			help: 'List peers in this group',
			run: function* (context, args) {
				try {
					const group = yield* protocol.transactions.client.debugGroup({
						id: context.conv.accountId,
						groupPk: strToBuf(context.conv.pk),
					}) // does not support multi devices per account
					const response = group.peerIds.length
						? 'You are connected with this peer !'
						: 'You are not connected with this peer ...'
					yield addCommandMessage(context.conv, CommandsMessageType.DebugGroup, response)
					return
				} catch (error) {
					return error
				}
			},
		},
		[CommandsMessageType.SendMessage]: {
			help: 'Send a message',
			run: function* (context, args) {
				try {
					// TODO: implem minimist and put this const in args
					const body = context.payload.body.substr(CommandsMessageType.SendMessage.length + 2) // 2 = slash + space before the message
					const response = !body ? 'Invalid arguments ...' : 'You have sent a message !'
					yield addCommandMessage(context.conv, CommandsMessageType.SendMessage, response)
					if (body) {
						const userMessage = {
							type: AppMessageType.UserMessage,
							body,
							attachments: [],
							sentDate: Date.now(),
						}

						yield* protocol.transactions.client.appMessageSend({
							groupPk: strToBuf(context.conv.pk), // need to set the pk in conv handlers
							payload: jsonToBuf(userMessage),
						})
					}
					return
				} catch (error) {
					return error
				}
			},
		},
	}
	return arr
}

export const isCommandMessage = (message) => {
	const cmds = getCommandsMessage()
	// index for simple command
	let index = message.split('\n')[0]
	let cmd = cmds[index.substr(1)]
	if (cmd && index.substr(0, 1) === '/') {
		return cmd
	}
	// index for command w/ args
	index = message.split(' ')[0]
	cmd = cmds[index.substr(1)]
	if (cmd && index.substr(0, 1) === '/') {
		return cmd
	}
	return null
}

export const transactions = {
	generate: function* ({ length }) {
		const index = yield select((state) => queries.getFakeLength(state))
		const messages = faker.fakeMessages(length, index)
		yield put(
			events.generated({
				messages,
			}),
		)
		return messages
	},
	delete: function* ({ id }) {
		yield put(
			events.deleted({
				aggregateId: id,
			}),
		)
	},
	deleteFake: function* () {
		yield put(events.deletedFake())
	},
	send: function* (payload) {
		// Recup the conv
		const conv = yield select((state) => conversation.queries.get(state, { id: payload.id }))
		if (!conv) {
			return
		}

		if (payload.type === AppMessageType.UserMessage) {
			const cmd = isCommandMessage(payload.body)
			if (cmd) {
				const context = {
					conv,
					payload,
				}
				const args = {}
				yield cmd?.run(context, args)
			} else {
				const message = {
					type: AppMessageType.UserMessage,
					body: payload.body,
					attachments: payload.attachments,
					sentDate: Date.now(),
				}

				yield* protocol.transactions.client.appMessageSend({
					groupPk: strToBuf(conv.pk), // need to set the pk in conv handlers
					payload: jsonToBuf(message),
				})
			}
		}
	},
	sendToAll: function* () {
		// Recup the conv
		const conv = yield select((state) => conversation.queries.list(state))
		if (!conv || (conv && !conv.length)) {
			return
		}
		for (let i = 0; i < conv.length; i++) {
			if (!conv[i].fake) {
				const message = {
					type: AppMessageType.UserMessage,
					body: `Test, ${moment().format('MMMM Do YYYY, h:mm:ss a')}`,
					attachments: [],
					sentDate: Date.now(),
				}
				yield* protocol.transactions.client.appMessageSend({
					groupPk: strToBuf(conv[i].pk), // need to set the pk in conv handlers
					payload: jsonToBuf(message),
				})
			}
		}
	},
	hide: function* () {
		// TODO: hide a message
	},
}

export function* orchestrator() {
	yield all([
		...makeDefaultCommandsSagas(commands, transactions),
		takeEvery('protocol/GroupMessageEvent', function* (action) {
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
			const message = bufToJSON(action.payload.message) // <--- Not secure
			const aggregateId = bufToStr(idBuf)
			// create the message entity
			const existingMessage = yield select((state) => queries.get(state, { id: aggregateId }))
			if (existingMessage) {
				return
			}
			// Reconstitute the convId
			const convId = bufToStr(groupPkBuf)
			// Recup the conv
			const conv = yield select((state) => conversation.queries.get(state, { id: convId }))
			if (!conv) {
				return
			}

			const msgDevicePk = action.payload.headers?.devicePk

			let memberPk
			if (msgDevicePk) {
				const msgDevicePkStr = bufToStr(msgDevicePk)
				const groups = yield select((state) => state.groups)
				const { membersDevices } = groups[conv.pk] || { membersDevices: {} }
				const [pk] =
					Object.entries(membersDevices || {}).find(
						([, devicePks]) => devicePks && devicePks.some((p) => p === msgDevicePkStr),
					) || []
				memberPk = pk
			}

			const groupInfo = yield call(protocol.transactions.client.groupInfo, {
				id: action.payload.aggregateId,
				groupPk: groupPkBuf,
				contactPk: new Uint8Array(),
			})
			let isMe = false
			if (msgDevicePk && groupInfo?.devicePk) {
				// TODO: multiple devices support
				isMe = Buffer.from(msgDevicePk).equals(Buffer.from(groupInfo.devicePk))
			}

			yield put(
				events.received({
					aggregateId,
					message,
					receivedDate: Date.now(),
					isMe,
					memberPk,
				}),
			)

			// Add received message in store
			if (
				message.type === AppMessageType.UserMessage ||
				message.type === AppMessageType.GroupInvitation
			) {
				yield call(conversation.transactions.addMessage, {
					aggregateId: bufToStr(groupPkBuf),
					messageId: aggregateId,
					isMe,
				})
			}

			if (message.type === AppMessageType.UserMessage) {
				// add message to corresponding conversation

				if (!isMe) {
					// send acknowledgment
					const acknowledge = {
						type: AppMessageType.Acknowledge,
						target: aggregateId,
					}
					yield call(protocol.transactions.client.appMessageSend, {
						groupPk: groupPkBuf,
						payload: jsonToBuf(acknowledge),
					})
				}
			}
		}),
	])
}
