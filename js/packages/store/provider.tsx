import React, { useCallback, useEffect, useState } from 'react'
import { EventEmitter } from 'events'

import beapi from '@berty-tech/api'
import {
	useAppDispatch,
	useAppSelector,
	useAccount,
	useConversationsDict,
} from '@berty-tech/react-redux'
import { selectAccountLanguage } from '@berty-tech/redux/reducers/accountSettings.reducer'

import { MessengerContext, initialState } from './context'
import {
	initialLaunch,
	openingDaemon,
	openingClients,
	openingListingEvents,
	openingLocalSettings,
	openingCloseConvos,
	closingDaemon,
	deletingStorage,
	updateAccountsPreReady,
	syncAccountLanguage,
} from './providerEffects'
import {
	setPersistentOption,
	importAccount,
	updateAccount,
	switchAccount,
	deleteAccount,
	restart,
} from './providerCallbacks'
import { createNewAccount, getUsername, handleNetworkConfigBack } from './effectableCallbacks'
import { reducer } from './reducer'
import { playSound } from './sounds'
import { PersistentOptionsKeys, SoundKey } from './types'
import { accountService } from './accountService'
import { useSelector } from 'react-redux'
import {
	selectAppState,
	selectClearClients,
	selectClient,
	selectEmbedded,
	selectProtocolClient,
	selectSelectedAccount,
} from '@berty-tech/redux/reducers/ui.reducer'
import {
	selectNetworkConfig,
	setNetworkConfig,
} from '@berty-tech/redux/reducers/networkConfig.reducer'

export const MessengerProvider: React.FC<{ daemonAddress: string }> = ({
	children,
	daemonAddress,
}) => {
	const reduxDispatch = useAppDispatch()
	const [state, dispatch] = React.useReducer(reducer, {
		...initialState,
		daemonAddress,
	})
	const [eventEmitter] = React.useState(new EventEmitter())
	const [debugMode, setDebugMode] = React.useState(false)
	const [handledLink, setHandledLink] = useState<boolean>(false)
	const appState = useSelector(selectAppState)
	const clearClients = useSelector(selectClearClients)
	const protocolClient = useSelector(selectProtocolClient)
	const client = useSelector(selectClient)
	const embedded = useSelector(selectEmbedded)
	const selectedAccount = useSelector(selectSelectedAccount)
	const networkConfig = useSelector(selectNetworkConfig)

	useEffect(() => {
		console.log(`State change: ${appState}\n`)
	}, [appState])
	// useEffect(() => {
	// 	console.log(`networkConfig: ${networkConfig}\n`)
	// }, [networkConfig])

	useEffect(() => {
		initialLaunch(dispatch, embedded)
	}, [embedded])

	useEffect(() => {
		openingDaemon(dispatch, appState, selectedAccount)
	}, [embedded, appState, selectedAccount])

	useEffect(() => {
		openingClients(dispatch, appState, eventEmitter, daemonAddress, embedded, reduxDispatch)
	}, [daemonAddress, embedded, eventEmitter, appState, selectedAccount, reduxDispatch])

	const initialListComplete = useAppSelector(state => state.messenger.initialListComplete)

	useEffect(
		() => openingListingEvents(appState, initialListComplete),
		[appState, initialListComplete],
	)

	useEffect(() => {
		openingLocalSettings(dispatch, appState, selectedAccount)
	}, [appState, selectedAccount])

	const conversations = useConversationsDict()

	useEffect(() => {
		openingCloseConvos(appState, client, conversations, state.persistentOptions)
	}, [appState, client, conversations, state.persistentOptions, embedded])

	const accountLanguage = useAppSelector(selectAccountLanguage)
	useEffect(() => {
		syncAccountLanguage(accountLanguage)
	}, [accountLanguage])

	const account = useAccount()

	useEffect(() => {
		updateAccountsPreReady(
			appState,
			client,
			selectedAccount,
			account,
			protocolClient,
			embedded,
			dispatch,
		)
	}, [appState, client, selectedAccount, account, protocolClient, embedded, dispatch])

	useEffect(
		() => closingDaemon(appState, clearClients, dispatch, reduxDispatch),
		[clearClients, appState, reduxDispatch],
	)

	useEffect(
		() => deletingStorage(appState, dispatch, embedded, selectedAccount),
		[appState, selectedAccount, embedded],
	)

	const callbackImportAccount = useCallback(
		(path: string) => importAccount(embedded, dispatch, path, reduxDispatch),
		[embedded, reduxDispatch],
	)

	const callbackRestart = useCallback(
		() => restart(embedded, dispatch, selectedAccount, reduxDispatch),
		[selectedAccount, embedded, reduxDispatch],
	)

	const callbackDeleteAccount = useCallback(
		() => deleteAccount(embedded, dispatch, selectedAccount, reduxDispatch),
		[embedded, selectedAccount, reduxDispatch],
	)

	const callbackSwitchAccount = useCallback(
		(account: string) => switchAccount(embedded, dispatch, account, reduxDispatch),
		[embedded, reduxDispatch],
	)

	const callbackCreateNewAccount = useCallback(
		(newConfig?: NetworkConfigFront) =>
			createNewAccount(embedded, dispatch, reduxDispatch, newConfig),
		[embedded, reduxDispatch],
	)

	const callbackUpdateAccount = useCallback(
		(payload: any) => updateAccount(embedded, dispatch, payload),
		[embedded],
	)

	const callbackGetUsername = useCallback(() => {
		return getUsername()
	}, [])

	const callbackSetPersistentOption = useCallback(
		action => setPersistentOption(dispatch, selectedAccount, action),
		[selectedAccount],
	)

	const callbackAddNotificationListener = useCallback(
		cb => {
			eventEmitter.addListener('notification', cb)
		},
		[eventEmitter],
	)

	const callbackRemoveNotificationListener = useCallback(
		cb => {
			eventEmitter.removeListener('notification', cb)
		},
		[eventEmitter],
	)

	const callbackSetDebugMode = useCallback((value: boolean) => setDebugMode(value), [])

	const callbackPlaySound = useCallback(
		(sound: SoundKey) => {
			if (state.persistentOptions[PersistentOptionsKeys.Notifications].enable) {
				playSound(sound)
			}
			return
		},
		[state.persistentOptions],
	)

	useEffect(() => {
		const f = async () => {
			if (!networkConfig) {
				const netConf = await accountService.networkConfigGet({
					accountId: selectedAccount,
				})
				if (!netConf.currentConfig) {
					return
				}
				const test = handleNetworkConfigBack(netConf.currentConfig)
				reduxDispatch(setNetworkConfig({ ...test }))
			}
		}

		f().catch(e => console.warn(e))
	}, [networkConfig, reduxDispatch, selectedAccount])

	return (
		<MessengerContext.Provider
			value={{
				...state,
				dispatch,
				addNotificationListener: callbackAddNotificationListener,
				removeNotificationListener: callbackRemoveNotificationListener,
				setPersistentOption: callbackSetPersistentOption,
				createNewAccount: callbackCreateNewAccount,
				importAccount: callbackImportAccount,
				switchAccount: callbackSwitchAccount,
				updateAccount: callbackUpdateAccount,
				deleteAccount: callbackDeleteAccount,
				getUsername: callbackGetUsername,
				restart: callbackRestart,
				debugMode: debugMode,
				playSound: callbackPlaySound,
				setDebugMode: callbackSetDebugMode,
				handledLink,
				setHandledLink,
			}}
		>
			{children}
		</MessengerContext.Provider>
	)
}
