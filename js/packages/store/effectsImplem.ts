import { EventEmitter } from 'events'
import cloneDeep from 'lodash/cloneDeep'
import { Platform } from 'react-native'
import { grpc } from '@improbable-eng/grpc-web'

import beapi from '@berty/api'
import i18n, { osLanguage } from '@berty/i18n'
import GoBridge, { GoBridgeDefaultOpts, GoBridgeOpts } from '@berty/go-bridge'
import { GRPCError, Service } from '@berty/grpc-bridge'
import { logger } from '@berty/grpc-bridge/middleware'
import { bridge as rpcBridge, grpcweb as rpcWeb } from '@berty/grpc-bridge/rpc'
import { ServiceClientType } from '@berty/grpc-bridge/welsh-clients.gen'
import store, { AppDispatch, persistor } from '@berty/redux/store'
import { streamEventToAction as streamEventToReduxAction } from '@berty/redux/messengerActions'
import RNFS from 'react-native-fs'
import {
	WelshMessengerServiceClient,
	WelshProtocolServiceClient,
} from '@berty/grpc-bridge/welsh-clients.gen'

import { accountService, convertMAddr, storageGet, storageRemove } from './accountService'
import { updateAccount, closeAccountWithProgress, refreshAccountList } from './accountUtils'
import { requestAndPersistPushToken } from './services'
import { GlobalPersistentOptionsKeys, StreamInProgress } from './types'
import { storageKeyForAccount } from './utils'
import { resetTheme } from '@berty/redux/reducers/theme.reducer'
import {
	bridgeClosed,
	MESSENGER_APP_STATE,
	setNextAccount,
	setStateClosed,
	setStateOnBoardingReady,
	setStateOpeningClients,
	setStateOpeningGettingLocalSettings,
	setStateOpeningListingEvents,
	setStateOpeningMarkConversationsClosed,
	setStatePreReady,
	setStateReady,
	setStateStreamDone,
	setStateStreamInProgress,
	setStreamError,
} from '@berty/redux/reducers/ui.reducer'
import { deserializeFromBase64 } from '@berty/grpc-bridge/rpc/utils'
import { PersistentOptions } from '@berty/redux/reducers/persistentOptions.reducer'

const openAccountWithProgress = async (
	bridgeOpts: GoBridgeOpts,
	selectedAccount: string | null,
) => {
	console.log('Opening account', selectedAccount)
	try {
		const stream = await accountService.openAccountWithProgress({
			args: bridgeOpts.cliArgs,
			accountId: selectedAccount?.toString(),
			sessionKind: Platform.OS === 'web' ? 'desktop-electron' : null,
		})
		stream.onMessage((msg, err) => {
			if (err?.EOF) {
				console.log('activating persist with account:', selectedAccount?.toString())
				persistor.persist()
				console.log('opening account: stream closed')
				store.dispatch(setStateStreamDone())
				store.dispatch(setStateOpeningClients())
				return
			}
			if (err && !err.OK) {
				console.warn('open account error:', err.error.errorCode)
				store.dispatch(setStreamError({ error: new Error(`Failed to start node: ${err}`) }))
				return
			}
			if (msg?.progress?.state !== 'done') {
				const progress = msg?.progress
				if (progress) {
					const payload: StreamInProgress = {
						msg: progress,
						stream: 'Open account',
					}
					store.dispatch(setStateStreamInProgress(payload))
				}
			}
		})
		await stream.start()
		console.log('node is opened')
	} catch (err) {
		store.dispatch(setStreamError({ error: new Error(`Failed to start node: ${err}`) }))
	}
}

const initBridge = async () => {
	try {
		console.log('bridge methods: ', Object.keys(GoBridge))
		await GoBridge.initBridge()
		console.log('bridge init done')
	} catch (err: any) {
		if (err?.message?.indexOf('already started') === -1) {
			console.error('unable to init bridge: ', err)
		} else {
			console.log('bridge already started: ', err)
		}
	}
}

export const initialLaunch = async (embedded: boolean) => {
	await initBridge()
	const f = async () => {
		const accounts = await refreshAccountList(embedded)

		if (Object.keys(accounts).length > 0) {
			let accountSelected: any = null
			Object.values(accounts).forEach(account => {
				if (!accountSelected) {
					accountSelected = account
				} else if (accountSelected && accountSelected.lastOpened < (account.lastOpened || 0)) {
					accountSelected = account
				}
			})

			// Delete berty-backup account
			const outFile =
				RNFS.TemporaryDirectoryPath + `/berty-backup-${accountSelected.accountId}` + '.tar'
			RNFS.unlink(outFile)
				.then(() => {
					console.log('File deleted')
				})
				.catch(() => {
					console.log('File berty backup does not exist') // here
				})
			store.dispatch(setNextAccount(accountSelected.accountId))
			return
		} else {
			store.dispatch(setStateOnBoardingReady())
		}
	}

	f().catch(e => console.warn(e))
}

