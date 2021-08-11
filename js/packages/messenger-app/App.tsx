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
import { ErrorScreen } from '@berty-tech/components/error'

import { FeatherIconsPack } from './feather-icons'
import { CustomIconsPack } from './custom-icons'

import { NativeEventEmitter, NativeModules } from 'react-native';

const BootSplashInhibitor = () => {
	useMountEffect(() => {
		console.log(NativeModules)
		RNBootSplash.hide({ fade: true })
	})
	return null
}

export const App: React.FC = () => {
	React.useEffect(() => {
		// @SYNC(gfanton): test rootdir log
		NativeModules.RootDirModule.getRootDir()
								 .then(res => console.log('rootdir', res))
								 .catch(err => console.warn(err))
		Shake.start()

		// @SYNC(gfanton): test push notif event emitter
		const eventEmitter = new NativeEventEmitter(NativeModules.NotificationModule)
		eventEmitter.addListener(NativeModules.NotificationModule.NOTIFICATION_EVENT_ID, (event) => {
			console.log('event', event)
		})

		return () => {
			eventEmitter.remove()
			isReadyRef.current = false
		}
	}, [])

	return (
		<SafeAreaProvider>
			<StyleProvider>
				<MsgrProvider embedded daemonAddress='http://localhost:1337'>
					<IconRegistry icons={[EvaIconsPack, FeatherIconsPack, CustomIconsPack]} />
					<ThemeProvider>
						<ErrorScreen>
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
						</ErrorScreen>
					</ThemeProvider>
				</MsgrProvider>
			</StyleProvider>
		</SafeAreaProvider>
	)
}

export default App
