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
import {
	MESSENGER_APP_STATE,
	setNextAccount,
	setStateClients,
	setStateOpening,
	setStateStreamDone,
	setStateStreamInProgress,
	setStreamError,
	UiState,
} from '@berty/redux/reducers/ui.reducer'
import { AppDispatch, persistor } from '@berty/redux/store'
import { accountClient, storageGet } from '@berty/utils/accounts/accountClient'
import { defaultCLIArgs } from '@berty/utils/accounts/defaultCLIArgs'
import { convertMAddr } from '@berty/utils/ipfs/convertMAddr'
import { requestAndPersistPushToken } from '@berty/utils/notification/notif-push'
import { GlobalPersistentOptionsKeys } from '@berty/utils/persistent-options/types'
import { StreamInProgress } from '@berty/utils/protocol/progress.types'

const openAccountWithProgress = async (
	cliArgs: string[],
	selectedAccount: string | null,
	dispatch: AppDispatch,
) => {
	console.log('Opening account', selectedAccount)

	try {
		const stream = await accountClient.openAccountWithProgress({
			args: cliArgs,
			accountId: selectedAccount?.toString(),
			sessionKind: Platform.OS === 'web' ? 'desktop-electron' : null,
		})
		stream.onMessage((msg, err) => {
			if (err?.EOF) {
				console.log('activating persist with account:', selectedAccount?.toString())
				persistor.persist()
				console.log('opening account: stream closed')
				dispatch(setStateStreamDone())
				return
			}
			if (err && !err.OK) {
				console.warn('open account error:', err.error.errorCode)
				dispatch(setStreamError({ error: new Error(`Failed to start node: ${err}`) }))
				return
			}
			if (msg?.progress?.state !== 'done') {
				const progress = msg?.progress
				if (progress) {
					const payload: StreamInProgress = {
						msg: progress,
						stream: 'Open account',
					}
					dispatch(setStateStreamInProgress(payload))
				}
			}
		})
		await stream.start()
		console.log('node is opened')
	} catch (err) {
		dispatch(setStreamError({ error: new Error(`Failed to start node: ${err}`) }))
	}
}

const openingDaemon = async (selectedAccount: string | null, dispatch: AppDispatch) => {
	if (selectedAccount === null) {
		console.warn('openingDaemon / no account opened')
		return
	}

	let tyberHost = ''
	try {
		tyberHost = (await storageGet(GlobalPersistentOptionsKeys.TyberHost)) || ''
		if (tyberHost !== '') {
			console.warn(`connecting to ${tyberHost}`)
		}
	} catch (e) {
		console.warn(e)
	}

	// FIXME: pass tyber host as arg
	const cliArgs = defaultCLIArgs

	let openedAccount: beapi.account.GetOpenedAccount.Reply

	try {
		openedAccount = await accountClient.getOpenedAccount({})

		if (openedAccount.accountId !== selectedAccount) {
			if (openedAccount.accountId !== '') {
				await accountClient.closeAccount({})
			}

			await openAccountWithProgress(cliArgs, selectedAccount, dispatch)
		}
	} catch (e) {
		console.log(`account seems to be unopened yet ${e}`)
	}
}

const messengerEventStream = (
	messengerClient: WelshMessengerServiceClient,
	eventEmitter: EventEmitter,
	dispatch: AppDispatch,
) => {
	let precancel = false
	messengerClient
		.eventStream({ shallowAmount: 20 })
		.then(async stream => {
			if (precancel) {
				await stream.stop()
				return
			}
			stream.onMessage((msg, err) => {
				try {
					if (err) {
						if (
							err?.EOF ||
							(err instanceof GRPCError &&
								(err?.grpcErrorCode() === beapi.bridge.GRPCErrCode.CANCELED ||
									err?.grpcErrorCode() === beapi.bridge.GRPCErrCode.UNAVAILABLE))
						) {
							return
						}
						console.warn('events stream onMessage error:', err)
						dispatch(setStreamError({ error: err }))
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
				precancel = true
				dispatch(setNextAccount())
			} else {
				console.warn('events stream error:', err)
				precancel = true
				dispatch(setStreamError({ error: err }))
			}
		})
}

const openingClients = async (eventEmitter: EventEmitter, dispatch: AppDispatch): Promise<void> => {
	console.log('starting stream')

	let messengerClient, protocolClient

	if (Platform.OS === 'web') {
		const openedAccount = await accountClient?.getOpenedAccount({})
		const url = convertMAddr(openedAccount?.listeners || [])

		if (url === null) {
			console.error('unable to find service address')
			return
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
	messengerEventStream(messengerClient, eventEmitter, dispatch)

	dispatch(setStateClients({ messengerClient, protocolClient }))
}

export const openingDaemonAndClients = async (
	ui: UiState,
	eventEmitter: EventEmitter,
	dispatch: AppDispatch,
) => {
	if (ui.appState !== MESSENGER_APP_STATE.TO_OPEN) {
		return
	}

	dispatch(setStateOpening())

	try {
		// opening berty daemon
		await openingDaemon(ui.selectedAccount, dispatch)

		// opening messenger and protocol clients
		await openingClients(eventEmitter, dispatch)
	} catch (err) {
		console.warn(err)
	}
}
