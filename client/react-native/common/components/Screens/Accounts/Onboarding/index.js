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
        title: '',
        tabBarIcon: tabIcon('lock'),
      }),
    },
    'onboarding/notifications': {
      screen: Notifications,
      navigationOptions: () => ({
        title: '',
        tabBarIcon: tabIcon('bell'),
      }),
    },
    'onboarding/contacts': {
      screen: Contacts,
      navigationOptions: () => ({
        title: '',
        tabBarIcon: tabIcon('users'),
      }),
    },
    'onboarding/backup': {
      screen: Backup,
      navigationOptions: () => ({
        title: '',
        tabBarIcon: tabIcon('archive'),
      }),
    },
    'onboarding/ready': {
      screen: Ready,
      navigationOptions: () => ({
        title: '',
        tabBarIcon: tabIcon('check-circle'),
      }),
    },
  },
  {
    initialRouteName: 'onboarding/welcome',
    ...tabNavigatorOptions,
  },
)
