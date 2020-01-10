import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import { all, call } from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'

import * as protocol from '../protocol'
import * as account from './account'
import * as request from './request'
import * as contact from './contact'
import * as conversation from './conversation'
import * as member from './member'
import * as message from './message'

export type Account = account.Entity
export type Request = request.Entity
export type Contact = contact.Entity
export type Conversation = conversation.Entity
export type Member = member.Entity
export type Message = message.Entity

export const commands = {
	protocol: protocol.commands,
	account: account.commands,
	request: request.commands,
	contact: contact.commands,
	conversation: conversation.commands,
	member: conversation.commands,
	message: conversation.commands,
}

export const reducers = {
	...protocol.reducers,
	chat: combineReducers({
		account: account.reducer,
		request: request.reducer,
		contact: contact.reducer,
		conversation: conversation.reducer,
		member: member.reducer,
		message: message.reducer,
	}),
}

export function* rootSaga() {
	yield all([
		call(protocol.rootSaga),
		call(account.orchestrator),
		call(request.orchestrator),
		call(contact.orchestrator),
		call(conversation.orchestrator),
		call(member.orchestrator),
		call(message.orchestrator),
	])
}

export const init = () => {
	const sagaMiddleware = createSagaMiddleware()

	const store = configureStore({
		reducer: combineReducers(reducers),
		middleware: [sagaMiddleware],
	})

	sagaMiddleware.run(rootSaga)
	return store
}
