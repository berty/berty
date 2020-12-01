import { useReducer, useCallback } from 'react'

import beapi from '@berty-tech/api'

import { MessengerMethodsHooks, ProtocolMethodsHooks } from './types.gen'
import { MsgrState, useMsgrContext } from './context'

const initialState: MethodState<any> = { error: null, reply: null, done: false, called: false }

const methodReducer = (state: MethodState<any>, action: any) => {
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

const uncap = (v: any) => {
	if (typeof v !== 'string') {
		return v
	}
	return v.charAt(0).toLowerCase() + v.slice(1)
}

const errorAction = (error: any) => ({ type: 'ERROR', payload: { error } })

const doneAction = (reply: any) => ({ type: 'DONE', payload: { reply } })

const callAction = () => ({ type: 'CALL' })

// TODO: UnknownMethod class

const makeMethodHook = <R>(getClient: (ctx: any) => any, key: string) => () => {
	const ctx = useMsgrContext()
	const client = getClient(ctx)

	const [state, dispatch] = useReducer<(state: MethodState<R>, action: any) => MethodState<R>>(
		methodReducer,
		initialState,
	)

	const call = useCallback(
		(payload) => {
			if (client === null) {
				console.warn('client is null')
				return
			}

			const clientKey = uncap(key)
			if (!Object.keys(client).includes(clientKey)) {
				dispatch(errorAction(new Error(`Couldn't find method '${key}'`)))
				return
			}
			dispatch(callAction())
			client[clientKey](payload)
				.then((reply: R) => {
					dispatch(doneAction(reply))
				})
				.catch((err: any) => {
					dispatch(errorAction(err))
				})
		},
		[client],
	)

	const refresh = useCallback(
		(payload) => {
			console.warn('Using deprecated "refresh" in method hook, please use "call" instead')
			call(payload)
		},
		[call],
	)

	return { call, refresh, ...state }
}

const getServiceMethods = (service: any) => {
	try {
		return service.resolveAll().methods
	} catch (e) {
		return {}
	}
}

const makeServiceHooks = <S>(service: S, getClient: (ctx: MsgrState) => any) =>
	Object.keys(getServiceMethods(service)).reduce(
		(r, key) => ({ ...r, ['use' + key]: makeMethodHook(getClient, key) }),
		{},
	)

export const messengerMethodsHooks: MessengerMethodsHooks = makeServiceHooks(
	beapi.messenger.MessengerService,
	(ctx) => ctx.client,
) as any

export const protocolMethodsHooks: ProtocolMethodsHooks = makeServiceHooks(
	beapi.protocol.ProtocolService,
	(ctx) => ctx.protocolClient,
) as any

export default { ...protocolMethodsHooks, ...messengerMethodsHooks }

type MethodState<R> = {
	error: any
	reply: R
	done: boolean
	called: boolean
}
