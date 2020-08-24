import { useMemo, useReducer, useCallback } from 'react'
import { useMsgrContext } from './context'
import { messenger as messengerpb } from '@berty-tech/api/index.js'

const initialState = { error: null, reply: null, done: false }

const methodReducer = (state, action = {}) => {
	switch (action.type) {
		case 'ERROR':
			return { ...state, error: action.payload.error, done: true }
		case 'DONE':
			return { ...state, reply: action.payload.reply, done: true }
		case 'RESET':
			return initialState
		default:
			console.warn(`Unknown methodReducer action ${action.type}`)
			return state
	}
}

const uncap = (v) => {
	if (typeof v !== 'string') {
		return v
	}
	return v.charAt(0).toLowerCase() + v.slice(1)
}

const methodError = (error) => ({ type: 'ERROR', payload: { error } })

const methodDone = (reply) => ({ type: 'DONE', payload: { reply } })

const messengerMethodHook = (key) => (payload) => {
	const ctx = useMsgrContext()
	const [state, dispatch] = useReducer(methodReducer, initialState)

	const callback = useCallback(() => {
		const clientKey = uncap(key)
		if (!Object.keys(ctx.client).includes(clientKey)) {
			dispatch(methodError(new Error(`Couldn't find method '${key}'`)))
			return
		}
		ctx.client[clientKey](payload)
			.then((reply) => {
				dispatch(methodDone(reply))
			})
			.catch((err) => {
				dispatch(methodError(err))
			})
	}, [ctx.client, payload])

	const refresh = useCallback(() => {
		dispatch({ type: 'RESET' })
		callback()
	}, [callback])

	return { done: state.done, reply: state.reply, error: state.error, refresh }
}

const messengerMethods = messengerpb?.MessengerService?.resolveAll()?.methods || {}

const messengerMethodsHooks = Object.keys(messengerMethods).reduce(
	(r, key) => ({ ...r, ['use' + key]: messengerMethodHook(key) }),
	{},
)

export default messengerMethodsHooks
