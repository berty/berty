import { EventEmitter } from 'events'
import AsyncStorage from '@react-native-community/async-storage'
import cloneDeep from 'lodash/cloneDeep'

import { bridge as rpcBridge, grpcweb as rpcWeb } from '@berty-tech/grpc-bridge/rpc'
import beapi from '@berty-tech/api'
import { ServiceClientType } from '@berty-tech/grpc-bridge/welsh-clients.gen'
import i18n from '@berty-tech/berty-i18n'
import { Service } from '@berty-tech/grpc-bridge'
import GoBridge, { GoBridgeDefaultOpts, GoBridgeOpts } from '@berty-tech/go-bridge'

import ExternalTransport from './externalTransport'
import {
	createNewAccount,
	refreshAccountList,
	closeAccountWithProgress,
} from './effectableCallbacks'
import {
	defaultPersistentOptions,
	MessengerActions,
	MessengerAppState,
	PersistentOptions,
	PersistentOptionsKeys,
	reducerAction,
	accountService,
} from './context'

export const openAccountWithProgress = async (
	dispatch: (arg0: reducerAction) => void,
	bridgeOpts: GoBridgeOpts,
	selectedAccount: string | null,
) => {
	await accountService
		.openAccountWithProgress({
			args: bridgeOpts.cliArgs,
			accountId: selectedAccount?.toString(),
			loggerFilters: bridgeOpts.logFilters,
		})
		.then(async (stream) => {
			stream.onMessage((msg, _) => {
				if (msg?.progress?.doing !== 'done') {
					dispatch({
						type: MessengerActions.SetStateStreamInProgress,
						payload: {
							msg: msg,
							stream: 'Open account',
						},
					})
				} else {
					dispatch({
						type: MessengerActions.SetStateStreamDone,
					})
				}
				return
			})
			await stream.start()
			console.log('node is opened')
			dispatch({ type: MessengerActions.SetStateOpeningClients })
		})
		.catch((err) => {
			dispatch({
				type: MessengerActions.SetStreamError,
				payload: { error: new Error(`Failed to start node: ${err}`) },
			})
		})
}

export const storageKeyForAccount = (accountID: string) => `storage_${accountID}`

const getPersistentOptions = async (
	dispatch: (arg0: reducerAction) => void,
	selectedAccount: string | null,
) => {
	if (selectedAccount === null) {
		console.warn('getPersistentOptions / no account opened')
		return
	}

	try {
		let opts = defaultPersistentOptions()
		let storedOpts = await AsyncStorage.getItem(storageKeyForAccount(selectedAccount))

		if (storedOpts !== null) {
			const parsed = JSON.parse(storedOpts)

			for (let key of Object.values(PersistentOptionsKeys)) {
				opts[key] = { ...opts[key], ...(parsed[key] || {}) }
			}
		}

		if (i18n.language !== opts.i18n.language) {
			await i18n.changeLanguage(opts.i18n.language)
		}

		dispatch({
			type: MessengerActions.SetPersistentOption,
			payload: opts,
		})
	} catch (e) {
		console.warn('store getPersistentOptions Failed:', e)
		return
	}
}

export const tyberHostStorageKey = 'global-storage_tyber-host'

export const initialLaunch = async (dispatch: (arg0: reducerAction) => void, embedded: boolean) => {
	const tyberHost =
		(await AsyncStorage.getItem(tyberHostStorageKey)) ||
		defaultPersistentOptions().tyberHost.address
	await GoBridge.initBridge(tyberHost)
		.then(() => console.log('bridge init done'))
		.catch((err) => {
			console.warn('unable to init bridge ', Object.keys(err), err.domain)
		})
	const f = async () => {
		const accounts = await refreshAccountList(embedded, dispatch)

		if (Object.keys(accounts).length === 0) {
			await createNewAccount(embedded, dispatch, null)
		} else if (Object.keys(accounts).length > 0) {
			console.log('accountsLength > 0 and dispatch SetNextAccount')
			let accountSelected: any = null
			Object.values(accounts).forEach((account) => {
				if (!accountSelected) {
					accountSelected = account
				} else if (accountSelected && accountSelected.lastOpened < (account.lastOpened || 0)) {
					accountSelected = account
				}
			})
			dispatch({ type: MessengerActions.SetNextAccount, payload: accountSelected.accountId })
			return
		}
	}

	f().catch((e) => console.warn(e))
}

