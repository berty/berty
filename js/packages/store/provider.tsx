import React from 'react'
import * as middleware from '@berty-tech/grpc-bridge/middleware'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { grpcweb as rpcWeb, bridge as rpcBridge } from '@berty-tech/grpc-bridge/rpc'
import { Service, EOF } from '@berty-tech/grpc-bridge'
import ExternalTransport from './externalTransport'
import cloneDeep from 'lodash/cloneDeep'
import GoBridge, { GoLogLevel } from '@berty-tech/go-bridge'
import MsgrContext, { initialState } from './context'

const T = messengerpb.StreamEvent.Type

const reducer = (oldState, action) => {
	const state = cloneDeep(oldState) // TODO: optimize rerenders
	console.log('reducing', action)
	switch (action.type) {
		case 'SET_STREAM_ERROR':
			state.streamError = action.payload.error
			break
		case 'CLEAR':
			return initialState
		case 'SET_CLIENT':
			state.client = action.payload.client
			break
		case 'DELETE_STATE_UPDATED':
			state.deleteState = action.payload.state
			break
		case T.TypeConversationUpdated:
			const conv = action.payload.conversation
			state.conversations[conv.publicKey] = conv
			break
		case T.TypeAccountUpdated:
			const acc = action.payload.account
			state.account = acc
			break
		case T.TypeContactUpdated:
			const contact = action.payload.contact
			state.contacts[contact.publicKey] = contact
			break
		case T.TypeListEnd:
			state.listDone = true
			break
		case T.TypeInteractionUpdated:
			try {
				const inte = action.payload.interaction
				const gpk = inte.conversationPublicKey
				if (!state.interactions[gpk]) {
					state.interactions[gpk] = {}
				}
				const typeName = Object.keys(messengerpb.AppMessage.Type).find(
					(name) => messengerpb.AppMessage.Type[name] === inte.type,
				)
				const name = typeName.substr('Type'.length)
				const pbobj = messengerpb.AppMessage[name]
				if (!pbobj) {
					throw new Error('failed to find a protobuf object matching the event type')
				}
				inte.name = name
				inte.payload = pbobj.decode(inte.payload).toJSON()
				console.log('jsoned payload', inte.payload)
				console.log('received inte', inte)
				state.interactions[gpk][inte.cid] = inte
			} catch (e) {
				console.warn('failed to reduce interaction', e)
				return oldState
			}
			break
		default:
			console.warn('Unknown action type', action.type)
	}
	// console.log('new global state', state)
	return state
}

export const MsgrProvider = ({ children, daemonAddress, embedded }) => {
	const [state, dispatch] = React.useReducer(reducer, { ...initialState, daemonAddress })
	const [restartCount, setRestartCount] = React.useState(0)
	const [nodeStarted, setNodeStarted] = React.useState(false)

	const restart = React.useCallback(() => {
		setNodeStarted(false)
		dispatch({ type: 'CLEAR' })
		setRestartCount(restartCount + 1)
	}, [restartCount])

	const deleteAccount = React.useCallback(async () => {
		if (!embedded) {
			return
		}
		dispatch({ type: 'DELETE_STATE_UPDATED', payload: { state: 'STOPING_DAEMON' } })
		await GoBridge.stopProtocol()
		dispatch({ type: 'DELETE_STATE_UPDATED', payload: { state: 'CLEARING_STORAGE' } })
		await GoBridge.clearStorage()
		dispatch({ type: 'DELETE_STATE_UPDATED', payload: { state: 'DONE' } })
	}, [embedded])

	React.useEffect(() => {
		if (state.deleteState === 'DONE') {
			restart()
		}
	}, [restart, state.deleteState])

	React.useEffect(() => {
		if (!embedded) {
			return
		}
		console.log('starting daemon')
		GoBridge.startProtocol({
			persistence: true,
			logLevel: GoLogLevel.debug,
		})
			.then(() => {
				setNodeStarted(true)
			})
			.catch((err) => dispatch({ type: 'SET_STREAM_ERROR', payload: { error: err } }))
		return () => GoBridge.stopProtocol()
	}, [embedded, restartCount])

	React.useEffect(() => {
		if (embedded && !nodeStarted) {
			return
		}

		console.log('starting stream')

		const messengerMiddlewares = middleware.chain(
			__DEV__ ? middleware.logger.create('MESSENGER') : null,
		)

		let rpc
		if (embedded) {
			rpc = rpcBridge
		} else {
			const opts = {
				transport: ExternalTransport(),
				host: daemonAddress,
			}
			rpc = rpcWeb(opts)
		}

		const messengerClient = Service(messengerpb.MessengerService, rpc, messengerMiddlewares)

		dispatch({ type: 'CLEAR' })
		dispatch({ type: 'SET_CLIENT', payload: { client: messengerClient } })

		let precancel = false
		let cancel = () => {
			precancel = true
		}
		messengerClient
			.eventStream({})
			.then(async (stream) => {
				if (precancel) {
					return
				}
				stream.onMessage((msg, err) => {
					if (err) {
						console.warn('events stream onMessage error:', err)
						dispatch({ type: 'SET_STREAM_ERROR', payload: { error: err } })
						return
					}
					const evt = msg && msg.event
					if (!evt) {
						console.warn('received empty event')
						return
					}
					const enumName = Object.keys(messengerpb.StreamEvent.Type).find(
						(name) => messengerpb.StreamEvent.Type[name] === evt.type,
					)
					const payloadName = enumName.substr('Type'.length)
					const pbobj = messengerpb.StreamEvent[payloadName]
					if (!pbobj) {
						console.warn('failed to find a protobuf object matching the event type')
						return
					}
					dispatch({ type: evt.type, name: payloadName, payload: pbobj.decode(evt.payload) })
				})
				cancel = await stream.start()
			})
			.catch((err) => {
				if (err === EOF) {
					console.info('end of the events stream')
				} else {
					console.warn('events stream error:', err)
				}
				dispatch({ type: 'SET_STREAM_ERROR', payload: { error: err } })
			})
		return () => cancel()
	}, [daemonAddress, embedded, nodeStarted])
	return (
		<MsgrContext.Provider value={{ ...state, restart, deleteAccount }}>
			{children}
		</MsgrContext.Provider>
	)
}

export default MsgrProvider
