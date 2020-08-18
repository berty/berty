import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import { call, take, race, delay, select, fork, put } from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'
import createRecorder from 'redux-test-recorder'
import mem from 'mem'
import createSagaMonitor from '@clarketm/saga-monitor'
import { persistReducer, persistStore } from 'redux-persist'

import * as protocol from '../protocol'
import * as settings from '../settings'
import * as account from './account'
import * as contact from './contact'
import * as conversation from './conversation'
import * as message from './message'
import * as groups from '../groups'

import * as middleware from '@berty-tech/grpc-bridge/middleware'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { grpcweb as rpcWeb } from '@berty-tech/grpc-bridge/rpc'
import { Service, EOF } from '@berty-tech/grpc-bridge'
import ExternalTransport from '../protocol/externalTransport'

export * from './AppMessage'

export { account, contact, conversation, message }

export const reducers = {
	...protocol.reducers,
	...settings.reducers,
	...groups.reducers,
	messenger: combineReducers({
		account: account.reducer,
		contact: contact.reducer,
		conversation: conversation.reducer,
		message: message.reducer,
	}),
}

function* initApp() {
	console.log(
		'messengerpb.StreamEvent.ConversationUpdated',
		messengerpb.StreamEvent.ConversationUpdated,
	)

	let acc = yield select(account.queries.get)
	if (!acc) {
		yield take(account.events.created)
		acc = yield select(account.queries.get)
	}
	yield* protocol.transactions.client.start({ name: acc.name })
	yield* account.transactions.open()
	yield put({ type: 'APP_READY' })
}

export function* rootSaga() {
	yield take('persist/REHYDRATE')
	while (true) {
		try {
			yield race({
				rootTask: call(function* rootTask() {
					// start commands and events listeners
					for (const saga of [
						protocol.rootSaga,
						settings.rootSaga,
						account.orchestrator,
						contact.orchestrator,
						conversation.orchestrator,
						message.orchestrator,
						groups.orchestrator,
					]) {
						yield fork(saga)
					}
					// call init saga
					yield* initApp()
				}),
				restart: take(['RESTART_ROOT_SAGA', 'CLEAR_STORE']),
			})
			console.log('Restarting root saga')
			yield delay(500)
		} catch (error) {
			console.warn('Chat orchestrator crashed, retrying in 1s')
			console.error(error)
			yield delay(1000)
		}
	}
}

const combinedReducer = combineReducers(reducers)
// Check if CLEAR_STORE
const reducer = (state, action) => {
	if (action.type === 'CLEAR_STORE') {
		return combinedReducer(undefined, action)
	} else {
		return combinedReducer(state, action)
	}
}

const _recorder = createRecorder({
	reducer,
	testLib: 'jest',
	equality: (result, nextState) => JSON.stringify(result) === JSON.stringify(nextState),
})

export const recorder = {
	start: _recorder.props.startRecord,
	stop: _recorder.props.stopRecord,
	listen: _recorder.props.listen,
	createTest: _recorder.props.createNewTest,
}

export const init = mem(
	(config) => {
		const sagaMiddleware = createSagaMiddleware({
			sagaMonitor: createSagaMonitor({
				level: 'log', // logging level
				verbose: false, // verbose mode
				color: '#03A9F4', // default color
				rootSagaStart: false, // show root saga start effect
				effectTrigger: false, // show triggered effects
				effectResolve: false, // show resolved effects
				effectReject: true, // show rejected effects
				effectCancel: false, // show cancelled effects
				actionDispatch: false, // show dispatched actions
			}),
		})
		const middlewares = [sagaMiddleware, _recorder.middleware, ...(config.middlewares || [])]

		const persistConfig = {
			key: 'root',
			storage: config.storage,
			whitelist: ['messenger', 'settings', 'groups'],
		}

		const configuredStore = configureStore({
			reducer: persistReducer(persistConfig, reducer),
			middleware: middlewares,
		})

		const store = {
			reducer,
			...configuredStore,
			persistor: persistStore(configuredStore),
		}

		sagaMiddleware.run(rootSaga)

		return store
	},
	{
		cacheKey: () => 'messenger',
	},
)
