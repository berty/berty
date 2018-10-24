import React from 'react'
import { createSubStackNavigator } from '../../../helpers/react-navigation'
import { Header } from '../../Library'
import List from './List'
import MyAccount from './MyAccount'
import MyPublicKey from './MyPublicKey'
import MyQRCode from './MyQRCode'
import Devtools from './Devtools/index.js'
import About from './About/index.js'

export default createSubStackNavigator(
  {
    'settings/list': List,
    'settings/my-account': MyAccount,
    'settings/my-account/my-public-key': MyPublicKey,
    'settings/my-account/my-qr-code': MyQRCode,
    'settings/about': About,
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
