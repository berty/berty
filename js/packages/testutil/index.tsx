import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { IconRegistry } from '@ui-kitten/components'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { Provider as ThemeProvider } from '@berty-tech/components/theme'
import { FeatherIconsPack } from '@berty-tech/messenger-app/feather-icons'
import { CustomIconsPack } from '@berty-tech/messenger-app/custom-icons'
import { Provider as StyleProvider } from '@berty-tech/styles'

export const TestProvider: React.FC = ({ children }) => (
	<SafeAreaProvider
		initialMetrics={{
			frame: { x: 0, y: 0, width: 0, height: 0 },
			insets: { top: 0, left: 0, right: 0, bottom: 0 },
		}}
	>
		<StyleProvider>
			<IconRegistry icons={[EvaIconsPack, FeatherIconsPack, CustomIconsPack]} />
			<ThemeProvider>
				<NavigationContainer>{children}</NavigationContainer>
			</ThemeProvider>
		</StyleProvider>
	</SafeAreaProvider>
)

import _fixtures from './fixtures'
export const fixtures = _fixtures
