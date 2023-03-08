import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { storiesOf } from '@storybook/react-native'
import React from 'react'

import { AppDecorator } from '../../../../.storybook/preview'
import { Home } from './Home'

const Stack = createNativeStackNavigator()

storiesOf('Screens', module)
	.addDecorator(AppDecorator)
	.add('Home', () => (
		<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen name='Home' component={Home} />
			</Stack.Navigator>
		</NavigationContainer>
	))
