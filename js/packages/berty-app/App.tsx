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
import { testIdsEnabled, testId } from '@berty-tech/appium-utils'
// import bridge, { ReactNativeTransport } from '@berty-tech/grpc-bridge'

import { faker } from '@berty-tech/berty-storybook/faker.gen'
import { Theme } from '@berty-tech/berty-storybook'
import { NavigationNativeContainer } from '@react-navigation/native'
import { enableScreens } from 'react-native-screens'
import { View, Text } from 'react-native'

enableScreens()

export const TestIdsStatus = () =>
	testIdsEnabled() && (
		<View>
			<Text>Test IDs enabled!</Text>
		</View>
	)

export const App: React.FC = () => (
	<NavigationNativeContainer>
		<Store.Provider
			rpcImpl={
				faker.berty.chat.ChatService
					.rpcImpl /*bridge({ host: '', transport: ReactNativeTransport() */
			}
		>
			<Theme.Provider>
				<View {...testId('TestElem')}>
					<Text>42</Text>
				</View>
				<Navigation />
				<TestIdsStatus />
			</Theme.Provider>
		</Store.Provider>
	</NavigationNativeContainer>
)

export default App
