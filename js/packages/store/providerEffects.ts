import {
	messenger as messengerpb,
	protocol as protocolpb,
	account as accountpb,
} from '@berty-tech/api/index.js'
import {
	bridge as rpcBridge,
	grpcweb as rpcWeb,
	native as rpcNative,
} from '@berty-tech/grpc-bridge/rpc'
import i18n from '@berty-tech/berty-i18n'
import { EOF, Service } from '@berty-tech/grpc-bridge'
import ExternalTransport from './externalTransport'
import GoBridge, { GoBridgeDefaultOpts } from '@berty-tech/go-bridge'
import { EventEmitter } from 'events'
import AsyncStorage from '@react-native-community/async-storage'
import cloneDeep from 'lodash/cloneDeep'
import {
	defaultPersistentOptions,
	MessengerActions,
	MessengerAppState,
	PersistentOptionsKeys,
	PersistentOptionsUpdate,
} from '@berty-tech/store/context'
import { berty } from '@berty-tech/api/index.pb'
import { reducerAction } from '@berty-tech/store/providerReducer'

const accountClient = Service(
	accountpb.AccountService,
	rpcNative,
	null,
) as berty.account.v1.AccountService

export const storageKeyForAccount = (accountID: string) => `storage_${accountID}`

export const createNewAccount = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
) => {
	if (!embedded) {
		return
	}

	await GoBridge.initBridge()
	let resp: berty.account.v1.CreateAccount.Reply

	try {
		resp = await accountClient.createAccount({})
	} catch (e) {
		console.warn('unable to create account', e)
		return
	}

	if (!resp.accountMetadata?.accountId) {
		throw new Error('no account id returned')
	}

	await refreshAccountList(embedded, dispatch)

	dispatch({
		type: MessengerActions.SetCreatedAccount,
		payload: {
			accountId: resp.accountMetadata.accountId,
			clearDaemon: () => {
				GoBridge.closeBridge()
			},
		},
	})
}

export const importAccount = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	path: string,
) => {
	if (!embedded) {
		return
	}

	await GoBridge.initBridge()
	let resp: berty.account.v1.CreateAccount.Reply

	try {
		resp = await accountClient.importAccount({
			backupPath: path,
		})
	} catch (e) {
		console.warn('unable to import account', e)
		return
	}

	if (!resp.accountMetadata?.accountId) {
		throw new Error('no account id returned')
	}

	await refreshAccountList(embedded, dispatch)
	await GoBridge.closeBridge()

	dispatch({
		type: MessengerActions.SetNextAccount,
		payload: resp.accountMetadata.accountId,
	})
}

export const setPersistentOption = async (
	dispatch: (arg0: reducerAction) => void,
	selectedAccount: string | null,
	action: PersistentOptionsUpdate,
) => {
	if (selectedAccount === null) {
		console.warn('no account opened')
		return
	}

	try {
		let opts = {}
		let persistOpts = await AsyncStorage.getItem(storageKeyForAccount(selectedAccount))

		if (persistOpts !== null) {
			opts = JSON.parse(persistOpts)
		}

		const updatedPersistOpts = {
			...defaultPersistentOptions(),
			...opts,
			[action.type]: action.payload,
		}

		await AsyncStorage.setItem(
			storageKeyForAccount(selectedAccount),
			JSON.stringify(updatedPersistOpts),
		)
		dispatch({
			type: MessengerActions.SetPersistentOption,
			payload: updatedPersistOpts,
		})
	} catch (e) {
		console.warn('store setPersistentOption Failed:', e)
		return
	}
}

// callWithBridge wraps a function, creates a bridge if necessary and closes it
function callWithBridge<T>(func: () => Promise<T>): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		let bridgeInitiated = false

		GoBridge.getProtocolAddr()
			.catch(() => {
				bridgeInitiated = true
				return GoBridge.initBridge()
			})
			.catch((err) => {
				console.warn('unable to init bridge')
				reject(err)
			})
			.then(func)
			.then((result) => {
				if (!bridgeInitiated) {
					resolve(result)
					return
				}

				GoBridge.closeBridge().catch((err) => {
					console.error(err)
				})

				return resolve(result)
			})
			.catch((err) => {
				reject(err)
			})
	})
}

export const refreshAccountList = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
): Promise<berty.account.v1.IAccountMetadata[]> => {
	try {
		if (embedded) {
			const resp = await callWithBridge(async () => accountClient.listAccounts({}))

			if (!resp.accounts) {
				return []
			}

			dispatch({ type: MessengerActions.SetAccounts, payload: resp.accounts })

			return resp.accounts
		}

		let accounts = [{ accountId: '0', name: 'remote server account' }]

		dispatch({ type: MessengerActions.SetAccounts, payload: accounts })

		return accounts
	} catch (e) {
		console.warn(e)
		return []
	}
}

