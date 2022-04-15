import { useReducer, useCallback } from 'react'

import beapi from '@berty/api'

import { MessengerMethodsHooks, ProtocolMethodsHooks } from './types.gen'
import { useSelector } from 'react-redux'
import { selectClient } from '@berty/redux/reducers/ui.reducer'
import { WelshMessengerServiceClient } from '@berty/grpc-bridge/welsh-clients.gen'

const initialState: MethodState<any> = {
	error: null,
	reply: null,
	done: false,
	called: false,
	loading: false,
}

const methodReducer = (state: MethodState<any>, action: any) => {
	switch (action.type) {
		case 'ERROR':
			return { ...state, error: action.payload.error, done: true, loading: false }
		case 'DONE':
			return { ...state, reply: action.payload.reply, done: true, loading: false }
		case 'CALL':
			return { ...initialState, called: true, loading: true }
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

const makeMethodHook =
	<R>(key: string) =>
	() => {
		const client = useSelector(selectClient)

		const [state, dispatch] = useReducer<(state: MethodState<R>, action: any) => MethodState<R>>(
			methodReducer,
			initialState,
		)

		const call = useCallback(
			payload => {
				if (client === null) {
					console.warn('client is null', client)
					return
				}

				const clientKey: keyof WelshMessengerServiceClient = uncap(key)
				if (!Object.keys(client).includes(clientKey)) {
					dispatch(errorAction(new Error(`Couldn't find method '${key}'`)))
					return
				}
				dispatch(callAction())
				client[clientKey](payload)
					.then(reply => {
						dispatch(doneAction(reply))
					})
					.catch((err: unknown) => {
						dispatch(errorAction(err))
					})
			},
			[client],
		)

		const refresh = useCallback(
			payload => {
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

const makeServiceHooks = <S>(service: S) =>
	Object.keys(getServiceMethods(service)).reduce(
		(r, key) => ({ ...r, ['use' + key]: makeMethodHook(key) }),
		{},
	)

const messengerMethodsHooks: MessengerMethodsHooks = makeServiceHooks(
	beapi.messenger.MessengerService,
) as any

export const protocolMethodsHooks: ProtocolMethodsHooks = makeServiceHooks(
	beapi.protocol.ProtocolService,
) as any

export default { ...protocolMethodsHooks, ...messengerMethodsHooks }

type MethodState<R> = {
	error: any
	reply: R
	done: boolean
	called: boolean
	loading: boolean
}
