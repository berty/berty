import { createMaterialTopTabNavigator } from 'react-navigation'
import Welcome from './Welcome'
import Notifications from './Notifications'
import Contacts from './Contacts'
import Backup from './Backup'
import Ready from './Ready'
import { tabIcon } from '../../../../helpers/views'
import { tabNavigatorOptions } from '../../../../constants/styling'

export default createMaterialTopTabNavigator(
  {
    'onboarding/welcome': {
      screen: Welcome,
      navigationOptions: () => ({
        tabBarIcon: tabIcon('lock'),
      }),
    },
    'onboarding/notifications': {
      screen: Notifications,
      navigationOptions: () => ({
        tabBarIcon: tabIcon('bell'),
      }),
    },
    'onboarding/contacts': {
      screen: Contacts,
      navigationOptions: () => ({
        tabBarIcon: tabIcon('users'),
      }),
    },
    'onboarding/backup': {
      screen: Backup,
      navigationOptions: () => ({
        tabBarIcon: tabIcon('archive'),
      }),
    },
    'onboarding/ready': {
      screen: Ready,
      navigationOptions: () => ({
        tabBarIcon: tabIcon('check-circle'),
      }),
    },
  },
  {
    initialRouteName: 'onboarding/welcome',
    ...tabNavigatorOptions,
    tabBarOptions: {
      ...tabNavigatorOptions.tabBarOptions,
      labelStyle: {
        fontSize: 0,
        marginBottom: 0,
        marginTop: 0,
      },
    },
  },
)
