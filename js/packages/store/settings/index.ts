import { combineReducers } from 'redux'
import { all, call } from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'
import { configureStore } from '@reduxjs/toolkit'

import * as main from './main'

export type Entity = main.Entity

export const reducers = {
	settings: combineReducers({ main: main.reducer }),
}

export function* rootSaga() {
	yield all([call(main.orchestrator)])
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

export { main }
