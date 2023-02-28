import { NavigationContainer } from '@react-navigation/native'
import { IconRegistry } from '@ui-kitten/components'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import React from 'react'
import { Platform, View } from 'react-native'
import RNBootSplash from 'react-native-bootsplash'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as ReduxProvider } from 'react-redux'

import { ErrorScreen } from '@berty/components/error'
import NotificationProvider from '@berty/contexts/notification.context'
import { PermissionsProvider } from '@berty/contexts/permissions.context'
import { AppDimensionsProvider, StyleProvider } from '@berty/contexts/styles'
import { UIKittenProvider } from '@berty/contexts/uiKitten.context'
import { useMountEffect, useThemeColor } from '@berty/hooks'
import { isReadyRef, navigationRef } from '@berty/navigation'
import { Navigation } from '@berty/navigation/stacks'
import reduxStore from '@berty/redux/store'

import { CustomIconsPack } from './custom-icons'
import { FeatherIconsPack } from './feather-icons'
import { useFonts } from './fonts-loader'

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
						<IconRegistry icons={[EvaIconsPack, FeatherIconsPack, CustomIconsPack]} />
						<UIKittenProvider>
							<Background>
								<ErrorScreen>
									<NavigationContainer
										ref={navigationRef}
										onReady={() => {
											isReadyRef.current = true
										}}
									>
										<PermissionsProvider>
											<NotificationProvider>
												{Platform.OS !== 'web' ? <BootSplashInhibitor /> : null}
												<Navigation />
											</NotificationProvider>
										</PermissionsProvider>
									</NavigationContainer>
								</ErrorScreen>
							</Background>
						</UIKittenProvider>
					</ReduxProvider>
				</StyleProvider>
			</AppDimensionsProvider>
		</SafeAreaProvider>
	)
}

export default App
