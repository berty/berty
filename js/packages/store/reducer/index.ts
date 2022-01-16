import { MessengerState, reducerAction } from '../types'
import { uiReducerActions } from './uiReducer'

export const reducerActions: {
	[key: string]: (oldState: MessengerState, action: reducerAction) => MessengerState
} = {
	...uiReducerActions,
}

export const reducer = (oldState: MessengerState, action: reducerAction): MessengerState => {
	if (reducerActions[action.type]) {
		return reducerActions[action.type](oldState, action)
	}

	console.warn('Unknown action type', action.type)
	return oldState
}