const getPersistentOptions = async (
	dispatch: (arg0: reducerAction) => void,
	selectedAccount: string | null,
) => {
	if (selectedAccount === null) {
		console.warn('no account opened')
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

export const initialLaunch = (dispatch: (arg0: reducerAction) => void, embedded: boolean) => {
	const f = async () => {
		const accounts = await refreshAccountList(embedded, dispatch)

		switch (Object.keys(accounts).length) {
			case 0:
				await createNewAccount(embedded, dispatch)
				return

			case 1:
				dispatch({ type: MessengerActions.SetNextAccount, payload: accounts[0].accountId })
				return

			default:
				dispatch({ type: MessengerActions.SetStateClosed })
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
	selectedAccount: number | null,
) => {
	if (appState !== MessengerAppState.OpeningWaitingForDaemon) {
		return
	}

	if (selectedAccount === null) {
		console.warn('no account opened')
		return
	}

	// Apply store options
	let bridgeOpts
	try {
		let opts = {}
		let store
		store = await AsyncStorage.getItem(storageKeyForAccount(selectedAccount))
		if (store !== null) {
			opts = JSON.parse(store)
		}
		bridgeOpts = cloneDeep(GoBridgeDefaultOpts)

		// set ble flag
		bridgeOpts.cliArgs =
			opts?.ble && !opts.ble.enable
				? [...bridgeOpts.cliArgs, '--p2p.ble=false']
				: [...bridgeOpts.cliArgs, '--p2p.ble=true']

		// set mc flag
		bridgeOpts.cliArgs =
			opts?.mc && !opts.mc.enable
				? [...bridgeOpts.cliArgs, '--p2p.multipeer-connectivity=false']
				: [...bridgeOpts.cliArgs, '--p2p.multipeer-connectivity=true']
	} catch (e) {
		console.warn('store getPersistentOptions Failed:', e)
		bridgeOpts = cloneDeep(GoBridgeDefaultOpts)
	}

	GoBridge.initBridge()
		.then(() => console.log('bridge init done'))
		.catch((err) => {
			console.error('unable to init bridge', err)
		})
		.then(() =>
			accountClient.openAccount({
				args: bridgeOpts.cliArgs,
				accountId: selectedAccount,
			}),
		)
		.then(() => {
			dispatch({
				type: MessengerActions.SetStateOpeningClients,
				payload: {
					clearDaemon: () => {
						GoBridge.closeBridge()
					},
				},
			})
		})
		.catch((err) =>
			dispatch({
				type: MessengerActions.SetStreamError,
				payload: { error: new Error(`Failed to start node: ${err}`) },
			}),
		)
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

	const messengerClient = Service(
		messengerpb.MessengerService,
		rpc,
		messengerMiddlewares,
	) as berty.messenger.v1.MessengerService

	const protocolClient = Service(
		protocolpb.ProtocolService,
		rpc,
		null,
	) as berty.protocol.v1.ProtocolService

	let precancel = false
	let cancel = () => {
		precancel = true
	}
	messengerClient
		.eventStream({})
		.then(async (stream: any) => {
			if (precancel) {
				return
			}
			stream.onMessage(
				(msg: { event: berty.messenger.v1.IStreamEvent | undefined }, err: Error | null) => {
					if (err) {
						console.warn('events stream onMessage error:', err)
						dispatch({ type: MessengerActions.SetStreamError, payload: { error: err } })
						return
					}
					const evt = msg && msg.event
					if (!evt || evt.type === null || evt.type === undefined) {
						console.warn('received empty event')
						return
					}

					const enumName = Object.keys(messengerpb.StreamEvent.Type).find(
						(name) => messengerpb.StreamEvent.Type[name] === evt.type,
					)
					if (!enumName) {
						console.warn('failed to get event type name')
						return
					}

					const payloadName = enumName.substr('Type'.length)
					const pbobj = messengerpb.StreamEvent[payloadName]
					if (!pbobj) {
						console.warn('failed to find a protobuf object matching the event type')
						return
					}
					const eventPayload = pbobj.decode(evt.payload)
					if (evt.type === messengerpb.StreamEvent.Type.TypeNotified) {
						const enumName = Object.keys(messengerpb.StreamEvent.Notified.Type).find(
							(name) => messengerpb.StreamEvent.Notified.Type[name] === eventPayload.type,
						)
						if (!enumName) {
							console.warn('failed to get event type name')
							return
						}

						const payloadName = enumName.substr('Type'.length)
						const pbobj = messengerpb.StreamEvent.Notified[payloadName]
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
				},
			)
			cancel = await stream.start()
		})
		.catch((err: Error) => {
			if (err === EOF) {
				console.info('end of the events stream')
				dispatch({ type: MessengerActions.SetStateClosed })
			} else {
				console.warn('events stream error:', err)
				dispatch({ type: MessengerActions.SetStreamError, payload: { error: err } })
			}
		})

	dispatch({
		type: MessengerActions.SetStateOpeningListingEvents,
		payload: { messengerClient, protocolClient, clearClients: cancel },
	})
}

// handle state OpeningMarkConversationsAsClosed
export const openingCloseConvos = (
	appState: MessengerAppState,
	dispatch: (arg0: reducerAction) => void,
	client: berty.messenger.v1.MessengerService | null,
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
	clearBridge: (() => Promise<void>) | null,
	clearClients: (() => Promise<void>) | null,
	dispatch: (arg0: reducerAction) => void,
) => {
	if (clearBridge === null) {
		return
	}

	return () => {
		const f = async () => {
			try {
				if (clearClients) {
					await clearClients()
				}

				await clearBridge()
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
			await callWithBridge(async () => accountClient.deleteAccount({ accountId: selectedAccount }))
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
