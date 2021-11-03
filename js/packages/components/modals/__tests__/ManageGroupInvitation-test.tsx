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

import ManageGroupInvitation from '../ManageGroupInvitation'

jest.mock('react-native/Libraries/LogBox/LogBox')

describe('ManageGroupInvitation modal', () => {
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
		const props: React.ComponentProps<typeof ManageGroupInvitation> = {
			publicKey: 'ShNdInuJKER0Nh_puXWMYDlydH8BX_hEt0joqiBeBso',
			isPassword: false,
			type: 'link',
			displayName: 'some-group',
			link: 'https://berty.tech/id#group/5QdUv6Fn3uvsxRCYb9hUn6UCe26QK7s7sqmFQGsQrNjj4TZmViFRyEwRr8dz3qMzGThz3QUTTj3NrAkg3WC6PqjXDvAp5UUrfzGqw8BxHiKye8QyRp46dJGAKQEjQfvkSx9GKm5QevrrDzsmfyUSkj6HqKVzPRZxr7X1FebqM7xxweY9K69tJoJC41an3fdbAr/name=some+group',
		}
		const tree = renderer
			.create(
				<TestProvider>
					<ManageGroupInvitation {...props} />
				</TestProvider>,
			)
			.toJSON()
		expect(tree).toMatchSnapshot()
	})
})
