import { combineReducers, Middleware } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import { all, call } from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'
import createRecorder from 'redux-test-recorder'
import mem from 'mem'
import createSagaMonitor from '@clarketm/saga-monitor'

import * as protocol from '../protocol'
import * as account from './account'
import * as incomingContactRequest from './incomingContactRequest'
import * as outgoingContactRequest from './outgoingContactRequest'
import * as contact from './contact'
import * as conversation from './conversation'
import * as member from './member'
import * as message from './message'

export {
	account,
	incomingContactRequest,
	outgoingContactRequest,
	contact,
	conversation,
	member,
	message,
}

export type State = account.GlobalState

export const reducers = {
	...protocol.reducers,
	chat: combineReducers({
		account: account.reducer,
		incomingContactRequest: incomingContactRequest.reducer,
		outgoingContactRequest: outgoingContactRequest.reducer,
		contact: contact.reducer,
		conversation: conversation.reducer,
		member: member.reducer,
		message: message.reducer,
	}),
}

export function* rootSaga() {
	while (1) {
		try {
			yield all([
				call(protocol.rootSaga),
				call(account.orchestrator),
				call(incomingContactRequest.orchestrator),
				call(contact.orchestrator),
				call(conversation.orchestrator),
				call(member.orchestrator),
				call(message.orchestrator),
			])
		} catch (error) {
			console.error('Chat orchestrator crashed, retrying', error.toString())
		}
	}
}

const reducer = combineReducers(reducers)

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

export const init = mem(
	(...middlewares: Array<Middleware>) => {
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

		const store = {
			reducer,
			...configureStore({
				reducer,
				middleware: [sagaMiddleware, _recorder.middleware, ...middlewares],
			}),
		}

		sagaMiddleware.run(rootSaga)

		return store
	},
	{
		cacheKey: () => 'chat',
	},
)
