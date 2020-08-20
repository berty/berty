import React from 'react'
import * as middleware from '@berty-tech/grpc-bridge/middleware'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { grpcweb as rpcWeb } from '@berty-tech/grpc-bridge/rpc'
import { Service, EOF } from '@berty-tech/grpc-bridge'
import ExternalTransport from '@berty-tech/store/protocol/externalTransport'
import cloneDeep from 'lodash/cloneDeep'

/* global __DEV__ */

const initialState = {
	account: null,
	conversations: {},
	contacts: {},
	interactions: {},
	client: null,
	listDone: false,
	streamError: null,
}

export const MsgrContext = React.createContext(initialState)

const T = messengerpb.StreamEvent.Type

const reducer = (oldState, action) => {
	const state = cloneDeep(oldState) // TODO: optimize rerenders
	console.log('reducing', action)
	switch (action.type) {
		case 'SET_STREAM_ERROR':
			state.streamError = action.payload.error
			break
		case 'SET_CLIENT':
			state.client = action.payload.client
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
	console.log('new global state', state)
	return state
}

export const MsgrProvider = ({ children, daemonAddress }) => {
	const [state, dispatch] = React.useReducer(reducer, { ...initialState, daemonAddress })
	React.useEffect(() => {
		// TODO:: support embeded node
		const messengerMiddlewares = middleware.chain(
			__DEV__ ? middleware.logger.create('MESSENGER') : null,
		)
		const opts = {
			transport: ExternalTransport(),
			host: daemonAddress,
		}
		const rpc = rpcWeb(opts)
		const messengerClient = Service(messengerpb.MessengerService, rpc, messengerMiddlewares)
		dispatch({ type: 'SET_CLIENT', payload: { client: messengerClient } })
		let precancel = false
		const cancelObj = {
			cancel: () => {
				precancel = true
			},
		}
		messengerClient
			.eventStream({})
			.then((stream) => {
				stream.onMessage((msg, err) => {
					if (err) {
						dispatch({ type: 'SET_STREAM_ERROR', payload: { error: err } })
						return
					}
					console.log('got msg', msg, err)
					const evt = msg && msg.event
					if (!evt) return
					console.log('got event', evt)
					console.log('type', evt.type)
					const enumName = Object.keys(messengerpb.StreamEvent.Type).find(
						(name) => messengerpb.StreamEvent.Type[name] === evt.type,
					)
					console.log('event name', enumName)
					const payloadName = enumName.substr('Type'.length)
					const pbobj = messengerpb.StreamEvent[payloadName]
					if (!pbobj) {
						console.warn('failed to find a protobuf object matching the event type')
						return
					}
					dispatch({ type: evt.type, name: payloadName, payload: pbobj.decode(evt.payload) })
				})
				if (!precancel) {
					cancelObj.cancel = stream.start()
				}
			})
			.catch((err) => {
				if (err === EOF) {
					console.info('end of the events stream')
				} else if (err) {
					console.warn(err)
				}
				dispatch({ type: 'SET_STREAM_ERROR', payload: { error: err } })
			})
		return () => {
			cancelObj.cancel()
		}
	}, [daemonAddress, dispatch])
	return <MsgrContext.Provider value={state}>{children}</MsgrContext.Provider>
}
