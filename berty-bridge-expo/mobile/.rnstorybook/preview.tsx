import AppCommonProviders from '@berty/contexts/AppCommonProviders';
import { NavigationContainer } from '@react-navigation/native';
import type { Preview } from '@storybook/react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

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
          screenOptions={{ headerShown: false }}
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

export default preview;
