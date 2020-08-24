import { useMemo, useReducer, useCallback } from 'react'
import { useMsgrContext } from './context'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import mapValues from 'lodash/mapValues'

const noop = () => {}

const methodReducer = (state, action = {}) => {
	switch (action.type) {
		case 'ERROR':
			return { error: action.payload.error }
		case 'DONE':
			return { reply: action.payload.reply }
		default:
			console.warn(`Unknown methodReducer action ${action.type}`)
			return state
	}
}

const methodInitialState = { error: null, reply: null }

const methodError = (error) => ({ type: 'ERROR', payload: { error } })

const methodDone = (reply) => ({ type: 'DONE', payload: { reply } })

const messengerMethodHook = (key) => (payload) => {
	const ctx = useMsgrContext()
	const [state, dispatch] = useReducer(methodReducer, methodInitialState)
	const callback = useCallback(() => {
		if (!Object.keys(ctx.client).includes(key)) {
			dispatch(methodError(new Error(`Couldn't find method '${key}'`)))
			return
		}
		ctx.client[key](payload)
			.then((error, reply) => {
				if (error) {
					dispatch(methodError(error))
					return
				}
				dispatch(methodDone(reply))
			})
			.catch((err) => {
				dispatch(methodError(err))
			})
	}, [ctx.client, payload])
	return [callback, state.reply, state.error]
}

const messengerMethods = messengerpb?.MessengerService?.resolveAll()?.methods || {}

const messengerMethodsHooks = mapValues(messengerMethods, (_, key) => messengerMethodHook(key))

export default messengerMethodsHooks
