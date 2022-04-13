import React, { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useAppDispatch, useAppSelector, useAccount, useConversationsDict } from '@berty/hooks'
import { selectAccountLanguage } from '@berty/redux/reducers/accountSettings.reducer'
import {
	selectAppState,
	selectClearClients,
	selectClient,
	selectEmbedded,
	selectProtocolClient,
	selectSelectedAccount,
	selectDaemonAddress,
} from '@berty/redux/reducers/ui.reducer'
import { selectPersistentOptions } from '@berty/redux/reducers/persistentOptions.reducer'
import { EventEmitterContext } from '@berty/contexts/eventEmitter.context'

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
} from './effectsImplem'

export const MessengerEffects: React.FC = () => {
	const dispatch = useAppDispatch()
	const eventEmitter = useContext(EventEmitterContext)
	const appState = useSelector(selectAppState)
	const clearClients = useSelector(selectClearClients)
	const protocolClient = useSelector(selectProtocolClient)
	const client = useSelector(selectClient)
	const embedded = useSelector(selectEmbedded)
	const selectedAccount = useSelector(selectSelectedAccount)
	const persistentOptions = useSelector(selectPersistentOptions)
	const daemonAddress = useSelector(selectDaemonAddress)

	useEffect(() => {
		console.log(`State change: ${appState}\n`)
	}, [appState])

	useEffect(() => {
		initialLaunch(embedded)
	}, [embedded])

	useEffect(() => {
		openingDaemon(appState, selectedAccount)
	}, [embedded, appState, selectedAccount])

	useEffect(() => {
		openingClients(appState, eventEmitter, daemonAddress, embedded, dispatch)
	}, [daemonAddress, embedded, eventEmitter, appState, selectedAccount, dispatch])

	const initialListComplete = useAppSelector(state => state.messenger.initialListComplete)

	useEffect(() => {
		return openingListingEvents(appState, initialListComplete)
	}, [appState, initialListComplete])

	useEffect(() => {
		openingLocalSettings(appState)
	}, [appState])

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
		updateAccountsPreReady(appState, client, selectedAccount, account, protocolClient, embedded)
	}, [appState, client, selectedAccount, account, protocolClient, embedded])

	useEffect(() => {
		return closingDaemon(appState, clearClients, dispatch)
	}, [clearClients, appState, dispatch])

	useEffect(() => {
		return deletingStorage(appState, embedded, selectedAccount)
	}, [appState, selectedAccount, embedded])

	return null
}
