import React from 'react'
import { createStackNavigator } from 'react-navigation'
import { Header } from '../../../Library'
import List from './List'
import Database from './Database'
import Network from './Network'

export default createStackNavigator(
  {
    'devtools/list': List,
    'devtools/database': Database,
    'devtools/network': Network,
  },
  {
    initialRouteName: 'devtools/list',
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header
          navigation={navigation}
          title='Developer Tools'
          titleIcon='terminal'
          backBtn
        />
      ),
      tabBarVisible: false,
    }),
  }
)