// handle state MessengerAppState.OpeningGettingLocalSettings
export const openingLocalSettings = (
	dispatch: (arg0: reducerAction) => void,
	appState: MessengerAppState,
	selectedAccount: string | null,
) => {
	if (appState !== MessengerAppState.OpeningGettingLocalSettings) {
		return
	}

	getPersistentOptions(dispatch, selectedAccount)
		.then(() => dispatch({ type: MessengerActions.SetStateOpeningMarkConversationsClosed }))
		.catch((e) => console.warn('unable to get persistent options', e))
}

// handle state OpeningWaitingForDaemon
export const openingDaemon = async (
	dispatch: (arg0: reducerAction) => void,
	appState: MessengerAppState,
	selectedAccount: string | null,
) => {
	if (appState !== MessengerAppState.OpeningWaitingForDaemon) {
		return
	}

	if (selectedAccount === null) {
		console.warn('openingDaemon / no account opened')
		return
	}

	// Apply store options
	let bridgeOpts: GoBridgeOpts
	try {
		const store = await AsyncStorage.getItem(storageKeyForAccount(selectedAccount.toString()))
		const opts: PersistentOptions = JSON.parse(store as any)
		bridgeOpts = cloneDeep(GoBridgeDefaultOpts)

		// set ble flag
		bridgeOpts.cliArgs =
			opts?.ble && !opts.ble.enable
				? [...bridgeOpts.cliArgs!, '--p2p.ble=false']
				: [...bridgeOpts.cliArgs!, '--p2p.ble=true']

		// set mc flag
		bridgeOpts.cliArgs =
			opts?.mc && !opts.mc.enable
				? [...bridgeOpts.cliArgs!, '--p2p.multipeer-connectivity=false']
				: [...bridgeOpts.cliArgs!, '--p2p.multipeer-connectivity=true']

		// set tor flag
		bridgeOpts.cliArgs = opts?.tor?.flag.length
			? [...bridgeOpts.cliArgs!, `--tor.mode=${opts?.tor?.flag}`]
			: [...bridgeOpts.cliArgs!, '--tor.mode=disabled']

		// set log flag
		bridgeOpts.cliArgs = opts?.log?.format
			? [...bridgeOpts.cliArgs!, `--log.format=${opts?.log?.format}`]
			: [...bridgeOpts.cliArgs!, '--log.format=console']

		// set tyber host flag
		if (opts?.tyberHost?.address) {
			bridgeOpts.cliArgs = bridgeOpts.cliArgs.filter((arg) => !arg.startsWith('--log.tyber-host='))
			bridgeOpts.cliArgs = [...bridgeOpts.cliArgs!, `--log.tyber-host=${opts?.tyberHost?.address}`]
		}

		// set log filter opt
		bridgeOpts.logFilters = opts?.logFilters?.format
			? opts?.logFilters?.format
			: 'info+:bty*,-*.grpc warn+:*.grpc error+:*'
	} catch (e) {
		console.warn('store getPersistentOptions Failed:', e)
		bridgeOpts = cloneDeep(GoBridgeDefaultOpts)
	}

	accountService
		.getGRPCListenerAddrs({})
		.then(() => {
			// account already open
			dispatch({ type: MessengerActions.SetStateOpeningClients })
		})
		.catch(async () => {
			// account not open
			await openAccountWithProgress(dispatch, bridgeOpts, selectedAccount)
		})
}

