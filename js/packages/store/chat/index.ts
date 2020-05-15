import { combineReducers, Middleware } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import { all, call, cancel, fork, take, join } from 'redux-saga/effects'
import createSagaMiddleware, { Task } from 'redux-saga'
import createRecorder from 'redux-test-recorder'
import mem from 'mem'
import createSagaMonitor from '@clarketm/saga-monitor'
import { persistReducer, persistStore } from 'redux-persist'

import * as protocol from '../protocol'
import * as settings from '../settings'
import * as account from './account'
import * as contact from './contact'
import * as conversation from './conversation'
import * as member from './member'
import * as message from './message'

export { account, contact, conversation, member, message }

export type State = account.GlobalState

export const reducers = {
	...protocol.reducers,
	...settings.reducers,
	chat: combineReducers({
		account: account.reducer,
		contact: contact.reducer,
		conversation: conversation.reducer,
		member: member.reducer,
		message: message.reducer,
	}),
}

export function* rootSaga() {
	// wrapping everything in a call because typescript gets confused on sagaMiddleware.run otherwise
	yield call(function* () {
		yield take('persist/REHYDRATE')
		while (true) {
			try {
				const rootTask = (yield fork(function* () {
					yield all([
						call(protocol.rootSaga),
						call(settings.rootSaga),
						call(account.orchestrator),
						call(contact.orchestrator),
						call(conversation.orchestrator),
						call(member.orchestrator),
						call(message.orchestrator),
					])
				})) as Task
				yield take('CLEAR_STORE')
				console.log('Store cleared, Restarting root saga')
				yield cancel(rootTask)
				yield join(rootTask)
			} catch (error) {
				console.error(error)
				console.warn('Chat orchestrator crashed, retrying')
			}
		}
	})
}

const combinedReducer = combineReducers(reducers)
// Check if CLEAR_STORE
const reducer = (state: any, action: any) => {
	if (action.type === 'CLEAR_STORE') {
		return combinedReducer(undefined, action)
	} else {
		return combinedReducer(state, action)
	}
}

const _recorder = createRecorder({
	reducer,
	testLib: 'jest',
	equality: (result: State, nextState: State) =>
		JSON.stringify(result) === JSON.stringify(nextState),
})

export const recorder: {
	start: () => void
	stop: () => void
	listen: (clbk: (testState: any) => void) => () => void
	createTest: () => string
} = {
	start: _recorder.props.startRecord,
	stop: _recorder.props.stopRecord,
	listen: _recorder.props.listen,
	createTest: _recorder.props.createNewTest,
}

export type InitConfig = {
	storage: any
	middlewares?: Array<Middleware>
}

export const init = mem(
	(config: InitConfig) => {
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
		const middlewares: Array<Middleware> = [
			sagaMiddleware,
			_recorder.middleware,
			...(config.middlewares || []),
		]

		const persistConfig = {
			key: 'root',
			storage: config.storage,
			whitelist: ['chat', 'settings'],
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
		cacheKey: () => 'chat',
	},
)
