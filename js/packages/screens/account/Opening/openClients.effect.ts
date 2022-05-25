import { grpc } from '@improbable-eng/grpc-web'
import { EventEmitter } from 'events'
import { Platform } from 'react-native'

import beapi from '@berty/api'
import { GRPCError, createServiceClient } from '@berty/grpc-bridge'
import { logger } from '@berty/grpc-bridge/middleware'
import { bridge as rpcBridge, grpcweb as rpcWeb } from '@berty/grpc-bridge/rpc'
import { deserializeFromBase64 } from '@berty/grpc-bridge/rpc/utils'
import {
	WelshMessengerServiceClient,
	WelshProtocolServiceClient,
} from '@berty/grpc-bridge/welsh-clients.gen'
import { streamEventToAction as streamEventToReduxAction } from '@berty/redux/messengerActions'
import { setClients, setStreamError, setClearClients } from '@berty/redux/reducers/ui.reducer'
import { AppDispatch } from '@berty/redux/store'
import { accountClient } from '@berty/utils/accounts/accountClient'
import { convertMAddr } from '@berty/utils/ipfs/convertMAddr'
import { requestAndPersistPushToken } from '@berty/utils/notification/notif-push'

const messengerEventStream = (
	messengerClient: WelshMessengerServiceClient,
	eventEmitter: EventEmitter,
	dispatch: AppDispatch,
) =>
	new Promise<void>(async (resolve, reject) => {
		let cancel: () => Promise<void>
		messengerClient
			.eventStream({ shallowAmount: 20 })
			.then(async stream => {
				cancel = async () => await stream.stop()
				stream.onMessage((msg, err) => {
					try {
						if (err) {
							if (
								err?.EOF ||
								(err instanceof GRPCError &&
									(err?.grpcErrorCode() === beapi.bridge.GRPCErrCode.CANCELED ||
										err?.grpcErrorCode() === beapi.bridge.GRPCErrCode.UNAVAILABLE))
							) {
								// do nothing
							} else {
								console.warn('events stream onMessage error:', err)
								dispatch(setStreamError({ error: err }))
								reject(err)
							}
						}

						const evt = msg?.event
						if (!evt || evt.type === null || evt.type === undefined) {
							console.warn('received empty or undefined event')
							return
						}

						const action = streamEventToReduxAction(evt)
						if (action?.type === 'messenger/Notified') {
							const enumName =
								beapi.messenger.StreamEvent.Notified.Type[
									action.payload.type || beapi.messenger.StreamEvent.Notified.Type.Unknown
								]
							if (!enumName) {
								console.warn('failed to get event type name')
								return
							}

							const payloadName = enumName.substring('Type'.length)
							const pbobj = (beapi.messenger.StreamEvent.Notified as any)[payloadName]
							if (!pbobj) {
								console.warn('failed to find a protobuf object matching the notification type')
								return
							}
							if (typeof action.payload.payload === 'string') {
								action.payload.payload = deserializeFromBase64(action.payload.payload)
							}
							action.payload.payload =
								action.payload.payload === undefined ? {} : pbobj.decode(action.payload.payload)
							eventEmitter.emit('notification', {
								type: action.payload.type,
								name: payloadName,
								payload: action.payload,
							})
						}
						if (action) {
							// this event is the last message that say that all events are done for opening an account
							if (action.type === 'messenger/ListEnded') {
								resolve()
							}
							dispatch(action)
						}
					} catch (err) {
						console.warn('failed to handle stream event (', msg?.event, '):', err)
					}
				})
				await stream.start()
			})
			.catch(err => {
				if (err instanceof GRPCError && err?.EOF) {
					console.info('end of the events stream')
					resolve()
				} else {
					console.warn('events stream error:', err)
					dispatch(setStreamError({ error: err }))
					reject(err)
				}
			})
		dispatch(setClearClients(async () => await cancel()))
	})

export const openClients = async (
	eventEmitter: EventEmitter,
	dispatch: AppDispatch,
): Promise<{
	messengerClient: WelshMessengerServiceClient
	protocolClient: WelshProtocolServiceClient
}> => {
	console.log('starting stream')

	let messengerClient, protocolClient

	if (Platform.OS === 'web') {
		const openedAccount = await accountClient?.getOpenedAccount({})
		const url = convertMAddr(openedAccount?.listeners || [])

		if (url === null) {
			throw new Error('unable to find service address')
		}

		const opts = {
			transport: grpc.CrossBrowserHttpTransport({ withCredentials: false }),
			host: url,
		}

		protocolClient = createServiceClient(
			beapi.protocol.ProtocolService,
			rpcWeb(opts),
		) as unknown as WelshProtocolServiceClient

		messengerClient = createServiceClient(
			beapi.messenger.MessengerService,
			rpcWeb(opts),
		) as unknown as WelshMessengerServiceClient
	} else {
		messengerClient = createServiceClient(
			beapi.messenger.MessengerService,
			rpcBridge,
			logger.create('MESSENGER'),
		)
		protocolClient = createServiceClient(
			beapi.protocol.ProtocolService,
			rpcBridge,
			logger.create('PROTOCOL'),
		)
	}

	// request push notifications token
	if (Platform.OS === 'ios' || Platform.OS === 'android') {
		requestAndPersistPushToken(protocolClient).catch(e => console.warn(e))
	}

	// call messenger client event stream
	await messengerEventStream(messengerClient, eventEmitter, dispatch)

	dispatch(setClients({ messengerClient, protocolClient }))

	return { messengerClient, protocolClient }
}
