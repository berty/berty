/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import 'react-native-gesture-handler'
import React, { useState, useContext, useEffect } from 'react'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import DevMenu from 'react-native-dev-menu'
import Navigation from '@berty-tech/berty-navigation'
// import bridge, { ReactNativeTransport } from '@berty-tech/grpc-bridge'

import { faker } from '@berty-tech/berty-storybook/faker.gen'
import { Theme } from '@berty-tech/berty-storybook'
import '@berty-tech/berty-i18n'
import { enableScreens } from 'react-native-screens'
import { Chat } from '@berty-tech/hooks'
import { NavigationContainer } from '@react-navigation/native'
import AsyncStorage from '@react-native-community/async-storage'

import { ModalsProvider } from '@berty-tech/berty-storybook'
import { ModalsContext } from '@berty-tech/berty-storybook'
import LinkHandler from '@berty-tech/berty-storybook/LinkHandler'

enableScreens()

DevMenu.addItem('Clear async-storage', () => AsyncStorage.clear())

// Use this to dev a modal easily
const TestModal: React.FC = () => {
	const modals = useContext(ModalsContext)
	useEffect(() => {
		if (!modals.current) {
			// replace modal with yours
			const modal = undefined // <AddThisContact name='Bob' publicKey='fake' reference='fake' />

			modals.setCurrent(modal)
			console.log('set current', modal)
		}
	})
	return null
}

export const App: React.FC = () => (
	<NavigationContainer>
		<Store.Provider
			rpcImpl={
				faker.berty.chat.ChatService
					.rpcImpl /*bridge({ host: '', transport: ReactNativeTransport() */
			}
		>
			<Chat.Provider config={{ storage: AsyncStorage }}>
				<Theme.Provider>
					<ModalsProvider>
						<LinkHandler />
						<Navigation />
					</ModalsProvider>
				</Theme.Provider>
			</Chat.Provider>
		</Store.Provider>
	</NavigationContainer>
)

export default App
