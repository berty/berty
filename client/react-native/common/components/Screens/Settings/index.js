import React from 'react'
import { createStackNavigator } from 'react-navigation'
import { Header } from '../../Library'
import List from './List'
import Devtools from './Devtools'
import MyAccount from './MyAccount'
import MyPublicKey from './MyPublicKey'
import MyQRCode from './MyQRCode'

export default createStackNavigator(
  {
    List,
    Devtools,
    MyAccount,
    MyPublicKey,
    MyQRCode,
  },
  {
    initialRouteName: 'List',
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header navigation={navigation} title='Settings' titleIcon='settings' />
      ),
      tabBarVisible: false,
    }),
  }
)
