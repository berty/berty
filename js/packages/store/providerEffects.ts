import * as middleware from '@berty-tech/grpc-bridge/middleware'
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
import {
	defaultPersistentOptions,
	MessengerActions,
	MessengerAppState,
	PersistentOptionsKeys,
	PersistentOptionsUpdate,
} from '@berty-tech/store/context'
import { berty } from '@berty-tech/api/index.pb'
import { reducerAction } from '@berty-tech/store/providerReducer'

const accountClient: berty.account.v1.AccountService = Service(accountpb.AccountService, rpcNative)

export const storageKeyForAccount = (accountID: number) => `storage_${accountID}`

export const createNewAccount = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
) => {
	if (!embedded) {
		return
	}

	const accountID = Object.keys(await refreshAccountList(embedded, dispatch)).pop() || '-1'
	dispatch({ type: MessengerActions.SetNextAccount, payload: parseInt(accountID, 10) + 1 })

	await refreshAccountList(embedded, dispatch)
}

export const importAccount = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	path: string,
) => {
	if (!embedded) {
		return
	}

	try {
		const accountID = (() => {
			console.info(`importing ${path}`)

			// TODO: await some rpc command for import
			return 0
		})()

		await refreshAccountList(embedded, dispatch)
		dispatch({ type: MessengerActions.SetNextAccount, payload: accountID })
	} catch (e) {
		console.warn(e)
	}
}

export const setPersistentOption = async (
	dispatch: (arg0: reducerAction) => void,
	selectedAccount: number | null,
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

export const refreshAccountList = (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
): { [key: number]: any } | Promise<{ [key: number]: any }> => {
	try {
		let accounts: { [key: number]: any }

		if (embedded) {
			// TODO: call rpc func to get account list
			accounts = {
				0: { name: 'local forced account' },
				// 1: { name: 'local forced account 1' },
			}
		} else {
			accounts = { 0: { name: 'remote server account' } }
		}

		dispatch({ type: MessengerActions.SetAccounts, payload: accounts })

		return accounts
	} catch (e) {
		console.warn(e)
		return {}
	}
}

const getPersistentOptions = async (
	dispatch: (arg0: reducerAction) => void,
	selectedAccount: number | null,
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

		if (Object.keys(accounts).length === 1) {
			const accountID = parseInt(Object.keys(accounts)[0], 10)
			dispatch({ type: MessengerActions.SetNextAccount, payload: accountID })
		}
	}

	f().catch((e) => console.warn(e))
}

// handle state MessengerAppState.OpeningGettingLocalSettings
export const openingLocalSettings = (
	dispatch: (arg0: reducerAction) => void,
	appState: MessengerAppState,
	selectedAccount: number | null,
) => {
	if (appState !== MessengerAppState.OpeningGettingLocalSettings) {
		return
	}

	getPersistentOptions(dispatch, selectedAccount)
		.then(() => dispatch({ type: MessengerActions.SetStateOpeningMarkConversationsClosed }))
		.catch((e) => console.warn('unable to get persistent options', e))
}

// handle state OpeningWaitingForDaemon
export const openingDaemon = (
	dispatch: (arg0: reducerAction) => void,
	appState: MessengerAppState,
) => {
	if (appState !== MessengerAppState.OpeningWaitingForDaemon) {
		return
	}

	GoBridge.initBridge()
		.then(() => console.log('bridge init done'))
		.catch((err) => {
			console.error('unable to init bridge', err)
		})
		.then(() =>
			accountClient.openAccount({
				args: GoBridgeDefaultOpts.cliArgs,
				persistence: GoBridgeDefaultOpts.persistence,
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
			} else {
				console.warn('events stream error:', err)
			}
			dispatch({ type: MessengerActions.SetStreamError, payload: { error: err } })
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
	clearBridge: (() => void | Promise<void>) | null,
	clearClients: (() => void) | null,
	dispatch: (arg0: reducerAction) => void,
) => {
	if (clearBridge === null) {
		return
	}

	const f = async () => {
		try {
			if (clearClients) {
				clearClients()
			}

			await clearBridge()
		} catch (e) {
			console.warn('unable to stop protocol', e)
		}

		dispatch({ type: MessengerActions.BridgeClosed })
	}

	return () => {
		f().catch((e) => console.warn(e))
	}
}

// handle state DeletingClearingStorage
export const deletingStorage = (
	appState: MessengerAppState,
	dispatch: (arg0: reducerAction) => void,
	embedded: boolean,
	selectedAccount: number | null,
) => {
	if (appState !== MessengerAppState.DeletingClearingStorage) {
		return
	}

	const f = async () => {
		try {
			await GoBridge.clearStorage()
		} catch (e) {
			console.warn('unable to clear storage', e)
		}

		if (selectedAccount !== null) {
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
