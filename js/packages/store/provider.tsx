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
	setPersistentOption,
	createNewAccount,
	importAccount,
} from '@berty-tech/store/providerEffects'
import { reducer } from './providerReducer'

export const MsgrProvider: React.FC<any> = ({ children, daemonAddress, embedded }) => {
	const [state, dispatch] = React.useReducer(reducer, { ...initialState, daemonAddress, embedded })
	const [eventEmitter] = React.useState(new EventEmitter())

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

	useEffect(() => closingDaemon(state.clearClients, dispatch), [state.clearClients])

	useEffect(() => deletingStorage(state.appState, dispatch, embedded, state.selectedAccount), [
		state.appState,
		state.selectedAccount,
		embedded,
	])

	const callbackImportAccount = useCallback(
		(path: string) => importAccount(embedded, dispatch, path),
		[embedded],
	)

	const callbackCreateNewAccount = useCallback(() => createNewAccount(embedded, dispatch), [
		embedded,
	])

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
			}}
		>
			{children}
		</MsgrContext.Provider>
	)
}

export default MsgrProvider
