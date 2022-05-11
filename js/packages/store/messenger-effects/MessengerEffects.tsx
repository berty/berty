import React, { useEffect } from 'react'

// import { usePrevious } from '@berty/components/hooks'
import { useAppDispatch, useAppSelector } from '@berty/hooks'
import {
	resetStateBeforeOpening,
	selectAppState,
	selectClearClients,
	selectSelectedAccount,
	setStateOpening,
} from '@berty/redux/reducers/ui.reducer'

import { initialLaunch } from './initialLaunch.effect'

export const MessengerEffects: React.FC = () => {
	const dispatch = useAppDispatch()
	const selectedAccount = useAppSelector(selectSelectedAccount)
	const appState = useAppSelector(selectAppState)
	const clearClients = useAppSelector(selectClearClients)

	useEffect(() => {
		console.log(`State change: ${appState}\n`)
	}, [appState])

	useEffect(() => {
		initialLaunch(dispatch)
	}, [dispatch])

	useEffect(() => {
		const f = async () => {
			await clearClients()
		}

		if (selectedAccount) {
			// clear clients
			f()
			// reset UiState except accounts, isNewAccount and selectedAccount keys
			dispatch(resetStateBeforeOpening())
			// when selected account is changed, we want to reopen clients
			dispatch(setStateOpening())
		}
	}, [clearClients, dispatch, selectedAccount])

	return null
}
