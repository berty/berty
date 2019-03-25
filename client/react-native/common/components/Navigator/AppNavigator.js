import { Platform } from 'react-native'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'

import { Picker } from '../Screens/Picker'
import Auth from '../Screens/Accounts/Auth'
import MainNavigator from './MainNavigator'
import OnboardingNavigator from './OnboardingNavigator'

const AppNavigator = createSwitchNavigator(
  {
    'accounts/auth': Auth,
    'switch/picker': Picker,
    'switch/onboarding': OnboardingNavigator,
    'switch/main': MainNavigator,
  },
  {
    initialRouteName: 'accounts/auth',
    headerMode: 'none',
  }
)

export default (Platform.OS !== 'web'
  ? createAppContainer(AppNavigator)
  : AppNavigator)
