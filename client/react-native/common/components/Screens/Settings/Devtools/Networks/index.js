import React from 'react'
import { createSubStackNavigator } from '../../../../../helpers/react-navigation'
import { Header } from '../../../../Library'
import List from './List'
import Peers from './Peers'

export default createSubStackNavigator(
  {
    'networks/list': List,
    'networks/peers': Peers,
  },
  {
    initialRouteName: 'networks/list',
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header navigation={navigation} title='Networks' titleIcon='activity' />
      ),
      tabBarVisible: false,
    }),
  }
)
