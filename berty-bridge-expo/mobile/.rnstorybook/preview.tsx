import AppCommonProviders from '@berty/contexts/AppCommonProviders';
import { makeRouteContext, routeContextKey } from '@berty/utils/testing/routerContext';
import { ExpoRoot } from 'expo-router';
import type { Preview } from '@storybook/react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

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

// Screens read their params and navigation from Expo Router hooks, so stories are
// mounted inside a throwaway in-memory router rather than a bare navigator.
const STORY_ROUTE = '/storybook'

// A story supplies route params with `parameters: { routeParams: { ... } }`,
// which stand in for the old Stack.Screen `initialParams`.
export const NavigationDecorator = (story, context: any) => {
  const Screen = () => story()
  const routeParams = context?.parameters?.routeParams
  const search = routeParams
    ? new URLSearchParams(
        Object.entries(routeParams).map(([k, v]) => [k, String(v)]),
      ).toString()
    : ''

  return (
    <ExpoRoot
      context={makeRouteContext({ [routeContextKey(STORY_ROUTE)]: Screen })}
      location={search ? `${STORY_ROUTE}?${search}` : STORY_ROUTE}
    />
  )
}

export const Spacer = () => <View style={styles.spacer} />

const styles = StyleSheet.create({
  scrollview: { padding: 16, height: '100%' },
  spacer: { height: 16 },
})

export default preview;
