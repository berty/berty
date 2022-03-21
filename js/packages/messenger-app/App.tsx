import React from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { IconRegistry } from '@ui-kitten/components'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { View } from 'react-native'
import RNBootSplash from 'react-native-bootsplash'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as ReduxProvider } from 'react-redux'

import '@berty-tech/berty-i18n'
import { ErrorScreen } from '@berty-tech/components/error'
import { StreamGate, ListGate } from '@berty-tech/components/gates'
import { ModalProvider } from '@berty-tech/components/providers/modal.provider'
import { MusicPlayerProvider } from '@berty-tech/components/providers/musicPlayer.provider'
import NotificationProvider from '@berty-tech/components/providers/notification.provider'
import { Provider as ThemeProvider } from '@berty-tech/components/theme'
import { isReadyRef, navigationRef } from '@berty-tech/navigation'
import { Navigation } from '@berty-tech/navigation/stacks'
// import { StickMusicPlayer } from '@berty-tech/components/shared-components/StickyMusicPlayer'
import reduxStore from '@berty-tech/redux/store'
import { MessengerProvider, useMountEffect, useThemeColor } from '@berty-tech/store'
import { Provider as StyleProvider } from '@berty-tech/styles'

import { CustomIconsPack } from './custom-icons'
import { FeatherIconsPack } from './feather-icons'

const BootSplashInhibitor: React.FC = React.memo(() => {
	useMountEffect(() => {
		RNBootSplash.hide({ fade: true })
	})
	return null
})

const Background: React.FC = ({ children }) => {
	const colors = useThemeColor()
	return <View style={{ flex: 1, backgroundColor: colors['main-background'] }}>{children}</View>
}

export const App: React.FC = () => {
	useMountEffect(() => {
		return () => {
			isReadyRef.current = false
		}
	})

	return (
		<SafeAreaProvider>
			<StyleProvider>
				<ReduxProvider store={reduxStore}>
					<MessengerProvider daemonAddress='http://localhost:1337'>
						<IconRegistry icons={[EvaIconsPack, FeatherIconsPack, CustomIconsPack]} />
						<ThemeProvider>
							<Background>
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
														<ModalProvider>
															{/*<StickMusicPlayer />*/}
															<Navigation />
														</ModalProvider>
													</MusicPlayerProvider>
												</ListGate>
											</StreamGate>
										</NotificationProvider>
									</NavigationContainer>
								</ErrorScreen>
							</Background>
						</ThemeProvider>
					</MessengerProvider>
				</ReduxProvider>
			</StyleProvider>
		</SafeAreaProvider>
	)
}

export default App
