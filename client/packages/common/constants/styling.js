import Platform from 'react-native'
import colors from './colors'

export const tabNavigatorOptions = {
  swipeEnabled: Platform.OS !== 'android',
  animationEnabled: true,
  backBehavior: 'none',
  tabBarOptions: {
    activeTintColor: colors.fakeBlack,
    inactiveTintColor: colors.fakeBlack,
    showIcon: true,
    showLabel: true,
    upperCaseLabel: false,
    style: {
      backgroundColor: colors.white,
      marginBottom: 0,
      marginTop: 0,
    },
    tabStyle: {
      marginBottom: 0,
      marginTop: 0,
    },
    indicatorStyle: {
      backgroundColor: colors.blue,
      marginBottom: 0,
      marginTop: 0,
    },
    labelStyle: {
      fontSize: 12,
      marginBottom: 0,
      marginTop: 0,
    },
  },
}

export const monospaceFont = Platform.OS === 'ios' ? 'monospace' : 'Courier'
