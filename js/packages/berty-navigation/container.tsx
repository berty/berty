import React, { useState, useRef } from 'react'
import {
	useLinking,
	NavigationContainer as ReactNavigationContainer,
} from '@react-navigation/native'
import { Routes } from './types'

export const NavigationContainer: React.FC = ({ children }) => {
	const ref = useRef()

	const { getInitialState } = useLinking(ref, {
		prefixes: ['berty://'],
		config: {
			['Modals']: {
				screens: {
					[Routes.Modals.SendContactRequest]: ':uriData',
				},
			},
		},
	})

	const [isReady, setIsReady] = useState(false)
	const [initialState, setInitialState] = useState()

	React.useEffect(() => {
		Promise.race([
			getInitialState(),
			new Promise((resolve) =>
				// Timeout in 150ms if `getInitialState` doesn't resolve
				// Workaround for https://github.com/facebook/react-native/issues/25675
				setTimeout(resolve, 150),
			),
		])
			.catch((e) => {
				console.error(e)
			})
			.then((state) => {
				if (state !== undefined) {
					setInitialState(state)
				}

				setIsReady(true)
			})
	}, [getInitialState])

	if (!isReady) {
		return null
	}

	return (
		<ReactNavigationContainer initialState={initialState} ref={ref}>
			{children}
		</ReactNavigationContainer>
	)
}
