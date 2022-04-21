import React from 'react'
import { IconRegistry } from '@ui-kitten/components'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import RNBootSplash from 'react-native-bootsplash'
import { Provider as ReduxProvider } from 'react-redux'
import { Platform, View } from 'react-native'
import * as Font from 'expo-font'

import '@berty/i18n'
import { Provider as ThemeProvider } from '@berty/components/theme'
import { StreamGate, ListGate } from '@berty/components/gates'
import { MessengerEffects, useThemeColor, useMountEffect } from '@berty/store'
import { isReadyRef, navigationRef } from '@berty/navigation'
import { Navigation } from '@berty/navigation/stacks'
import NotificationProvider from '@berty/components/providers/notification.provider'
import { MusicPlayerProvider } from '@berty/components/providers/musicPlayer.provider'
import { ErrorScreen } from '@berty/components/error'
import reduxStore from '@berty/redux/store'
import { ModalProvider } from '@berty/components/providers/modal.provider'
import { AppDimensionsProvider, StyleProvider } from '@berty/contexts/styles'
import BoldOpenSans from '@berty/assets/font/OpenSans-Bold.ttf'
import LightOpenSans from '@berty/assets/font/OpenSans-Light.ttf'
import LightItalicOpenSans from '@berty/assets/font/OpenSans-LightItalic.ttf'
import SemiBoldOpenSans from '@berty/assets/font/OpenSans-SemiBold.ttf'
import SemiBoldItalicOpenSans from '@berty/assets/font/OpenSans-SemiBoldItalic.ttf'

import { FeatherIconsPack } from './feather-icons'
import { CustomIconsPack } from './custom-icons'

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

// load Open Sans font for web
const useFonts = () => {
	const [isFontLoaded, setIsFontLoaded] = React.useState(false)

	const loadFontAsync = React.useCallback(async () => {
		try {
			await Font.loadAsync({
				'Bold Open Sans': {
					uri: BoldOpenSans,
					display: Font.FontDisplay.SWAP,
				},
				'Light Open Sans': {
					uri: LightOpenSans,
					display: Font.FontDisplay.SWAP,
				},
				'Light Italic Open Sans': {
					uri: LightItalicOpenSans,
					display: Font.FontDisplay.SWAP,
				},
				'Open Sans': {
					uri: SemiBoldOpenSans,
					display: Font.FontDisplay.SWAP,
				},
				'Italic Open Sans': {
					uri: SemiBoldItalicOpenSans,
					display: Font.FontDisplay.SWAP,
				},
			})
			setIsFontLoaded(true)
		} catch (error) {
			console.log('Font Load Error:', error)
		}
	}, [])

	useMountEffect(() => {
		loadFontAsync()
	})

	return {
		isFontLoaded,
	}
}

const App: React.FC = () => {
	const { isFontLoaded } = useFonts()

	useMountEffect(() => {
		return () => {
			isReadyRef.current = false
		}
	})

	if (!isFontLoaded) {
		return null
	}

	return (
		<SafeAreaProvider>
			<AppDimensionsProvider>
				<StyleProvider>
					<ReduxProvider store={reduxStore}>
						<MessengerEffects />
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
					</ReduxProvider>
				</StyleProvider>
			</AppDimensionsProvider>
		</SafeAreaProvider>
	)
}

export default App
