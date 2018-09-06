import { createStackNavigator } from 'react-navigation'

export const createSubStackNavigator = (
  routeConfig,
  stackNavigatorConfig,
  parentStackNavigatorConfig
) => {
  const Stack = createStackNavigator(routeConfig, stackNavigatorConfig)
  if (parentStackNavigatorConfig == null) {
    Stack.navigationOptions = ({
      navigation: {
        state: { routes, index },
      },
    }) => ({
      header: null,
      tabBarVisible:
        routes[index].routeName === stackNavigatorConfig.initialRouteName,
      swipeEnabled:
        routes[index].routeName === stackNavigatorConfig.initialRouteName,
      animationEnabled:
        routes[index].routeName === stackNavigatorConfig.initialRouteName,
    })
  } else {
    Stack.navigationOptions = parentStackNavigatorConfig
  }
  return Stack
}
