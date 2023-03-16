import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { Platform, View } from 'react-native'
import RNBootSplash from 'react-native-bootsplash'

import { ErrorScreen } from '@berty/components/error'
import AppCommonProviders from '@berty/contexts/AppCommonProviders'
import NotificationProvider from '@berty/contexts/notification.context'
import { PermissionsProvider } from '@berty/contexts/permissions.context'
import { UIKittenProvider } from '@berty/contexts/uiKitten.context'
import { useMountEffect, useThemeColor } from '@berty/hooks'
import { isReadyRef, navigationRef } from '@berty/navigation'
import { Navigation } from '@berty/navigation/stacks'

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
	useMountEffect(() => {
		return () => {
			isReadyRef.current = false
		}
	})

	return (
		<AppCommonProviders>
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
		</AppCommonProviders>
	)
}

export default App
