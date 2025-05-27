import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { storiesOf } from '@storybook/react-native'
import React from 'react'

import { AppDecorator, NavigationDecorator } from '../../../.storybook/preview'
import { CreatingAccount, OpeningAccount } from '../account'
import { CreateAccount } from './CreateAccount/CreateAccount'
import { DefaultMode } from './DefaultMode/DefaultMode'

const Stack = createNativeStackNavigator()

storiesOf('Onboarding', module)
	.addDecorator(AppDecorator)
	.addDecorator(NavigationDecorator)
	.add('Create Account', (props: any) => <CreateAccount {...props} />)
	.add('Default Mode', (props: any) => <DefaultMode {...props} />)
	.add('Creating Account', (props: any) => <CreatingAccount {...props} />)

storiesOf('Onboarding', module)
	.addDecorator(AppDecorator)
	.add('Onboarding', () => (
		<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen
					name='Account.Opening'
					initialParams={{
						selectedAccount: '123-account-id-123',
						isNewAccount: true,
					}}
					component={OpeningAccount}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	))
