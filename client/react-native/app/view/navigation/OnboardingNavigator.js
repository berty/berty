import { tabNavigatorOptions } from '@berty/common/constants/styling'
import Bluetooth from '@berty/screen/Accounts/Onboarding/Bluetooth'
import Contacts from '@berty/screen/Accounts/Onboarding/Contacts'
import I18n from '@berty/common/locale'
import Notifications from '@berty/screen/Accounts/Onboarding/Notifications'
import Ready from '@berty/screen/Accounts/Onboarding/Ready'
import Welcome from '@berty/screen/Accounts/Onboarding/Welcome'
import { withProps } from '@berty/common/helpers/views'
import TabIcon from '@berty/component/TabIcon'

import { createMaterialTopTabNavigator } from 'react-navigation'

export default createMaterialTopTabNavigator(
  {
    'onboarding/welcome': {
      screen: Welcome,
      navigationOptions: () => ({
        tabBarIcon: withProps({ name: 'lock' })(TabIcon),
        title: I18n.t('onboarding.welcome.tab'),
      }),
    },
    'onboarding/notifications': {
      screen: Notifications,
      navigationOptions: () => ({
        tabBarIcon: withProps({ name: 'bell' })(TabIcon),
        title: I18n.t('onboarding.notifications.tab'),
      }),
    },
    'onboarding/bluetooth': {
      screen: Bluetooth,
      navigationOptions: () => ({
        tabBarIcon: withProps({ name: 'bluetooth' })(TabIcon),
        title: I18n.t('onboarding.bluetooth.tab'),
      }),
    },
    'onboarding/contacts': {
      screen: Contacts,
      navigationOptions: () => ({
        tabBarIcon: withProps({ name: 'users' })(TabIcon),
        title: I18n.t('onboarding.contacts.tab'),
      }),
    },
    'onboarding/ready': {
      screen: Ready,
      navigationOptions: () => ({
        tabBarIcon: withProps({ name: 'check-circle' })(TabIcon),
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
