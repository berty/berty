import { createSwitchNavigator } from 'react-navigation'

import { Picker } from '../screen/Picker'
import Auth from '../screen/Accounts/Auth'
import MainNavigator from './MainNavigator'
import OnboardingNavigator from './OnboardingNavigator'

export const AppNavigator = createSwitchNavigator(
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
