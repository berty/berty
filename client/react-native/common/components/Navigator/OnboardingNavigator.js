import { createMaterialTopTabNavigator } from 'react-navigation'
import Welcome from '../Screens/Accounts/Onboarding/Welcome'
import Notifications from '../Screens/Accounts/Onboarding/Notifications'
import Bluetooth from '../Screens/Accounts/Onboarding/Bluetooth'
import Contacts from '../Screens/Accounts/Onboarding/Contacts'
import Ready from '../Screens/Accounts/Onboarding/Ready'
import { tabIcon } from '../../helpers/views'
import { tabNavigatorOptions } from '../../constants/styling'
import I18n from '../../i18n'

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
  },
)
