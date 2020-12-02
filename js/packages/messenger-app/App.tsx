import React from 'react'
import { IconRegistry } from '@ui-kitten/components'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import Shake from '@shakebugs/react-native-shake'
import RNBootSplash from 'react-native-bootsplash'

import '@berty-tech/berty-i18n'
import { Provider as ThemeProvider } from '@berty-tech/components/theme'
import { StreamGate, ListGate } from '@berty-tech/components/gates'
import MsgrProvider from '@berty-tech/store/provider'
import { isReadyRef, navigationRef } from '@berty-tech/navigation'
import { Navigation } from '@berty-tech/navigation/stacks'
import { Provider as StyleProvider } from '@berty-tech/styles'
import NotificationProvider from '@berty-tech/components/NotificationProvider'
import { StickMusicPlayer } from '@berty-tech/components/shared-components/StickyMusicPlayer'
import { MusicPlayerProvider } from '@berty-tech/music-player'
import { useMountEffect } from '@berty-tech/store/hooks'

import { FeatherIconsPack } from './feather-icons'
import { CustomIconsPack } from './custom-icons'
import PushNotification from 'react-native-push-notification'
import { tokenSubscriber } from '@berty-tech/store/push'
import { Platform } from 'react-native'

const BootSplashInhibitor = () => {
	useMountEffect(() => {
		RNBootSplash.hide({ fade: true })
	})
	return null
}

PushNotification.configure({
	// (optional) Called when Token is generated (iOS and Android)
	onRegister: function (token: { token: string; os: string }) {
		let tokenUIntArray = new Uint8Array(token.token.length)
		tokenUIntArray.forEach((_, i) => {
			tokenUIntArray[i] = token.token.charCodeAt(i)
		})

		tokenSubscriber.onNew(tokenUIntArray)
		console.log('TOKEN:', token)
	},

	// (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
	onRegistrationError: function (err: Error) {
		tokenSubscriber.onError(err)
		console.error(err.message, err)
	},
})

if (Platform.OS === 'android') {
	// TODO: use at least one channel per account?
	const messageChannel = 'berty-message'

	PushNotification.channelExists(messageChannel, function (exists: boolean) {
		if (!exists) {
			PushNotification.createChannel(
				{
					channelId: messageChannel, // (required)
					channelName: 'New messages', // (required)
					channelDescription: 'Any new incoming message', // (optional) default: undefined.
					soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
					importance: 4, // (optional) default: 4. Int value of the Android notification importance
					vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
				},
				(created: boolean) => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
			)
		}
	})
}

export const App: React.FC = () => {
	React.useEffect(() => {
		Shake.start()

		return () => {
			isReadyRef.current = false
		}
	}, [])

	return (
		<SafeAreaProvider>
			<StyleProvider>
				<MsgrProvider embedded daemonAddress='http://localhost:1337'>
					<IconRegistry icons={[EvaIconsPack, FeatherIconsPack, CustomIconsPack]} />
					<ThemeProvider>
						<NavigationContainer
							ref={navigationRef}
							onReady={() => {
								isReadyRef.current = true
							}}
						>
							<NotificationProvider>
								<BootSplashInhibitor />
								<StreamGate>
									<ListGate>
										<MusicPlayerProvider>
											<StickMusicPlayer />
											<Navigation />
										</MusicPlayerProvider>
									</ListGate>
								</StreamGate>
							</NotificationProvider>
						</NavigationContainer>
					</ThemeProvider>
				</MsgrProvider>
			</StyleProvider>
		</SafeAreaProvider>
	)
}

export default App
