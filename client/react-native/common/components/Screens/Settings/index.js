import React from 'react'
import { createSubStackNavigator } from '../../../helpers/react-navigation'
import { Header } from '../../Library'
import List from './List'
import Devtools from './Devtools'
import MyAccount from './MyAccount'
import MyPublicKey from './MyPublicKey'
import MyQRCode from './MyQRCode'

export default createSubStackNavigator(
  {
    'settings/list': List,
    'settings/devtools': Devtools,
    'settings/my-account': MyAccount,
    'settings/my-public-key': MyPublicKey,
    'settings/my-qr-code': MyQRCode,
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
