/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import DevMenu from 'react-native-dev-menu'
import Navigation, { NavigationContainer } from '@berty-tech/berty-navigation'
// import bridge, { ReactNativeTransport } from '@berty-tech/grpc-bridge'

import { faker } from '@berty-tech/berty-storybook/faker.gen'
import { Theme } from '@berty-tech/berty-storybook'
import '@berty-tech/berty-i18n'
import { enableScreens } from 'react-native-screens'
import { Chat } from '@berty-tech/hooks'
import AsyncStorage from '@react-native-community/async-storage'

enableScreens()

DevMenu.addItem('Clear async-storage', () => AsyncStorage.clear())

export const App: React.FC = () => (
	<NavigationContainer>
		<Store.Provider
			rpcImpl={
				faker.berty.chat.ChatService
					.rpcImpl /*bridge({ host: '', transport: ReactNativeTransport() */
			}
		>
			<Chat.Provider config={{ storage: AsyncStorage }}>
				<Chat.Recorder />
				<Theme.Provider>
					<Navigation />
				</Theme.Provider>
			</Chat.Provider>
		</Store.Provider>
	</NavigationContainer>
)

export default App
