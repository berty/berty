import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import { ScrollView, StyleSheet, View } from 'react-native'
import AppCommonProviders from '@berty/contexts/AppCommonProviders'

export const decorators = []
export const parameters = {}

export const ScroolViewDecorator = (getStory, context) => (
	<ScrollView style={styles.scrollview}>{getStory(context)}</ScrollView>
)

export const AppDecorator = (getStory, context) => (
	<AppCommonProviders>{getStory(context)}</AppCommonProviders>
)

const StoryBookStack = createNativeStackNavigator()

export const NavigationDecorator = story => {
	const Screen = () => story()
	return (
		<NavigationContainer independent={true}>
			<StoryBookStack.Navigator>
				<StoryBookStack.Screen
					name='MyStorybookScreen'
					component={Screen}
					options={{ header: () => null }}
				/>
			</StoryBookStack.Navigator>
		</NavigationContainer>
	)
}

export const Spacer = () => <View style={styles.spacer} />

const styles = StyleSheet.create({
	scrollview: { padding: 16, height: '100%' },
	spacer: { height: 16 },
})
