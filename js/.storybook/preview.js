import React from 'react'
import { AppDimensionsProvider } from '@berty/contexts/app-dimensions.context'
import { StyleProvider } from '@berty/contexts/styles'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as ReduxProvider } from 'react-redux'
import { IconRegistry } from '@ui-kitten/components'
import reduxStore from '@berty/redux/store'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { FeatherIconsPack } from '../packages/messenger-app/feather-icons'
import { CustomIconsPack } from '../packages/messenger-app/custom-icons'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import { ScrollView, StyleSheet, View } from 'react-native'

export const decorators = []
export const parameters = {}

export const ScroolViewDecorator = (getStory, context) => (
	<ScrollView style={styles.scrollview}>{getStory(context)}</ScrollView>
)

export const AppDecorator = (getStory, context) => (
	<SafeAreaProvider>
		<AppDimensionsProvider>
			<StyleProvider>
				<ReduxProvider store={reduxStore}>
					<IconRegistry icons={[EvaIconsPack, FeatherIconsPack, CustomIconsPack]} />
					{getStory(context)}
				</ReduxProvider>
			</StyleProvider>
		</AppDimensionsProvider>
	</SafeAreaProvider>
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
