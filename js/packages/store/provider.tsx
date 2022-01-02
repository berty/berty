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
import { createNewAccount, getUsername } from './effectableCallbacks'
import { reducer } from './reducer'
import { playSound } from './sounds'
import { MessengerAppState, PersistentOptionsKeys, SoundKey } from './types'
import { accountService } from './accountService'

export const MessengerProvider: React.FC<{ daemonAddress: string; embedded: boolean }> = ({
	children,
	daemonAddress,
	embedded,
}) => {
	const reduxDispatch = useAppDispatch()
	const [state, dispatch] = React.useReducer(reducer, {
		...initialState,
		daemonAddress,
		embedded,
	})
	const [eventEmitter] = React.useState(new EventEmitter())
	const [debugMode, setDebugMode] = React.useState(false)
	const [networkConfig, setNetworkConfig] = useState<beapi.account.INetworkConfig>({})
	const [handledLink, setHandledLink] = useState<boolean>(false)

	useEffect(() => {
		console.log('State change:', MessengerAppState[state.appState] + '\n')
	}, [state.appState])

	useEffect(() => {
		initialLaunch(dispatch, embedded)
	}, [embedded])

	useEffect(() => {
		openingDaemon(dispatch, state.appState, state.selectedAccount)
	}, [embedded, state.appState, state.selectedAccount])

	useEffect(() => {
		openingClients(dispatch, state.appState, eventEmitter, daemonAddress, embedded, reduxDispatch)
	}, [daemonAddress, embedded, eventEmitter, state.appState, state.selectedAccount, reduxDispatch])

	const initialListComplete = useAppSelector(state => state.messenger.initialListComplete)

	useEffect(
		() => openingListingEvents(state.appState, initialListComplete, dispatch),
		[state.appState, initialListComplete],
	)

	useEffect(() => {
		openingLocalSettings(dispatch, state.appState, state.selectedAccount)
	}, [state.appState, state.selectedAccount])

	const conversations = useConversationsDict()

	useEffect(() => {
		openingCloseConvos(
			state.appState,
			state.client,
			conversations,
			state.persistentOptions,
			dispatch,
		)
	}, [state.appState, state.client, conversations, state.persistentOptions, embedded])

	const accountLanguage = useAppSelector(selectAccountLanguage)
	useEffect(() => {
		syncAccountLanguage(accountLanguage)
	}, [accountLanguage])

	const account = useAccount()

	useEffect(() => {
		updateAccountsPreReady(
			state.appState,
			state.client,
			state.selectedAccount,
			account,
			state.protocolClient,
			embedded,
			dispatch,
		)
	}, [
		state.appState,
		state.client,
		state.selectedAccount,
		account,
		state.protocolClient,
		embedded,
		dispatch,
	])

	useEffect(
		() => closingDaemon(state.appState, state.clearClients, dispatch, reduxDispatch),
		[state.clearClients, state.appState, reduxDispatch],
	)

	useEffect(
		() => deletingStorage(state.appState, dispatch, embedded, state.selectedAccount),
		[state.appState, state.selectedAccount, embedded],
	)

	const callbackImportAccount = useCallback(
		(path: string) => importAccount(embedded, dispatch, path, reduxDispatch),
		[embedded, reduxDispatch],
	)

	const callbackRestart = useCallback(
		() => restart(embedded, dispatch, state.selectedAccount, reduxDispatch),
		[state.selectedAccount, embedded, reduxDispatch],
	)

	const callbackDeleteAccount = useCallback(
		() => deleteAccount(embedded, dispatch, state.selectedAccount, reduxDispatch),
		[embedded, state.selectedAccount, reduxDispatch],
	)

	const callbackSwitchAccount = useCallback(
		(account: string) => switchAccount(embedded, dispatch, account, reduxDispatch),
		[embedded, reduxDispatch],
	)

	const callbackCreateNewAccount = useCallback(
		(newConfig?: beapi.account.INetworkConfig) => createNewAccount(embedded, dispatch, newConfig),
		[embedded],
	)

	const callbackUpdateAccount = useCallback(
		(payload: any) => updateAccount(embedded, dispatch, payload),
		[embedded],
	)

	const callbackGetUsername = useCallback(() => {
		return getUsername()
	}, [])

	const callbackSetPersistentOption = useCallback(
		action => setPersistentOption(dispatch, state.selectedAccount, action),
		[state.selectedAccount],
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
		if (state.selectedAccount === null) {
			console.log('no account id supplied')
			setNetworkConfig({})
			return
		}

		const f = async () => {
			const netConf = await accountService.networkConfigGet({
				accountId: state.selectedAccount,
			})
			if (!netConf.currentConfig) {
				return
			}

			setNetworkConfig(netConf.currentConfig)
		}

		f().catch(e => console.warn(e))
	}, [state.selectedAccount])

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
				networkConfig: networkConfig,
				setNetworkConfig: setNetworkConfig,
				handledLink,
				setHandledLink,
			}}
		>
			{children}
		</MessengerContext.Provider>
	)
}
