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
import {Service} from '@berty-tech/grpc-bridge'
import rpcBridge from '@berty-tech/grpc-bridge/rpc/rpc.bridge'
import {logger} from '@berty-tech/grpc-bridge/middleware'

export const MessengerProvider: React.FC<{ daemonAddress: string; embedded: boolean }> = ({
	children,
	daemonAddress,
	embedded,
}) => {
	const reduxDispatch = useAppDispatch()
	const [state, dispatch] = React.useReducer(reducer, {
		...initialState,
		daemonAddress,
	})
	const [eventEmitter] = React.useState(new EventEmitter())
	const [debugMode, setDebugMode] = React.useState(false)
	const [networkConfig, setNetworkConfig] = useState<beapi.account.INetworkConfig>({})
	const [handledLink, setHandledLink] = useState<boolean>(false)

	useEffect(() => {
		console.log('State change:', MessengerAppState[state.appState] + '\n')
	}, [state.appState])

	useEffect(() => {
		initialLaunch(state.accountClient, dispatch, embedded).catch(e => console.warn(e))
	}, [state.accountClient, embedded])

	useEffect(() => {
		openingDaemon(state.accountClient, dispatch, state.appState, state.selectedAccount).catch(e =>
			console.warn(e),
		)
	}, [state.accountClient, embedded, state.appState, state.selectedAccount])

	useEffect(() => {
		openingClients(
			state.accountClient,
			dispatch,
			state.appState,
			eventEmitter,
			daemonAddress,
			embedded,
			reduxDispatch,
		).catch(e => console.warn(e))
	}, [
		state.accountClient,
		daemonAddress,
		embedded,
		eventEmitter,
		state.appState,
		state.selectedAccount,
		reduxDispatch,
	])

	const initialListComplete = useAppSelector(state => state.messenger.initialListComplete)

	useEffect(
		() => openingListingEvents(state.appState, initialListComplete, dispatch),
		[state.appState, initialListComplete],
	)

	useEffect(() => {
		openingLocalSettings(
			state.accountClient,
			dispatch,
			state.appState,
			state.selectedAccount,
		).catch(e => console.warn(e))
	}, [state.accountClient, state.appState, state.selectedAccount])

	const conversations = useConversationsDict()

	useEffect(() => {
		openingCloseConvos(
			state.appState,
			state.client,
			conversations,
			state.persistentOptions,
			dispatch,
		).catch(e => console.warn(e))
	}, [state.appState, state.client, conversations, state.persistentOptions, embedded])

	const accountLanguage = useAppSelector(selectAccountLanguage)
	useEffect(() => {
		syncAccountLanguage(accountLanguage).catch(e => console.warn(e))
	}, [accountLanguage])

	const account = useAccount()

	useEffect(() => {
		updateAccountsPreReady(
			state.accountClient,
			state.appState,
			state.client,
			state.selectedAccount,
			account,
			state.protocolClient,
			embedded,
			dispatch,
		).catch(e => console.warn(e))
	}, [
		state.accountClient,
		state.appState,
		state.client,
		state.selectedAccount,
		account,
		state.protocolClient,
		embedded,
		dispatch,
	])

	useEffect(
		() =>
			closingDaemon(
				state.accountClient,
				state.appState,
				state.clearClients,
				dispatch,
				reduxDispatch,
			),
		[state.accountClient, state.clearClients, state.appState, reduxDispatch],
	)

	useEffect(
		() =>
			deletingStorage(
				state.accountClient,
				state.appState,
				dispatch,
				embedded,
				state.selectedAccount,
			),
		[state.accountClient, state.appState, state.selectedAccount, embedded],
	)

	const callbackImportAccount = useCallback(
		(path: string) => importAccount(state.accountClient, embedded, dispatch, path, reduxDispatch),
		[state.accountClient, embedded, reduxDispatch],
	)

	const callbackRestart = useCallback(
		() => restart(state.accountClient, embedded, dispatch, state.selectedAccount, reduxDispatch),
		[state.accountClient, state.selectedAccount, embedded, reduxDispatch],
	)

	const callbackDeleteAccount = useCallback(
		() =>
			deleteAccount(state.accountClient, embedded, dispatch, state.selectedAccount, reduxDispatch),
		[state.accountClient, embedded, state.selectedAccount, reduxDispatch],
	)

	const callbackSwitchAccount = useCallback(
		(account: string) =>
			switchAccount(state.accountClient, embedded, dispatch, account, reduxDispatch),
		[state.accountClient, embedded, reduxDispatch],
	)

	const callbackCreateNewAccount = useCallback(
		(newConfig?: beapi.account.INetworkConfig) =>
			createNewAccount(state.accountClient, embedded, dispatch, newConfig),
		[state.accountClient, embedded],
	)

	const callbackUpdateAccount = useCallback(
		(payload: any) => updateAccount(state.accountClient, embedded, dispatch, payload),
		[state.accountClient, embedded],
	)

	const callbackGetUsername = useCallback(() => {
		return getUsername(state.accountClient)
	}, [state.accountClient])

	const callbackSetPersistentOption = useCallback(
		action => setPersistentOption(state.accountClient, dispatch, state.selectedAccount, action),
		[state.accountClient, state.selectedAccount],
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
			const netConf = await state.accountClient.networkConfigGet({
				accountId: state.selectedAccount,
			})
			if (!netConf.currentConfig) {
				return
			}

			setNetworkConfig(netConf.currentConfig)
		}

		f().catch(e => console.warn(e))
	}, [state.accountClient, state.selectedAccount])

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
