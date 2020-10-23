import { useReducer, useCallback } from 'react'
import { useMsgrContext } from './context'
import { messenger as messengerpb, protocol as protocolpb } from '@berty-tech/api/index.js'

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

const makeServiceHooks = (service: any, getClient: any) =>
	Object.keys(getServiceMethods(service)).reduce(
		(r, key) => ({ ...r, ['use' + key]: makeMethodHook(getClient, key) }),
		{},
	)

export const messengerMethodsHooks = makeServiceHooks(
	messengerpb.MessengerService,
	(ctx: any) => ctx.client,
)

export const protocolMethodsHooks = makeServiceHooks(
	protocolpb.ProtocolService,
	(ctx: any) => ctx.protocolClient,
)

export default messengerMethodsHooks as any

type MethodState<R> = {
	error: any
	reply: R
	done: boolean
	called: boolean
}
