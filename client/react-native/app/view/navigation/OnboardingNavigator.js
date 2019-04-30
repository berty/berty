import { createMaterialTopTabNavigator } from 'react-navigation'
import Welcome from '../screen/Accounts/Onboarding/Welcome'
import Notifications from '../screen/Accounts/Onboarding/Notifications'
import Bluetooth from '../screen/Accounts/Onboarding/Bluetooth'
import Contacts from '../screen/Accounts/Onboarding/Contacts'
import Ready from '../screen/Accounts/Onboarding/Ready'
import { tabIcon } from '@berty/common/helpers/views'
import { tabNavigatorOptions } from '@berty/common/constants/styling'
import I18n from '@berty/locale'

export default createMaterialTopTabNavigator(
  {
    'onboarding/welcome': {
      screen: Welcome,
      navigationOptions: () => ({
        tabBarIcon: tabIcon('lock'),
        title: I18n.t('onboarding.welcome.tab'),
      }),
    },
    'onboarding/notifications': {
      screen: Notifications,
      navigationOptions: () => ({
        tabBarIcon: tabIcon('bell'),
        title: I18n.t('onboarding.notifications.tab'),
      }),
    },
    'onboarding/bluetooth': {
      screen: Bluetooth,
      navigationOptions: () => ({
        tabBarIcon: tabIcon('bluetooth'),
        title: I18n.t('onboarding.bluetooth.tab'),
      }),
    },
    'onboarding/contacts': {
      screen: Contacts,
      navigationOptions: () => ({
        tabBarIcon: tabIcon('users'),
        title: I18n.t('onboarding.contacts.tab'),
      }),
    },
    'onboarding/ready': {
      screen: Ready,
      navigationOptions: () => ({
        tabBarIcon: tabIcon('check-circle'),
        title: I18n.t('onboarding.ready.tab'),
      }),
    },
  },
  {
    initialRouteName: 'onboarding/welcome',
    ...tabNavigatorOptions,
    tabBarOptions: {
      ...tabNavigatorOptions.tabBarOptions,
      labelStyle: {
        height: 0,
        fontSize: 0,
        marginBottom: 0,
        marginTop: 0,
      },
    },
  }
)
