import React, { useCallback, useEffect, useState } from 'react'
import { EventEmitter } from 'events'

import MsgrContext, { accountService, initialState, PersistentOptionsKeys } from './context'
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
} from './providerEffects'
import {
	setPersistentOption,
	importAccount,
	updateAccount,
	switchAccount,
	deleteAccount,
	restart,
	setReaction,
} from './providerCallbacks'
import { createNewAccount, getUsername } from './effectableCallbacks'
import { reducer } from './providerReducer'
import { playSound, SoundKey } from './sounds'
import beapi from '@berty-tech/api'

export const MsgrProvider: React.FC<any> = ({ children, daemonAddress, embedded }) => {
	const [state, dispatch] = React.useReducer(reducer, { ...initialState, daemonAddress, embedded })
	const [eventEmitter] = React.useState(new EventEmitter())
	const [debugMode, setDebugMode] = React.useState(false)
	const [networkConfig, setNetworkConfig] = useState<beapi.account.INetworkConfig>({})

	useEffect(() => {
		console.log('State change:', state.appState + '\n')
	}, [state.appState])

	useEffect(() => {
		initialLaunch(dispatch, embedded).then()
	}, [embedded])

	useEffect(() => {
		openingDaemon(dispatch, state.appState, state.selectedAccount).then()
	}, [embedded, state.appState, state.selectedAccount])

	useEffect(() => {
		openingClients(dispatch, state.appState, eventEmitter, daemonAddress, embedded).then()
	}, [daemonAddress, embedded, eventEmitter, state.appState, state.selectedAccount])

	useEffect(
		() => openingListingEvents(state.appState, state.initialListComplete, dispatch),
		[state.appState, state.initialListComplete],
	)

	useEffect(() => {
		openingLocalSettings(dispatch, state.appState, state.selectedAccount).then()
	}, [state.appState, state.selectedAccount])

	useEffect(() => {
		openingCloseConvos(
			state.appState,
			state.persistentOptions.i18n.language,
			state.client,
			state.conversations,
			state.persistentOptions,
			embedded,
			dispatch,
		).then()
	}, [
		state.appState,
		state.persistentOptions.i18n.language,
		state.client,
		state.conversations,
		state.persistentOptions,
		embedded,
	])

	useEffect(() => {
		updateAccountsPreReady(
			state.appState,
			state.client,
			state.selectedAccount,
			state.account,
			embedded,
			dispatch,
		).then()
	}, [state.appState, state.client, state.selectedAccount, state.account, embedded, dispatch])

	useEffect(
		() => closingDaemon(state.appState, state.clearClients, dispatch),
		[state.clearClients, state.appState],
	)

	useEffect(
		() => deletingStorage(state.appState, dispatch, embedded, state.selectedAccount),
		[state.appState, state.selectedAccount, embedded],
	)

	const callbackImportAccount = useCallback(
		(path: string) => importAccount(embedded, dispatch, path),
		[embedded],
	)

	const callbackRestart = useCallback(
		() => restart(embedded, dispatch, state.selectedAccount),
		[state.selectedAccount, embedded],
	)

	const callbackDeleteAccount = useCallback(
		() => deleteAccount(embedded, dispatch, state.selectedAccount),
		[embedded, state.selectedAccount],
	)

	const callbackSwitchAccount = useCallback(
		(account: string) => switchAccount(embedded, dispatch, account),
		[embedded],
	)

	const callbackCreateNewAccount = useCallback(
		() => createNewAccount(embedded, dispatch),
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

	const callbackAddReaction = useCallback(
		(convPK: string, targetCID: string, emoji: string) => {
			if (state.client) {
				return setReaction(convPK, targetCID, emoji, true, state.client)
			}
		},
		[state.client],
	)

	const callbackRemoveReaction = useCallback(
		(convPK: string, targetCID: string, emoji: string) => {
			if (state.client) {
				return setReaction(convPK, targetCID, emoji, false, state.client)
			}
		},
		[state.client],
	)

	useEffect(() => {
		if (state.selectedAccount === null) {
			console.warn('no account id supplied')
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
		<MsgrContext.Provider
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
				addReaction: callbackAddReaction,
				removeReaction: callbackRemoveReaction,
				networkConfig: networkConfig,
				setNetworkConfig: setNetworkConfig,
			}}
		>
			{children}
		</MsgrContext.Provider>
	)
}

export default MsgrProvider
