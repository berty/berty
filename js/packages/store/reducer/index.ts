import { isExpectedAppStateChange } from '../context'
import { MessengerAppState, MessengerState, reducerAction } from '../types'
import { eventStreamReducerActions } from './eventStreamReducer'
import { uiReducerActions } from './uiReducer'

export const reducerActions: {
	[key: string]: (oldState: MessengerState, action: reducerAction) => MessengerState
} = {
	...uiReducerActions,
	...eventStreamReducerActions,
}

export const reducer = (oldState: MessengerState, action: reducerAction): MessengerState => {
	if (reducerActions[action.type]) {
		const newState = reducerActions[action.type](oldState, action)

		if (!isExpectedAppStateChange(oldState.appState, newState.appState)) {
			console.warn(
				`unexpected app state change from ${MessengerAppState[oldState.appState]} to ${
					MessengerAppState[newState.appState]
				}`,
			)
		}

		return newState
	}

	console.warn('Unknown action type', action.type)
	return oldState
}
