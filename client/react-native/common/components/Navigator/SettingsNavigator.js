import React from 'react'
import { Platform } from 'react-native'
import { Header } from '../Library'
import { createStackNavigator } from 'react-navigation'
import Notifications from '../Screens/Settings/Notifications'
import List from '../Screens/Settings/List'
import MyAccount from '../Screens/Settings/MyAccount/MyAccount'
import Update from '../Screens/Settings/Update'
import I18n from 'i18next'
import AboutNavigator from './AboutNavigator'
import HelpNavigator from './HelpNavigator'
import LegalNavigator from './LegalNavigator'
import DevtoolsNavigator from './DevtoolsNavigator'

const handleNavigationsOptions = ({ navigation, screenProps }) => {
  let tabBarVisible = false

  if ((Platform.OS === 'web' && navigation.state.routeName === 'settings/list') ||
    (Platform.OS !== 'web' &&
      navigation.state.routes[navigation.state.index].routeName === 'settings/list')) {
    tabBarVisible = true
  }
  console.log(tabBarVisible)
  return {
    header: (
      <Header navigation={navigation} title={I18n.t('settings.title')} titleIcon='settings' />
    ),
    tabBarVisible,
  }
}

export default createStackNavigator(
  {
    'settings/list': List,
    'settings/my-account': MyAccount,
    'settings/notifications': Notifications,
    'settings/about': {
      screen: AboutNavigator,
      navigationOptions: ({ navigation }) => ({
        header: null,
      }),
    },
    'settings/help': {
      screen: HelpNavigator,
      navigationOptions: ({ navigation }) => ({
        header: null,
      }),
    },
    'settings/legal': {
      screen: LegalNavigator,
      navigationOptions: ({ navigation }) => ({
        header: null,
      }),
    },
    'settings/devtools': {
      screen: DevtoolsNavigator,
      navigationOptions: ({ navigation }) => ({
        header: null,
      }),
    },
    'settings/update': Update,
  },
  {
    initialRouteName: 'settings/list',
    navigationOptions: handleNavigationsOptions,
  }
)
