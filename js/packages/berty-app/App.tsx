/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import Navigation from '@berty-tech/berty-navigation'
// import bridge, { ReactNativeTransport } from '@berty-tech/grpc-bridge'

import { faker } from '@berty-tech/berty-storybook/faker.gen'
import { Theme } from '@berty-tech/berty-storybook'
import { NavigationNativeContainer } from '@react-navigation/native'
import '@berty-tech/berty-i18n'
import { enableScreens } from 'react-native-screens'

enableScreens()

export const App: React.FC = () => (
	<NavigationNativeContainer>
		<Store.Provider
			rpcImpl={
				faker.berty.chat.ChatService
					.rpcImpl /*bridge({ host: '', transport: ReactNativeTransport() */
			}
		>
			<Theme.Provider>
				<Navigation />
			</Theme.Provider>
		</Store.Provider>
	</NavigationNativeContainer>
)

export default App
