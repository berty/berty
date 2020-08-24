import React from 'react'
import { enableScreens } from 'react-native-screens'
import { IconRegistry } from 'react-native-ui-kitten'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import '@berty-tech/berty-i18n'
import { Provider as ThemeProvider } from '@berty-tech/components/theme'
import { StreamGate, DeleteGate, ListGate } from '@berty-tech/components/gates'
import MsgrProvider from '@berty-tech/store/provider'
import Navigation, { NavigationContainer } from '@berty-tech/navigation'
import { Provider as StyleProvider } from '@berty-tech/styles'

import { FeatherIconsPack } from './feather-icons'
import { CustomIconsPack } from './custom-icons'

enableScreens()

export const App: React.FC = () => {
	return (
		<SafeAreaProvider>
			<StyleProvider>
				<MsgrProvider embedded daemonAddress='http://localhost:1337'>
					<IconRegistry icons={[EvaIconsPack, FeatherIconsPack, CustomIconsPack]} />
					<ThemeProvider>
						<DeleteGate>
							<StreamGate>
								<ListGate>
									<NavigationContainer>
										<Navigation />
									</NavigationContainer>
								</ListGate>
							</StreamGate>
						</DeleteGate>
					</ThemeProvider>
				</MsgrProvider>
			</StyleProvider>
		</SafeAreaProvider>
	)
}

export default App
