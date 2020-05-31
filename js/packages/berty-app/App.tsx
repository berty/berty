/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react'
import DevMenu from 'react-native-dev-menu'
import Navigation, { NavigationContainer } from '@berty-tech/berty-navigation'

import { Theme, NodeGate, NotificationsProvider } from '@berty-tech/components'
import '@berty-tech/berty-i18n'
import { enableScreens } from 'react-native-screens'
import { Chat } from '@berty-tech/hooks'
import AsyncStorage from '@react-native-community/async-storage'
import { FeatherIconsPack } from './feather-icons'
import { IconRegistry } from 'react-native-ui-kitten'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { CustomIconsPack } from './custom-icons'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import GoBridge from '@berty-tech/go-bridge'

enableScreens()

DevMenu.addItem('Clear async-storage', async () => {
	await GoBridge.stopProtocol()
	await GoBridge.clearStorage()
	await AsyncStorage.clear()
	console.warn('CLEAR DONE')
})

export const App: React.FC = () => (
	<SafeAreaProvider>
		<NavigationContainer>
			<Chat.Provider config={{ storage: AsyncStorage }}>
				<IconRegistry icons={[EvaIconsPack, FeatherIconsPack, CustomIconsPack]} />
				<Theme.Provider>
					<NotificationsProvider>
						<NodeGate>
							<Navigation />
						</NodeGate>
					</NotificationsProvider>
				</Theme.Provider>
			</Chat.Provider>
		</NavigationContainer>
	</SafeAreaProvider>
)

export default App
