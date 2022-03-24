import React from 'react'
import { IconRegistry } from '@ui-kitten/components'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import RNBootSplash from 'react-native-bootsplash'
import { Provider as ReduxProvider } from 'react-redux'
import { Platform, View } from 'react-native'

import '@berty-tech/berty-i18n'
import { Provider as ThemeProvider } from '@berty-tech/components/theme'
import { StreamGate, ListGate } from '@berty-tech/components/gates'
import { MessengerProvider, useThemeColor, useMountEffect } from '@berty-tech/store'
import { isReadyRef, navigationRef } from '@berty-tech/navigation'
import { Navigation } from '@berty-tech/navigation/stacks'
import { Provider as StyleProvider } from '@berty-tech/styles'
import NotificationProvider from '@berty-tech/components/providers/notification.provider'
import { MusicPlayerProvider } from '@berty-tech/components/providers/musicPlayer.provider'
import { ErrorScreen } from '@berty-tech/components/error'
import reduxStore from '@berty-tech/redux/store'

import { FeatherIconsPack } from './feather-icons'
import { CustomIconsPack } from './custom-icons'
import { ModalProvider } from '@berty-tech/components/providers/modal.provider'

const BootSplashInhibitor: React.FC = () => {
	useMountEffect(() => {
		RNBootSplash.hide({ fade: true })
	})

	return <></>
}

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
											{Platform.OS !== 'web' ? <BootSplashInhibitor /> : null}
											<StreamGate>
												<ListGate>
													<MusicPlayerProvider>
														<ModalProvider>
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
