import React from 'react'
import { createSubStackNavigator } from '../../../helpers/react-navigation'
import { Header } from '../../Library'
import List from './List'
import MyAccount from './MyAccount'
import Notifications from './Notifications'
import About from './About'
import Help from './Help'
import Legal from './Legal'
import Devtools from './Devtools'
import Update from './Update'
import I18n from 'i18next'

export default createSubStackNavigator(
  {
    'settings/list': List,
    'settings/my-account': MyAccount,
    'settings/notifications': Notifications,
    'settings/about': About,
    'settings/help': Help,
    'settings/legal': Legal,
    'settings/devtools': Devtools,
    'settings/update': Update,
  },
  {
    initialRouteName: 'settings/list',
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header navigation={navigation} title={I18n.t('settings.title')} titleIcon='settings' />
      ),
      tabBarVisible: false,
    }),
  }
)
