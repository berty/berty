import React from 'react'
import { enableScreens } from 'react-native-screens'
import { IconRegistry } from '@ui-kitten/components'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'

import '@berty-tech/berty-i18n'
import { Provider as ThemeProvider } from '@berty-tech/components/theme'
import { StreamGate, DeleteGate, ListGate } from '@berty-tech/components/gates'
import MsgrProvider from '@berty-tech/store/provider'
import { isReadyRef, navigationRef } from '@berty-tech/navigation'
import { Navigation } from '@berty-tech/navigation/stacks'
import { Provider as StyleProvider } from '@berty-tech/styles'
import NotificationProvider from '@berty-tech/components/NotificationProvider'

import { FeatherIconsPack } from './feather-icons'
import { CustomIconsPack } from './custom-icons'

enableScreens()

export const App: React.FC = () => {
	React.useEffect(() => {
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
								<DeleteGate>
									<StreamGate>
										<ListGate>
											<Navigation />
										</ListGate>
									</StreamGate>
								</DeleteGate>
							</NotificationProvider>
						</NavigationContainer>
					</ThemeProvider>
				</MsgrProvider>
			</StyleProvider>
		</SafeAreaProvider>
	)
}

export default App
