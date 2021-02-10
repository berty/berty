import React, { useCallback, useEffect } from 'react'
import MsgrContext, { initialState } from './context'
import { EventEmitter } from 'events'
import {
	initialLaunch,
	openingDaemon,
	openingClients,
	openingListingEvents,
	openingLocalSettings,
	openingCloseConvos,
	closingDaemon,
	deletingStorage,
} from './providerEffects'
import {
	setPersistentOption,
	createNewAccount,
	importAccount,
	updateAccount,
	switchAccount,
	deleteAccount,
	restart,
} from './providerCallbacks'
import { reducer } from './providerReducer'

export const MsgrProvider: React.FC<any> = ({ children, daemonAddress, embedded }) => {
	const [state, dispatch] = React.useReducer(reducer, { ...initialState, daemonAddress, embedded })
	const [eventEmitter] = React.useState(new EventEmitter())
	const [debugMode, setDebugMode] = React.useState(false)

	useEffect(() => {
		console.log('State change:', state.appState + '\n')
	}, [state.appState])

	useEffect(() => {
		initialLaunch(dispatch, embedded)
	}, [embedded])

	useEffect(() => {
		openingDaemon(dispatch, state.appState, state.selectedAccount)
	}, [embedded, state.appState, state.selectedAccount])

	useEffect(() => openingClients(dispatch, state.appState, eventEmitter, daemonAddress, embedded), [
		daemonAddress,
		embedded,
		eventEmitter,
		state.appState,
		state.selectedAccount,
	])

	useEffect(() => openingListingEvents(state.appState, state.initialListComplete, dispatch), [
		state.appState,
		state.initialListComplete,
	])

	useEffect(() => openingLocalSettings(dispatch, state.appState, state.selectedAccount), [
		state.appState,
		state.selectedAccount,
	])

	useEffect(() => openingCloseConvos(state.appState, dispatch, state.client, state.conversations), [
		state.appState,
		state.client,
		state.conversations,
	])

	useEffect(() => closingDaemon(state.appState, state.clearClients, dispatch), [
		state.clearClients,
		state.appState,
	])

	useEffect(() => deletingStorage(state.appState, dispatch, embedded, state.selectedAccount), [
		state.appState,
		state.selectedAccount,
		embedded,
	])

	const callbackImportAccount = useCallback(
		(path: string) => importAccount(embedded, dispatch, path),
		[embedded],
	)

	const callbackRestart = useCallback(() => restart(embedded, dispatch, state.selectedAccount), [
		state.selectedAccount,
		embedded,
	])

	const callbackDeleteAccount = useCallback(
		() => deleteAccount(embedded, dispatch, state.selectedAccount),
		[embedded, state.selectedAccount],
	)

	const callbackSwitchAccount = useCallback(
		(account: string) => switchAccount(embedded, dispatch, account),
		[embedded],
	)

	const callbackCreateNewAccount = useCallback(
		() => createNewAccount(embedded, dispatch, state.clearClients),
		[embedded, state.clearClients],
	)

	const callbackUpdateAccount = useCallback(
		(payload: any) => updateAccount(embedded, dispatch, payload),
		[embedded],
	)

	const callbackSetPersistentOption = useCallback(
		(action) => setPersistentOption(dispatch, state.selectedAccount, action),
		[state.selectedAccount],
	)

	const callbackAddNotificationListener = useCallback(
		(cb) => {
			eventEmitter.addListener('notification', cb)
		},
		[eventEmitter],
	)

	const callbackRemoveNotificationListener = useCallback(
		(cb) => {
			eventEmitter.removeListener('notification', cb)
		},
		[eventEmitter],
	)

	const callbackSetDebugMode = useCallback((value: boolean) => setDebugMode(value), [])

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
				restart: callbackRestart,
				debugMode: debugMode,
				setDebugMode: callbackSetDebugMode,
			}}
		>
			{children}
		</MsgrContext.Provider>
	)
}

export default MsgrProvider
