import React, { useCallback, useEffect, useState } from 'react'
import { EventEmitter } from 'events'

import {
	useAppDispatch,
	useAppSelector,
	useAccount,
	useConversationsDict,
} from '@berty/react-redux'
import { selectAccountLanguage } from '@berty/redux/reducers/accountSettings.reducer'

import beapi from '@berty/api'
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
	importAccount,
	updateAccount,
	switchAccount,
	deleteAccount,
	restart,
} from './providerCallbacks'
import { createNewAccount, getUsername } from './effectableCallbacks'
import { reducer } from './reducer'
import { playSound } from './sounds'
import { SoundKey } from './types'
import { useSelector } from 'react-redux'
import {
	selectAppState,
	selectClearClients,
	selectClient,
	selectEmbedded,
	selectProtocolClient,
	selectSelectedAccount,
} from '@berty/redux/reducers/ui.reducer'
import {
	selectPersistentOptions,
	PersistentOptionsKeys,
} from '@berty/redux/reducers/persistentOptions.reducer'

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
	const persistentOptions = useSelector(selectPersistentOptions)

	useEffect(() => {
		console.log(`State change: ${appState}\n`)
	}, [appState])

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

	useEffect(() => {
		return openingListingEvents(appState, initialListComplete)
	}, [appState, initialListComplete])

	useEffect(() => {
		openingLocalSettings(reduxDispatch, appState, selectedAccount)
	}, [reduxDispatch, appState, selectedAccount])

	const conversations = useConversationsDict()

	useEffect(() => {
		openingCloseConvos(appState, client, conversations, persistentOptions)
	}, [appState, client, conversations, persistentOptions])

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

	useEffect(() => {
		return closingDaemon(appState, clearClients, dispatch, reduxDispatch)
	}, [clearClients, appState, reduxDispatch])

	useEffect(() => {
		return deletingStorage(appState, dispatch, embedded, selectedAccount)
	}, [appState, selectedAccount, embedded])

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
		(newConfig?: beapi.account.INetworkConfig) =>
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
			if (persistentOptions[PersistentOptionsKeys.Notifications].enable) {
				playSound(sound)
			}
			return
		},
		[persistentOptions],
	)

	return (
		<MessengerContext.Provider
			value={{
				...state,
				dispatch,
				addNotificationListener: callbackAddNotificationListener,
				removeNotificationListener: callbackRemoveNotificationListener,
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
