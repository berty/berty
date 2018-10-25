import React from 'react'
import { createSubStackNavigator } from '../../../helpers/react-navigation'
import { Header } from '../../Library'
import List from './List'
import MyAccount from './MyAccount/index.js'
import About from './About/index.js'
import Help from './Help/index.js'
import Legal from './Legal/index.js'
import Devtools from './Devtools/index.js'

export default createSubStackNavigator(
  {
    'settings/list': List,
    'settings/my-account': MyAccount,
    'settings/about': About,
    'settings/help': Help,
    'settings/legal': Legal,
    'settings/devtools': Devtools,
  },
  {
    initialRouteName: 'settings/list',
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header navigation={navigation} title='Settings' titleIcon='settings' />
      ),
      tabBarVisible: false,
    }),
  }
)