// handle state openingGettingLocalSettings
export const openingLocalSettings = async (
	appState: MESSENGER_APP_STATE[keyof MESSENGER_APP_STATE],
) => {
	if (appState !== MESSENGER_APP_STATE.OPENING_GETTING_LOCAL_SETTINGS) {
		return
	}

	try {
		store.dispatch(setStateOpeningMarkConversationsClosed())
	} catch (e) {
		console.warn('unable to get persistent options', e)
	}
}

// handle state OpeningWaitingForDaemon
export const openingDaemon = async (
	appState: MESSENGER_APP_STATE[keyof MESSENGER_APP_STATE],
	selectedAccount: string | null,
) => {
	if (appState !== MESSENGER_APP_STATE.OPENING_WAITING_FOR_DAEMON) {
		return
	}

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

	// Apply store options
	let bridgeOpts: GoBridgeOpts
	try {
		let opts: PersistentOptions | undefined
		let store = await storageGet(storageKeyForAccount(selectedAccount.toString()))
		if (store) {
			opts = JSON.parse(store)
		}

		bridgeOpts = cloneDeep(GoBridgeDefaultOpts)

		// set log flag
		bridgeOpts.cliArgs = opts?.log?.format
			? [...bridgeOpts.cliArgs!, `--log.format=${opts?.log?.format}`]
			: [...bridgeOpts.cliArgs!, '--log.format=console']

		// set log filter opt
		bridgeOpts.logFilters = opts?.logFilters?.format
			? opts?.logFilters?.format
			: 'info+:bty*,-*.grpc warn+:*.grpc error+:*'
	} catch (e) {
		console.warn('store getPersistentOptions Failed:', e)
		bridgeOpts = cloneDeep(GoBridgeDefaultOpts)
	}

	let openedAccount: beapi.account.GetOpenedAccount.Reply

	try {
		openedAccount = await accountService.getOpenedAccount({})

		if (openedAccount.accountId !== selectedAccount) {
			if (openedAccount.accountId !== '') {
				await accountService.closeAccount({})
			}

			await openAccountWithProgress(bridgeOpts, selectedAccount)
		}

		store.dispatch(setStateOpeningClients())
	} catch (e) {
		console.log(`account seems to be unopened yet ${e}`)
	}
}

// handle state OpeningWaitingForClients
export const openingClients = async (
	appState: MESSENGER_APP_STATE[keyof MESSENGER_APP_STATE],
	eventEmitter: EventEmitter,
	daemonAddress: string,
	embedded: boolean,
	dispatch: AppDispatch,
): Promise<void> => {
	if (appState !== MESSENGER_APP_STATE.OPENING_WAITING_FOR_CLIENTS) {
		return
	}

	console.log('starting stream')

	let messengerClient, protocolClient

	if (Platform.OS === 'web') {
		const openedAccount = await accountService?.getOpenedAccount({})
		const url = convertMAddr(openedAccount?.listeners || [])

		if (url === null) {
			console.error('unable to find service address')
			return
		}

		const opts = {
			transport: grpc.CrossBrowserHttpTransport({ withCredentials: false }),
			host: url,
		}

		protocolClient = Service(
			beapi.protocol.ProtocolService,
			rpcWeb(opts),
		) as unknown as WelshProtocolServiceClient

		messengerClient = Service(
			beapi.messenger.MessengerService,
			rpcWeb(opts),
		) as unknown as WelshMessengerServiceClient
	} else {
		messengerClient = Service(
			beapi.messenger.MessengerService,
			rpcBridge,
			logger.create('MESSENGER'),
		)
		protocolClient = Service(beapi.protocol.ProtocolService, rpcBridge, logger.create('PROTOCOL'))
	}

	if (Platform.OS === 'ios' || Platform.OS === 'android') {
		requestAndPersistPushToken(protocolClient).catch(e => console.warn(e))
	}

	let precancel = false
	let cancel = () => {
		precancel = true
	}

	messengerClient
		.eventStream({ shallowAmount: 20 })
		.then(async stream => {
			if (precancel) {
				await stream.stop()
				return
			}
			cancel = () => stream.stop()
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
						store.dispatch(setStreamError({ error: err }))
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
				store.dispatch(setStateClosed())
			} else {
				console.warn('events stream error:', err)
				store.dispatch(setStreamError({ error: err }))
			}
		})
	dispatch(
		setStateOpeningListingEvents({ messengerClient, protocolClient, clearClients: () => cancel() }),
	)
}

