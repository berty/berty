import React from 'react'
import renderer from 'react-test-renderer'
import { NavigationContainer } from '@react-navigation/native'
import { IconRegistry } from '@ui-kitten/components'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { Provider as ThemeProvider } from '@berty-tech/components/theme'
import { FeatherIconsPack } from '@berty-tech/messenger-app/feather-icons'
import { CustomIconsPack } from '@berty-tech/messenger-app/custom-icons'
import { Provider as StyleProvider } from '@berty-tech/styles'

import InvalidScan from '../InvalidScan'

jest.mock('react-native/Libraries/LogBox/LogBox')

describe('InvalidScan modal', () => {
	beforeEach(() => {
		jest.resetModules()
		jest.resetAllMocks()
		jest.useFakeTimers()
	})
	it('renders correctly', () => {
		const TestProvider: React.FC = ({ children }) => (
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
		const props: React.ComponentProps<typeof InvalidScan> = {
			type: 'link',
			error: new Error('Test error'),
		}
		const tree = renderer
			.create(
				<TestProvider>
					<InvalidScan {...props} />
				</TestProvider>,
			)
			.toJSON()
		expect(tree).toMatchSnapshot()
	})
})
