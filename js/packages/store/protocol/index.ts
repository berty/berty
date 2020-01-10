import { combineReducers } from 'redux'
import { all, call } from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'
import { configureStore } from '@reduxjs/toolkit'

import * as instance from './instance'

export type Instance = instance.Entity

export const commands = {
	instance: instance.commands,
}

export const reducers = {
	protocol: combineReducers({ instance: instance.reducer }),
}

export function* rootSaga() {
	yield all([call(instance.orchestrator)])
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
