import { combineReducers } from 'redux'
import { all, call } from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'
import { configureStore } from '@reduxjs/toolkit'

import * as client from './client'

export type Client = client.Entity

export { client }

export const commands = {
	client: client.commands,
}

export const queries = {
	client: client.queries,
}

export const events = {
	client: client.events,
}

export const transactions = {
	client: client.transactions,
}

export const reducers = {
	protocol: combineReducers({ client: client.reducer }),
}

export function* rootSaga() {
	yield all([call(client.orchestrator)])
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
