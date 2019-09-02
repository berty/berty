import { Platform } from 'react-native'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'

import { Picker } from '@berty/screen/Picker'
import Auth from '@berty/screen/Accounts/Auth'
import MainNavigator from './MainNavigator'
import OnboardingNavigator from './OnboardingNavigator'
import { withDeepLinkHandler } from '@berty/common/helpers/withDeepLinkHandler'

const AppNavigator = createSwitchNavigator(
  {
    'accounts/auth': Auth,
    'switch/picker': Picker,
    'switch/onboarding': OnboardingNavigator,
    'switch/main': withDeepLinkHandler(MainNavigator),
  },
  {
    initialRouteName: 'accounts/auth',
    headerMode: 'none',
  }
)

export default (Platform.OS === 'web'
  ? AppNavigator
  : createAppContainer(AppNavigator))