// handle state OpeningWaitingForClients
export const openingClients = (
	dispatch: (arg0: reducerAction) => void,
	appState: MessengerAppState,
	eventEmitter: EventEmitter,
	daemonAddress: string,
	embedded: boolean,
) => {
	if (appState !== MessengerAppState.OpeningWaitingForClients) {
		return
	}

	console.log('starting stream')

	const messengerMiddlewares = null
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

	const messengerClient = Service(beapi.messenger.MessengerService, rpc, messengerMiddlewares)

	const protocolClient = Service(beapi.protocol.ProtocolService, rpc, null)

	let precancel = false
	let cancel = () => {
		precancel = true
	}
	messengerClient
		.eventStream({ shallowAmount: 1 })
		.then(async (stream) => {
			if (precancel) {
				await stream.stop()
				return
			}
			cancel = () => stream.stop()
			stream.onMessage((msg, err) => {
				if (err) {
					if (
						err?.EOF ||
						err?.grpcErrorCode() === beapi.bridge.GRPCErrCode.CANCELED ||
						err?.grpcErrorCode() === beapi.bridge.GRPCErrCode.UNAVAILABLE
					) {
						return
					}
					console.warn('events stream onMessage error:', err)
					dispatch({ type: MessengerActions.SetStreamError, payload: { error: err } })
				}
				const evt = msg?.event
				if (!evt || evt.type === null || evt.type === undefined) {
					console.warn('received empty event')
					return
				}

				const enumName = beapi.messenger.StreamEvent.Type[evt.type]
				if (!enumName) {
					console.warn('failed to get event type name')
					return
				}

				const payloadName = enumName.substr('Type'.length)
				const pbobj = (beapi.messenger.StreamEvent as any)[payloadName]
				if (!pbobj) {
					console.warn('failed to find a protobuf object matching the event type')
					return
				}
				const eventPayload = pbobj.decode(evt.payload)
				if (evt.type === beapi.messenger.StreamEvent.Type.TypeNotified) {
					const enumName = Object.keys(beapi.messenger.StreamEvent.Notified.Type).find(
						(name) =>
							(beapi.messenger.StreamEvent.Notified.Type as any)[name] === eventPayload.type,
					)
					if (!enumName) {
						console.warn('failed to get event type name')
						return
					}

					const payloadName = enumName.substr('Type'.length)
					const pbobj = (beapi.messenger.StreamEvent.Notified as any)[payloadName]
					if (!pbobj) {
						console.warn('failed to find a protobuf object matching the notification type')
						return
					}
					eventPayload.payload = pbobj.decode(eventPayload.payload)
					eventEmitter.emit('notification', {
						type: eventPayload.type,
						name: payloadName,
						payload: eventPayload,
					})
				} else {
					dispatch({
						type: evt.type,
						name: payloadName,
						payload: eventPayload,
					})
				}
			})
			await stream.start()
		})
		.catch((err) => {
			if (err?.EOF) {
				console.info('end of the events stream')
				dispatch({ type: MessengerActions.SetStateClosed })
			} else {
				console.warn('events stream error:', err)
				dispatch({ type: MessengerActions.SetStreamError, payload: { error: err } })
			}
		})

	dispatch({
		type: MessengerActions.SetStateOpeningListingEvents,
		payload: { messengerClient, protocolClient, clearClients: () => cancel() },
	})
}

// handle state OpeningMarkConversationsAsClosed
export const openingCloseConvos = (
	appState: MessengerAppState,
	dispatch: (arg0: reducerAction) => void,
	client: ServiceClientType<beapi.messenger.MessengerService> | null,
	conversations: { [key: string]: any },
) => {
	if (appState !== MessengerAppState.OpeningMarkConversationsAsClosed) {
		return
	}

	if (client === null) {
		console.warn('client is null')
		return
	}

	for (const conv of Object.values(conversations).filter((conv) => conv.isOpen) as any) {
		client.conversationClose({ groupPk: conv.publicKey }).catch((e: any) => {
			console.warn(`failed to close conversation "${conv.displayName}",`, e)
		})
	}

	dispatch({ type: MessengerActions.SetStateReady })
}

// handle states DeletingClosingDaemon, ClosingDaemon
export const closingDaemon = (
	appState: MessengerAppState,
	clearClients: (() => Promise<void>) | null,
	dispatch: (arg0: reducerAction) => void,
) => {
	if (
		appState !== MessengerAppState.ClosingDaemon &&
		appState !== MessengerAppState.DeletingClosingDaemon
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
			dispatch({ type: MessengerActions.BridgeClosed })
		}

		f().catch((e) => {
			console.warn(e)
		})
	}
}

// handle state DeletingClearingStorage
export const deletingStorage = (
	appState: MessengerAppState,
	dispatch: (arg0: reducerAction) => void,
	embedded: boolean,
	selectedAccount: string | null,
) => {
	if (appState !== MessengerAppState.DeletingClearingStorage) {
		return
	}

	const f = async () => {
		if (selectedAccount !== null) {
			await accountService.deleteAccount({ accountId: selectedAccount })
			await AsyncStorage.removeItem(storageKeyForAccount(selectedAccount))
			await refreshAccountList(embedded, dispatch)
		} else {
			console.warn('state.selectedAccount is null and this should not occur')
		}

		dispatch({ type: MessengerActions.SetStateClosed })
	}

	f().catch((e) => console.error(e))
}

export const openingListingEvents = (
	appState: MessengerAppState,
	initialListComplete: boolean,
	dispatch: (arg0: reducerAction) => void,
) => {
	if (appState !== MessengerAppState.OpeningListingEvents) {
		return
	}

	if (!initialListComplete) {
		console.info('waiting for initial listing to be completed')
		return
	}

	dispatch({ type: MessengerActions.SetStateOpeningGettingLocalSettings })
}
