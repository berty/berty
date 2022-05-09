import React, { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { EventEmitterContext } from '@berty/contexts/eventEmitter.context'
import { useAppDispatch, useAppSelector, useConversationsDict } from '@berty/hooks'
import { selectAppState } from '@berty/redux/reducers/ui.reducer'

import { initialLaunch, openingDaemonAndClients, finishPreparingAccount } from './effectsImplem'

export const MessengerEffects: React.FC = () => {
	const dispatch = useAppDispatch()
	const eventEmitter = useContext(EventEmitterContext)
	const ui = useAppSelector(state => state.ui)
	const messenger = useAppSelector(state => state.messenger)
	const appState = useSelector(selectAppState)
	const conversations = useConversationsDict()

	useEffect(() => {
		console.log(`State change: ${appState}\n`)
	}, [appState])

	useEffect(() => {
		// this condition is for support hot reload on dev, no need to restart all daemons/clients when we do a change on the store
		// this variable is set to true when messenger client has finished to stream events
		if (!messenger.initialEventsStreamCompleted) {
			// this function determine if you have already an account or not
			// if you have an account, this function triggered the openingDaemonAndClients in the next useEffect
			// else you'll be redirected in the onboarding
			initialLaunch(dispatch)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		// this function open berty daemon and differents clients
		// after that, EventStream of messengerClient will be called
		// when the stream will have finished, it will set initialEventsStreamCompleted (in the messenger store) to true
		openingDaemonAndClients(ui, eventEmitter, dispatch)
	}, [ui, eventEmitter, dispatch])

	useEffect(() => {
		// like the second useEffect of this file, this variable is set to true when messenger client has finished to stream events
		if (!messenger.initialEventsStreamCompleted) {
			console.info('waiting for initial listing to be completed')
			return
		}
		// this function finish to prepare some requirements for the app
		finishPreparingAccount(ui, messenger, conversations, dispatch)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [messenger.initialEventsStreamCompleted])

	return null
}
