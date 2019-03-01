import { createSwitchNavigator } from 'react-navigation'
import Auth from '../Screens/Accounts/Auth'
import { Picker } from '../Screens/Picker'
import OnboardingNavigator from './OnboardingNavigator'
import MainNavigator from './MainNavigator'

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
