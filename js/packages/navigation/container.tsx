import React, { useState, useRef } from 'react'
import {
	useLinking,
	NavigationContainer as ReactNavigationContainer,
} from '@react-navigation/native'
import { Routes } from './types'
import { Messenger } from '@berty-tech/hooks'

export const NavigationContainer: React.FC = ({ children }) => {
	const ref = useRef()
	const handleDeepLink = Messenger.useHandleDeepLink()
	const prefix = 'berty://'
	const { getInitialState } = useLinking(ref, {
		prefixes: [prefix],
		config: {
			['Modals']: {
				initialRouteName: 'Tabs',
				screens: {
					/*[Routes.Modals.ManageDeepLink]: {
						path: 'id/:type', // can't map prop name
						parse: {
							type: (data) => {
								console.log('got contact link', data)
								handleDeepLink(`${prefix}id/${data}`)
								return 'link'
							},
						},
					},*/
					[Routes.Modals.ManageDeepLink]: {
						path: 'group/:value', // can't map prop name
						parse: {
							value: (data) => {
								console.log('got group link', data)
								const link = `${prefix}group/${data}`
								handleDeepLink(link)
								return link
							},
						},
					},
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
					setInitialState(state as any)
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
