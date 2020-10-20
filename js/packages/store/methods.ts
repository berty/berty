import { useReducer, useCallback } from 'react'
import { useMsgrContext } from './context'
import { messenger as messengerpb } from '@berty-tech/api/index.js'

const initialState = { error: null, reply: null, done: false, called: false }

const methodReducer = (state, action = {}) => {
	switch (action.type) {
		case 'ERROR':
			return { ...state, error: action.payload.error, done: true }
		case 'DONE':
			return { ...state, reply: action.payload.reply, done: true }
		case 'CALL':
			return { ...initialState, called: true }
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

const errorAction = (error) => ({ type: 'ERROR', payload: { error } })

const doneAction = (reply) => ({ type: 'DONE', payload: { reply } })

const callAction = () => ({ type: 'CALL' })

// TODO: UnknownMethod class

const messengerMethodHook = (key) => () => {
	const ctx = useMsgrContext()

	const [state, dispatch] = useReducer(methodReducer, initialState)

	const call = useCallback(
		(payload) => {
			const clientKey = uncap(key)
			if (!Object.keys(ctx.client).includes(clientKey)) {
				dispatch(errorAction(new Error(`Couldn't find method '${key}'`)))
				return
			}
			dispatch(callAction())
			ctx.client[clientKey](payload)
				.then((reply) => {
					dispatch(doneAction(reply))
				})
				.catch((err) => {
					dispatch(errorAction(err))
				})
		},
		[ctx.client],
	)

	const refresh = useCallback(
		(payload) => {
			console.warn('Using deprecated "refresh" in messenger method hook, please use "call" instead')
			call(payload)
		},
		[call],
	)

	return { call, refresh, ...state }
}

const getMessengerMethods = () => {
	try {
		return messengerpb.MessengerService.resolveAll().methods
	} catch (e) {
		return {}
	}
}

const messengerMethodsHooks = Object.keys(getMessengerMethods()).reduce(
	(r, key) => ({ ...r, ['use' + key]: messengerMethodHook(key) }),
	{},
)

export default messengerMethodsHooks as any