// handle state OpeningMarkConversationsAsClosed
export const openingCloseConvos = async (
	appState: MESSENGER_APP_STATE[keyof MESSENGER_APP_STATE],
	client: ServiceClientType<beapi.messenger.MessengerService> | null,
	conversations: { [key: string]: beapi.messenger.IConversation | undefined },
	persistentOptions: PersistentOptions,
) => {
	if (appState !== MESSENGER_APP_STATE.OPENING_MARK_CONVERSATIONS_AS_CLOSED) {
		return
	}

	if (client === null) {
		console.warn('client is null')
		return
	}

	for (const conv of Object.values(conversations).filter(conv => conv?.isOpen) as any) {
		client.conversationClose({ groupPk: conv.publicKey }).catch((e: any) => {
			console.warn(`failed to close conversation "${conv.displayName}",`, e)
		})
	}
	persistentOptions.onBoardingFinished.isFinished
		? store.dispatch(setStateReady())
		: store.dispatch(setStatePreReady())
}

export const syncAccountLanguage = async (accountLanguage: string | undefined) => {
	await i18n.changeLanguage(accountLanguage || osLanguage)
}

// handle state PreReady
export const updateAccountsPreReady = async (
	appState: MESSENGER_APP_STATE[keyof MESSENGER_APP_STATE],
	client: ServiceClientType<beapi.messenger.MessengerService> | null,
	selectedAccount: string | null,
	account: beapi.messenger.IAccount | null | undefined,
	protocolClient: ServiceClientType<beapi.protocol.ProtocolService> | null,
	embedded: boolean,
) => {
	if (appState !== MESSENGER_APP_STATE.PRE_READY) {
		return
	}
	const displayName = await storageGet(GlobalPersistentOptionsKeys.DisplayName)
	await storageRemove(GlobalPersistentOptionsKeys.DisplayName)
	await storageRemove(GlobalPersistentOptionsKeys.IsNewAccount)
	if (displayName) {
		await client?.accountUpdate({ displayName }).catch(err => console.error(err))
		// update account in bertyaccount
		await updateAccount(embedded, {
			accountName: displayName,
			accountId: selectedAccount,
			publicKey: account?.publicKey,
		})
	}
	store.dispatch(resetTheme())
	// TODO: fix flow of asking permissions
	// const config = await accountService.networkConfigGet({ accountId: selectedAccount })
	// if (config.currentConfig?.staticRelay && config.currentConfig?.staticRelay[0] === ':default:') {
	// 	await servicesAuthViaURL(protocolClient, bertyOperatedServer)
	// }
}

// handle states DeletingClosingDaemon, ClosingDaemon
export const closingDaemon = (
	appState: MESSENGER_APP_STATE[keyof MESSENGER_APP_STATE],
	clearClients: (() => Promise<void>) | (() => void) | null,
	dispatch: AppDispatch,
) => {
	if (
		appState !== MESSENGER_APP_STATE.CLOSING_DAEMON &&
		appState !== MESSENGER_APP_STATE.DELETING_CLOSING_DAEMON
	) {
		return
	}
	return () => {
		const f = async () => {
			try {
				if (clearClients) {
					await clearClients()
				}
				await closeAccountWithProgress(dispatch)
			} catch (e) {
				console.warn('unable to stop protocol', e)
			}
			dispatch(bridgeClosed())
		}

		f().catch(e => {
			console.warn(e)
		})
	}
}

// handle state DeletingClearingStorage
export const deletingStorage = (
	appState: MESSENGER_APP_STATE[keyof MESSENGER_APP_STATE],
	embedded: boolean,
	selectedAccount: string | null,
) => {
	if (appState !== MESSENGER_APP_STATE.DELETING_CLEARING_STORAGE) {
		return
	}

	const f = async () => {
		if (selectedAccount !== null) {
			await accountService.deleteAccount({ accountId: selectedAccount })
			await storageRemove(storageKeyForAccount(selectedAccount))
			await refreshAccountList(embedded)
		} else {
			console.warn('state.selectedAccount is null and this should not occur')
		}

		store.dispatch(setStateClosed())
	}

	f().catch(e => console.error(e))
}

export const openingListingEvents = (
	appState: MESSENGER_APP_STATE[keyof MESSENGER_APP_STATE],
	initialListComplete: boolean,
) => {
	if (appState !== MESSENGER_APP_STATE.OPENING_LISTING_EVENTS) {
		return
	}

	if (!initialListComplete) {
		console.info('waiting for initial listing to be completed')
		return
	}

	store.dispatch(setStateOpeningGettingLocalSettings())
}
